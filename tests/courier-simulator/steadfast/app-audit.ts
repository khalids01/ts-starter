import { assertSimulatorAppEnvironment } from './app-guard';
assertSimulatorAppEnvironment();
const { assertNoInterruptedSimulatorRun } = await import('../../e2e/fixtures/simulator-state');
await assertNoInterruptedSimulatorRun();
const { default: db } = await import('../../../packages/db/src/client.server');
try {
  const prefix = 'v3-browser-sim-';
  const leftovers = {
    products: await db.product.count({ where: { slug: { startsWith: prefix } } }),
    categories: await db.category.count({ where: { slug: { startsWith: prefix } } }),
    locations: await db.inventoryLocation.count({ where: { code: { startsWith: prefix } } }),
    shipping: await db.shippingRate.count({ where: { code: { startsWith: prefix } } }),
    connections: await db.courierConnection.count({ where: { publicId: { startsWith: prefix } } }),
    customers: await db.ecommerceCustomer.count({ where: { normalizedEmail: { startsWith: prefix } } }),
    orders: await db.order.count({ where: { customerEmail: { startsWith: prefix } } }),
    webhooks: await db.webhookEvent.count({ where: { provider: { startsWith: `courier:steadfast:${prefix}` } } }),
  };
  if (Object.values(leftovers).some(Boolean)) throw new Error(`Owned fixture residue: ${JSON.stringify(leftovers)}`);
  const mappings = await (await fetch('http://localhost:9099/__admin/mappings', { redirect: 'error', signal: AbortSignal.timeout(5000) })).json();
  if (mappings.mappings.some((m: any) => m.metadata?.simulatorRun)) throw new Error('Simulator mapping residue; inspect owned run before cleanup');
  console.log(JSON.stringify({ leftovers, settings: await db.storeSettings.findMany(), defaultShipping: await db.shippingRate.findMany({ where: { isDefault: true }, select: { id: true, isDefault: true, updatedAt: true } }), totalOrders: await db.order.count(), simulatorMappings: mappings.mappings.length }));
} finally { await db.$disconnect(); }
