import { beforeEach, describe, expect, it, mock } from "bun:test";
import { courierCod, orderMoney } from "../src/modules/ecommerce/orders/payment-accounting";
import { courierRequestSnapshot, assertReviewedCourierRequest } from "../src/modules/delivery/dispatch-snapshot";
let order: any;
let payments: any[];
let refunds: any[];
let events: any[];
let settlements: any[];
let consignments: any[];
let exceptions: any[];
const db: any = {
  order: {
    findUnique: mock(async () => ({ ...order, payments, refunds })),
    update: mock(async ({ data }: any) => Object.assign(order, data)),
  },
  orderPayment: {
    findUnique: mock(async ({ where }: any) => payments.find((entry) => Object.entries(where).every(([key, value]) => entry[key] === value)) ?? null),
    create: mock(async ({ data }: any) => { const entry = { id: `payment-${payments.length + 1}`, ...data }; payments.push(entry); return entry; }),
  },
  orderStatusEvent: { create: mock(async ({ data }: any) => { events.push(data); return data; }) },
  courierDispatch: { updateMany: mock(async () => ({ count: 0 })), update: mock(async () => ({})) },
  courierConsignment: {
    findMany: mock(async () => consignments.filter((entry) => entry.active)),
    findFirst: mock(async () => { const row = consignments.find((entry) => entry.active || entry.submittedAt); return row ? { ...row, order: { deliveryStatus: order.deliveryStatus } } : null; }),
    findUnique: mock(async ({ where }: any) => consignments.find((entry) => entry.id === where.id)),
    update: mock(async ({ where, data }: any) => Object.assign(consignments.find((entry) => entry.id === where.id), data)),
  },
  courierOperation: { updateMany: mock(async () => ({ count: 1 })) },
  courierEvent: { create: mock(async () => ({})) },
  courierSettlement: {
    findMany: mock(async () => settlements.filter((row) => row.state === "matched_pending_delivery")),
    findUnique: mock(async ({ where }: any) => settlements.find((entry) => entry.consignmentId === where.consignmentId_externalId.consignmentId && entry.externalId === where.consignmentId_externalId.externalId) ?? null),
    create: mock(async ({ data }: any) => { const row = { id: `settlement-${settlements.length + 1}`, ...data }; settlements.push(row); return row; }),
    update: mock(async ({ where, data }: any) => Object.assign(settlements.find((entry) => entry.id === where.id), data)),
  },
  courierException: {
    findFirst: mock(async ({ where }: any) => exceptions.find((entry) => entry.consignmentId === where.consignmentId && entry.kind === where.kind) ?? null),
    create: mock(async ({ data }: any) => { exceptions.push(data); return data; }),
  },
};
db.$transaction = mock(async (work: any) => {
  const original = structuredClone({ order, payments, refunds, events, settlements, consignments, exceptions });
  try { return await work(db); }
  catch (error) { ({ order, payments, refunds, events, settlements, consignments, exceptions } = original); throw error; }
});
mock.module("@db/server", () => ({ default: db }));
mock.module("@env/server", () => ({ env: {} }));
const { orderPaymentsService } = await import("../src/modules/admin/orders/order-payments.service");
const { CourierReturnsSettlementsService } = await import("../src/modules/admin/delivery/returns-settlements.service");
const { CourierTrackingService } = await import("../src/modules/delivery/tracking.service");
const { reconcileCourierSettlement } = await import("../src/modules/delivery/settlement-accounting");
const service = new CourierReturnsSettlementsService({ db, activity: { record: mock(async () => ({})) } });
const input = { amount: "30.00", currency: "BDT", method: "manual_bank" as const, reference: "TX-1", note: "Bank statement confirmed" };
function evidenced() { return { ...order, payments, refunds }; }
function consignment(state = "delivered") {
  const row = { id: "consignment-1", orderId: order.id, state, codAmount: "100.00", currency: "BDT", active: false, externalId: "external-1", submittedAt: new Date(), operations: [] };
  consignments.push(row); return row;
}
beforeEach(() => {
  order = { id: "order-1", orderNumber: "ORD-1", totalAmount: "100.00", currency: "BDT", paymentStatus: "unpaid", paymentMethod: "cash_on_delivery", orderStatus: "confirmed", deliveryStatus: "delivered", inventoryStatus: "committed", addresses: [{ type: "shipping", fullName: "Fictional customer", phone: "01700000000", line1: "Fictional warehouse" }] };
  payments = []; refunds = []; events = []; settlements = []; consignments = []; exceptions = [];
});

describe("confirmed payment ledger", () => {
  it("records a deposit then final collection with exact outstanding COD", async () => {
    await orderPaymentsService.receive(order.id, input, "admin-1");
    expect(order.paymentStatus).toBe("partially_paid"); expect(courierCod(evidenced())).toBe("70.00");
    await orderPaymentsService.receive(order.id, { ...input, amount: "70", reference: "TX-2" }, "admin-1");
    expect(order.paymentStatus).toBe("paid"); expect(courierCod(evidenced())).toBe("0.00"); expect(events).toHaveLength(2);
  });
  it("canonical duplicate reference replays once and conflicts on changed money or order", async () => {
    await orderPaymentsService.receive(order.id, input, "admin-1");
    await orderPaymentsService.receive(order.id, { ...input, reference: " tx-1 " }, "admin-2");
    expect(payments).toHaveLength(1); expect(events).toHaveLength(1);
    await expect(orderPaymentsService.receive(order.id, { ...input, amount: "31" }, "admin-1")).rejects.toMatchObject({ status: 409 });
    await expect(orderPaymentsService.receive("other-order", input, "admin-1")).rejects.toMatchObject({ status: 409 });
  });
  it.each([{ amount: "100.01" }, { currency: "USD" }, { amount: "-1" }, { amount: "0" }, { amount: "1.001" }])("rejects inconsistent collection %j", async (change) => {
    await expect(orderPaymentsService.receive(order.id, { ...input, ...change }, "admin-1")).rejects.toThrow();
    expect(payments).toHaveLength(0); expect(events).toHaveLength(0);
  });
  it("reverses mistaken evidence once without refunding", async () => {
    const receipt = await orderPaymentsService.receive(order.id, input, "admin-1");
    await orderPaymentsService.reverse(order.id, receipt.id, "Bank reference belonged to another customer", "admin-1");
    expect(order.paymentStatus).toBe("unpaid"); expect(orderMoney(evidenced()).received).toBe(0n); expect(refunds).toHaveLength(0);
    await expect(orderPaymentsService.reverse(order.id, receipt.id, "Repeat", "admin-1")).rejects.toMatchObject({ status: 409 });
  });
  it("does not reverse refunded receipts or accept unevidenced legacy paid rows", async () => {
    const receipt = await orderPaymentsService.receive(order.id, input, "admin-1");
    refunds.push({ amount: "10", currency: "BDT" }); order.paymentStatus = "partially_refunded";
    await expect(orderPaymentsService.reverse(order.id, receipt.id, "Correction", "admin-1")).rejects.toThrow("Refund exceeds");
    expect(payments).toHaveLength(1);
    payments = []; refunds = []; order.paymentStatus = "paid";
    await expect(orderPaymentsService.receive(order.id, input, "admin-1")).rejects.toThrow("Legacy payment status");
  });
  it("refunds do not create COD and partial-deposit refunds never exceed received", () => {
    payments = [{ id: "p1", entryType: "receipt", amount: "100", currency: "BDT" }]; refunds = [{ amount: "20", currency: "BDT" }]; order.paymentStatus = "partially_refunded";
    expect(courierCod(evidenced())).toBe("0.00");
    payments[0].amount = "30"; expect(courierCod(evidenced())).toBe("70.00");
    refunds[0].amount = "31"; expect(() => orderMoney(evidenced())).toThrow("Refund exceeds");
  });
  it("requires settlement evidence for courier cash collection", async () => {
    consignment();
    await expect(orderPaymentsService.receive(order.id, { ...input, method: "cash_on_delivery" }, "admin-1")).rejects.toThrow("settlement evidence"); expect(payments).toHaveLength(0);
  });
  it("freezes reviewed payment and address evidence", async () => {
    const reviewed = courierRequestSnapshot(evidenced());
    await orderPaymentsService.receive(order.id, input, "admin-1");
    expect(() => assertReviewedCourierRequest(evidenced(), reviewed)).toThrow("review");
    const current = courierRequestSnapshot(evidenced());
    order.addresses[0].line1 = "Changed address";
    expect(() => assertReviewedCourierRequest(evidenced(), current)).toThrow("review");
  });
  it("keeps accepted booking money frozen and opens reconciliation", async () => {
    const booking = consignment("submitted"); booking.active = true;
    await orderPaymentsService.receive(order.id, input, "admin-1");
    expect(booking.codAmount).toBe("100.00"); expect(exceptions[0].kind).toBe("payment_review_changed");
  });
});

describe("gross courier collection accounting", () => {
  const settlementInput = { consignmentId: "consignment-1", externalId: "COLLECTION-1", amount: "100.00", currency: "BDT" };
  it("credits once and does not overwrite a later refund on replay", async () => {
    consignment();
    const first = await service.recordSettlement(settlementInput, "admin-1");
    expect(first.state).toBe("reconciled"); expect(payments).toHaveLength(1);
    refunds.push({ amount: "20", currency: "BDT" }); order.paymentStatus = "partially_refunded";
    const repeat = await service.recordSettlement(settlementInput, "admin-1");
    expect(repeat.duplicate).toBe(true); expect(payments).toHaveLength(1); expect(order.paymentStatus).toBe("partially_refunded");
    await expect(service.recordSettlement({ ...settlementInput, amount: "99" }, "admin-1")).rejects.toMatchObject({ status: 409 });
  });
  it("holds matching pre-delivery evidence then credits on actual delivery", async () => {
    const parcel = consignment("in_transit"); order.deliveryStatus = "out_for_delivery";
    expect((await service.recordSettlement(settlementInput, "admin-1")).state).toBe("matched_pending_delivery"); expect(payments).toHaveLength(0);
    parcel.state = "delivered"; order.deliveryStatus = "delivered";
    expect(await db.$transaction((tx: any) => reconcileCourierSettlement(tx, parcel, settlements[0], "admin-1"))).toBe("reconciled"); expect(payments).toHaveLength(1);
  });
  it("reconciles only remaining booked COD after a deposit", async () => {
    await orderPaymentsService.receive(order.id, input, "admin-1");
    const parcel = consignment(); parcel.codAmount = "70";
    expect((await service.recordSettlement({ ...settlementInput, amount: "70" }, "admin-1")).state).toBe("reconciled");
    expect(orderMoney(evidenced()).received).toBe(10000n);
  });
  it.each([{ amount: "95" }, { currency: "USD" }])("routes net payout/currency mismatch to review %j", async (change) => {
    consignment(); expect((await service.recordSettlement({ ...settlementInput, ...change }, "admin-1")).state).toBe("mismatch"); expect(payments).toHaveLength(0); expect(exceptions).toHaveLength(1);
  });
  it("does not double credit independently recorded collection or different settlement IDs", async () => {
    await orderPaymentsService.receive(order.id, { ...input, amount: "100" }, "admin-1"); consignment();
    expect((await service.recordSettlement(settlementInput, "admin-1")).state).toBe("mismatch"); expect(payments).toHaveLength(1);
  });
  it("rejects money changes atomically on a serializable conflict", async () => {
    db.$transaction.mockRejectedValueOnce({ code: "P2034" });
    await expect(orderPaymentsService.receive(order.id, input, "admin-1")).rejects.toMatchObject({ status: 409 }); expect(payments).toHaveLength(0);
  });
});


describe("delayed delivery settlement writes", () => {
  it("preserves refunded money when delayed collection no longer matches", async () => {
    consignment("in_transit"); order.deliveryStatus = "out_for_delivery";
    await service.recordSettlement({ consignmentId: "consignment-1", externalId: "DELAYED-1", amount: "100", currency: "BDT" }, "admin-1");
    payments.push({ id: "manual-1", entryType: "receipt", amount: "100", currency: "BDT" }); refunds.push({ amount: "20", currency: "BDT" }); order.paymentStatus = "partially_refunded";
    await new CourierTrackingService({ db }).record({ connectionId: "connection-1", source: "webhook", eventKey: "delivered-1", eventType: "delivery_status", externalId: "external-1", providerState: "delivered", payload: {} });
    expect(order.paymentStatus).toBe("partially_refunded"); expect(payments).toHaveLength(1); expect(settlements[0].state).toBe("mismatch");
  });
  it("delivery without collection evidence leaves the order unpaid", async () => {
    consignment("in_transit"); order.deliveryStatus = "out_for_delivery";
    await new CourierTrackingService({ db }).record({ connectionId: "connection-1", source: "webhook", eventKey: "delivered-2", eventType: "delivery_status", externalId: "external-1", providerState: "delivered", payload: {} });
    expect(order.deliveryStatus).toBe("delivered"); expect(order.paymentStatus).toBe("unpaid"); expect(payments).toHaveLength(0);
  });
});


describe("payment changes and never-attempted booking", () => {
  it("stops queued booking without changing stock or sending a courier request", async () => {
    const booking = consignment("pending_submission"); booking.active = true; booking.externalId = null as any; booking.submittedAt = null as any;
    booking.operations = [{ id: "create-1", kind: "create", state: "pending", attemptCount: 0 }] as any;
    await orderPaymentsService.receive(order.id, input, "admin-1");
    expect(booking.state).toBe("cancelled_before_submission"); expect(booking.active).toBe(false); expect(order.inventoryStatus).toBe("committed");
  });
  it("rolls back a receipt if a worker wins the stop race", async () => {
    const booking = consignment("pending_submission"); booking.active = true; booking.externalId = null as any; booking.submittedAt = null as any;
    booking.operations = [{ id: "create-1", kind: "create", state: "pending", attemptCount: 0 }] as any;
    db.courierOperation.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(orderPaymentsService.receive(order.id, input, "admin-1")).rejects.toMatchObject({ status: 409 });
    expect(payments).toHaveLength(0); expect(order.paymentStatus).toBe("unpaid"); expect(events).toHaveLength(0);
  });
});
