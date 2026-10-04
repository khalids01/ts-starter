import { expect, test, request, type APIRequestContext } from '@playwright/test';
import { db, checkout, confirm, payment, routeAndQueue, post, body, serverUrl } from '../fixtures/v3';
import { simulatorFixture } from '../fixtures/simulator';
import { runWorker } from '../../courier-simulator/steadfast/app-worker';
import { callback, signCallback, sendCallback } from '../../courier-simulator/steadfast/webhooks';
import { payload, type Parcel, type Fault } from '../../courier-simulator/steadfast/contract';
import { TEST_USERS } from '../../users-config';

test.setTimeout(180_000);
test.beforeEach(({ page }) => page.setDefaultTimeout(15_000));
const order = (id: string) => db.order.findUniqueOrThrow({ where: { id } });
const consignment = (id: string) => db.courierConsignment.findFirstOrThrow({ where: { orderId: id } });
const operation = (id: string) => db.courierOperation.findFirstOrThrow({ where: { consignment: { orderId: id } } });
async function signed(f: Awaited<ReturnType<typeof simulatorFixture>>, parcel: Parcel, state: Parameters<typeof callback>[1]) {
  const message = callback(parcel, state);
  const target = `${serverUrl}/courier/webhooks/${f.connection.publicId}`;
  const response = await sendCallback(target, message);
  expect(response.status).toBe(200);
  return { message, target, result: await response.json() };
}
async function receipt(api: APIRequestContext, id: string, amount: string, reference: string) {
  return post(api, `/admin/orders/${id}/payments`, { amount, currency: 'BDT', method: 'manual_bank', reference, note: 'Fictional confirmed evidence' });
}
async function queued(api: APIRequestContext, f: Awaited<ReturnType<typeof simulatorFixture>>, deposit?: string) {
  const { orderId: id } = await checkout(api, f);
  await body(await api.patch(`${serverUrl}/admin/orders/${id}/status`, { data: { orderStatus: 'confirmed' } }));
  if (deposit) await receipt(api, id, deposit, `${id}-deposit`);
  const dispatch = await post<{ id: string }>(api, `/admin/delivery/orders/${id}/confirm`, { connectionId: f.connection.id, serviceId: f.service.id, overrideReason: 'Fictional test route' });
  await post(api, `/admin/delivery/dispatches/${dispatch.id}/queue`, {});
  return id;
}
async function assertBooking(f: Awaited<ReturnType<typeof simulatorFixture>>, p: Parcel, id: string) {
  expect((await consignment(id)).externalId).toBe(String(p.externalId));
  expect((await operation(id)).state).toBe('completed');
  const creates = (await f.simulator.journal()).filter(e => e.request.method === 'POST' && JSON.parse(e.request.body!).invoice === p.request.invoice);
  expect(creates).toHaveLength(1);
  expect(JSON.parse(creates[0]!.request.body!)).toEqual(payload(p));
}
async function peerRace(connectionId: string) {
  const ready: Promise<void>[] = [];
  let barrierTimer: ReturnType<typeof setTimeout> | undefined;
  const children = [0, 1].map(() => {
    let markReady!: () => void;
    ready.push(new Promise(resolve => { markReady = resolve; }));
    return Bun.spawn(['bun', 'tests/courier-simulator/steadfast/app-worker.ts', connectionId], {
      env: { ...process.env }, stdout: 'pipe', stderr: 'pipe',
      ipc(message) { if ((message as { type?: string }).type === 'ready') markReady(); },
    });
  });
  try {
    await Promise.race([Promise.all(ready), new Promise((_, reject) => { barrierTimer = setTimeout(() => reject(new Error('Worker IPC readiness timed out')), 15000); })]);
    children.forEach(child => child.send({ type: 'go' }));
    for (const child of children) {
      const [code, stderr] = await Promise.all([child.exited, new Response(child.stderr).text()]);
      expect(code, stderr).toBe(0);
    }
  } finally { clearTimeout(barrierTimer); for (const child of children) if (child.exitCode === null) child.kill(); }
}

test('simulator: browser deposit, booking, polling, signed delivery, gross settlement and completion persist', async ({ page, browser }) => {
  const f = await simulatorFixture(page.request);
  const customer = await browser.newContext({ baseURL: 'http://localhost:3001', storageState: { cookies: [], origins: [] } });
  try {
    const shop = await customer.newPage();
    await shop.goto(`/shop?search=${encodeURIComponent(f.marker)}`, { waitUntil: 'networkidle' });
    await shop.getByRole('article').getByRole('link', { name: f.marker, exact: true }).click();
    await shop.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await shop.goto('/checkout', { waitUntil: 'networkidle' });
    await shop.getByLabel('Name', { exact: true }).fill('Fictional customer');
    await shop.getByLabel('Email', { exact: true }).fill(`${f.marker}@northstar.example.test`);
    await shop.getByLabel('Phone', { exact: true }).fill('01700000000');
    await shop.getByLabel('Address line 1').fill('1 Fictional Road');
    await shop.getByLabel('City', { exact: true }).fill('Dhaka');
    await shop.getByLabel('Postal code').fill('1205');
    await shop.getByRole('button', { name: 'Place order', exact: true }).click();
    await expect(shop).toHaveURL(/\/checkout\/success\//);
    const id = shop.url().split('/').at(-1)!;
    expect((await order(id)).inventoryStatus).toBe('reserved');
    await confirm(page, id);
    await payment(page, '30.00', `${f.marker}-deposit`);
    const { card } = await routeAndQueue(page, id, f);
    const parcel = await f.register(id);
    expect(parcel.request.codAmount).toBe('80.00');
    await runWorker(f.connection.id);
    await assertBooking(f, parcel, id);
    await page.reload();
    await card.getByRole('button', { name: 'Mark handed over' }).click();
    await expect.poll(async () => (await order(id)).deliveryStatus).toBe('shipped');
    await f.simulator.transition(parcel, 'delivered_approval_pending');
    await runWorker(f.connection.id, 'tracking');
    expect((await consignment(id)).state).toBe('delivery_pending_approval');
    expect((await order(id)).deliveryStatus).toBe('shipped');
    expect(await db.courierEvent.count({ where: { consignmentId: (await consignment(id)).id, source: 'polling' } })).toBe(1);
    const delivered = { message: callback(parcel, 'delivered'), target: `${serverUrl}/courier/webhooks/${f.connection.publicId}` };
    const callbacks = await Promise.all([sendCallback(delivered.target, delivered.message), sendCallback(delivered.target, delivered.message)]);
    expect(callbacks.map(r => r.status)).toEqual([200, 200]);
    const callbackResults = await Promise.all(callbacks.map(r => r.json()));
    expect(callbackResults.map(r => r.duplicate).sort()).toEqual([false, true]);
    const history = await db.orderStatusEvent.count({ where: { orderId: id } });
    expect((await (await sendCallback(delivered.target, { ...delivered.message, headers: { ...delivered.message.headers, 'idempotency-key': crypto.randomUUID() } })).json()).duplicate).toBe(true);
    expect(await db.orderStatusEvent.count({ where: { orderId: id } })).toBe(history);
    expect((await order(id)).paymentStatus).toBe('partially_paid');
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(1);
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    await body(await page.request.post(`${serverUrl}/admin/orders/${id}/cancel`, { data: { reason: 'Fictional forbidden delivered cancellation' } }), 409);
    await page.reload();
    await card.getByRole('button', { name: 'Record settlement', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Collection/reference ID').fill(`${f.marker}-gross`);
    await dialog.getByLabel('Amount', { exact: true }).fill('80.00');
    await dialog.getByLabel('Evidence note').fill('Fictional gross collection evidence');
    await dialog.getByRole('button', { name: 'Record settlement', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect((await order(id)).paymentStatus).toBe('paid');
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(0);
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(2);
    const c = await consignment(id);
    await post(page.request, '/admin/delivery/settlements', { consignmentId: c.id, externalId: `${f.marker}-gross`, amount: '80.00', currency: 'BDT', note: 'Fictional replay' });
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(2);
    await page.goto(`/admin/orders/${id}`, { waitUntil: 'networkidle' });
    await page.getByRole('combobox').filter({ hasText: 'Confirmed' }).click();
    await page.getByRole('option', { name: 'Completed', exact: true }).click();
    await page.getByRole('button', { name: 'Update order', exact: true }).click();
    await expect.poll(async () => (await order(id)).orderStatus).toBe('completed');
    const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([29, 0]);
    expect(history).toBeGreaterThan(4);
    expect(await db.webhookEvent.count({ where: { provider: `courier:steadfast:${f.connection.publicId}`, status: 'processed' } })).toBe(1);
  } finally { await customer.close(); await f.cleanup(); }
});

test('simulator: invalid callback bytes/auth/payload leave persistence unchanged; return evidence never receives or refunds stock', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const id = await queued(page.request, f, '30.00');
    const p = await f.register(id);
    await runWorker(f.connection.id);
    const c = await consignment(id);
    const before = await db.orderStatusEvent.count({ where: { orderId: id } });
    const valid = callback(p, 'delivered');
    for (const invalid of [
      { ...valid, headers: { ...valid.headers, authorization: 'Bearer wrong' } },
      { ...valid, headers: { ...valid.headers, 'x-signature': 'wrong' } },
      { ...valid, body: valid.body + ' ' },
      signCallback('{'), signCallback(JSON.stringify({ notification_type: 'unsupported' })),
    ]) {
      expect((await sendCallback(`${serverUrl}/courier/webhooks/${f.connection.publicId}`, invalid)).status).toBe(401);
    }
    expect(await db.courierEvent.count({ where: { consignmentId: c.id } })).toBe(0);
    expect(await db.webhookEvent.count({ where: { provider: `courier:steadfast:${f.connection.publicId}` } })).toBe(0);
    expect(await db.orderStatusEvent.count({ where: { orderId: id } })).toBe(before);
    expect((await order(id)).deliveryStatus).not.toBe('delivered');
    await signed(f, p, 'partial_delivered');
    expect(await db.courierException.count({ where: { consignmentId: c.id, kind: 'partial_delivery' } })).toBe(1);
    await signed(f, p, 'cancelled_return_received');
    expect(await db.orderRecovery.count({ where: { orderId: id } })).toBe(0);
    expect(await db.orderRefund.count({ where: { orderId: id } })).toBe(0);
    expect((await order(id)).inventoryStatus).toBe('committed');
    await post(page.request, `/admin/orders/${id}/cancel`, { reason: 'Fictional returned order' });
    await body(await page.request.post(`${serverUrl}/admin/orders/${id}/recovery/restock`, { data: { note: 'No receipt' } }), 409);
    await post(page.request, `/admin/orders/${id}/recovery`, { allItemsReceived: true, note: 'Fictional full warehouse receipt' });
    await body(await page.request.patch(`${serverUrl}/admin/orders/${id}/recovery`, { data: { disposition: 'sellable', note: 'Fictional inspection' } }));
    await post(page.request, `/admin/orders/${id}/recovery/restock`, { note: 'Fictional inspected receipt' });
    await body(await page.request.post(`${serverUrl}/admin/orders/${id}/recovery/restock`, { data: { note: 'Fictional duplicate restock' } }), 409);
    await post(page.request, `/admin/orders/${id}/refunds`, { amount: '30.00', reason: 'Fictional deposit refund', restockInventory: false });
    expect((await order(id)).paymentStatus).toBe('refunded');
    expect(await db.orderRecovery.count({ where: { orderId: id, restockedAt: { not: null } } })).toBe(1);
    const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([30, 0]);
  } finally { await f.cleanup(); }
});

test('simulator: competing accounts route/queue one shipment and independent worker processes book once', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  const manager = await request.newContext({ storageState: TEST_USERS.commerceManager.storageStatePath });
  try {
    const { orderId: id } = await checkout(page.request, f);
    await confirm(page, id);
    const route = { connectionId: f.connection.id, serviceId: f.service.id, overrideReason: 'Fictional competing routes' };
    const responses = await Promise.all([page.request, manager].map(api => api.post(`${serverUrl}/admin/delivery/orders/${id}/confirm`, { data: route })));
    expect(responses.map(r => r.status()).sort()).toEqual([200, 409]);
    const dispatch = await db.courierDispatch.findFirstOrThrow({ where: { orderId: id } });
    const queues = await Promise.all([page.request, manager].map(api => api.post(`${serverUrl}/admin/delivery/dispatches/${dispatch.id}/queue`, { data: {} })));
    expect(queues.some(r => r.ok())).toBe(true);
    for (const response of queues) expect([200, 409], await response.text()).toContain(response.status());
    // A Serializable conflict is an explicit operator retry; replay returns the existing consignment.
    await post(manager, `/admin/delivery/dispatches/${dispatch.id}/queue`, {});
    expect(await db.courierConsignment.count({ where: { orderId: id } })).toBe(1);
    expect(await db.courierOperation.count({ where: { consignment: { orderId: id } } })).toBe(1);
    const p = await f.register(id);
    await peerRace(f.connection.id);
    await assertBooking(f, p, id);
    expect((await operation(id)).attemptCount).toBe(1);
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    expect((await order(id)).inventoryStatus).toBe('committed');
  } finally { await manager.dispose(); await f.cleanup(); }
});

for (const fault of ['authentication', 'validation', 'rate-limit', 'server', 'network', 'malformed', 'accepted-response-lost'] as Fault[]) {
  test(`simulator: ${fault} persists safe retry/review, stable invoice and custody`, async ({ page }) => {
    const f = await simulatorFixture(page.request);
    try {
      const id = await queued(page.request, f);
      const p = await f.register(id, fault);
      const started = new Date();
      await runWorker(f.connection.id, 'dispatch', started, fault === 'accepted-response-lost' ? 100 : undefined);
      let op = await operation(id);
      const retryable = ['rate-limit', 'server', 'network', 'accepted-response-lost'].includes(fault);
      expect(op.state).toBe(retryable ? 'retry' : 'manual_review');
      expect(op.attemptCount).toBe(1);
      expect((await consignment(id)).externalId).toBeNull();
      expect((await order(id)).inventoryStatus).toBe('committed');
      expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
      if (fault === 'authentication') {
        const connection = await db.courierConnection.findUniqueOrThrow({ where: { id: f.connection.id } });
        expect([connection.enabled, connection.healthState]).toEqual([false, 'auth_failed']);
      }
      if (retryable) {
        expect(op.nextAttemptAt.getTime()).toBeGreaterThanOrEqual(started.getTime() + 60000);
        if (fault === 'rate-limit') expect((await db.courierConnection.findUniqueOrThrow({ where: { id: f.connection.id } })).cooldownUntil).toEqual(op.nextAttemptAt);
        const journal = await f.simulator.journal();
        await runWorker(f.connection.id, 'dispatch', started);
        expect((await operation(id)).attemptCount).toBe(1);
        expect(await f.simulator.journal()).toHaveLength(journal.length);
        if (fault === 'accepted-response-lost') {
          await new Promise(resolve => setTimeout(resolve, 1600));
          await post(page.request, `/admin/orders/${id}/cancel`, { reason: 'Fictional cancellation after uncertain acceptance' });
          expect((await order(id)).inventoryStatus).toBe('committed');
          expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
        }
        await runWorker(f.connection.id, 'dispatch', new Date(started.getTime() + 121000));
        op = await operation(id);
        // Missing invoice status cannot prove safe resubmission. Cancellation has already stopped its own retry.
        expect(op.state).toBe('manual_review');
        expect(op.lastErrorCode).toBe(fault === 'accepted-response-lost' ? 'order_recovery_required' : 'validation');
        expect(op.attemptCount).toBe(fault === 'accepted-response-lost' ? 1 : 2);
      }
      const journal = await f.simulator.journal();
      expect(journal.filter(e => e.request.method === 'POST')).toHaveLength(1);
      expect((await consignment(id)).invoice).toBe(p.request.invoice);
      if (['malformed', 'accepted-response-lost'].includes(fault)) {
        const c = await consignment(id);
        await body(await page.request.post(`${serverUrl}/admin/delivery/consignments/${c.id}/retry-hold`, { data: { note: 'Unsafe blind retry' } }), 409);
        await post(page.request, `/admin/delivery/consignments/${c.id}/reconcile-booking`, { invoice: c.invoice, externalId: String(p.externalId), trackingCode: p.trackingCode, providerState: 'pending', note: 'Fictional merchant identity evidence' });
        expect((await operation(id)).state).toBe('completed');
        expect((await consignment(id)).externalId).toBe(String(p.externalId));
        expect((await order(id)).paymentStatus).toBe('unpaid');
        if (fault === 'accepted-response-lost') {
          expect((await order(id)).orderStatus).toBe('cancelled');
          expect((await order(id)).inventoryStatus).toBe('committed');
          expect(await db.courierException.count({ where: { consignmentId: c.id, kind: 'order_recovery_required', state: 'open' } })).toBe(1);
          expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
        }
        expect(await db.orderStatusEvent.count({ where: { orderId: id, metadata: { path: ['action'], equals: 'courier_booking_identity_reconciled' } } })).toBe(1);
      }
    } finally { await f.cleanup(); }
  });
}

test('simulator: pre-attempt cancellation/payment change stop HTTP; unsafe goods cannot restock', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const cancelled = await queued(page.request, f);
    await f.register(cancelled);
    await post(page.request, `/admin/orders/${cancelled}/cancel`, { reason: 'Fictional before attempt' });
    await runWorker(f.connection.id);
    expect((await order(cancelled)).inventoryStatus).toBe('restocked');
    expect(await db.courierShipmentClaim.count({ where: { orderId: cancelled } })).toBe(0);
    const changed = await queued(page.request, f);
    const first = await f.register(changed);
    await receipt(page.request, changed, '20.00', `${changed}-change`);
    await runWorker(f.connection.id);
    expect((await consignment(changed)).state).toBe('cancelled_before_submission');
    expect(await f.simulator.journal()).toHaveLength(0);
    const route = await post<{ id: string }>(page.request, `/admin/delivery/orders/${changed}/confirm`, { connectionId: f.connection.id, serviceId: f.service.id, overrideReason: 'Fictional reviewed new payment' });
    await post(page.request, `/admin/delivery/dispatches/${route.id}/queue`, {});
    const latest = await db.courierConsignment.findFirstOrThrow({ where: { dispatchId: route.id } });
    expect(latest.invoice).not.toBe(first.request.invoice);
    // The old attempt is safely cancelled. No provider request has been made for either attempt.
    await post(page.request, `/admin/orders/${changed}/cancel`, { reason: 'Fictional cancel new unattempted route' });
    const unsafe = await queued(page.request, f, '30.00');
    const p = await f.register(unsafe);
    await runWorker(f.connection.id);
    await signed(f, p, 'cancelled_return_received');
    await post(page.request, `/admin/orders/${unsafe}/cancel`, { reason: 'Fictional unsafe return' });
    await post(page.request, `/admin/orders/${unsafe}/recovery`, { allItemsReceived: true, note: 'Fictional physical receipt' });
    await body(await page.request.patch(`${serverUrl}/admin/orders/${unsafe}/recovery`, { data: { disposition: 'unsafe', note: 'Fictional spoilage inspection' } }));
    await body(await page.request.post(`${serverUrl}/admin/orders/${unsafe}/recovery/restock`, { data: { note: 'Forbidden unsafe restock' } }), 409);
    await post(page.request, `/admin/orders/${unsafe}/refunds`, { amount: '30.00', reason: 'Fictional unsafe refund', restockInventory: false });
    expect((await order(unsafe)).inventoryStatus).toBe('committed');
    expect((await order(unsafe)).paymentStatus).toBe('refunded');
    const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([29, 0]);
  } finally { await f.cleanup(); }
});

test('simulator: viewer, customer and anonymous cannot mutate actual shipment, money or recovery', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const id = await queued(page.request, f, '30.00');
    await f.register(id);
    const c = await consignment(id);
    const before = await db.orderStatusEvent.count({ where: { orderId: id } });
    for (const key of ['commerceViewer', 'user', null] as const) {
      const api = await request.newContext({ storageState: key ? TEST_USERS[key].storageStatePath : { cookies: [], origins: [] } });
      try {
        for (const [path, data] of [
          [`/admin/delivery/dispatches/${c.dispatchId}/queue`, {}],
          [`/admin/delivery/consignments/${c.id}/handoff`, { state: 'handed_to_courier', note: 'Forbidden' }],
          [`/admin/delivery/consignments/${c.id}/reconcile-booking`, { invoice: c.invoice, externalId: '123', providerState: 'pending', note: 'Forbidden' }],
          ['/admin/delivery/settlements', { consignmentId: c.id, externalId: 'forbidden', amount: '80.00', currency: 'BDT', note: 'Forbidden' }],
          [`/admin/orders/${id}/payments`, { amount: '1.00', currency: 'BDT', method: 'manual_bank', reference: 'forbidden', note: 'Forbidden' }],
          [`/admin/orders/${id}/cancel`, { reason: 'Forbidden' }],
          [`/admin/orders/${id}/refunds`, { amount: '1.00', reason: 'Forbidden' }],
          [`/admin/orders/${id}/recovery`, { allItemsReceived: true, note: 'Forbidden' }],
          [`/admin/orders/${id}/recovery/restock`, { note: 'Forbidden' }],
        ] as const) expect([401, 403], `${key}: ${path}`).toContain((await api.post(serverUrl + path, { data })).status());
      } finally { await api.dispose(); }
    }
    expect(await db.orderStatusEvent.count({ where: { orderId: id } })).toBe(before);
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(1);
    expect(await db.orderRecovery.count({ where: { orderId: id } })).toBe(0);
    expect((await operation(id)).attemptCount).toBe(0);
    expect(await f.simulator.journal()).toHaveLength(0);
  } finally { await f.cleanup(); }
});

test('simulator: prepaid COD stays zero; early collection waits for delivery and refunded deposits cannot become debt', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const prepaid = await queued(page.request, f, '110.00');
    const paidParcel = await f.register(prepaid);
    expect(paidParcel.request.codAmount).toBe('0.00');
    await runWorker(f.connection.id);
    await assertBooking(f, paidParcel, prepaid);
    await signed(f, paidParcel, 'delivered');
    expect((await order(prepaid)).paymentStatus).toBe('paid');
    expect(await db.courierShipmentClaim.count({ where: { orderId: prepaid } })).toBe(0);
    expect(await db.orderPayment.count({ where: { orderId: prepaid } })).toBe(1);

    const early = await queued(page.request, f, '30.00');
    const earlyParcel = await f.register(early);
    await runWorker(f.connection.id);
    const earlyC = await consignment(early);
    const evidence = { consignmentId: earlyC.id, externalId: `${early}-gross`, amount: '80.00', currency: 'BDT', note: 'Fictional gross evidence before callback' };
    expect((await post(page.request, '/admin/delivery/settlements', evidence)).state).toBe('matched_pending_delivery');
    expect(await db.orderPayment.count({ where: { orderId: early } })).toBe(1);
    await signed(f, earlyParcel, 'delivered');
    expect((await order(early)).paymentStatus).toBe('paid');
    expect(await db.orderPayment.count({ where: { orderId: early } })).toBe(2);
    await post(page.request, '/admin/delivery/settlements', evidence);
    await body(await page.request.post(serverUrl + '/admin/delivery/settlements', { data: { ...evidence, amount: '79.00' } }), 409);
    expect(await db.orderPayment.count({ where: { orderId: early } })).toBe(2);

    const refunded = await queued(page.request, f, '30.00');
    const refundParcel = await f.register(refunded);
    await runWorker(f.connection.id);
    const refundC = await consignment(refunded);
    await post(page.request, '/admin/delivery/settlements', { consignmentId: refundC.id, externalId: `${refunded}-gross`, amount: '80.00', currency: 'BDT', note: 'Fictional early evidence' });
    await post(page.request, `/admin/orders/${refunded}/refunds`, { amount: '10.00', reason: 'Fictional partial deposit refund', restockInventory: false });
    const beforeStock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    await signed(f, refundParcel, 'delivered');
    expect((await order(refunded)).paymentStatus).toBe('partially_refunded');
    expect(await db.orderPayment.count({ where: { orderId: refunded } })).toBe(2);
    expect(String((await consignment(refunded)).codAmount)).toBe('80');
    const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([beforeStock.quantityOnHand, beforeStock.quantityReserved]);
    expect(await db.orderRecovery.count({ where: { orderId: refunded } })).toBe(0);
  } finally { await f.cleanup(); }
});

test('simulator: disabled connection and stale address snapshot block HTTP; cooldown holds the whole connection', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const stale = await queued(page.request, f);
    await f.register(stale);
    await db.orderAddress.updateMany({ where: { orderId: stale, type: 'shipping' }, data: { line1: '2 Fictional Changed Road' } });
    await runWorker(f.connection.id);
    expect((await operation(stale)).state).toBe('manual_review');
    expect((await operation(stale)).lastErrorCode).toBe('payment_or_address_review_changed');
    expect(await f.simulator.journal()).toHaveLength(0);
    const disabled = await queued(page.request, f);
    await f.register(disabled);
    await db.courierConnection.update({ where: { id: f.connection.id }, data: { enabled: false } });
    await runWorker(f.connection.id);
    expect((await operation(disabled)).lastErrorCode).toBe('connection_unavailable');
    expect(await f.simulator.journal()).toHaveLength(0);
    await db.courierConnection.update({ where: { id: f.connection.id }, data: { enabled: true } });
    const throttled = await queued(page.request, f);
    await f.register(throttled, 'rate-limit');
    const waiting = await queued(page.request, f);
    await f.register(waiting);
    await runWorker(f.connection.id);
    expect((await operation(throttled)).lastErrorCode).toBe('rate_limited');
    expect((await operation(waiting)).lastErrorCode).toBe('connection_cooldown');
    expect((await operation(waiting)).attemptCount).toBe(0);
    expect((await operation(waiting)).nextAttemptAt).toEqual((await operation(throttled)).nextAttemptAt);
    expect((await f.simulator.journal()).filter(e => e.request.method === 'POST')).toHaveLength(1);
  } finally { await f.cleanup(); }
});

test('simulator: accepted lost response recovers status only and never submits the invoice again', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const id = await queued(page.request, f);
    const p = await f.register(id, 'accepted-response-lost');
    const started = new Date();
    await runWorker(f.connection.id, 'dispatch', started, 100);
    expect((await operation(id)).state).toBe('retry');
    await new Promise(resolve => setTimeout(resolve, 1600));
    await runWorker(f.connection.id, 'dispatch', new Date(started.getTime() + 121000));
    expect((await operation(id)).state).toBe('manual_review');
    expect((await operation(id)).lastErrorCode).toBe('uncertain_submission');
    const journal = await f.simulator.journal();
    expect(journal.filter(e => e.request.method === 'POST')).toHaveLength(1);
    expect(journal.filter(e => e.request.url === `/status_by_invoice/${p.request.invoice}`)).toHaveLength(1);
    await runWorker(f.connection.id, 'dispatch', new Date(started.getTime() + 240000));
    expect(await f.simulator.journal()).toHaveLength(journal.length);
    expect((await consignment(id)).externalId).toBeNull();
    expect((await order(id)).inventoryStatus).toBe('committed');
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(0);
  } finally { await f.cleanup(); }
});

test('simulator: wrong gross collection amount or currency cannot credit an unpaid order', async ({ page }) => {
  const f = await simulatorFixture(page.request);
  try {
    const id = await queued(page.request, f);
    const parcel = await f.register(id);
    await runWorker(f.connection.id);
    const c = await consignment(id);
    for (const [suffix, amount, currency] of [['amount', '109.00', 'BDT'], ['currency', '110.00', 'USD']] as const) {
      const result = await post(page.request, '/admin/delivery/settlements', { consignmentId: c.id, externalId: `${id}-${suffix}`, amount, currency, note: 'Fictional mismatch evidence' });
      expect(result.state).toBe('mismatch');
    }
    await signed(f, parcel, 'delivered');
    expect((await order(id)).paymentStatus).toBe('unpaid');
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(0);
    expect(await db.courierShipmentClaim.count({ where: { orderId: id } })).toBe(1);
    expect(await db.courierException.count({ where: { consignmentId: c.id, kind: 'settlement_mismatch', state: 'open' } })).toBe(1);
    const stock = await db.inventoryStock.findFirstOrThrow({ where: { variantId: f.variantId } });
    expect([stock.quantityOnHand, stock.quantityReserved]).toEqual([29, 0]);
  } finally { await f.cleanup(); }
});
