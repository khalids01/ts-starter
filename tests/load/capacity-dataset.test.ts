import { expect, it } from "bun:test";
import { buildCapacityDataset, CAPACITY_COUNTS } from "./capacity-dataset";
import { persistCapacityDataset } from "./generate-step13";
import { checkStep13Invariants } from "./check-step13-invariants";
import type { PrismaClient } from "../../packages/db/prisma/generated/client";

const options = { runId: "unit", actorUserId: "fictional-actor", baseTime: new Date("2026-10-03T00:00:00Z"), counts: { customers: 10, orders: 100, products: 10, variants: 30 } };
it("prepares the full agreed dataset without a database and keeps launch policies consistent", () => {
  const { rows, manifest } = buildCapacityDataset({ ...options, counts: CAPACITY_COUNTS });
  expect([rows.customers.length, rows.orders.length, rows.products.length, rows.variants.length]).toEqual([10000, 25000, 1000, 3000]);
  expect(rows.customers.every((row) => row.email.endsWith(".example.test"))).toBe(true);
  expect(rows.categories.filter((row) => row.fulfillmentKind !== "gadget").every((row) => row.warrantyDays === 0 && row.serialTracking === "none")).toBe(true);
  expect(rows.warrantyClaims.length).toBeGreaterThan(0);
  expect(rows.payments.length).toBeGreaterThan(0);
  expect(rows.refunds.length).toBeGreaterThan(0);
  expect(rows.products.some((row) => row.status === "draft")).toBe(true);
  expect(manifest.checkoutVariants.some((row) => row.foodSlotId)).toBe(true);
  expect(manifest.adminSessionCookie).toBe("");
});
it("reconciles receipt evidence, physical movements, reservations, slots and discount counters", async () => {
  const { rows } = buildCapacityDataset(options);
  function group(values: { variantId: string; locationId: string; batchId?: string | null; quantity?: number; delta?: number }[], field: "quantity" | "delta") {
    const groups = new Map<string, any>();
    for (const row of values) {
      const key = JSON.stringify([row.variantId, row.locationId, row.batchId ?? null]);
      const value = groups.get(key) ?? { variantId: row.variantId, locationId: row.locationId, batchId: row.batchId ?? null, _sum: { [field]: 0 } };
      value._sum[field] += row[field] ?? 0; groups.set(key, value);
    }
    return [...groups.values()];
  }
  const db = {
    order: { findMany: async (args: any) => args.cursor ? [] : rows.orders.map((order) => ({ ...order, payments: rows.payments.filter((p) => p.orderId === order.id), refunds: rows.refunds.filter((r) => r.orderId === order.id) })) },
    inventoryStock: { findMany: async () => rows.stocks },
    stockReservation: { groupBy: async () => group(rows.reservations.filter((row) => row.status === "active"), "quantity") },
    inventoryMovement: { groupBy: async () => group(rows.movements, "delta") },
    foodDeliverySlot: { findMany: async () => rows.slots }, foodOrderBooking: { findMany: async () => rows.bookings },
    discountCode: { findMany: async () => rows.discounts.map((row) => ({ ...row, redemptions: rows.redemptions.filter((r) => r.discountCodeId === row.id) })) },
    courierConsignment: { findMany: async () => [] }, courierOperation: { groupBy: async () => [], findMany: async () => [], count: async () => 0 },
  } as unknown as PrismaClient;
  const result = await checkStep13Invariants(db);
  expect(result.failures).toEqual({});
  expect(result.passed).toBe(true);
  expect(rows.units.filter((unit) => unit.lineItemId).every((unit) => rows.lines.some((line) => line.id === unit.lineItemId && line.fulfillmentKind === "gadget"))).toBe(true);
  expect(rows.orders.every((order) => rows.customers.some((customer) => customer.id === order.ecommerceCustomerId))).toBe(true);
});
it("uses bounded create batches and stops immediately on write failure", async () => {
  const dataset = buildCapacityDataset({ ...options, counts: { customers: 101, orders: 101, products: 50, variants: 150 } });
  const calls: { table: string; size: number }[] = [];
  const db = new Proxy({}, { get: (_, table) => ({ createMany: async ({ data }: { data: unknown[] }) => {
    calls.push({ table: String(table), size: data.length });
    if (table === "order") throw new Error("fictional write failure");
    return { count: data.length };
  } }) }) as PrismaClient;
  await expect(persistCapacityDataset(db, dataset)).rejects.toThrow("fictional write failure");
  expect(calls.every((call) => call.size <= 100)).toBe(true);
  expect(calls.some((call) => call.table === "ecommerceCustomer" && call.size === 1)).toBe(true);
  expect(calls.some((call) => call.table === "orderLineItem")).toBe(false);
});
it("rejects unsafe identities, impossible counts and oversized fixture plans", () => {
  expect(() => buildCapacityDataset({ ...options, runId: "../unsafe" })).toThrow();
  expect(() => buildCapacityDataset({ ...options, counts: { ...options.counts, variants: 31 } })).toThrow();
  expect(() => buildCapacityDataset({ ...options, counts: { ...CAPACITY_COUNTS, orders: 25001 } })).toThrow();
});
