import { expect, test } from '@playwright/test';
import { db, checkout, body, post, serverUrl } from '../fixtures/v3';
import { simulatorFixture, queueSimulatorOrder } from '../fixtures/simulator';
import { startSimulatorPeer, finishSimulatorPeer } from '../fixtures/simulator-process';
import { readOwnedSimulatorRun, assertNoInterruptedSimulatorRun } from '../fixtures/simulator-state';
import { recoverOwnedSimulatorRun } from '../../courier-simulator/steadfast/app-recover';
import { SimulatorControl } from '../../courier-simulator/steadfast/control';
import { fixture as parcelFixture, credentials } from '../../courier-simulator/steadfast/contract';
import { SteadfastCourierAdapter } from '../../../apps/server/src/modules/delivery/providers/steadfast';
import { runWorker } from '../../courier-simulator/steadfast/app-worker';

test.setTimeout(180000);
const operation = (orderId: string) => db.courierOperation.findFirstOrThrow({ where: { consignment: { orderId } } });
const order = (id: string) => db.order.findUniqueOrThrow({ where: { id } });
async function restartWorker(connectionId: string) {
  const peer = await startSimulatorPeer('app-worker.ts', [connectionId]);
  peer.child.send({ type: 'go' });
  return finishSimulatorPeer(peer);
}

test('recovery: SIGKILL after acceptance retains live lease; fresh processes recover after real expiry without another create', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  let peer: Awaited<ReturnType<typeof startSimulatorPeer>> | undefined;
  try {
    const id = await queueSimulatorOrder(page.request, f);
    const parcel = await f.register(id, 'accepted-response-lost');
    const history = await db.orderStatusEvent.count({ where: { orderId: id } });
    peer = await startSimulatorPeer('app-worker.ts', [f.connection.id]);
    peer.child.send({ type: 'go' });
    await expect.poll(() => f.simulator.state(parcel), { intervals: [10, 25, 50], timeout: 10000 }).toBe('pending');
    const claimed = await operation(id);
    expect(claimed.state).toBe('processing');
    expect(claimed.attemptCount).toBe(1);
    expect(claimed.leaseToken).not.toBeNull();
    peer.child.kill('SIGKILL');
    await peer.child.exited;
    expect(peer.child.signalCode).toBe('SIGKILL');
    await new Promise(resolve => setTimeout(resolve, 1600));
    expect((await restartWorker(f.connection.id)).processed).toBe(0);
    expect((await operation(id)).leaseToken).toBe(claimed.leaseToken);
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    expect((await order(id)).inventoryStatus).toBe('committed');
    const connection = await db.courierConnection.findUniqueOrThrow({ where: { id: f.connection.id } });
    const expiry = Math.max(claimed.leaseUntil!.getTime(), connection.dispatchLeaseUntil!.getTime());
    expect(expiry - Date.now()).toBeLessThanOrEqual(120000);
    console.log('Waiting for the actual persisted 120-second lease to expire; no clock injection or lease edits.');
    while (Date.now() <= expiry) await new Promise(resolve => setTimeout(resolve, Math.min(10000, expiry - Date.now() + 20)));
    expect((await restartWorker(f.connection.id)).processed).toBe(1);
    const recovered = await operation(id);
    expect(recovered).toMatchObject({ identity: claimed.identity, state: 'manual_review', attemptCount: 2, leaseToken: null, leaseUntil: null, lastErrorCode: 'uncertain_submission' });
    const c = await db.courierConsignment.findFirstOrThrow({ where: { orderId: id } });
    expect(c.invoice).toBe(parcel.request.invoice);
    expect(c.externalId).toBeNull();
    const journal = await f.simulator.journal();
    expect(journal.filter(e => e.request.method === 'POST')).toHaveLength(1);
    expect(journal.filter(e => e.request.url === `/status_by_invoice/${parcel.request.invoice}`)).toHaveLength(1);
    expect(await db.orderStatusEvent.count({ where: { orderId: id } })).toBe(history);
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(0);
    expect(await db.orderRecovery.count({ where: { orderId: id } })).toBe(0);
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([29, 0]);
    await body(await page.request.post(`${serverUrl}/admin/delivery/consignments/${c.id}/retry-hold`, { data: { note: 'Forbidden blind retry after crash' } }), 409);
    await post(page.request, `/admin/orders/${id}/cancel`, { reason: 'Fictional cancellation after crash review' });
    await post(page.request, `/admin/delivery/consignments/${c.id}/reconcile-booking`, { invoice: c.invoice, externalId: String(parcel.externalId), trackingCode: parcel.trackingCode, providerState: 'pending', note: 'Fictional accepted identity independently reviewed' });
    expect((await order(id)).orderStatus).toBe('cancelled');
    expect((await order(id)).inventoryStatus).toBe('committed');
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    expect(await db.courierException.count({ where: { consignmentId: c.id, kind: 'order_recovery_required', state: 'open' } })).toBe(1);
  } finally {
    if (peer?.child.exitCode === null) { peer.child.kill('SIGKILL'); await peer.child.exited; }
    await f.cleanup();
  }
});

test('recovery: a killed fixture process is cleaned by its saved ownership record; another simulator run and existing app rows survive', async () => {
  const other = new SimulatorControl(crypto.randomUUID().replaceAll('-', '').slice(0, 16));
  const sentinel = parcelFixture(other.run, 'other', 'preserve');
  await other.register(sentinel);
  await new SteadfastCourierAdapter().createConsignment(credentials, sentinel.request);
  const beforeJournal = await other.journal();
  const beforeOrders = await db.order.count();
  const beforeSettings = await db.storeSettings.findMany();
  const beforeDefaults = await db.shippingRate.findMany({ where: { isDefault: true }, select: { id: true, updatedAt: true } });
  let peer: Awaited<ReturnType<typeof startSimulatorPeer>> | undefined;
  let run: string | undefined;
  try {
    peer = await startSimulatorPeer('app-interrupted-fixture.ts');
    run = String(peer.message.run);
    const id = String(peer.message.orderId);
    expect((await readOwnedSimulatorRun(run)).status).toBe('active');
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(1);
    expect(await db.courierSettlement.count({ where: { consignment: { orderId: id } } })).toBe(1);
    expect(await db.webhookEvent.count({ where: { provider: `courier:steadfast:v3-browser-sim-${run}` } })).toBe(1);
    peer.child.kill('SIGKILL');
    await peer.child.exited;
    expect(peer.child.signalCode).toBe('SIGKILL');
    await expect(assertNoInterruptedSimulatorRun()).rejects.toThrow('needs scoped recovery');
    // Run recovery in a new process: no closure, in-memory control entries or fixture object can survive SIGKILL.
    const recovery = Bun.spawn(['bun', 'tests/courier-simulator/steadfast/app-recover.ts', run], { env: { ...process.env }, stdout: 'pipe', stderr: 'pipe' });
    const [code, errors, output] = await Promise.all([recovery.exited, new Response(recovery.stderr).text(), new Response(recovery.stdout).text()]);
    expect(code, errors).toBe(0);
    expect(JSON.parse(output.trim())).toMatchObject({ run, cleaned: true, duplicate: false });
    expect(await recoverOwnedSimulatorRun(run)).toEqual({ run, cleaned: true, duplicate: true });
    expect((await readOwnedSimulatorRun(run)).status).toBe('cleaned');
    await assertNoInterruptedSimulatorRun();
    expect(await db.order.count()).toBe(beforeOrders);
    expect(await db.storeSettings.findMany()).toEqual(beforeSettings);
    expect(await db.shippingRate.findMany({ where: { isDefault: true }, select: { id: true, updatedAt: true } })).toEqual(beforeDefaults);
    expect(await other.journal()).toEqual(beforeJournal);
    expect(await other.state(sentinel)).toBe('pending');
  } finally {
    if (peer?.child.exitCode === null) { peer.child.kill('SIGKILL'); await peer.child.exited; }
    if (run && (await readOwnedSimulatorRun(run)).status === 'active') await recoverOwnedSimulatorRun(run);
    await other.cleanup();
  }
});

for (const status of ['paid', 'partially_paid', 'partially_refunded', 'refunded'] as const) {
  test(`legacy: ${status} without receipt evidence requires review and cannot book, receive money or refund`, async ({ page }) => {
    const f = await simulatorFixture(page.request);
    try {
      const { orderId: id } = await checkout(page.request, f);
      await body(await page.request.patch(`${serverUrl}/admin/orders/${id}/status`, { data: { orderStatus: 'confirmed' } }));
      await db.order.update({ where: { id }, data: { paymentStatus: status } });
      const history = await db.orderStatusEvent.count({ where: { orderId: id } });
      const detail = await body(await page.request.get(`${serverUrl}/admin/orders/${id}`));
      expect(detail.money).toMatchObject({ received: null, outstanding: null, error: 'Legacy payment status requires reviewed receipt reconciliation' });
      await body(await page.request.post(`${serverUrl}/admin/delivery/orders/${id}/confirm`, { data: { connectionId: f.connection.id, serviceId: f.service.id, overrideReason: 'Forbidden legacy inference' } }), 409);
      await body(await page.request.post(`${serverUrl}/admin/orders/${id}/payments`, { data: { amount: '1.00', currency: 'BDT', method: 'manual_bank', reference: `${id}-forbidden`, note: 'Cannot silently reconcile legacy status' } }), 409);
      await body(await page.request.post(`${serverUrl}/admin/orders/${id}/refunds`, { data: { amount: '1.00', reason: 'No receipt evidence' } }), 409);
      expect((await order(id)).paymentStatus).toBe(status);
      expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(0);
      expect(await db.orderRefund.count({ where: { orderId: id } })).toBe(0);
      expect(await db.orderStatusEvent.count({ where: { orderId: id } })).toBe(history);
      expect(await db.courierDispatch.count({ where: { orderId: id } })).toBe(0);
      expect(await f.simulator.journal()).toHaveLength(0);
      const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
      expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([29, 0]);
    } finally { await f.cleanup(); }
  });
}

test('legacy: contradictory receipt status cannot reach the worker or change money/stock', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const id = await queueSimulatorOrder(page.request, f, '30.00');
    await f.register(id);
    await db.order.update({ where: { id }, data: { paymentStatus: 'paid' } });
    const history = await db.orderStatusEvent.count({ where: { orderId: id } });
    await runWorker(f.connection.id);
    expect((await operation(id)).lastErrorCode).toBe('payment_or_address_review_changed');
    expect((await operation(id)).state).toBe('manual_review');
    const detail = await body(await page.request.get(`${serverUrl}/admin/orders/${id}`));
    expect(detail.money.error).toBe('Payment status contradicts receipt evidence');
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(1);
    expect(await db.orderStatusEvent.count({ where: { orderId: id } })).toBe(history);
    expect(await f.simulator.journal()).toHaveLength(0);
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    expect((await order(id)).inventoryStatus).toBe('committed');
  } finally { await f.cleanup(); }
});

for (const missing of ['claim', 'operation'] as const) {
  test(`legacy: missing ${missing} evidence blocks rebooking and cancellation cannot restore stock`, async ({ page }) => {
    const f = await simulatorFixture(page.request);
    try {
      const id = await queueSimulatorOrder(page.request, f);
      await f.register(id);
      if (missing === 'claim') await db.courierShipmentClaim.delete({ where: { orderId: id } });
      else await db.courierOperation.delete({ where: { id: (await operation(id)).id } });
      await runWorker(f.connection.id);
      if (missing === 'claim') expect((await operation(id)).lastErrorCode).toBe('shipment_claim_missing_or_changed');
      await body(await page.request.post(`${serverUrl}/admin/delivery/orders/${id}/confirm`, { data: { connectionId: f.connection.id, serviceId: f.service.id, overrideReason: 'Forbidden ambiguous rebooking' } }), 409);
      await post(page.request, `/admin/orders/${id}/cancel`, { reason: 'Fictional legacy custody review' });
      expect((await order(id)).inventoryStatus).toBe('committed');
      expect(await db.courierException.count({ where: { consignment: { orderId: id }, kind: 'order_recovery_required', state: 'open' } })).toBe(1);
      await body(await page.request.post(`${serverUrl}/admin/orders/${id}/recovery/restock`, { data: { note: 'No physical receipt evidence' } }), 409);
      expect(await db.orderRecovery.count({ where: { orderId: id } })).toBe(0);
      expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(0);
      expect(await f.simulator.journal()).toHaveLength(0);
      const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
      expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([29, 0]);
    } finally { await f.cleanup(); }
  });
}
