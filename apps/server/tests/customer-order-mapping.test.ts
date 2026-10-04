import { describe, expect, test } from "bun:test";
import { mapOrder } from "../src/modules/shop/lib/order-mappers";
const order = {
  id: "order-owned",
  orderNumber: "ORD-1",
  totalAmount: "100.00",
  currency: "BDT",
  paymentMethod: "cash_on_delivery",
  paymentStatus: "unpaid",
  addresses: [],
  lineItems: [],
  payments: [],
  refunds: [],
  statusEvents: [],
};
describe("customer order money and private fields", () => {
  test("partial receipts and refunds use ledger evidence, not labels", () => {
    const result = mapOrder({
      ...order,
      paymentStatus: "partially_refunded",
      payments: [
        {
          id: "receipt",
          entryType: "receipt",
          amount: "30.00",
          currency: "BDT",
        },
      ],
      refunds: [{ amount: "10.00", currency: "BDT" }],
    });
    expect(result.money).toEqual({
      received: "30.00",
      refunded: "10.00",
      outstanding: "70.00",
      netReceived: "20.00",
      error: null,
    });
  });
  test("legacy paid status cannot invent receipt or remaining values", () => {
    const result = mapOrder({ ...order, paymentStatus: "paid" });
    expect(result.money).toEqual({
      received: null,
      refunded: null,
      outstanding: null,
      netReceived: null,
      error: "Payment information needs store review",
    });
  });
  test("customer history omits staff notes, actor and provider metadata", () => {
    const result = mapOrder({
      ...order,
      adminNotes: "private",
      statusEvents: [
        {
          id: "event",
          type: "order",
          newValue: "confirmed",
          note: "staff-only",
          actorUserId: "staff",
          metadata: { token: "private" },
          createdAt: new Date("2026-10-04"),
        },
      ],
    });
    expect(result.statusEvents).toEqual([
      {
        id: "event",
        type: "order",
        newValue: "confirmed",
        createdAt: "2026-10-04T00:00:00.000Z",
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("private");
  });
  test("food booking exposes only the customer's delivery window", () => {
    const result = mapOrder({
      ...order,
      foodBooking: {
        state: "reserved",
        capacityUnits: 99,
        slot: {
          label: "Morning",
          startsAt: new Date("2026-10-05"),
          endsAt: new Date("2026-10-05T03:00Z"),
          capacityUnits: 999,
          postalCodes: ["private"],
        },
      },
    });
    expect(result.foodBooking).toEqual({
      state: "reserved",
      slot: {
        label: "Morning",
        startsAt: "2026-10-05T00:00:00.000Z",
        endsAt: "2026-10-05T03:00:00.000Z",
      },
    });
  });
});
