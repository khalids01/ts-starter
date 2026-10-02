import { expect, it, mock } from "bun:test";
mock.module("@env/server", () => ({ env: {} }));
mock.module("@db/server", () => ({ default: {} }));
const { CourierRoutingDispatchService } =
  await import("../src/modules/admin/delivery/routing-dispatch.service");
import { canRetryUnsubmittedHold } from "../src/modules/delivery/dispatch-policy";
import { courierRequestSnapshot } from "../src/modules/delivery/dispatch-snapshot";
function harness() {
  const order: any = {
    id: "order",
    orderNumber: "ORD-1",
    orderStatus: "confirmed",
    inventoryStatus: "committed",
    deliveryStatus: "unfulfilled",
    recovery: null,
    totalAmount: "100",
    currency: "BDT",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "unpaid",
    payments: [],
    refunds: [],
    addresses: [
      {
        type: "shipping",
        fullName: "Customer",
        phone: "01700000000",
        line1: "Address",
      },
    ],
  };
  const op: any = {
    id: "op",
    identity: "create:dispatch",
    kind: "create",
    state: "manual_review",
    attemptCount: 1,
    leaseUntil: null,
    lastErrorCode: "connection_unavailable",
  };
  const c: any = {
    id: "consignment",
    orderId: "order",
    dispatchId: "dispatch",
    connectionId: "connection",
    externalId: null,
    submittedAt: null,
    invoice: courierRequestSnapshot(order).invoice,
    requestSnapshot: courierRequestSnapshot(order),
    operations: [op],
    order,
    connection: { enabled: true, healthState: "healthy" },
    service: { enabled: true, connectionId: "connection" },
  };
  const events: any[] = [];
  const db: any = {
    courierConsignment: {
      findUnique: async () => c,
      update: mock(async ({ data }: any) => {
        Object.assign(c, data);
        return c;
      }),
    },
    courierShipmentClaim: {
      findUnique: async () => ({ dispatchId: "dispatch" }),
    },
    courierOperation: {
      updateMany: async ({ data }: any) => {
        Object.assign(op, data);
        return { count: 1 };
      },
    },
    courierException: {
      findFirst: async () => null,
      updateMany: mock(async () => ({ count: 1 })),
    },
    courierDispatch: { update: mock(async () => ({})) },
    unitAllocation: { updateMany: async () => ({ count: 0 }) },
    inventoryUnit: { updateMany: async () => ({ count: 0 }) },
    stockReservation: { findFirst: async () => null },
    orderLineItem: { findMany: async () => [] },
    orderStatusEvent: { create: async ({ data }: any) => events.push(data) },
  };
  db.$transaction = async (callback: any) => callback(db);
  const service = new CourierRoutingDispatchService({
    db,
    activity: { record: mock(async () => {}) },
  });
  return { op, c, db, events, service };
}
it("reviewed never-submitted hold resumes the same identity and resolves only its preflight exception", async () => {
  const h = harness();
  await h.service.retryUnsubmittedHold(
    h.c.id,
    "Connection restored and stock checked",
    "actor",
  );
  expect(h.op.state).toBe("pending");
  expect(h.op.attemptCount).toBe(0);
  expect(h.op.identity).toBe("create:dispatch");
  expect(h.events).toHaveLength(1);
  expect(h.db.courierException.updateMany.mock.calls[0]?.[0].where.kind).toBe(
    "connection_unavailable",
  );
  await expect(
    h.service.retryUnsubmittedHold(h.c.id, "Again", "actor"),
  ).rejects.toThrow("reconciliation");
});
it.each([
  "uncertain_submission",
  "network",
  "provider_success_local_save_failed",
  "authentication",
  "invalid_response",
])("%s cannot be turned into a fresh create", async (code) => {
  const h = harness();
  h.op.lastErrorCode = code;
  await expect(
    h.service.retryUnsubmittedHold(h.c.id, "Review", "actor"),
  ).rejects.toThrow("reconciliation");
  expect(h.db.courierConsignment.update).not.toHaveBeenCalled();
});
it.each(["external", "attempted", "leased", "cancelled", "changed-money"])(
  "rejects unsafe hold retry: %s",
  async (reason) => {
    const h = harness();
    if (reason === "external") h.c.externalId = "accepted";
    if (reason === "attempted") h.op.attemptCount = 2;
    if (reason === "leased") h.op.leaseUntil = new Date();
    if (reason === "cancelled") h.c.order.orderStatus = "cancelled";
    if (reason === "changed-money") h.c.order.totalAmount = "120";
    await expect(
      h.service.retryUnsubmittedHold(h.c.id, "Review", "actor"),
    ).rejects.toThrow();
    expect(h.events).toHaveLength(0);
    expect(h.op.state).toBe("manual_review");
  },
);
it("retry policy never permits a leased or accepted booking", () => {
  const h = harness();
  expect(canRetryUnsubmittedHold(h.op, h.c)).toBe(true);
  h.op.leaseUntil = new Date(0);
  expect(canRetryUnsubmittedHold(h.op, h.c)).toBe(false);
});

it("merchant identity reconciliation completes the original operation without delivery or money changes", async () => {
  const h = harness();
  h.op.lastErrorCode = "network";
  const input = {
    invoice: h.c.invoice,
    externalId: "merchant-123",
    providerState: "in_review",
    note: "Merchant dashboard verified by operator",
  };
  expect(await h.service.reconcileBooking(h.c.id, input, "actor")).toEqual({
    success: true,
    duplicate: false,
  });
  expect(h.c.externalId).toBe("merchant-123");
  expect(h.op.state).toBe("completed");
  expect(h.c.order.deliveryStatus).toBe("unfulfilled");
  expect(h.c.order.paymentStatus).toBe("unpaid");
  expect(await h.service.reconcileBooking(h.c.id, input, "actor")).toEqual({
    success: true,
    duplicate: true,
  });
  expect(h.events).toHaveLength(1);
});
it.each(["wrong-invoice", "leased", "preflight"])(
  "merchant identity rejects %s evidence",
  async (reason) => {
    const h = harness();
    h.op.lastErrorCode = "network";
    if (reason === "leased") h.op.leaseUntil = new Date();
    if (reason === "preflight") h.op.lastErrorCode = "connection_unavailable";
    await expect(
      h.service.reconcileBooking(
        h.c.id,
        {
          invoice: reason === "wrong-invoice" ? "wrong" : h.c.invoice,
          externalId: "merchant",
          providerState: "pending",
          note: "Evidence",
        },
        "actor",
      ),
    ).rejects.toThrow();
    expect(h.db.courierConsignment.update).not.toHaveBeenCalled();
  },
);
