import { assertSimulatorAppEnvironment } from './app-guard';
assertSimulatorAppEnvironment();
const { readOwnedSimulatorRun, releaseCleanedSimulatorRun } = await import('../../e2e/fixtures/simulator-state');
const { cleanupSimulatorFixture } = await import('../../e2e/fixtures/simulator-cleanup');
const { TEST_USERS } = await import('../../users-config');
const { request } = await import('@playwright/test');
const { db, serverUrl } = await import('../../e2e/fixtures/v3');

export async function recoverOwnedSimulatorRun(run: string) {
  const record = await readOwnedSimulatorRun(run);
  if (record.status === 'cleaned') {
    await releaseCleanedSimulatorRun(record);
    return { run, cleaned: true, duplicate: true };
  }
  const api = await request.newContext({ storageState: TEST_USERS.owner.storageStatePath });
  try {
    const response = await api.get(`${serverUrl}/session/context`);
    if (!response.ok() || (await response.json()).primaryRoleSlug !== TEST_USERS.owner.roleSlug)
      throw new Error('Scoped recovery requires the existing isolated owner session');
    await cleanupSimulatorFixture(api, record);
    return { run, cleaned: true, duplicate: false };
  } finally { await api.dispose(); }
}
if (import.meta.main) {
  try { console.log(JSON.stringify(await recoverOwnedSimulatorRun(process.argv[2]!))); }
  finally { await db.$disconnect(); }
}
