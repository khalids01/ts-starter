import { request } from '@playwright/test';
import { assertSimulatorAppEnvironment } from './app-guard';
import { TEST_USERS } from '../../users-config';
assertSimulatorAppEnvironment();
for (const user of Object.values(TEST_USERS)) {
  const api = await request.newContext({ baseURL: 'http://localhost:3000' });
  try {
    const response = await api.post('/api/auth/sign-in/email', { data: { email: user.email, password: user.password }, headers: { origin: 'http://localhost:3001' } });
    if (!response.ok()) throw new Error(`Existing persona login failed: ${user.key} (${response.status()})`);
    const context = await (await api.get('/session/context')).json();
    if (context.user?.email !== user.email || context.primaryRoleSlug !== user.roleSlug) throw new Error(`Persona role mismatch: ${user.key}`);
    await api.storageState({ path: user.storageStatePath });
    console.log(`Verified existing session: ${user.key}`);
  } finally { await api.dispose(); }
}
