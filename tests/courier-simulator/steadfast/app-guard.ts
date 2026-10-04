import { assertTestEnvironment } from '../../setup/assert-test-environment';
import { credentials, ORIGIN } from './contract';

export function assertSimulatorAppEnvironment() {
  const target = assertTestEnvironment();
  if (process.env.COURIER_SIMULATOR_APP_APPROVED !== 'true' || process.env.E2E_MODE !== 'true' || target.isRemote)
    throw new Error('Simulator app tests require explicitly approved local E2E mode');
  if (target.databaseTarget !== 'postgresql://127.0.0.1:5433/e2e_v3_step10_20261003_03043274' || target.redisTarget !== 'redis://127.0.0.1:6380' || target.redisKeyPrefix !== 'ts-starter:e2e:step10:e2e_v3_step10_20261003_03043274:')
    throw new Error('Simulator app tests require the reviewed existing Step 10/11 targets');
  if (process.env.STEAD_FAST_BASE_URL !== ORIGIN || process.env.STEAD_FAST_API_KEY !== credentials.values.apiKey || process.env.STEAD_FAST_SECRET_KEY !== credentials.values.secretKey || process.env.STEAD_FAST_WEBHOOK_TOKEN !== credentials.values.webhookToken || process.env.COURIER_WORKERS_ENABLED !== 'false')
    throw new Error('Require fictional simulator credentials and disabled automatic workers');
  for (const key of ['SMTP_HOST', 'EMAIL_PASSWORD', 'POLAR_ACCESS_TOKEN', 'POLAR_WEBHOOK_SECRET', 'FILE_SERVER_URL', 'FILE_SERVER_API_KEY', 'COURIER_CREDENTIAL_ENCRYPTION_KEYS'])
    if (process.env[key]) throw new Error(`External configuration forbidden: ${key}`);
  return target;
}
