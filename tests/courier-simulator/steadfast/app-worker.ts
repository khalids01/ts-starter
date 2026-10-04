import { assertSimulatorAppEnvironment } from './app-guard';
import { SimulatorControl } from './control';
assertSimulatorAppEnvironment();
const { createPeerClient } = await import('../../integration/fixtures/courier-worker');
const { CourierDispatchWorker } = await import('../../../apps/server/src/modules/delivery/dispatch-worker');
const { CourierTrackingWorker } = await import('../../../apps/server/src/modules/delivery/tracking-worker');
const { CourierTrackingService } = await import('../../../apps/server/src/modules/delivery/tracking.service');
const { createConfiguredCourierCredentialResolver } = await import('../../../apps/server/src/modules/delivery/credentials.config');
const { createCourierProviderRegistry } = await import('../../../apps/server/src/modules/delivery/registry.config');

export async function runWorker(connectionId: string, mode: 'dispatch' | 'tracking' = 'dispatch', now = new Date(), requestTimeoutMs?: number) {
  await new SimulatorControl('workerready').ready();
  const db = createPeerClient();
  try {
    const connection = await db.courierConnection.findUniqueOrThrow({ where: { id: connectionId }, include: { provider: true } });
    if (!connection.publicId.startsWith('v3-browser-') || connection.provider.code !== 'steadfast' || connection.environment !== 'test' || connection.credentialSource !== 'server_environment')
      throw new Error('Worker requires an owned fictional simulator connection');
    // Scope discovery only. All claims, transactions and writes use the actual independent client.
    const scoped = new Proxy(db, {
      get(client, key) {
        if (key === 'courierOperation' || key === 'courierConsignment') {
          const model = client[key];
          return new Proxy(model, { get(delegate, method) {
            if (method === 'findMany') return (args: any) => (delegate.findMany as any)({ ...args, where: { AND: [args.where, key === 'courierOperation' ? { consignment: { connectionId } } : { connectionId }] } });
            const value = Reflect.get(delegate, method); return typeof value === 'function' ? value.bind(delegate) : value;
          } });
        }
        const value = Reflect.get(client, key); return typeof value === 'function' ? value.bind(client) : value;
      },
    });
    const dependencies = { db: scoped, resolver: createConfiguredCourierCredentialResolver(), registry: createCourierProviderRegistry(), now: () => now };
    return mode === 'dispatch'
      ? await new CourierDispatchWorker({ ...dependencies, requestTimeoutMs }).runOnce()
      : await new CourierTrackingWorker({ ...dependencies, tracking: new CourierTrackingService({ db }) }).runOnce();
  } finally { await db.$disconnect(); }
}

if (import.meta.main) {
  if (!process.send) throw new Error('Peer worker requires an IPC start barrier');
  await new Promise<void>(resolve => {
    process.once('message', message => { if ((message as { type?: string }).type === 'go') resolve(); });
    process.send!({ type: 'ready' });
  });
  console.log(JSON.stringify({ processed: await runWorker(process.argv[2]!) }));
}
