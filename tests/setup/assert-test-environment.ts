import { TEST_USERS, assertTestUsersAreSafe } from "../users-config";

export type TestEnvironmentInput = {
  NODE_ENV?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  REDIS_KEY_PREFIX?: string;
  DATABASE_URL_DEVELOPMENT?: string;
  DATABASE_URL_PRODUCTION?: string;
  E2E_REMOTE_TEST_URL?: string;
};

export type ValidatedTestEnvironment = {
  databaseName: string;
  databaseTarget: string;
  redisTarget: string;
  redisKeyPrefix: string;
  isRemote: boolean;
};

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const productionLike = /(?:prod(?:uction)?|live|primary|mainnet)/i;

function required(input: TestEnvironmentInput, key: keyof TestEnvironmentInput) {
  const value = input[key];
  if (!value) throw new Error(`Missing required E2E environment variable: ${key}`);
  return value;
}

function parseUrl(value: string, key: string) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL`);
  }
}

function databaseName(url: URL) {
  return decodeURIComponent(url.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
}

function sanitizedUrl(url: URL) {
  return `${url.protocol}//${url.host}${url.pathname}`;
}

function assertLocalHost(url: URL, key: string) {
  if (!localHosts.has(url.hostname)) {
    throw new Error(`${key} must target a local host for the local E2E workflow`);
  }
}

function assertNotProductionLike(value: string, label: string) {
  if (productionLike.test(value)) {
    throw new Error(`${label} contains a production-like target`);
  }
}

export function validateTestEnvironment(
  input: TestEnvironmentInput,
): ValidatedTestEnvironment {
  if (input.NODE_ENV !== "test") {
    throw new Error("NODE_ENV must be exactly test before any E2E mutation");
  }

  assertTestUsersAreSafe();
  const databaseUrl = parseUrl(required(input, "DATABASE_URL"), "DATABASE_URL");
  const redisUrl = parseUrl(required(input, "REDIS_URL"), "REDIS_URL");
  const redisKeyPrefix = required(input, "REDIS_KEY_PREFIX");
  const name = databaseName(databaseUrl);
  const isRemote = Boolean(input.E2E_REMOTE_TEST_URL);

  if (databaseUrl.protocol !== "postgresql:" && databaseUrl.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must use the PostgreSQL protocol");
  }
  if (redisUrl.protocol !== "redis:" && redisUrl.protocol !== "rediss:") {
    throw new Error("REDIS_URL must use the Redis protocol");
  }
  if (name !== "ts_starter_e2e" && !name.endsWith("_e2e")) {
    throw new Error("E2E database name must be ts_starter_e2e or end with _e2e");
  }
  if (!redisKeyPrefix.startsWith("ts-starter:e2e:")) {
    throw new Error("REDIS_KEY_PREFIX must begin with ts-starter:e2e:");
  }
  if (!isRemote) {
    assertLocalHost(databaseUrl, "DATABASE_URL");
    assertLocalHost(redisUrl, "REDIS_URL");
  }

  for (const [label, value] of [
    ["DATABASE_URL", databaseUrl.hostname],
    ["database name", name],
    ["REDIS_URL", redisUrl.hostname],
    ["REDIS_KEY_PREFIX", redisKeyPrefix],
  ] as const) {
    assertNotProductionLike(value, label);
  }

  for (const [label, knownUrl] of [
    ["DATABASE_URL_DEVELOPMENT", input.DATABASE_URL_DEVELOPMENT],
    ["DATABASE_URL_PRODUCTION", input.DATABASE_URL_PRODUCTION],
  ] as const) {
    if (knownUrl && knownUrl === input.DATABASE_URL) {
      throw new Error(`DATABASE_URL must not match ${label}`);
    }
  }

  for (const user of Object.values(TEST_USERS)) {
    if (!user.email.endsWith(".example.test")) {
      throw new Error(`Unsafe configured E2E email: ${user.key}`);
    }
  }

  return {
    databaseName: name,
    databaseTarget: sanitizedUrl(databaseUrl),
    redisTarget: sanitizedUrl(redisUrl),
    redisKeyPrefix,
    isRemote,
  };
}

export function assertTestEnvironment(
  input: TestEnvironmentInput = process.env,
): ValidatedTestEnvironment {
  return validateTestEnvironment(input);
}

export function printValidatedTestEnvironment(
  environment: ValidatedTestEnvironment,
): void {
  console.log("Validated E2E-only targets:");
  console.log(`  database: ${environment.databaseTarget}`);
  console.log(`  redis: ${environment.redisTarget}`);
  console.log(`  redis prefix: ${environment.redisKeyPrefix}`);
  console.log(`  remote workflow: ${environment.isRemote ? "yes" : "no"}`);
}

if (import.meta.main) {
  printValidatedTestEnvironment(assertTestEnvironment());
}
