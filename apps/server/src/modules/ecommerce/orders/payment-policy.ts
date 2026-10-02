/** Pure receipt accounting. Refunds do not create a new courier receivable. */
export function paymentMinorUnits(value: string): bigint {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Invalid money amount");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export type PaymentEvidence = Readonly<{
  amount: string;
  currency: string;
  entryType: "receipt" | "reversal";
}>;

export function deriveOrderMoney(input: Readonly<{
  total: string;
  currency: string;
  payments: readonly PaymentEvidence[];
  refunded: string;
}>) {
  const total = paymentMinorUnits(input.total);
  const refunded = paymentMinorUnits(input.refunded);
  const received = input.payments.reduce((sum, entry) => {
    if (entry.currency !== input.currency) throw new Error("Payment currency mismatch");
    const amount = paymentMinorUnits(entry.amount);
    if (amount === 0n) throw new Error("Payment amount must be positive");
    return sum + (entry.entryType === "receipt" ? amount : -amount);
  }, 0n);
  if (received < 0n || received > total) throw new Error("Inconsistent payment receipts");
  if (refunded > received) throw new Error("Refund exceeds received money");
  return {
    total,
    received,
    refunded,
    netReceived: received - refunded,
    outstanding: total - received,
  };
}
