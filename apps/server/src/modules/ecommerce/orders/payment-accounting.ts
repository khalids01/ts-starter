import { deriveOrderMoney, paymentMinorUnits, type PaymentEvidence } from "./payment-policy";

export class OrderMoneyError extends Error {}
export function minorUnitsString(value: bigint) {
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

export type MoneyOrder = {
  totalAmount: unknown;
  currency: string;
  paymentStatus: string;
  paymentMethod?: string;
  payments?: readonly (Omit<PaymentEvidence, "amount"> & { amount: unknown; id?: string; reversesId?: string | null; settlementId?: string | null })[];
  refunds?: readonly { amount: unknown; currency?: string }[];
};

export function moneyStatus(money: ReturnType<typeof deriveOrderMoney>) {
  if (money.refunded > 0n) return money.refunded === money.received ? "refunded" : "partially_refunded";
  if (money.outstanding === 0n) return "paid";
  return money.received > 0n ? "partially_paid" : "unpaid";
}

/** Legacy paid/refunded rows require reviewed evidence, never invented receipts. */
export function orderMoney(order: MoneyOrder, validateStatus = true) {
  try {
    const payments = order.payments ?? [];
    if (!payments.length && !["unpaid", "failed"].includes(order.paymentStatus)) {
      throw new Error("Legacy payment status requires reviewed receipt reconciliation");
    }
    for (const reversal of payments.filter((row) => row.entryType === "reversal")) {
      const receipt = payments.find((row) => row.id === reversal.reversesId);
      if (!receipt || receipt.entryType !== "receipt" || receipt.currency !== reversal.currency
        || paymentMinorUnits(String(receipt.amount)) !== paymentMinorUnits(String(reversal.amount))
        || payments.filter((row) => row.reversesId === receipt.id).length !== 1) {
        throw new Error("Payment reversal evidence is inconsistent");
      }
    }
    let refunded = 0n;
    for (const refund of order.refunds ?? []) {
      if (refund.currency && refund.currency !== order.currency) throw new Error("Refund currency mismatch");
      refunded += paymentMinorUnits(String(refund.amount));
    }
    const money = deriveOrderMoney({
      total: String(order.totalAmount), currency: order.currency,
      payments: payments.map((row) => ({ ...row, amount: String(row.amount) })),
      refunded: minorUnitsString(refunded),
    });
    if (validateStatus && payments.length && moneyStatus(money) !== order.paymentStatus) throw new Error("Payment status contradicts receipt evidence");
    return money;
  } catch (error) {
    throw new OrderMoneyError(error instanceof Error ? error.message : "Invalid payment evidence");
  }
}

export function courierCod(order: MoneyOrder) {
  if (order.currency !== "BDT") throw new OrderMoneyError("Courier dispatch currently requires BDT");
  const money = orderMoney(order);
  if (money.outstanding > 0n && order.paymentMethod !== "cash_on_delivery") {
    throw new OrderMoneyError("Unpaid non-COD orders cannot be dispatched");
  }
  return minorUnitsString(money.outstanding);
}

export function paymentSummary(order: MoneyOrder) {
  try {
    const money = orderMoney(order);
    return { received: minorUnitsString(money.received), refunded: minorUnitsString(money.refunded), outstanding: minorUnitsString(money.outstanding), netReceived: minorUnitsString(money.netReceived), error: null };
  } catch (error) {
    return { received: null, refunded: null, outstanding: null, netReceived: null, error: (error as Error).message };
  }
}
