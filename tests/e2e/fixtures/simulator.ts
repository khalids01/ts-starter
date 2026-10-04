import { type APIRequestContext } from '@playwright/test';
import { db, fixture, checkout, body, post, serverUrl } from './v3';
import { SimulatorControl } from '../../courier-simulator/steadfast/control';
import { fixture as parcelFixture, type Fault, type Parcel } from '../../courier-simulator/steadfast/contract';
import type { CreateConsignmentRequest } from '../../../apps/server/src/modules/delivery/provider';

import { assertSimulatorAppEnvironment } from '../../courier-simulator/steadfast/app-guard';
import { beginOwnedSimulatorRun, assertNoInterruptedSimulatorRun } from './simulator-state';
import { cleanupSimulatorFixture } from './simulator-cleanup';

export async function simulatorFixture(api: APIRequestContext) {
  await assertNoInterruptedSimulatorRun();
  const run = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
  const marker = `v3-browser-sim-${run}`;
  const simulator = new SimulatorControl(run);
  await simulator.ready();
  const settings = await db.storeSettings.findMany();
  const shippingDefaults = await db.shippingRate.findMany({ where: { isDefault: true } });
  const providerExisted = !!await db.courierProvider.findUnique({ where: { code: 'steadfast' } });
  const record = await beginOwnedSimulatorRun(JSON.parse(JSON.stringify({
    version: 1, run, marker, databaseTarget: assertSimulatorAppEnvironment().databaseTarget,
    status: 'active', settings, shippingDefaults: shippingDefaults.map(({ id, updatedAt }) => ({ id, updatedAt })),
    providerExisted, retainedOrders: await db.order.count(),
  })));
  const cleanup = () => cleanupSimulatorFixture(api, record, simulator);
  try {
    const f = await fixture(api, marker);
    return { ...f, run, simulator, cleanup,
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

export async function queueSimulatorOrder(api: APIRequestContext, f: Awaited<ReturnType<typeof simulatorFixture>>, deposit?: string) {
  const { orderId: id } = await checkout(api, f);
  await body(await api.patch(`${serverUrl}/admin/orders/${id}/status`, { data: { orderStatus: 'confirmed' } }));
  if (deposit) await post(api, `/admin/orders/${id}/payments`, { amount: deposit, currency: 'BDT', method: 'manual_bank', reference: `${id}-deposit`, note: 'Fictional confirmed evidence' });
  const dispatch = await post<{ id: string }>(api, `/admin/delivery/orders/${id}/confirm`, { connectionId: f.connection.id, serviceId: f.service.id, overrideReason: 'Fictional test route' });
  await post(api, `/admin/delivery/dispatches/${dispatch.id}/queue`, {});
  return id;
}
