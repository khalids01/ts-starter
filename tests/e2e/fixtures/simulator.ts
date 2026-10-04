import { expect, type APIRequestContext } from '@playwright/test';
import { db, fixture, body, serverUrl } from './v3';
import { SimulatorControl } from '../../courier-simulator/steadfast/control';
import { fixture as parcelFixture, type Fault, type Parcel } from '../../courier-simulator/steadfast/contract';
import type { CreateConsignmentRequest } from '../../../apps/server/src/modules/delivery/provider';

export async function simulatorFixture(api: APIRequestContext) {
  const run = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
  const marker = `v3-browser-sim-${run}`;
  const simulator = new SimulatorControl(run);
  await simulator.ready();
  const settings = await db.storeSettings.findMany();
  const shippingDefaults = await db.shippingRate.findMany({ where: { isDefault: true } });
  const providerExisted = !!await db.courierProvider.findUnique({ where: { code: 'steadfast' } });
  const cleanup = async () => {
    await simulator.cleanup();
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
      for (const rate of shippingDefaults) await tx.shippingRate.update({ where: { id: rate.id }, data: { isDefault: true, updatedAt: rate.updatedAt } });
      for (const row of settings) await tx.storeSettings.update({ where: { id: row.id }, data: row });
      if (!providerExisted) await tx.courierProvider.deleteMany({ where: { code: 'steadfast', connections: { none: {} } } });
    });
    // Invalidate restored settings through the existing authenticated route/service cache.
    if (settings[0]) {
      const { id, createdAt, updatedAt, ...data } = settings[0];
      await body(await api.put(serverUrl + '/admin/store-settings', { data }));
      await db.storeSettings.update({ where: { id }, data: { updatedAt } });
    }
    expect(await db.order.count({ where: orderWhere })).toBe(0);
    expect(await db.courierConnection.count({ where: connections })).toBe(0);
    expect(await db.product.count({ where: { slug: marker } })).toBe(0);
  };
  try {
    const f = await fixture(api, marker);
    return { ...f, simulator, cleanup,
      async register(orderId: string, fault: Fault = 'none'): Promise<Parcel> {
        const c = await db.courierConsignment.findFirstOrThrow({ where: { orderId, connectionId: f.connection.id, active: true } });
        const parcel = parcelFixture(run, 'app', crypto.randomUUID().slice(0, 8), String(c.codAmount));
        parcel.request = c.requestSnapshot as unknown as CreateConsignmentRequest;
        // App generates its own stable attempt invoice; simulator scenario ownership stays run-scoped.
        await simulator.register(parcel, fault);
        return parcel;
      },
    };
  } catch (error) { await cleanup(); throw error; }
}
