import { beforeEach, describe, expect, it, mock } from "bun:test";
mock.module("@db/server", () => ({ default: {} }));
mock.module("@env/server", () => ({ env: {} }));
const { CourierRoutingDispatchService } = await import("../src/modules/admin/delivery/routing-dispatch.service");
const { invalidatePaymentDispatches } = await import("../src/modules/ecommerce/orders/payment-dispatch");
const { stopUnsubmittedDispatches } = await import("../src/modules/admin/orders/order-custody");
const { releaseUnsubmittedShipmentClaim, releaseDeliveredShipmentClaim } = await import("../src/modules/delivery/shipment-claim");
let order: any;
let dispatches: any[];
let consignments: any[];
let operations: any[];
let claims: any[];
let events: any[];
let exceptions: any[];
let returns: any[];
const db: any = {
  order: { findUnique: mock(async () => order) },
  orderStatusEvent: { create: mock(async ({ data }: any) => { events.push(data); return data; }) },
  courierConnection: { findMany: mock(async () => [1, 2].map((n) => ({ id: `connection-${n}`, displayName: `Connection ${n}`, enabled: true, healthState: "healthy", priority: n }))) },
  courierService: { findMany: mock(async () => [1, 2].map((n) => ({ id: `service-${n}`, connectionId: `connection-${n}`, enabled: true, methods: [{ shippingRateId: "rate-1" }] }))) },
  courierRoutingRule: { findMany: mock(async () => [1, 2].map((n) => ({ id: `rule-${n}`, version: 1, priority: n, enabled: true, connectionId: `connection-${n}`, serviceId: `service-${n}`, conditions: { countries: ["BD"] } }))) },
  courierShipmentClaim: {
    create: mock(async ({ data }: any) => {
      if (claims.some((row) => row.orderId === data.orderId || row.dispatchId === data.dispatchId)) throw { code: "P2002" };
      claims.push(data); return data;
    }),
    findUnique: mock(async ({ where }: any) => {
      const claim = claims.find((row) => row.orderId === where.orderId);
      if (!claim) return null;
      const dispatch = dispatches.find((row) => row.id === claim.dispatchId);
      const consignment = consignments.find((row) => row.dispatchId === dispatch?.id);
      return { ...claim, dispatch: { ...dispatch, consignment: consignment ? { ...consignment, operations: operations.filter((row) => row.consignmentId === consignment.id) } : null } };
    }),
    deleteMany: mock(async ({ where }: any) => { const previous = claims.length; claims = claims.filter((row) => row.orderId !== where.orderId || row.dispatchId !== where.dispatchId); return { count: previous - claims.length }; }),
  },
  courierDispatch: {
    findFirst: mock(async () => dispatches.find((row) => !["cancelled", "completed"].includes(row.status)) ?? null),
    findUnique: mock(async ({ where }: any) => { const row = dispatches.find((item) => item.id === where.id); return row ? { ...row, consignment: consignments.find((item) => item.dispatchId === row.id) ?? null } : null; }),
    create: mock(async ({ data }: any) => { const row = { id: `dispatch-${dispatches.length + 1}`, ...data }; dispatches.push(row); return row; }),
    update: mock(async ({ where, data }: any) => Object.assign(dispatches.find((row) => row.id === where.id), data)),
    updateMany: mock(async ({ where, data }: any) => {
      const matching = dispatches.filter((row) => (!where.id || row.id === where.id) && (!where.orderId || row.orderId === where.orderId) && row.status === where.status && (!where.consignment || !consignments.some((item) => item.dispatchId === row.id)));
      matching.forEach((row) => Object.assign(row, data)); return { count: matching.length };
    }),
  },
  courierConsignment: {
    findMany: mock(async ({ where }: any) => consignments.filter((row) => where.active === undefined || row.active === where.active).map((row) => ({ ...row, operations: operations.filter((op) => op.consignmentId === row.id) }))),
    findUnique: mock(async ({ where }: any) => { const row = consignments.find((row) => row.id === where.id); return row ? { ...row, order } : null; }),
    update: mock(async ({ where, data }: any) => Object.assign(consignments.find((row) => row.id === where.id), data)),
    create: mock(async ({ data }: any) => { const row = { id: `consignment-${consignments.length + 1}`, state: "pending_submission", active: true, ...data }; consignments.push(row); return row; }),
  },
  courierOperation: {
    findFirst: mock(async () => operations.find((row) => row.state !== "completed") ?? null),
    updateMany: mock(async ({ where, data }: any) => {
      const matching = operations.filter((row) => (!where.id || row.id === where.id) && (!where.consignmentId || row.consignmentId === where.consignmentId) && (where.state?.in ? where.state.in.includes(row.state) : row.state === where.state) && (where.attemptCount === undefined || row.attemptCount === where.attemptCount));
      matching.forEach((row) => Object.assign(row, data)); return { count: matching.length };
    }),
    create: mock(async ({ data }: any) => { const row = { id: `operation-${operations.length + 1}`, state: "pending", attemptCount: 0, leaseUntil: null, ...data }; operations.push(row); return row; }) },
  courierException: { findFirst: mock(async () => exceptions[0] ?? null), create: mock(async ({ data }: any) => { exceptions.push(data); return data; }) },
  courierReturn: { findFirst: mock(async () => returns[0] ?? null) },
};
// Deterministic serialized fixture with rollback and uniqueness, not PostgreSQL concurrency proof.
let previousTransaction = Promise.resolve();
db.$transaction = mock(async (work: any) => {
  const previous = previousTransaction;
  let done!: () => void;
  previousTransaction = new Promise<void>((resolve) => { done = resolve; });
  await previous;
  const snapshot = structuredClone({ order, dispatches, consignments, operations, claims, events });
  try { return await work(db); }
  catch (error) { ({ order, dispatches, consignments, operations, claims, events } = snapshot); throw error; }
  finally { done(); }
});
const service = new CourierRoutingDispatchService({ db, activity: { record: mock(async () => ({})) } });
const route = { connectionId: "connection-1", serviceId: "service-1" };
beforeEach(() => {
  order = { id: "order-1", orderNumber: "ORD-1", totalAmount: "100.00", currency: "BDT", paymentMethod: "cash_on_delivery", paymentStatus: "unpaid", orderStatus: "confirmed", inventoryStatus: "committed", deliveryStatus: "unfulfilled", payments: [], refunds: [], statusEvents: [], shippingRateId: "rate-1", addresses: [{ type: "shipping", fullName: "Fictional customer", phone: "01700000000", line1: "Fictional warehouse", country: "BD" }] };
  dispatches = []; consignments = []; operations = []; claims = []; events = []; exceptions = []; returns = [];
});
async function queued() { const dispatch = await service.confirm(order.id, route, "admin-1"); await service.queue(dispatch.id, "admin-1"); return dispatch; }

describe("one database shipment owner", () => {
  it("keeps one winner across simultaneous route requests on different connections", async () => {
    const outcomes = await Promise.allSettled([service.confirm(order.id, route, "admin-1"), service.confirm(order.id, { connectionId: "connection-2", serviceId: "service-2", overrideReason: "Second account" }, "admin-2")]);
    expect(outcomes.filter((row) => row.status === "fulfilled")).toHaveLength(1); expect(claims).toHaveLength(1); expect(dispatches).toHaveLength(1); expect(events).toHaveLength(1);
  });
  it("rolls back new dispatch when the unique order claim rejects it", async () => {
    claims.push({ orderId: order.id, dispatchId: "legacy-owner" });
    await expect(service.confirm(order.id, route, "admin-1")).rejects.toMatchObject({ status: 409 });
    expect(dispatches).toHaveLength(0); expect(claims[0].dispatchId).toBe("legacy-owner"); expect(events).toHaveLength(0);
  });
  it("queues once with one stable invoice and operation identity", async () => {
    const dispatch = await service.confirm(order.id, route, "admin-1");
    const results = await Promise.all([service.queue(dispatch.id, "admin-1"), service.queue(dispatch.id, "admin-1")]);
    expect(results[0].id).toBe(results[1].id); expect(consignments).toHaveLength(1); expect(operations).toHaveLength(1);
    expect(consignments[0].invoice).toBe(dispatch.routingSnapshot.reviewedRequest.invoice); expect(operations[0].identity).toBe(`create:${dispatch.id}`);
  });
  it("rejects missing and changed ownership even on queue replay", async () => {
    const dispatch = await queued(); claims = [];
    await expect(service.queue(dispatch.id, "admin-1")).rejects.toMatchObject({ status: 409 });
    claims = [{ orderId: order.id, dispatchId: "other-dispatch" }];
    await expect(service.queue(dispatch.id, "admin-1")).rejects.toMatchObject({ status: 409 }); expect(operations).toHaveLength(1);
  });
  it("rolls back queue and consignment when outbox creation fails", async () => {
    const dispatch = await service.confirm(order.id, route, "admin-1");
    db.courierOperation.create.mockRejectedValueOnce(new Error("outbox write failed"));
    await expect(service.queue(dispatch.id, "admin-1")).rejects.toThrow("outbox write failed");
    expect(dispatches[0].status).toBe("confirmed"); expect(consignments).toHaveLength(0); expect(claims).toHaveLength(1);
  });
  it("maps serializable conflicts to a reloadable response", async () => {
    db.$transaction.mockRejectedValueOnce({ code: "P2034" });
    await expect(service.confirm(order.id, route, "admin-1")).rejects.toMatchObject({ status: 409 }); expect(claims).toHaveLength(0);
  });
  it("blocks uncertain legacy consignments even without an active flag or claim", async () => {
    consignments.push({ id: "legacy", dispatchId: "old", state: "cancelled", active: false, externalId: "external-1", submittedAt: new Date() });
    await expect(service.confirm(order.id, route, "admin-1")).rejects.toMatchObject({ status: 409 }); expect(claims).toHaveLength(0);
  });
  it("blocks historical manual handoff after a status regression", async () => {
    order.statusEvents = [{ newValue: "shipped" }];
    await expect(service.confirm(order.id, route, "admin-1")).rejects.toMatchObject({ status: 409 });
  });
});

describe("safe claim release", () => {
  it("releases never-submitted cancellation and gives subsequent review a new invoice", async () => {
    const original = await queued(); dispatches[0].status = "cancelled"; consignments[0].state = "cancelled_before_submission"; operations[0].state = "cancelled";
    expect(await db.$transaction((tx: any) => releaseUnsubmittedShipmentClaim(tx, order.id, "admin-1", "Payment review changed"))).toBe(true);
    const subsequent = await service.confirm(order.id, route, "admin-1");
    expect(subsequent.routingSnapshot.reviewedRequest.invoice).not.toBe(original.routingSnapshot.reviewedRequest.invoice); expect(claims).toHaveLength(1); expect(consignments).toHaveLength(1);
    expect(events.some((row) => row.metadata.action === "shipment_claim_released")).toBe(true);
  });
  it.each(["processing", "retry", "manual_review"])("retains uncertain %s ownership", async (state) => {
    await queued(); dispatches[0].status = "cancelled"; consignments[0].state = "cancelled_before_submission"; operations[0].state = state; operations[0].attemptCount = 1;
    expect(await db.$transaction((tx: any) => releaseUnsubmittedShipmentClaim(tx, order.id, "admin-1", "Cancel"))).toBe(false); expect(claims).toHaveLength(1);
  });
  it("retains ownership for provider cancelled or received-return records", async () => {
    await queued(); consignments[0].state = "cancelled"; consignments[0].externalId = "external-1"; dispatches[0].status = "cancelled";
    expect(await db.$transaction((tx: any) => releaseUnsubmittedShipmentClaim(tx, order.id, "admin-1", "Cancel"))).toBe(false); expect(claims).toHaveLength(1);
  });
  it("releases delivered and fully evidenced goods once, but forbids another shipment", async () => {
    const dispatch = await queued(); operations[0].state = "completed"; consignments[0].state = "delivered"; order.deliveryStatus = "delivered"; order.paymentStatus = "paid"; order.payments = [{ id: "receipt-1", entryType: "receipt", amount: "100", currency: "BDT" }];
    expect(await db.$transaction((tx: any) => releaseDeliveredShipmentClaim(tx, consignments[0].id))).toBe(true);
    expect(claims).toHaveLength(0); expect(dispatches[0].status).toBe("completed");
    expect(await db.$transaction((tx: any) => releaseDeliveredShipmentClaim(tx, consignments[0].id))).toBe(false);
    await expect(service.confirm(order.id, route, "admin-1")).rejects.toMatchObject({ status: 409 }); expect(dispatches[0].id).toBe(dispatch.id);
  });
  it.each(["unpaid", "exception", "return", "recovery", "processing"])("holds delivered ownership with unresolved %s", async (blocker) => {
    await queued(); operations[0].state = blocker === "processing" ? "processing" : "completed"; consignments[0].state = "delivered"; order.deliveryStatus = "delivered";
    if (blocker !== "unpaid") { order.paymentStatus = "paid"; order.payments = [{ id: "receipt-1", entryType: "receipt", amount: "100", currency: "BDT" }]; }
    if (blocker === "exception") exceptions.push({ state: "open" });
    if (blocker === "return") returns.push({ state: "pending" });
    if (blocker === "recovery") order.recovery = { disposition: "sellable" };
    expect(await db.$transaction((tx: any) => releaseDeliveredShipmentClaim(tx, consignments[0].id))).toBe(false); expect(claims).toHaveLength(1);
  });
});


describe("claim release through existing order actions", () => {
  it("releases confirmed unsubmitted ownership on cancellation", async () => {
    await service.confirm(order.id, route, "admin-1");
    await db.$transaction((tx: any) => stopUnsubmittedDispatches(tx, order.id, "admin-1"));
    expect(claims).toHaveLength(0); expect(dispatches[0].status).toBe("cancelled");
  });
  it("releases a queued never-attempted booking after payment review changes", async () => {
    await queued();
    await db.$transaction((tx: any) => invalidatePaymentDispatches(tx, order.id, "admin-1"));
    expect(claims).toHaveLength(0); expect(operations[0].state).toBe("cancelled"); expect(consignments[0].state).toBe("cancelled_before_submission");
  });
  it("holds ownership if payment changes after provider acceptance", async () => {
    await queued(); consignments[0].state = "submitted"; consignments[0].externalId = "external-1"; operations[0].state = "completed"; operations[0].attemptCount = 1;
    await db.$transaction((tx: any) => invalidatePaymentDispatches(tx, order.id, "admin-1"));
    expect(claims).toHaveLength(1); expect(exceptions[0].kind).toBe("payment_review_changed");
  });
});


it("rolls back claim and dispatch when claim history cannot be recorded", async () => {
  db.orderStatusEvent.create.mockRejectedValueOnce(new Error("history write failed"));
  await expect(service.confirm(order.id, route, "admin-1")).rejects.toThrow("history write failed");
  expect(dispatches).toHaveLength(0); expect(claims).toHaveLength(0);
});

it("keeps attempt invoices bounded and provider-compatible", async () => {
  order.orderNumber = "ORD @".repeat(40);
  const dispatch = await service.confirm(order.id, route, "admin-1");
  const invoice = dispatch.routingSnapshot.reviewedRequest.invoice;
  expect(invoice.length).toBeLessThanOrEqual(100); expect(invoice).toMatch(/^[A-Za-z0-9_-]+$/);
});
