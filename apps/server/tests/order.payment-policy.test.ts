import { describe, expect, it } from "bun:test";
import { deriveOrderMoney, paymentMinorUnits } from "../src/modules/ecommerce/orders/payment-policy";

const receipt = (amount: string) => ({ amount, currency: "BDT", entryType: "receipt" as const });
const balance = (payments = [receipt("300.00")], refunded = "0.00") => deriveOrderMoney({ total: "1000.00", currency: "BDT", payments, refunded });

describe("order receipt accounting contract", () => {
  it("collects only the outstanding balance after a deposit", () => {
    expect(balance().outstanding).toBe(70000n);
    expect(balance().netReceived).toBe(30000n);
  });
  it("does not turn a refund into additional COD", () => {
    expect(balance([receipt("1000.00")], "200.00")).toMatchObject({ outstanding: 0n, netReceived: 80000n });
    expect(balance([receipt("1000.00")], "1000.00").outstanding).toBe(0n);
  });
  it("supports corrected receipt evidence separately from refunds", () => {
    const money = deriveOrderMoney({ total: "1000", currency: "BDT", refunded: "0", payments: [receipt("300"), { ...receipt("300"), entryType: "reversal" }] });
    expect(money.received).toBe(0n);
    expect(money.outstanding).toBe(100000n);
  });
  it("rejects unsupported precision, signs and invalid money", () => {
    for (const value of ["-1", "1.001", "NaN", "1e2", " 1", "1."]) expect(() => paymentMinorUnits(value)).toThrow();
    expect(paymentMinorUnits("0.01")).toBe(1n);
  });
  it("rejects overpayments, excess refunds, zero receipts and currency mismatch", () => {
    expect(() => balance([receipt("1000.01")])).toThrow();
    expect(() => balance([receipt("300")], "300.01")).toThrow();
    expect(() => balance([receipt("0")])).toThrow();
    expect(() => deriveOrderMoney({ total: "1000", currency: "USD", refunded: "0", payments: [receipt("1")] })).toThrow();
  });
});
