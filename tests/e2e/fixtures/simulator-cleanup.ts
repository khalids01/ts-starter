import { expect, type APIRequestContext } from '@playwright/test';
import { db, body, serverUrl } from './v3';
import { SimulatorControl } from '../../courier-simulator/steadfast/control';
import { assertOwnedSimulatorRun, finishOwnedSimulatorRun, type OwnedSimulatorRun } from './simulator-state';

export async function cleanupSimulatorFixture(api: APIRequestContext, record: OwnedSimulatorRun, simulator?: SimulatorControl) {
  await assertOwnedSimulatorRun(record);
  if (simulator) await simulator.cleanup();
  else await new SimulatorControl(record.run).cleanupInterruptedRun();
  const marker = record.marker;
  const connections = { publicId: marker };
  const consignments = { consignment: { connection: connections } };
  const rates = await db.shippingRate.findMany({ where: { code: marker } });
  const orderWhere = { shippingRateId: { in: rates.map(r => r.id) } };
  const orders = await db.order.findMany({ where: orderWhere, select: { id: true } });
  const orderIds = { orderId: { in: orders.map(o => o.id) } };
  await db.$transaction(async tx => {
    await tx.webhookEvent.deleteMany({ where: { provider: `courier:steadfast:${marker}` } });
    await tx.orderPayment.deleteMany({ where: orderIds });
    await tx.courierSettlement.deleteMany({ where: consignments });
    await tx.courierReturn.deleteMany({ where: consignments });
    await tx.courierException.deleteMany({ where: consignments });
    await tx.courierEvent.deleteMany({ where: consignments });
    await tx.courierOperation.deleteMany({ where: consignments });
    await tx.courierShipmentClaim.deleteMany({ where: orderIds });
    await tx.courierConsignment.deleteMany({ where: { connection: connections } });
    await tx.courierDispatch.deleteMany({ where: { connection: connections } });
    await tx.courierRoutingRule.deleteMany({ where: { connection: connections } });
    await tx.courierService.deleteMany({ where: { connection: connections } });
    await tx.courierConnection.deleteMany({ where: connections });
    await tx.orderRecovery.deleteMany({ where: orderIds });
    await tx.order.deleteMany({ where: orderWhere });
    const variants = { variant: { product: { slug: marker } } };
    await tx.stockReservation.deleteMany({ where: variants });
    await tx.inventoryMovement.deleteMany({ where: variants });
    await tx.inventoryStock.deleteMany({ where: variants });
    await tx.inventoryBatch.deleteMany({ where: variants });
    await tx.product.deleteMany({ where: { slug: marker } });
    await tx.category.deleteMany({ where: { slug: marker } });
    await tx.inventoryLocation.deleteMany({ where: { code: marker } });
    await tx.shippingRate.deleteMany({ where: { code: marker } });
    await tx.ecommerceCustomer.deleteMany({ where: { normalizedEmail: `${marker}@northstar.example.test` } });
    for (const rate of record.shippingDefaults) await tx.shippingRate.update({ where: { id: rate.id }, data: { isDefault: true, updatedAt: rate.updatedAt } });
    for (const row of record.settings) await tx.storeSettings.update({ where: { id: row.id }, data: row });
    if (!record.providerExisted) await tx.courierProvider.deleteMany({ where: { code: 'steadfast', connections: { none: {} } } });
  });
  // Invalidate restored settings through the existing authenticated route/service cache.
  if (record.settings[0]) {
    const { id, createdAt, updatedAt, ...data } = record.settings[0];
    await body(await api.put(serverUrl + '/admin/store-settings', { data }));
    await db.storeSettings.update({ where: { id }, data: { updatedAt } });
  }
  expect(await db.order.count({ where: orderWhere })).toBe(0);
  expect(await db.courierConnection.count({ where: connections })).toBe(0);
  expect(await db.product.count({ where: { slug: marker } })).toBe(0);

  expect(await db.order.count()).toBe(record.retainedOrders);
  await finishOwnedSimulatorRun(record);
}
