import { courierRequestSnapshot } from "../src/modules/delivery/dispatch-snapshot";
import { describe, expect, it, mock } from "bun:test";
mock.module("@env/server", () => ({ env: {} }));
mock.module("@db/server", () => ({ default: {} }));
const { CourierDispatchWorker } = await import("../src/modules/delivery/dispatch-worker");
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";

function harness() {
  const operation: any = { id: "operation-1", consignmentId: "consignment-1", kind: "create", identity: "create:dispatch-1", state: "pending", attemptCount: 0, nextAttemptAt: new Date(0), leaseUntil: null };
  const consignment: any = { id: "consignment-1", orderId: "order-1", dispatchId: "dispatch-1", requestSnapshot: { invoice: "ORD-1", recipientName: "Jahid", recipientPhone: "01712345678", recipientAddress: "Dhaka", codAmount: "100", currency: "BDT" }, connection: { publicId: "public-1", credentialSource: "server_environment", provider: { code: "fake" } }, dispatch: { id: "dispatch-1" }, order: { orderStatus: "confirmed", inventoryStatus: "committed", recovery: null } };
  Object.assign(consignment.order, { orderNumber: "ORD-1", totalAmount: "100.00", currency: "BDT", paymentMethod: "cash_on_delivery", paymentStatus: "unpaid", payments: [], refunds: [], addresses: [{ type: "shipping", fullName: "Jahid", phone: "01712345678", line1: "Dhaka" }] });
  consignment.requestSnapshot = courierRequestSnapshot(consignment.order);
  const updates: any[] = [];
  const db: any = {
    courierShipmentClaim: { findUnique: mock(async () => ({ orderId: "order-1", dispatchId: "dispatch-1" })) },
    courierOperation: {
      findMany: mock(async () => [operation]),
      updateMany: mock(async ({ data }: any) => { operation.state = data.state; operation.attemptCount += 1; operation.leaseUntil = data.leaseUntil; return { count: 1 }; }),
      findUnique: mock(async () => ({ ...operation, consignment })),
      update: mock(async ({ data }: any) => { Object.assign(operation, data); updates.push(["operation", data]); return operation; }),
    },
    courierConsignment: { update: mock(async ({ data }: any) => { Object.assign(consignment, data); updates.push(["consignment", data]); }) },
    courierDispatch: { update: mock(async ({ data }: any) => updates.push(["dispatch", data])) },
    courierException: { create: mock(async ({ data }: any) => updates.push(["exception", data])) },
  };
  db.$transaction = async (callback: any) => callback(db);
  const adapter: CourierProviderAdapter = {
    code: "fake",
    capabilities: new Set(["createConsignment", "getConsignmentStatus"]),
    healthCheck: async () => ({ available: true }),
    createConsignment: mock(async (_credentials, request) => ({ externalId: "external-1", invoice: request.invoice, trackingCode: "track-1", providerState: "in_review" })),
    getConsignmentStatus: async () => ({ providerState: "pending" }),
  };
  const worker = new CourierDispatchWorker({
    db,
    resolver: { resolve: mock(async () => ({ baseUrl: "https://example.test", values: {} })) },
    registry: new CourierProviderRegistry().register(adapter),
    now: () => new Date("2026-01-01T00:00:00Z"),
  });
  return { worker, operation, consignment, updates, adapter, db };
}

describe("courier dispatch outbox worker", () => {
  it("leases and completes a create operation exactly through its identity", async () => {
    const { worker, operation, consignment, updates, adapter } = harness();
    expect(await worker.runOnce()).toBe(1);
    expect(adapter.createConsignment).toHaveBeenCalledTimes(1);
    expect(operation.state).toBe("completed");
    expect(consignment).toMatchObject({ externalId: "external-1", trackingCode: "track-1", state: "submitted" });
    expect(updates).toContainEqual(["dispatch", { status: "submitted" }]);
  });
});


describe("cancelled and recovered order dispatch protection", () => {
  it("does not submit an order cancelled after the worker scan", async () => {
    const { worker, consignment, adapter, operation, db } = harness();
    consignment.order.orderStatus = "cancelled";
    await worker.runOnce();
    expect(adapter.createConsignment).not.toHaveBeenCalled();
    expect(operation.state).toBe("manual_review");
    expect(db.courierOperation.updateMany.mock.calls[0]?.[0].where.consignment.order).toMatchObject({ inventoryStatus: "committed", recovery: { is: null } });
  });
  it.each(["restocked", "released"])("does not submit %s inventory", async (status) => {
    const { worker, consignment, adapter } = harness();
    consignment.order.inventoryStatus = status; await worker.runOnce();
    expect(adapter.createConsignment).not.toHaveBeenCalled();
  });
  it("does not book physically received goods", async () => {
    const { worker, consignment, adapter } = harness();
    consignment.order.recovery = { id: "recovery-1" }; await worker.runOnce();
    expect(adapter.createConsignment).not.toHaveBeenCalled();
  });
  it("skips a job when cancellation wins its lease race", async () => {
    const { worker, adapter, db } = harness();
    db.courierOperation.updateMany.mockResolvedValueOnce({ count: 0 });
    expect(await worker.runOnce()).toBe(0); expect(adapter.createConsignment).not.toHaveBeenCalled();
  });
});


it("holds changed money for review before any provider call", async () => {
  const { worker, consignment, adapter, operation } = harness();
  consignment.order.paymentStatus = "partially_paid";
  consignment.order.payments = [{ id: "deposit-1", entryType: "receipt", amount: "30", currency: "BDT" }];
  await worker.runOnce();
  expect(adapter.createConsignment).not.toHaveBeenCalled(); expect(operation.state).toBe("manual_review"); expect(operation.lastErrorCode).toBe("payment_or_address_review_changed");
});


it.each([null, { orderId: "order-1", dispatchId: "other-dispatch" }])("never submits without the matching claim %j", async (claim) => {
  const { worker, adapter, operation, db } = harness();
  db.courierShipmentClaim.findUnique.mockResolvedValue(claim);
  await worker.runOnce();
  expect(adapter.createConsignment).not.toHaveBeenCalled(); expect(operation.lastErrorCode).toBe("shipment_claim_missing_or_changed");
});
