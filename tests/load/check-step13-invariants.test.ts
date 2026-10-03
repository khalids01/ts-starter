import { expect, it } from "bun:test";
import type { PrismaClient } from "../../packages/db/prisma/generated/client";
import { checkStep13Invariants } from "./check-step13-invariants";

function dbWith(unsafe: boolean) {
  const order = { id: "fictional-order", checkoutKey: "fictional-key", totalAmount: "10.00", currency: "BDT", paymentStatus: "paid", payments: [{ id: "fictional-receipt", amount: "10.00", currency: "BDT", entryType: "receipt" }], refunds: unsafe ? [{ amount: "11.00", currency: "BDT" }] : [] };
  return {
    order: { findMany: async (args: any) => args.cursor ? [] : [order] },
    inventoryStock: { findMany: async () => [{ variantId: "v", locationId: "l", batchId: null, quantityOnHand: 1, quantityReserved: unsafe ? 2 : 0 }] },
    foodDeliverySlot: { findMany: async () => [{ id: "slot", capacityUnits: 1, reservedUnits: unsafe ? 2 : 0 }] },
    stockReservation: { groupBy: async () => [] },
    inventoryMovement: { groupBy: async () => [{ variantId: "v", locationId: "l", batchId: null, _sum: { delta: 1 } }] },
    foodOrderBooking: { findMany: async () => [] },
    discountCode: { findMany: async () => [] },
    courierConsignment: { findMany: async () => unsafe ? [{ orderId: "same", connectionId: "same", externalId: "same" }, { orderId: "same", connectionId: "same", externalId: "same" }] : [] },
    courierOperation: { groupBy: async () => [], count: async () => 0, findMany: async () => [] },
  } as unknown as PrismaClient;
}
it("rejects financial, stock, food capacity and shipment identity violations", async () => {
  const result = await checkStep13Invariants(dbWith(true));
  expect(result.passed).toBe(false);
  expect(result.failures).toEqual({ money_or_receipt_status: 1, negative_or_oversold_stock: 1, reservation_counter_mismatch: 1, food_slot_capacity: 1, food_booking_counter_mismatch: 1, duplicate_active_shipment: 1, duplicate_provider_identity: 1 });
});
it("accepts reconciled fictional state and reports bounded scan counts", async () => {
  const result = await checkStep13Invariants(dbWith(false));
  expect(result.passed).toBe(true);
  expect(result.ordersChecked).toBe(1);
  expect(result.stockRows).toBe(1);
});

it("detects durable orders/operations disappearing across a run", async () => {
  const result = await checkStep13Invariants(dbWith(false), { orderIds: ["fictional-order", "lost"], operationIds: ["lost-operation"] });
  expect(result.passed).toBe(false);
  expect(result.failures).toEqual({ lost_order: 1, lost_operation: 1 });
});
