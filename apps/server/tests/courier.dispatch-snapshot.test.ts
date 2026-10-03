import { expect, it } from "bun:test";
import {
  assertReviewedCourierRequest,
  courierRequestSnapshot,
} from "../src/modules/delivery/dispatch-snapshot";
const order = {
  orderNumber: "ORD-JSONB",
  totalAmount: "110.00",
  currency: "BDT",
  paymentMethod: "cash_on_delivery",
  paymentStatus: "unpaid",
  payments: [],
  refunds: [],
  customerPhone: "01700000000",
  addresses: [
    {
      type: "shipping",
      fullName: "Fictional customer",
      phone: "01700000000",
      line1: "1 Test Road",
    },
  ],
};
it("accepts the exact reviewed contract after PostgreSQL JSONB reorders object keys", () => {
  const original = courierRequestSnapshot(order);
  const reordered = Object.fromEntries(Object.entries(original).reverse());
  expect(JSON.stringify(original)).not.toBe(JSON.stringify(reordered));
  expect(assertReviewedCourierRequest(order, reordered)).toEqual(original);
});
it.each([
  "codAmount",
  "moneyFingerprint",
  "recipientAddress",
  "recipientPhone",
  "currency",
])("rejects changed reviewed %s even with reordered keys", (key) => {
  const reviewed = Object.fromEntries(
    Object.entries(courierRequestSnapshot(order)).reverse(),
  );
  reviewed[key] = "changed";
  expect(() => assertReviewedCourierRequest(order, reviewed)).toThrow(
    "changed",
  );
});
it("rejects missing or extra reviewed contract fields", () => {
  const reviewed: Record<string, unknown> = courierRequestSnapshot(order);
  delete reviewed.note;
  expect(() => assertReviewedCourierRequest(order, reviewed)).toThrow(
    "changed",
  );
  expect(() =>
    assertReviewedCourierRequest(order, {
      ...courierRequestSnapshot(order),
      unexpected: true,
    }),
  ).toThrow("changed");
});
