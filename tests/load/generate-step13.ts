import { buildCapacityDataset, CAPACITY_DATASET_VERSION, type CapacityDataset } from "./capacity-dataset";
import { assertTestEnvironment } from "../setup/assert-test-environment";
import { checkStep13Invariants } from "./check-step13-invariants";
import type { PrismaClient } from "../../packages/db/prisma/generated/client";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function persistCapacityDataset(db: PrismaClient, dataset: CapacityDataset) {
  const r = dataset.rows;
  async function batch<T>(label: string, values: T[], write: (data: T[]) => Promise<unknown>) {
    for (let offset = 0; offset < values.length; offset += 100) await write(values.slice(offset, offset + 100));
    console.log(`${label}: ${values.length}`);
  }
  await batch("categories", r.categories, (data) => db.category.createMany({ data }));
  await batch("attributes", r.attributes, (data) => db.productAttribute.createMany({ data }));
  await batch("categoryAttributes", r.categoryAttributes, (data) => db.categoryAttribute.createMany({ data }));
  await batch("products", r.products, (data) => db.product.createMany({ data }));
  await batch("assignments", r.assignments, (data) => db.productAttributeAssignment.createMany({ data }));
  await batch("variants", r.variants, (data) => db.productVariant.createMany({ data }));
  await batch("customers", r.customers, (data) => db.ecommerceCustomer.createMany({ data }));
  await batch("locations", r.locations, (data) => db.inventoryLocation.createMany({ data }));
  await batch("batches", r.batches, (data) => db.inventoryBatch.createMany({ data }));
  await batch("stocks", r.stocks, (data) => db.inventoryStock.createMany({ data }));
  await batch("shipping", r.shipping, (data) => db.shippingRate.createMany({ data }));
  await batch("slots", r.slots, (data) => db.foodDeliverySlot.createMany({ data }));
  await batch("discounts", r.discounts, (data) => db.discountCode.createMany({ data }));
  await batch("orders", r.orders, (data) => db.order.createMany({ data }));
  await batch("addresses", r.addresses, (data) => db.orderAddress.createMany({ data }));
  await batch("lines", r.lines, (data) => db.orderLineItem.createMany({ data }));
  await batch("events", r.events, (data) => db.orderStatusEvent.createMany({ data }));
  await batch("payments", r.payments, (data) => db.orderPayment.createMany({ data }));
  await batch("refunds", r.refunds, (data) => db.orderRefund.createMany({ data }));
  await batch("reservations", r.reservations, (data) => db.stockReservation.createMany({ data }));
  await batch("movements", r.movements, (data) => db.inventoryMovement.createMany({ data }));
  await batch("bookings", r.bookings, (data) => db.foodOrderBooking.createMany({ data }));
  await batch("redemptions", r.redemptions, (data) => db.discountRedemption.createMany({ data }));
  await batch("units", r.units, (data) => db.inventoryUnit.createMany({ data }));
  await batch("allocations", r.allocations, (data) => db.unitAllocation.createMany({ data }));
  await batch("warrantyClaims", r.warrantyClaims, (data) => db.warrantyClaim.createMany({ data }));
  await batch("visitors", r.visitors, (data) => db.visitorIdentity.createMany({ data }));
  await batch("sessions", r.sessions, (data) => db.visitorSession.createMany({ data }));
  await batch("activities", r.activities, (data) => db.activityEvent.createMany({ data }));
}

if (import.meta.main) {
  const apply = process.argv.includes("--apply");
  const runId = process.env.STEP13_FIXTURE_RUN_ID ?? "dryrun";
  const actorUserId = process.env.STEP13_FIXTURE_ACTOR_ID ?? "fictional-dryrun-actor";
  const baseTime = new Date(process.env.STEP13_FIXTURE_BASE_TIME ?? new Date().toISOString());
  // Validate approval/environment before dynamically importing the database client.
  if (apply && process.env.STEP13_FIXTURES_APPROVED !== "true") throw new Error("Explicit capacity fixture approval required before any database access");
  const target = apply ? assertTestEnvironment() : undefined;
  if (apply && (process.env.STEP13_FIXTURES_APPROVED !== "true" || target!.isRemote ||
    !/^e2e_v3_step13_capacity_[a-z0-9_]+$/.test(target!.databaseName) || process.env.STEP13_CAPACITY_DATABASE !== target!.databaseName ||
    !process.env.STEP13_FIXTURE_RUN_ID || !process.env.STEP13_FIXTURE_ACTOR_ID)) throw new Error("Explicit exact local capacity DB/fixture approval and verified fictional actor required");
  const dataset = buildCapacityDataset({ runId, actorUserId, baseTime });
  const directory = resolve("tests/artifacts/step13");
  await mkdir(directory, { recursive: true });
  const report = { datasetVersion: CAPACITY_DATASET_VERSION, runId, baseTime: baseTime.toISOString(), mode: apply ? "apply" : "dry-run-no-db", counts: dataset.manifest.counts };
  if (!apply) {
    await writeFile(resolve(directory, "dataset-dry-run.json"), JSON.stringify(report, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(report, null, 2));
  } else {
    const path = resolve(directory, `capacity-fixtures-${runId}.json`);
    if (await Bun.file(path).exists()) throw new Error("Fixture manifest already exists; never overwrite authenticated artifacts");
    const { default: db } = await import("../../packages/db/src/client.server");
    try {
      // Require an empty commerce/analytics database. Auth/RBAC provisioning is separately approved.
      const counts = await Promise.all([db.category.count(), db.productAttribute.count(), db.categoryAttribute.count(), db.product.count(), db.productAttributeAssignment.count(), db.productVariant.count(), db.ecommerceCustomer.count(), db.inventoryLocation.count(), db.inventoryBatch.count(), db.inventoryStock.count(), db.shippingRate.count(), db.foodDeliverySlot.count(), db.discountCode.count(), db.order.count(), db.orderAddress.count(), db.orderLineItem.count(), db.orderStatusEvent.count(), db.orderPayment.count(), db.orderRefund.count(), db.stockReservation.count(), db.inventoryMovement.count(), db.foodOrderBooking.count(), db.discountRedemption.count(), db.inventoryUnit.count(), db.unitAllocation.count(), db.warrantyClaim.count(), db.visitorIdentity.count(), db.visitorSession.count(), db.activityEvent.count(), db.courierProvider.count(), db.courierConnection.count(), db.courierDispatch.count(), db.courierConsignment.count(), db.courierOperation.count(), db.storeSettings.count()]);
      if (counts.some(Boolean)) throw new Error("Capacity commerce/analytics target must be empty; generator never resets, deletes or resumes partial writes");
      const actor = await db.user.findUnique({ where: { id: actorUserId }, select: { email: true, emailVerified: true } });
      if (!actor?.emailVerified || !actor.email.endsWith(".example.test")) throw new Error("Verified fictional admin actor required");
      await persistCapacityDataset(db, dataset);
      await db.storeSettings.create({ data: { id: "default", storeName: "Fictional capacity shop", checkoutEnabled: true } });
      const invariants = await checkStep13Invariants(db);
      if (!invariants.passed) throw new Error("Prepared dataset failed invariants; quarantine this isolated DB and inspect, never reset automatically");
      await writeFile(path, JSON.stringify({ ...dataset.manifest, databaseName: target!.databaseName, target: "http://localhost:3013", adminEmail: actor.email, invariants }, null, 2), { mode: 0o600, flag: "wx" });
      console.log(JSON.stringify({ ...report, invariantsPassed: true, manifest: path, authenticationRequired: true }, null, 2));
    } finally { await db.$disconnect(); }
  }
}
