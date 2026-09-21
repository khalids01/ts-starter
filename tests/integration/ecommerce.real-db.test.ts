import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import prisma from "../../packages/db/src/client.server";
import { assertTestEnvironment, printValidatedTestEnvironment } from "../setup/assert-test-environment";

const runId = crypto.randomUUID();
const email = `step82-${runId}@northstar.example.test`;
const rollbackEmail = `step82-rollback-${runId}@northstar.example.test`;
const normalizedEmail = email.toLowerCase();

describe("ecommerce real PostgreSQL invariants", () => {
  beforeAll(() => {
    printValidatedTestEnvironment(assertTestEnvironment());
  });

  afterAll(async () => {
    await prisma.ecommerceCustomer.deleteMany({
      where: { normalizedEmail: { in: [normalizedEmail, rollbackEmail] } },
    });
    await prisma.$disconnect();
  });

  it("enforces normalized customer email uniqueness under concurrent writes", async () => {
    const writes = await Promise.allSettled([
      prisma.ecommerceCustomer.create({
        data: { name: "Concurrency One", email, normalizedEmail },
      }),
      prisma.ecommerceCustomer.create({
        data: { name: "Concurrency Two", email: email.toUpperCase(), normalizedEmail },
      }),
    ]);

    expect(writes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(writes.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(await prisma.ecommerceCustomer.count({ where: { normalizedEmail } })).toBe(1);
  });

  it("rolls back all writes when a transaction fails", async () => {
    await expect(prisma.$transaction(async (tx) => {
      await tx.ecommerceCustomer.create({
        data: { name: "Rollback", email: rollbackEmail, normalizedEmail: rollbackEmail },
      });
      throw new Error("intentional rollback probe");
    })).rejects.toThrow("intentional rollback probe");

    expect(await prisma.ecommerceCustomer.count({ where: { normalizedEmail: rollbackEmail } })).toBe(0);
  });
});
