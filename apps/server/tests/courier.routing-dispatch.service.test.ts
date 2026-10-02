import { courierRequestSnapshot } from "../src/modules/delivery/dispatch-snapshot";
import { describe, expect, it, mock } from "bun:test";
mock.module("@db/server", () => ({ default: {} }));
mock.module("@env/server", () => ({ env: {} }));
const { calculateCourierCod, CourierRoutingDispatchService } = await import("../src/modules/admin/delivery/routing-dispatch.service");
const { AdminDeliveryServiceError } = await import("../src/modules/admin/delivery/delivery.service");

const order = {
  id: "order-1",
  orderNumber: "ORD-1",
  totalAmount: "1060.00",
  currency: "BDT",
  paymentMethod: "cash_on_delivery",
  paymentStatus: "unpaid",
  orderStatus: "confirmed",
  inventoryStatus: "committed",
  shippingRateId: "rate-1",
  customerPhone: "01712345678",
  customerNotes: null,
  refunds: [],
  addresses: [{ type: "shipping", fullName: "Jahid Hasan", phone: "01712345678", line1: "Dhanmondi", city: "Dhaka", state: "Dhaka", postalCode: "1209", country: "BD" }],
};

function harness() {
  const dispatches: any[] = [];
  const db = {
    order: { findUnique: mock(async () => order) },
    courierConnection: { findMany: mock(async () => [{ id: "connection-1", displayName: "Primary", enabled: true, healthState: "healthy", priority: 0 }]) },
    courierService: { findMany: mock(async () => [{ id: "service-1", connectionId: "connection-1", enabled: true, methods: [{ shippingRateId: "rate-1" }] }]) },
    courierRoutingRule: { findMany: mock(async () => [{ id: "rule-1", version: 3, priority: 1, enabled: true, connectionId: "connection-1", serviceId: "service-1", conditions: { countries: ["BD"] } }]) },
    courierDispatch: {
      findFirst: mock(async () => null),
      create: mock(async ({ data }: any) => { const row = { id: "dispatch-1", ...data, createdAt: new Date() }; dispatches.push(row); return row; }),
    },
  };
  const activities: any[] = [];
  const service = new CourierRoutingDispatchService({
    db,
    activity: { record: mock(async (entry: any) => { activities.push(entry); return entry; }) },
  });
  return { service, dispatches, activities, db };
}

describe("courier routing and dispatch review", () => {
  it("calculates authoritative COD and rejects unpaid prepaid orders", () => {
    expect(calculateCourierCod(order)).toBe(1060);
    expect(calculateCourierCod({ ...order, paymentStatus: "paid", payments: [{ id: "receipt-1", entryType: "receipt", amount: "1060", currency: "BDT" }] })).toBe(0);
    expect(() => calculateCourierCod({ ...order, paymentMethod: "manual_bank" })).toThrow(AdminDeliveryServiceError);
  });

  it("returns a deterministic recommendation and freezes it on confirmation", async () => {
    const { service, dispatches, activities, db } = harness();
    const recommendation = await service.recommend(order.id);
    expect(recommendation.candidates[0]).toMatchObject({ ruleId: "rule-1", ruleVersion: 3, connectionId: "connection-1", serviceId: "service-1" });
    await service.confirm(order.id, { connectionId: "connection-1", serviceId: "service-1" }, "admin-1");
    expect(dispatches[0].routingSnapshot).toMatchObject({ schemaVersion: 2, evaluatedRules: [{ id: "rule-1", version: 3 }], confirmedByUserId: "admin-1" });
    expect(activities[0].type).toBe("courier.dispatch.route_confirmed");
    expect(db.courierConnection.findMany).toHaveBeenCalledWith({ where: { archivedAt: null } });
    expect(db.courierRoutingRule.findMany).toHaveBeenCalledWith({ where: { archivedAt: null } });
  });

  it("requires an eligible selection and a reason for overrides", async () => {
    const { service } = harness();
    await expect(service.confirm(order.id, { connectionId: "missing", serviceId: "missing" }, "admin-1")).rejects.toMatchObject({ status: 409 });
  });

  it("guards delivery-option archive and restore dependencies", async () => {
    let serviceRow: any = { id: "service-1", connectionId: "connection-1", code: "home", displayName: "Home", enabled: true, archivedAt: null };
    const ruleCount = mock(async () => 1);
    const db: any = {
      courierService: {
        findUnique: mock(async () => serviceRow),
        update: mock(async ({ data }: any) => serviceRow = { ...serviceRow, ...data, connection: { displayName: "Primary", provider: { displayName: "Steadfast" } }, methods: [] }),
      },
      courierRoutingRule: { count: ruleCount },
      courierConnection: { findFirst: mock(async () => ({ id: "connection-1", archivedAt: null })) },
    };
    const service = new CourierRoutingDispatchService({ db, activity: { record: mock(async () => ({})) } });
    await expect(service.archiveService("service-1", "admin-1")).rejects.toMatchObject({ code: "RESOURCE_IN_USE" });
    ruleCount.mockResolvedValue(0);
    const archived = await service.archiveService("service-1", "admin-1");
    expect(archived).toMatchObject({ archivedAt: expect.any(String), enabled: false });
    const restored = await service.restoreService("service-1", "admin-1");
    expect(restored).toMatchObject({ archivedAt: null, enabled: false });
  });

  it("allows permanent deletion of an archived assignment rule", async () => {
    const remove = mock(async () => ({}));
    const db: any = {
      courierRoutingRule: {
        findUnique: mock(async () => ({ id: "rule-1", name: "Rule", archivedAt: new Date() })),
        delete: remove,
      },
    };
    const service = new CourierRoutingDispatchService({ db, activity: { record: mock(async () => ({})) } });
    await service.deleteRule("rule-1", "admin-1");
    expect(remove).toHaveBeenCalledWith({ where: { id: "rule-1" } });
  });
});

describe("queue cancellation and recovery boundary", () => {
  function queueHarness(currentOrder: any = order) {
    const dispatch = { id: "dispatch-1", status: "confirmed", connectionId: "connection-1", serviceId: "service-1", order, routingSnapshot: { reviewedRequest: courierRequestSnapshot(order) }, consignment: null };
    const db: any = {
      order: { findUnique: mock(async () => currentOrder) },
      courierDispatch: { findUnique: mock(async () => dispatch), updateMany: mock(async () => ({ count: 1 })) },
      courierConsignment: { create: mock(async ({ data }: any) => ({ id: "consignment-1", ...data })) },
      courierOperation: { create: mock(async () => ({})) },
    };
    db.$transaction = mock(async (work: any) => work(db));
    const service = new CourierRoutingDispatchService({ db, activity: { record: mock(async () => ({})) } });
    return { service, db };
  }
  it("queues valid committed stock and creates one operation", async () => {
    const { service, db } = queueHarness();
    await service.queue("dispatch-1", "admin-1");
    expect(db.courierOperation.create).toHaveBeenCalledTimes(1);
    expect(db.$transaction.mock.calls[0]?.[1]).toEqual({ isolationLevel: "Serializable" });
  });
  it.each([
    { ...order, orderStatus: "cancelled" },
    { ...order, inventoryStatus: "restocked" },
    { ...order, recovery: { id: "recovery-1" } },
    { ...order, deliveryStatus: "returned" },
    { ...order, paymentStatus: "partially_paid", payments: [{ id: "deposit-1", entryType: "receipt", amount: "100", currency: "BDT" }] },
    { ...order, addresses: [{ ...order.addresses[0], line1: "Changed warehouse" }] },
  ])("rejects an order changed after the initial queue read", async (current) => {
    const { service, db } = queueHarness(current);
    await expect(service.queue("dispatch-1", "admin-1")).rejects.toMatchObject({ status: 409 });
    expect(db.courierOperation.create).not.toHaveBeenCalled();
  });
  it("rejects cancellation that already stopped the dispatch", async () => {
    const { service, db } = queueHarness();
    db.courierDispatch.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.queue("dispatch-1", "admin-1")).rejects.toMatchObject({ status: 409 });
    expect(db.courierConsignment.create).not.toHaveBeenCalled();
  });
});
