import { expect, test } from "bun:test";
import { validatedMigrationTarget } from "./migrate-test-database";
const safe = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://fictional:fictional@127.0.0.1:5433/e2e_step10",
  REDIS_URL: "redis://127.0.0.1:6380",
  REDIS_KEY_PREFIX: "ts-starter:e2e:step10:",
};
test("migration runner validates test target without executing Prisma when imported", () => {
  expect(validatedMigrationTarget(safe).databaseName).toBe("e2e_step10");
});
test("migration runner rejects the development database", () => {
  expect(() =>
    validatedMigrationTarget({
      ...safe,
      DATABASE_URL: "postgresql://fictional:fictional@127.0.0.1:5432/ecommerce",
    }),
  ).toThrow("E2E database name");
});
test("migration runner rejects remote targets even with the remote E2E flag", () => {
  expect(() =>
    validatedMigrationTarget({
      ...safe,
      E2E_REMOTE_TEST_URL: "https://test.example.test",
      DATABASE_URL:
        "postgresql://fictional:fictional@test-db.example.test:5433/e2e_step10",
    }),
  ).toThrow("dedicated local");
});
