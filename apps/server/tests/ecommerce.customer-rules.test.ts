import { describe, expect, it } from "bun:test";
import { completedSpendByCurrency, orderSpend } from "../src/modules/admin/customers/customers.service";
import { normalizeCustomerEmail } from "../src/modules/ecommerce/customers/customer-identity.service";

describe("ecommerce customer rules", () => {
  it("normalizes email identity without using name or phone", () => {
    expect(normalizeCustomerEmail("  Customer@Example.COM ")).toBe("customer@example.com");
  });

  it("counts only completed qualifying orders and subtracts refunds without going negative", () => {
    expect(orderSpend({ orderStatus: "pending", paymentStatus: "paid", totalAmount: "50", refunds: [] })).toBe(0);
    expect(orderSpend({ orderStatus: "completed", paymentStatus: "unpaid", totalAmount: "50", refunds: [] })).toBe(0);
    expect(orderSpend({ orderStatus: "completed", paymentStatus: "partially_refunded", totalAmount: "50", refunds: [{ amount: "12.50" }] })).toBe(37.5);
    expect(orderSpend({ orderStatus: "completed", paymentStatus: "refunded", totalAmount: "50", refunds: [{ amount: "60" }] })).toBe(0);
  });

  it("keeps completed spend separated by currency", () => {
    expect(completedSpendByCurrency([
      { orderStatus: "completed", paymentStatus: "paid", totalAmount: "100", currency: "BDT", refunds: [] },
      { orderStatus: "completed", paymentStatus: "paid", totalAmount: "12.50", currency: "USD", refunds: [] },
      { orderStatus: "completed", paymentStatus: "partially_refunded", totalAmount: "20", currency: "USD", refunds: [{ amount: "5" }] },
    ])).toEqual([
      { currency: "BDT", amount: "100.00" },
      { currency: "USD", amount: "27.50" },
    ]);
  });
});
