import { describe, expect, test } from "bun:test";
import { validateTestEnvironment } from "./assert-test-environment";

const safeEnvironment = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://e2e:secret@127.0.0.1:5433/ts_starter_e2e",
  REDIS_URL: "redis://127.0.0.1:6380",
  REDIS_KEY_PREFIX: "ts-starter:e2e:",
};

describe("validateTestEnvironment", () => {
  test("accepts the dedicated local E2E targets without exposing credentials", () => {
    expect(validateTestEnvironment(safeEnvironment)).toEqual({
      databaseName: "ts_starter_e2e",
      databaseTarget: "postgresql://127.0.0.1:5433/ts_starter_e2e",
      redisTarget: "redis://127.0.0.1:6380",
      redisKeyPrefix: "ts-starter:e2e:",
      isRemote: false,
    });
  });

  test("rejects a development-shaped database name", () => {
    expect(() =>
      validateTestEnvironment({ ...safeEnvironment, DATABASE_URL: "postgresql://e2e:secret@127.0.0.1:5433/saas" }),
    ).toThrow("end with _e2e");
  });

  test("rejects a production-shaped database host", () => {
    expect(() =>
      validateTestEnvironment({ ...safeEnvironment, DATABASE_URL: "postgresql://e2e:secret@production-db:5433/ts_starter_e2e" }),
    ).toThrow("local host");
  });

  test("rejects a development Redis namespace", () => {
    expect(() =>
      validateTestEnvironment({ ...safeEnvironment, REDIS_KEY_PREFIX: "ts-starter:" }),
    ).toThrow("REDIS_KEY_PREFIX must begin");
  });

  test("rejects a configured development database URL", () => {
    expect(() =>
      validateTestEnvironment({ ...safeEnvironment, DATABASE_URL_DEVELOPMENT: safeEnvironment.DATABASE_URL }),
    ).toThrow("must not match DATABASE_URL_DEVELOPMENT");
  });
});
