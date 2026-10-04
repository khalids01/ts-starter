import { assertSimulatorAppEnvironment } from './app-guard';
import { SimulatorControl } from './control';
import { TEST_USERS } from '../../users-config';
const target = assertSimulatorAppEnvironment();
await new SimulatorControl('preflight').ready();
const { default: db } = await import('../../../packages/db/src/client.server');
try {
  // Read-only schema/provisioning checks: never migrate, seed, provision or reset here.
  await Promise.all([db.orderPayment.count(), db.orderRecovery.count(), db.courierShipmentClaim.count(), db.courierOperation.count(), db.courierEvent.count(), db.webhookEvent.count(), db.courierSettlement.count()]);
  for (const user of Object.values(TEST_USERS)) {
    const row = await db.user.findUnique({ where: { email: user.email } });
    if (!row?.emailVerified) throw new Error(`Missing verified existing persona: ${user.key}`);
  }
  const count = await db.rbacPermission.count({ where: { name: { in: ['admin.delivery.dispatch', 'admin.delivery.reconcile', 'admin.orders.payments'] } } });
  if (count !== 3) throw new Error('Missing existing permission catalog; user prerequisite required');
  console.log(JSON.stringify({ database: target.databaseTarget, redis: target.redisTarget, schema: 'present', personas: 'verified', permissions: 'present' }));
} finally { await db.$disconnect(); }
