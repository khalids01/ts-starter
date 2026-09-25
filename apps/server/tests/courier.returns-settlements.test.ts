import { describe, expect, it, mock } from "bun:test";
import { CourierReturnsSettlementsService } from "../src/modules/admin/delivery/returns-settlements.service";
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";

function harness(options: { delivered?: boolean; settlementAmount?: string } = {}) {
  const consignment: any = {
    id: "consignment-1",
    orderId: "order-1",
    state: options.delivered ? "delivered" : "in_transit",
    codAmount: "1060.00",
    currency: "BDT",
    externalId: "1424107",
    connectionId: "connection-1",
    connection: { id: "connection-1", publicId: "public-1", enabled: true, archivedAt: null, credentialSource: "server_environment", provider: { code: "fake", displayName: "Fake Courier" } },
    order: { id: "order-1", orderNumber: "ORD-1", paymentStatus: "unpaid", deliveryStatus: options.delivered ? "delivered" : "out_for_delivery" },
  };
  let courierReturn: any;
  const exceptions: any[] = [];
  const statusEvents: any[] = [];
  const orderUpdates: any[] = [];
  const db: any = {
    courierConsignment: { findUnique: mock(async () => consignment), update: mock(async ({ data }: any) => Object.assign(consignment, data)) },
    courierReturn: {
      findFirst: mock(async () => null),
      findUnique: mock(async () => courierReturn ? { ...courierReturn, consignment } : null),
      create: mock(async ({ data }: any) => { courierReturn = { id: "return-1", ...data }; return courierReturn; }),
      update: mock(async ({ data }: any) => { courierReturn = { ...courierReturn, ...data }; return courierReturn; }),
    },
    courierSettlement: { create: mock(async ({ data }: any) => ({ id: "settlement-1", ...data })) },
    courierException: { findFirst: mock(async () => null), create: mock(async ({ data }: any) => { exceptions.push(data); return data; }) },
    courierEvent: { create: mock(async () => ({})) },
    order: { update: mock(async ({ data }: any) => { orderUpdates.push(data); }) },
    orderStatusEvent: { create: mock(async ({ data }: any) => { statusEvents.push(data); }) },
  };
  db.$transaction = async (callback: any) => callback(db);
  const activities: any[] = [];
  const providerCalls: any[] = [];
  const adapter: CourierProviderAdapter = {
    code: "fake",
    capabilities: new Set(["createReturn", "requestPickup"]),
    healthCheck: async () => ({ available: true }),
    createConsignment: async () => { throw new Error("unused"); },
    getConsignmentStatus: async () => ({ providerState: "pending" }),
    createReturn: mock(async (_credentials, value) => { providerCalls.push({ kind: "return", value }); return { externalId: "provider-return-1", consignmentExternalId: "1424107", providerState: "pending" }; }),
    requestPickup: mock(async (_credentials, value) => { providerCalls.push({ kind: "pickup", value }); return { externalId: "pickup-1", providerState: "0" }; }),
  };
  const service = new CourierReturnsSettlementsService({ db, activity: { record: mock(async (entry: any) => { activities.push(entry); return entry; }) }, resolver: { resolve: mock(async () => ({ baseUrl: "https://example.test", values: {} })) }, registry: new CourierProviderRegistry().register(adapter) });
  return { service, db, consignment, exceptions, statusEvents, orderUpdates, activities, providerCalls, settlementAmount: options.settlementAmount ?? "1060.00" };
}

describe("courier returns and settlements", () => {
  it("completes a return into manual reconciliation without refunding or restocking", async () => {
    const { service, db, exceptions } = harness();
    await service.createReturn({ consignmentId: "consignment-1", reason: "Customer refused" }, "admin-1");
    await service.updateReturn("return-1", { state: "processing" }, "admin-1");
    await service.updateReturn("return-1", { state: "completed" }, "admin-1");
    expect(exceptions[0]).toMatchObject({ kind: "return_reconciliation_required", details: { inventoryAndRefundRemainManual: true } });
    expect(db).not.toHaveProperty("orderRefund");
    expect(db).not.toHaveProperty("inventoryMovement");
  });

  it("reconciles matching COD only after delivery", async () => {
    const delivered = harness({ delivered: true });
    const result = await delivered.service.recordSettlement({ consignmentId: "consignment-1", externalId: "PAYOUT-1", amount: "1060.00", currency: "BDT" }, "admin-1");
    expect(result.state).toBe("reconciled");
    expect(delivered.orderUpdates).toContainEqual({ paymentStatus: "paid" });
    expect(delivered.statusEvents[0]).toMatchObject({ type: "payment", newValue: "paid" });

    const notDelivered = harness();
    const pending = await notDelivered.service.recordSettlement({ consignmentId: "consignment-1", externalId: "PAYOUT-2", amount: "1060.00", currency: "BDT" }, "admin-1");
    expect(pending.state).toBe("matched_pending_delivery");
    expect(notDelivered.orderUpdates).toEqual([]);
  });

  it("routes amount or currency mismatches to an exception", async () => {
    const { service, exceptions, orderUpdates } = harness({ delivered: true });
    const result = await service.recordSettlement({ consignmentId: "consignment-1", externalId: "PAYOUT-3", amount: "1000.00", currency: "BDT" }, "admin-1");
    expect(result.state).toBe("mismatch");
    expect(exceptions[0]).toMatchObject({ kind: "settlement_mismatch" });
    expect(orderUpdates).toEqual([]);
  });

  it("records manual handoff without calling a provider pickup API", async () => {
    const { service, consignment, orderUpdates, activities } = harness();
    await service.markHandoff("consignment-1", { state: "handed_to_courier" }, "admin-1");
    expect(consignment.state).toBe("handed_to_courier");
    expect(orderUpdates).toContainEqual({ deliveryStatus: "shipped" });
    expect(activities[0].type).toBe("courier.handoff.updated");
  });

  it("submits a reviewed return to the selected courier", async () => {
    const { service, providerCalls } = harness();
    await service.createReturn({ consignmentId: "consignment-1", reason: "Customer refused" }, "admin-1");
    const result = await service.submitReturn("return-1", "admin-1");
    expect(result).toMatchObject({ externalId: "provider-return-1", providerState: "pending" });
    expect(providerCalls).toEqual([{ kind: "return", value: { externalId: "1424107", reason: "Customer refused" } }]);
  });

  it("submits an explicit pickup request and records the provider reference", async () => {
    const { service, providerCalls, consignment } = harness();
    await expect(service.requestPickup("consignment-1", { addressId: 42, policeStationId: 17, address: "Dhanmondi, Dhaka", contactNumber: "01712345678", estimatedQuantity: 1 }, "admin-1")).resolves.toMatchObject({ externalId: "pickup-1" });
    expect(consignment.state).toBe("pickup_requested_externally");
    expect(providerCalls[0]).toMatchObject({ kind: "pickup", value: { addressId: 42, policeStationId: 17 } });
  });
});
