import { expect, test } from 'bun:test';
import { assertSimulatorAppEnvironment } from './app-guard';
const safe = {
  NODE_ENV: 'test', E2E_MODE: 'true', COURIER_SIMULATOR_APP_APPROVED: 'true', COURIER_WORKERS_ENABLED: 'false',
  DATABASE_URL: 'postgresql://fictional:fictional@127.0.0.1:5433/e2e_v3_step10_20261003_03043274',
  REDIS_URL: 'redis://127.0.0.1:6380', REDIS_KEY_PREFIX: 'ts-starter:e2e:step10:e2e_v3_step10_20261003_03043274:',
  STEAD_FAST_BASE_URL: 'http://localhost:9099', STEAD_FAST_API_KEY: 'sim-fictional-key', STEAD_FAST_SECRET_KEY: 'sim-fictional-secret', STEAD_FAST_WEBHOOK_TOKEN: 'sim-fictional-webhook-token',
};
test('app guard rejects alternate test targets, credentials, workers, external services and missing approval before imports', () => {
  const keys = [...Object.keys(safe), 'E2E_REMOTE_TEST_URL', 'DATABASE_URL_DEVELOPMENT', 'DATABASE_URL_PRODUCTION', 'SMTP_HOST', 'EMAIL_PASSWORD', 'POLAR_ACCESS_TOKEN', 'POLAR_WEBHOOK_SECRET', 'FILE_SERVER_URL', 'FILE_SERVER_API_KEY', 'COURIER_CREDENTIAL_ENCRYPTION_KEYS'];
  const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  try {
    keys.forEach(k => delete process.env[k]);
    Object.assign(process.env, safe);
    expect(assertSimulatorAppEnvironment().databaseName).toBe('e2e_v3_step10_20261003_03043274');
    for (const [key, value] of Object.entries({ COURIER_SIMULATOR_APP_APPROVED: 'false', E2E_MODE: 'false', DATABASE_URL: 'postgresql://fictional:fictional@127.0.0.1:5433/another_e2e', REDIS_URL: 'redis://127.0.0.1:6381', REDIS_KEY_PREFIX: 'ts-starter:e2e:other:', STEAD_FAST_BASE_URL: 'https://portal.packzy.com/api/v1', STEAD_FAST_API_KEY: 'wrong', COURIER_WORKERS_ENABLED: 'true', SMTP_HOST: 'smtp.example.test', POLAR_ACCESS_TOKEN: 'fictional-but-forbidden' })) {
      process.env[key] = value;
      expect(() => assertSimulatorAppEnvironment()).toThrow();
      if (key in safe) process.env[key] = safe[key as keyof typeof safe]; else delete process.env[key];
    }
  } finally { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete process.env[key]; else process.env[key] = value; }
});
