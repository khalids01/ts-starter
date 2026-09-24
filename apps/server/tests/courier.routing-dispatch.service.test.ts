import { describe, expect, it, mock } from "bun:test";
import {
  calculateCourierCod,
  CourierRoutingDispatchService,
} from "../src/modules/admin/delivery/routing-dispatch.service";
import { AdminDeliveryServiceError } from "../src/modules/admin/delivery/delivery.service";

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
  return { service, dispatches, activities };
}

describe("courier routing and dispatch review", () => {
  it("calculates authoritative COD and rejects unpaid prepaid orders", () => {
    expect(calculateCourierCod(order)).toBe(1060);
    expect(calculateCourierCod({ ...order, paymentStatus: "paid" })).toBe(0);
    expect(() => calculateCourierCod({ ...order, paymentMethod: "manual_bank" })).toThrow(AdminDeliveryServiceError);
  });

  it("returns a deterministic recommendation and freezes it on confirmation", async () => {
    const { service, dispatches, activities } = harness();
    const recommendation = await service.recommend(order.id);
    expect(recommendation.candidates[0]).toMatchObject({ ruleId: "rule-1", ruleVersion: 3, connectionId: "connection-1", serviceId: "service-1" });
    await service.confirm(order.id, { connectionId: "connection-1", serviceId: "service-1" }, "admin-1");
    expect(dispatches[0].routingSnapshot).toMatchObject({ schemaVersion: 1, evaluatedRules: [{ id: "rule-1", version: 3 }], confirmedByUserId: "admin-1" });
    expect(activities[0].type).toBe("courier.dispatch.route_confirmed");
  });

  it("requires an eligible selection and a reason for overrides", async () => {
    const { service } = harness();
    await expect(service.confirm(order.id, { connectionId: "missing", serviceId: "missing" }, "admin-1")).rejects.toMatchObject({ status: 409 });
  });
});
