import { beforeEach, describe, expect, it, mock } from "bun:test";

const actor = { userId: "admin-1", canRestock: true };
let order: any;
let reservations: any[];
let shipments: any[];
let recovery: any;
let refunds: any[];
let events: any[];
let movements: any[];
let exceptions: any[];
let stock: number;
let reserved: number;
let loseReservationClaim: boolean;
let loseOperationClaim: boolean;

const db: any = {
  order: {
    findUnique: mock(async () => ({ ...order, recovery })),
    update: mock(async ({ data }: any) => Object.assign(order, data)),
    updateMany: mock(async ({ where, data }: any) => {
      if (order.inventoryStatus !== where.inventoryStatus) return { count: 0 };
      Object.assign(order, data); return { count: 1 };
    }),
  },
  stockReservation: {
    findMany: mock(async ({ where }: any) => reservations.filter((row) => row.status === where.status).map((row) => ({ ...row }))),
    findFirst: mock(async () => reservations.find((row) => row.status === "committed" && row.batch?.expiryDate && row.batch.expiryDate <= new Date()) ?? null),
    updateMany: mock(async ({ where, data }: any) => {
      const row = reservations.find((item) => item.id === where.id && item.status === where.status);
      if (!row || loseReservationClaim) return { count: 0 };
      Object.assign(row, data); return { count: 1 };
    }),
  },
  inventoryStock: { update: mock(async ({ data }: any) => { stock += data.quantityOnHand?.increment ?? 0; reserved -= data.quantityReserved?.decrement ?? 0; return {}; }) },
  inventoryMovement: { create: mock(async ({ data }: any) => { movements.push(data); return data; }) },
  orderStatusEvent: {
    findMany: mock(async () => events.filter((event) => event.type === "delivery")),
    create: mock(async ({ data }: any) => { events.push(data); return data; }),
  },
  orderRefund: {
    aggregate: mock(async () => ({ _sum: { amount: refunds.reduce((sum, row) => sum + Number(row.amount), 0).toFixed(2) } })),
    create: mock(async ({ data }: any) => { const row = { id: "refund-1", ...data }; refunds.push(row); return row; }),
  },
  courierConsignment: {
    findMany: mock(async () => shipments.map((row) => ({ ...row, operations: row.operations.map((op: any) => ({ ...op })) }))),
    update: mock(async ({ where, data }: any) => Object.assign(shipments.find((row) => row.id === where.id), data)),
  },
  courierOperation: {
    updateMany: mock(async ({ where, data }: any) => {
      if (loseOperationClaim) return { count: 0 };
      let count = 0;
      for (const row of shipments.flatMap((item) => item.operations)) {
        if (where.id && row.id !== where.id) continue;
        if (where.state?.in ? !where.state.in.includes(row.state) : row.state !== where.state) continue;
        if (where.attemptCount !== undefined && row.attemptCount !== where.attemptCount) continue;
        Object.assign(row, data); count++;
      }
      return { count };
    }),
    findFirst: mock(async () => shipments.flatMap((item) => item.operations).find((op) => ["pending", "retry", "processing"].includes(op.state)) ?? null),
  },
  courierDispatch: { update: mock(async () => ({})), updateMany: mock(async () => ({ count: 0 })) },
  courierException: {
    findFirst: mock(async ({ where }: any) => exceptions.find((row) => row.consignmentId === where.consignmentId) ?? null),
    create: mock(async ({ data }: any) => { exceptions.push(data); return data; }),
  },
  orderRecovery: {
    findUnique: mock(async () => recovery),
    create: mock(async ({ data }: any) => { recovery = { id: "recovery-1", disposition: "awaiting_inspection", restockedAt: null, ...data }; return recovery; }),
    update: mock(async ({ data }: any) => Object.assign(recovery, data)),
    updateMany: mock(async ({ where, data }: any) => {
      if (!recovery || recovery.restockedAt || recovery.disposition !== where.disposition) return { count: 0 };
      Object.assign(recovery, data); return { count: 1 };
    }),
  },
};
// A local rollback fixture exercises service failure handling, not database isolation.
db.$transaction = mock(async (callback: any) => {
  const original = structuredClone({ order, reservations, shipments, recovery, refunds, events, movements, exceptions, stock, reserved });
  try { return await callback(db); }
  catch (error) {
    ({ order, reservations, shipments, recovery, refunds, events, movements, exceptions, stock, reserved } = original);
    throw error;
  }
});
mock.module("@db/server", () => ({ default: db }));
const { orderOperationsService } = await import("../src/modules/admin/orders/order-operations.service");
const { orderRecoveryService } = await import("../src/modules/admin/orders/order-recovery.service");
const { withOrderTransaction } = await import("../src/modules/admin/orders/orders.service");

beforeEach(() => {
  order = { id: "order-1", totalAmount: "300.00", currency: "BDT", orderStatus: "confirmed", paymentStatus: "paid", deliveryStatus: "unfulfilled", inventoryStatus: "committed", shippedAt: null, deliveredAt: null };
  reservations = [{ id: "reservation-1", variantId: "variant-1", locationId: "location-1", batchId: null, quantity: 2, status: "committed" }];
  shipments = []; recovery = null; refunds = []; events = []; movements = []; exceptions = []; stock = 0; reserved = 0; loseReservationClaim = false; loseOperationClaim = false;
});
function shipment(overrides: any = {}, operationOverrides: any = {}) {
  shipments = [{ id: "consignment-1", dispatchId: "dispatch-1", state: "pending_submission", externalId: null, submittedAt: null, operations: [{ id: "operation-1", kind: "create", state: "pending", attemptCount: 0, leaseUntil: null, ...operationOverrides }], ...overrides }];
}
async function receiveAndInspect(disposition: "sellable" | "unsafe" = "sellable") {
  await orderRecoveryService.receive(order.id, { allItemsReceived: true, note: "All two items received at original warehouse, return R1" }, actor.userId);
  await orderRecoveryService.inspect(order.id, { disposition, note: "Every item inspected" }, actor.userId);
}

describe("custody-aware cancellation", () => {
  it("restocks retained unshipped inventory once and marks reservations recovered", async () => {
    expect(await orderOperationsService.cancelOrder(order.id, { reason: "Customer request" }, actor)).toMatchObject({ inventorySideEffect: "restocked", recoveryRequired: false });
    expect(stock).toBe(2); expect(reservations[0].status).toBe("restocked");
    await expect(orderOperationsService.cancelOrder(order.id, { reason: "Repeat" }, actor)).rejects.toThrow("already cancelled");
    expect(stock).toBe(2); expect(movements).toHaveLength(1);
    expect(events[0].actorUserId).toBe(actor.userId);
  });
  it("releases reserved stock once", async () => {
    order.inventoryStatus = "reserved"; reservations[0].status = "active"; reserved = 2;
    await orderOperationsService.cancelOrder(order.id, { reason: "Not needed" }, actor);
    expect(reserved).toBe(0); expect(stock).toBe(0); expect(reservations[0].status).toBe("released");
  });
  it("stops never-attempted queueing before stock recovery", async () => {
    shipment(); await orderOperationsService.cancelOrder(order.id, { reason: "Cancel queued order" }, actor);
    expect(shipments[0].operations[0].state).toBe("cancelled");
    expect(shipments[0].state).toBe("cancelled_before_submission"); expect(stock).toBe(2);
  });
  it.each(["processing", "retry", "manual_review"])("holds attempted %s submissions for recovery", async (state) => {
    shipment({}, { state, attemptCount: 1 });
    expect(await orderOperationsService.cancelOrder(order.id, { reason: "Cancellation while submitting" }, actor)).toMatchObject({ recoveryRequired: true, inventorySideEffect: "none" });
    expect(stock).toBe(0); expect(order.inventoryStatus).toBe("committed"); expect(exceptions).toHaveLength(1);
    if (state === "retry") expect(shipments[0].operations[0].state).toBe("manual_review");
  });
  it("keeps stock unavailable after provider acceptance or manual handoff", async () => {
    shipment({ state: "submitted", externalId: "external-1" }, { state: "completed", attemptCount: 1 });
    await orderOperationsService.cancelOrder(order.id, { reason: "Courier already accepted" }, actor);
    expect(stock).toBe(0);
    order.orderStatus = "confirmed"; shipments = []; order.deliveryStatus = "shipped"; order.shippedAt = new Date();
    await orderOperationsService.cancelOrder(order.id, { reason: "Manual handoff" }, actor);
    expect(stock).toBe(0);
  });
  it("uses historical shipment evidence after manual status regression", async () => {
    events.push({ type: "delivery", newValue: "shipped" });
    expect(await orderOperationsService.cancelOrder(order.id, { reason: "Legacy history" }, actor)).toMatchObject({ recoveryRequired: true });
    expect(stock).toBe(0);
  });
  it("does not grant inventory authority through cancellation alone", async () => {
    expect(await orderOperationsService.cancelOrder(order.id, { reason: "Restricted operator" }, { userId: "operator" })).toMatchObject({ recoveryRequired: true });
    expect(order.orderStatus).toBe("cancelled"); expect(stock).toBe(0);
  });
  it("cancels expired stock without returning it to sale", async () => {
    reservations[0].batch = { expiryDate: new Date(0) };
    expect(await orderOperationsService.cancelOrder(order.id, { reason: "Expired goods" }, actor)).toMatchObject({ recoveryRequired: true }); expect(stock).toBe(0);
  });
  it("rejects cancellation after delivery", async () => {
    order.deliveryStatus = "delivered"; order.deliveredAt = new Date();
    await expect(orderOperationsService.cancelOrder(order.id, { reason: "Too late" }, actor)).rejects.toThrow("delivered order"); expect(stock).toBe(0);
  });
  it("rolls back when a job lease wins the cancellation race", async () => {
    shipment(); loseOperationClaim = true;
    await expect(orderOperationsService.cancelOrder(order.id, { reason: "Race" }, actor)).rejects.toMatchObject({ status: 409 });
    expect(order.orderStatus).toBe("confirmed"); expect(stock).toBe(0); expect(events).toHaveLength(0);
  });
  it("rolls back stock recovery on a lost reservation claim", async () => {
    loseReservationClaim = true;
    await expect(orderOperationsService.cancelOrder(order.id, { reason: "Race" }, actor)).rejects.toMatchObject({ status: 409 });
    expect(order.inventoryStatus).toBe("committed"); expect(order.orderStatus).toBe("confirmed"); expect(stock).toBe(0);
  });
});

describe("physical receipt, inspection and explicit recovery", () => {
  beforeEach(() => { order.deliveryStatus = "shipped"; order.shippedAt = new Date(); });
  it("records complete receipt and inspection without increasing stock", async () => {
    await receiveAndInspect(); expect(stock).toBe(0); expect(order.deliveryStatus).toBe("returned"); expect(recovery.disposition).toBe("sellable");
    expect(events.map((event) => event.metadata.action)).toEqual(["physical_receipt_recorded", "physical_receipt_inspected"]);
  });
  it("restocks every inspected item once without recording a refund", async () => {
    await receiveAndInspect(); await orderRecoveryService.restock(order.id, "All items saleable", actor.userId);
    expect(stock).toBe(2); expect(refunds).toHaveLength(0); expect(recovery.restockedAt).toBeInstanceOf(Date); expect(reservations[0].status).toBe("restocked");
    await expect(orderRecoveryService.restock(order.id, "Again", actor.userId)).rejects.toThrow();
    await expect(orderRecoveryService.inspect(order.id, { disposition: "unsafe", note: "Late change" }, actor.userId)).rejects.toThrow("inspected again"); expect(stock).toBe(2);
  });
  it.each(["awaiting_inspection", "unsafe"])("rejects %s inventory", async (disposition) => {
    await orderRecoveryService.receive(order.id, { allItemsReceived: true, note: "Full physical receipt" }, actor.userId);
    if (disposition === "unsafe") await orderRecoveryService.inspect(order.id, { disposition: "unsafe", note: "Damaged goods" }, actor.userId);
    await expect(orderRecoveryService.restock(order.id, "Restock", actor.userId)).rejects.toThrow("sellable inspection"); expect(stock).toBe(0);
  });
  it("rejects missing receipt and partial receipt", async () => {
    await expect(orderRecoveryService.restock(order.id, "No receipt", actor.userId)).rejects.toThrow("physical receipt");
    await expect(orderRecoveryService.receive(order.id, { allItemsReceived: false as any, note: "Only one item" }, actor.userId)).rejects.toThrow("every item"); expect(recovery).toBeNull();
  });
  it("rejects repeated receipt and empty evidence", async () => {
    await receiveAndInspect(); await expect(orderRecoveryService.receive(order.id, { allItemsReceived: true, note: "Again" }, actor.userId)).rejects.toThrow("already been recorded");
    await expect(orderRecoveryService.inspect(order.id, { disposition: "sellable", note: " " }, actor.userId)).rejects.toThrow("evidence");
  });
  it("rejects receipt while booking is still in flight", async () => {
    shipment({}, { state: "processing", attemptCount: 1 });
    await expect(orderRecoveryService.receive(order.id, { allItemsReceived: true, note: "Received" }, actor.userId)).rejects.toThrow("uncertain courier booking"); expect(recovery).toBeNull(); expect(stock).toBe(0);
  });
  it("rejects expired stock even after a sellable inspection", async () => {
    await receiveAndInspect(); reservations[0].batch = { expiryDate: new Date(0) };
    await expect(orderRecoveryService.restock(order.id, "Restock", actor.userId)).rejects.toThrow("Expired inventory"); expect(stock).toBe(0); expect(recovery.restockedAt).toBeNull();
  });
});

describe("refunds and stock are independent", () => {
  it("records a partial refund with no stock side effect", async () => {
    const result = await orderOperationsService.recordRefund(order.id, { amount: "100", reason: "Price adjustment" }, actor);
    expect(result.paymentStatus).toBe("partially_refunded"); expect(stock).toBe(0); expect(result.totalRefunded).toBe("100.00");
  });
  it("completes cumulative full refund and rejects excess", async () => {
    refunds.push({ amount: "100" });
    expect((await orderOperationsService.recordRefund(order.id, { amount: "200", reason: "Refund remainder" }, actor)).paymentStatus).toBe("refunded");
    order.paymentStatus = "partially_refunded";
    await expect(orderOperationsService.recordRefund(order.id, { amount: "1", reason: "Too much" }, actor)).rejects.toThrow("exceeds"); expect(refunds).toHaveLength(2);
  });
  it("rejects refund restock without receipt or inventory authority", async () => {
    await expect(orderOperationsService.recordRefund(order.id, { amount: "50", reason: "Missing receipt", restockInventory: true }, actor)).rejects.toThrow("physical receipt"); expect(refunds).toHaveLength(0);
    await expect(orderOperationsService.recordRefund(order.id, { amount: "50", reason: "No stock permission", restockInventory: true }, { userId: "refund-only" })).rejects.toMatchObject({ status: 403 }); expect(stock).toBe(0);
  });
  it("requires explicit whole-order recovery even for a partial refund", async () => {
    order.deliveryStatus = "delivered"; order.deliveredAt = new Date(); await receiveAndInspect();
    await orderOperationsService.recordRefund(order.id, { amount: "50", reason: "Partial goodwill refund, full goods returned", restockInventory: true }, actor);
    expect(stock).toBe(2); expect(refunds[0].amount).toBe("50.00");
    await expect(orderOperationsService.recordRefund(order.id, { amount: "25", reason: "Repeat stock", restockInventory: true }, actor)).rejects.toThrow("already been restocked"); expect(stock).toBe(2);
  });
  it("translates a serializable conflict into a reviewable HTTP conflict", async () => {
    await expect(withOrderTransaction(async () => { throw { code: "P2034" }; })).rejects.toMatchObject({ status: 409 });
  });
});
