import { createHash } from "node:crypto";
import { courierCod } from "../ecommerce/orders/payment-accounting";

export function courierRequestSnapshot(order: any, invoice?: string) {
  const address = order.addresses?.find((row: any) => row.type === "shipping");
  if (!address) throw new Error("Shipping address is missing");
  return {
    schemaVersion: 2,
    invoice: invoice ?? order.orderNumber.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 100),
    recipientName: address.fullName,
    recipientPhone: address.phone ?? order.customerPhone,
    recipientAddress: [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", "),
    codAmount: courierCod(order),
    currency: order.currency,
    note: order.customerNotes?.slice(0, 480) || null,
    moneyFingerprint: createHash("sha256").update(JSON.stringify({
      total: String(order.totalAmount), currency: order.currency, method: order.paymentMethod,
      payments: (order.payments ?? []).map((row: any) => [row.id, row.entryType, String(row.amount), row.currency, row.reversesId ?? null]).sort(),
      refunds: (order.refunds ?? []).map((row: any) => [row.id, String(row.amount), row.currency]).sort(),
    })).digest("hex"),
  };
}

export function assertReviewedCourierRequest(order: any, reviewed: any) {
  const current = courierRequestSnapshot(order, reviewed?.invoice);
  if (!reviewed || reviewed.schemaVersion !== 2 || JSON.stringify(current) !== JSON.stringify(reviewed)) {
    throw new Error("Order money or shipping details changed; review the courier route again");
  }
  return current;
}
