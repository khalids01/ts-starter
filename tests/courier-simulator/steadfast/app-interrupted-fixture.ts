import { assertSimulatorAppEnvironment } from './app-guard';
assertSimulatorAppEnvironment();
if (!process.send) throw new Error('Interrupted fixture must be started as an owned IPC peer');
const { request } = await import('@playwright/test');
const { TEST_USERS } = await import('../../users-config');
const { simulatorFixture, queueSimulatorOrder } = await import('../../e2e/fixtures/simulator');
const { db, post, serverUrl } = await import('../../e2e/fixtures/v3');
const { runWorker } = await import('./app-worker');
const { callback, sendCallback } = await import('./webhooks');
const api = await request.newContext({ storageState: TEST_USERS.owner.storageStatePath });
let f: Awaited<ReturnType<typeof simulatorFixture>> | undefined;
try {
  f = await simulatorFixture(api);
  const orderId = await queueSimulatorOrder(api, f, '30.00');
  const parcel = await f.register(orderId);
  await runWorker(f.connection.id);
  const consignment = await db.courierConsignment.findFirstOrThrow({ where: { orderId } });
  await post(api, '/admin/delivery/settlements', { consignmentId: consignment.id, externalId: `${f.marker}-early-gross`, amount: '80.00', currency: 'BDT', note: 'Fictional interrupted-run evidence' });
  const response = await sendCallback(`${serverUrl}/courier/webhooks/${f.connection.publicId}`, callback(parcel, 'delivered_approval_pending'));
  if (!response.ok) throw new Error('Fictional callback did not persist');
  process.send!({ type: 'ready', run: f.run, orderId, connectionId: f.connection.id });
  await new Promise<void>(resolve => process.once('message', () => resolve()));
} finally {
  if (f) await f.cleanup();
  await api.dispose();
  await db.$disconnect();
}
