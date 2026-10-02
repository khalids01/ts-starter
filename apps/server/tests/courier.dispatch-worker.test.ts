import { courierRequestSnapshot } from "../src/modules/delivery/dispatch-snapshot";
import { describe, expect, it, mock } from "bun:test";
mock.module("@env/server", () => ({ env: {} }));
mock.module("@db/server", () => ({ default: {} }));
const { CourierDispatchWorker } = await import("../src/modules/delivery/dispatch-worker");
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";

function harness() {
  const operation: any = { id: "operation-1", consignmentId: "consignment-1", kind: "create", identity: "create:dispatch-1", state: "pending", attemptCount: 0, nextAttemptAt: new Date(0), leaseUntil: null };
  const consignment: any = { id: "consignment-1", orderId: "order-1", dispatchId: "dispatch-1", connectionId: "connection-1", service: { enabled: true, connectionId: "connection-1", archivedAt: null }, requestSnapshot: { invoice: "ORD-1", recipientName: "Jahid", recipientPhone: "01712345678", recipientAddress: "Dhaka", codAmount: "100", currency: "BDT" }, connection: { enabled: true, healthState: "healthy", archivedAt: null, publicId: "public-1", credentialSource: "server_environment", provider: { code: "fake" } }, dispatch: { id: "dispatch-1" }, order: { orderStatus: "confirmed", inventoryStatus: "committed", recovery: null } };
  Object.assign(consignment.order, { orderNumber: "ORD-1", totalAmount: "100.00", currency: "BDT", paymentMethod: "cash_on_delivery", paymentStatus: "unpaid", payments: [], refunds: [], addresses: [{ type: "shipping", fullName: "Jahid", phone: "01712345678", line1: "Dhaka" }] });
  consignment.requestSnapshot = courierRequestSnapshot(consignment.order);
  operation.consignment = { connectionId: consignment.connectionId };
  const updates: any[] = [];
  const db: any = {
    orderLineItem: { findMany: mock(async () => []) },
    unitAllocation: { updateMany: mock(async () => ({ count: 0 })) },
    inventoryUnit: { updateMany: mock(async () => ({ count: 0 })) },
    stockReservation: { findFirst: mock(async () => null) },
    courierConnection: { updateMany: mock(async ({ data }: any) => { Object.assign(consignment.connection, data); return { count: 1 }; }) },
    courierShipmentClaim: { findUnique: mock(async () => ({ orderId: "order-1", dispatchId: "dispatch-1" })) },
    courierOperation: {
      findMany: mock(async () => [operation]),
      updateMany: mock(async ({ where, data }: any) => {
        if (where.leaseToken && where.leaseToken !== operation.leaseToken) return { count: 0 };
        if (typeof where.state === "string" && where.state !== operation.state) return { count: 0 };
        if (where.OR && !["pending", "retry", "processing"].includes(operation.state)) return { count: 0 };
        const { attemptCount, ...fields } = data;
        Object.assign(operation, fields);
        operation.attemptCount += attemptCount?.increment ?? -(attemptCount?.decrement ?? 0);
        updates.push(["operation", data]); return { count: 1 };
      }),
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
    expect(db.courierOperation.updateMany.mock.calls[0]?.[0].data.leaseToken).toBeString();
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

import { CourierProviderRequestError } from "../src/modules/delivery/providers/steadfast";

it.each(["enabled", "archivedAt", "healthState"])("holds unavailable connection: %s", async (field) => {
  const h = harness(); h.consignment.connection[field] = field === "enabled" ? false : field === "archivedAt" ? new Date() : "auth_failed";
  await h.worker.runOnce(); expect(h.adapter.createConsignment).not.toHaveBeenCalled(); expect(h.operation.lastErrorCode).toBe("connection_unavailable");
});
it("holds a disabled service and unknown operation kind", async () => {
  const h = harness(); h.consignment.service.enabled = false;
  await h.worker.runOnce(); expect(h.operation.lastErrorCode).toBe("service_unavailable");
  const u = harness(); u.operation.kind = "other"; await u.worker.runOnce(); expect(u.operation.lastErrorCode).toBe("unsupported_operation");
});
it("rereads order eligibility after credentials resolve", async () => {
  const h = harness(); h.worker["dependencies"].resolver.resolve = async () => { h.consignment.order.orderStatus = "cancelled"; return { baseUrl: "https://example.test", values: {} }; };
  await h.worker.runOnce(); expect(h.adapter.createConsignment).not.toHaveBeenCalled();
});
it("recovers expired processing before create and holds status-only results", async () => {
  const h = harness(); h.operation.state = "processing"; h.operation.attemptCount = 1; h.operation.leaseUntil = new Date(0);
  h.adapter.recoverConsignment = mock(async () => ({ kind: "uncertain", providerState: "pending" }));
  await h.worker.runOnce(); expect(h.adapter.createConsignment).not.toHaveBeenCalled(); expect(h.adapter.recoverConsignment).toHaveBeenCalledTimes(1); expect(h.operation.lastErrorCode).toBe("uncertain_submission");
});
it("holds uncertain retry when adapter cannot recover", async () => {
  const h = harness(); h.operation.attemptCount = 1;
  await h.worker.runOnce(); expect(h.adapter.createConsignment).not.toHaveBeenCalled(); expect(h.operation.lastErrorCode).toBe("recovery_not_supported");
});
it("persists a complete recovered identity without another create", async () => {
  const h = harness(); h.operation.attemptCount = 1;
  h.adapter.recoverConsignment = async (_, invoice) => ({ kind: "found", consignment: { externalId: "recovered", invoice, trackingCode: null, providerState: "pending" } });
  await h.worker.runOnce(); expect(h.consignment.externalId).toBe("recovered"); expect(h.adapter.createConsignment).not.toHaveBeenCalled();
});
it("disables credentials on authentication failure", async () => {
  const h = harness(); h.adapter.createConsignment = mock(async () => { throw new CourierProviderRequestError("Rejected", { code: "authentication", retryable: false }); });
  await h.worker.runOnce(); expect(h.consignment.connection.enabled).toBe(false); expect(h.consignment.connection.healthState).toBe("auth_failed");
});
it("persists a rate cooldown and keeps identity stable", async () => {
  const h = harness(); h.adapter.createConsignment = mock(async () => { throw new CourierProviderRequestError("Rate", { code: "rate_limited", retryable: true, retryAfterSeconds: 120 }); });
  await h.worker.runOnce(); expect(h.operation.state).toBe("retry"); expect(h.consignment.connection.cooldownUntil).toEqual(new Date("2026-01-01T00:02:00Z")); expect(h.operation.identity).toBe("create:dispatch-1");
});
it("cooldown does not count as an external attempt", async () => {
  const h = harness(); h.consignment.connection.cooldownUntil = new Date("2026-01-01T01:00:00Z");
  await h.worker.runOnce(); expect(h.operation.attemptCount).toBe(0); expect(h.adapter.createConsignment).not.toHaveBeenCalled();
});
it("stale completion cannot mutate consignment or newer operation", async () => {
  const h = harness(); h.adapter.createConsignment = async (_, request) => { h.operation.leaseToken = "new-owner"; return { externalId: "late", invoice: request.invoice, trackingCode: null, providerState: "pending" }; };
  await h.worker.runOnce(); expect(h.consignment.externalId).toBeUndefined(); expect(h.operation.state).toBe("processing");
});
it("holds provider success with a local save failure without scheduling another create", async () => {
  const h = harness(); h.db.courierConsignment.update.mockRejectedValueOnce(new Error("local failure"));
  // Transaction rollback is simulated explicitly here; real rollback is Step 10 evidence.
  const original = h.db.$transaction; h.db.$transaction = async (callback: any) => { const saved = { ...h.operation }; try { return await original(callback); } catch (e) { Object.assign(h.operation, saved); throw e; } };
  await h.worker.runOnce(); expect(h.operation.lastErrorCode).toBe("provider_success_local_save_failed"); expect(h.operation.state).toBe("manual_review"); expect(h.adapter.createConsignment).toHaveBeenCalledTimes(1);
});
it("connection lease loss skips all operation and provider work", async () => {
  const h = harness(); h.db.courierConnection.updateMany.mockResolvedValueOnce({ count: 0 });
  expect(await h.worker.runOnce()).toBe(0); expect(h.adapter.createConsignment).not.toHaveBeenCalled();
});

it("holds committed stock which expired after queueing", async () => { const h = harness(); h.db.stockReservation.findFirst.mockResolvedValue({ id: "unsafe" }); await h.worker.runOnce(); expect(h.adapter.createConsignment).not.toHaveBeenCalled(); expect(h.operation.lastErrorCode).toBe("inventory_expired_or_unsafe"); });

it("deadline bounds a nonresponsive adapter and retains the connection lease until expiry", async () => {
  const h = harness(); h.worker["dependencies"].requestTimeoutMs = 1;
  h.adapter.createConsignment = mock(() => new Promise(() => {}));
  await h.worker.runOnce();
  expect(h.operation.state).toBe("retry"); expect(h.operation.lastErrorCode).toBe("network");
  expect(h.consignment.connection.dispatchLeaseToken).toBeString(); expect(h.consignment.connection.dispatchLeaseUntil).toEqual(new Date("2026-01-01T00:02:00Z"));
});
it("overlapping ticks cannot acquire the same durable connection lease", async () => {
  const h = harness(); let leased = false;
  h.db.courierConnection.updateMany = mock(async ({ where, data }: any) => {
    if (where.OR) { if (leased) return { count: 0 }; leased = true; Object.assign(h.consignment.connection, data); return { count: 1 }; }
    if (where.dispatchLeaseToken === h.consignment.connection.dispatchLeaseToken) { leased = false; Object.assign(h.consignment.connection, data); return { count: 1 }; }
    return { count: 0 };
  });
  const result = await Promise.all([h.worker.runOnce(), h.worker.runOnce()]);
  expect(result.reduce((sum, count) => sum + count, 0)).toBe(1); expect(h.adapter.createConsignment).toHaveBeenCalledTimes(1);
});
it("authentication failure stops sibling operations on the same connection", async () => {
  const h = harness(); const sibling = { ...h.operation, id: "operation-2", consignmentId: "consignment-2" };
  h.db.courierOperation.findMany.mockResolvedValue([h.operation, sibling]);
  h.db.courierOperation.findUnique = mock(async ({ where }: any) => ({ ...(where.id === sibling.id ? sibling : h.operation), consignment: h.consignment }));
  h.db.courierOperation.updateMany = mock(async ({ where, data }: any) => {
    const target = where.id === sibling.id ? sibling : h.operation;
    if (where.leaseToken && where.leaseToken !== target.leaseToken) return { count: 0 };
    const { attemptCount, ...fields } = data; Object.assign(target, fields); target.attemptCount += attemptCount?.increment ?? 0; return { count: 1 };
  });
  h.adapter.createConsignment = mock(async () => { throw new CourierProviderRequestError("Rejected", { code: "authentication", retryable: false }); });
  await h.worker.runOnce(); expect(h.adapter.createConsignment).toHaveBeenCalledTimes(1); expect(sibling.state).toBe("manual_review"); expect(sibling.lastErrorCode).toBe("connection_unavailable");
});
