import { createHash } from "node:crypto";
import { invalidatePaymentDispatches } from "../../ecommerce/orders/payment-dispatch";
import { minorUnitsString, moneyStatus, orderMoney } from "../../ecommerce/orders/payment-accounting";
import { paymentMinorUnits } from "../../ecommerce/orders/payment-policy";
import { AdminOrdersServiceError, withOrderTransaction } from "./orders.service";
import type { RecordOrderPaymentInput } from "./orders.dto";

function required(value: string, label: string) {
  const text = value.trim();
  if (!text) throw new AdminOrdersServiceError(`${label} is required`);
  return text;
}
export function manualReceiptKey(method: string, reference: string) {
  return `manual:${method}:${createHash("sha256").update(reference.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()).digest("hex")}`;
}
async function currentOrder(tx: any, id: string) {
  const order = await tx.order.findUnique({ where: { id }, include: { payments: true, refunds: true } });
  if (!order) throw new AdminOrdersServiceError("Order not found", 404);
  orderMoney(order);
  return order;
}
async function persistPayment(tx: any, order: any, entry: any, actorUserId: string) {
  const money = orderMoney({ ...order, payments: [...order.payments, entry] }, false);
  const status = moneyStatus(money);
  const payment = await tx.orderPayment.create({ data: entry });
  await tx.order.update({ where: { id: order.id }, data: { paymentStatus: status } });
  await tx.orderStatusEvent.create({ data: {
    orderId: order.id, type: "payment", previousValue: order.paymentStatus, newValue: status,
    note: entry.note, actorUserId,
    metadata: { action: entry.entryType === "receipt" ? "payment_receipt_recorded" : "payment_receipt_reversed", paymentId: payment.id, amount: entry.amount, currency: entry.currency, method: entry.method, reference: entry.reference },
  } });
  await invalidatePaymentDispatches(tx, order.id);
  return payment;
}

export const orderPaymentsService = {
  async receive(orderId: string, input: RecordOrderPaymentInput, actorUserId: string) {
    if (!actorUserId) throw new AdminOrdersServiceError("Authenticated payment actor is required", 403);
    const reference = required(input.reference, "Collection reference");
    const note = required(input.note, "Confirmed collection evidence");
    const currency = input.currency.trim().toUpperCase();
    let amount: string;
    try {
      const minor = paymentMinorUnits(input.amount.trim());
      if (minor <= 0n || minor > 999999999999n) throw new Error("Payment amount is outside supported limits");
      amount = minorUnitsString(minor);
    } catch (error) { throw new AdminOrdersServiceError((error as Error).message); }
    const idempotencyKey = manualReceiptKey(input.method, reference);
    return withOrderTransaction(async (tx) => {
      const previous = await tx.orderPayment.findUnique({ where: { idempotencyKey } });
      if (previous) {
        if (previous.orderId !== orderId || paymentMinorUnits(String(previous.amount)) !== paymentMinorUnits(amount)
          || previous.currency !== currency || previous.method !== input.method || previous.entryType !== "receipt") {
          throw new AdminOrdersServiceError("Collection reference already exists with different payment data", 409);
        }
        return previous;
      }
      const order = await currentOrder(tx, orderId);
      if (currency !== order.currency) throw new AdminOrdersServiceError("Payment currency mismatch", 409);
      if (order.orderStatus === "cancelled" || order.orderStatus === "completed") throw new AdminOrdersServiceError("Use reconciliation for cancelled or completed order collections", 409);
      if (input.method === "cash_on_delivery") {
        const courier = await tx.courierConsignment.findFirst({ where: { orderId, OR: [{ active: true }, { submittedAt: { not: null } }] } });
        if (courier) throw new AdminOrdersServiceError("Record courier collection using its settlement evidence to avoid double credit", 409);
      }
      return persistPayment(tx, order, { orderId, entryType: "receipt", amount, currency, method: input.method, idempotencyKey, reference, note, actorUserId, receivedAt: new Date() }, actorUserId);
    });
  },

  async reverse(orderId: string, paymentId: string, noteInput: string, actorUserId: string) {
    if (!actorUserId) throw new AdminOrdersServiceError("Authenticated payment actor is required", 403);
    const note = required(noteInput, "Correction evidence");
    return withOrderTransaction(async (tx) => {
      const order = await currentOrder(tx, orderId);
      if (order.orderStatus === "completed") throw new AdminOrdersServiceError("Completed order corrections require reconciliation", 409);
      const receipt = order.payments.find((row: any) => row.id === paymentId);
      if (!receipt || receipt.entryType !== "receipt" || receipt.settlementId) throw new AdminOrdersServiceError("Only this order's manual receipt can be corrected here", 409);
      if (order.payments.some((row: any) => row.reversesId === paymentId)) throw new AdminOrdersServiceError("Receipt was already reversed", 409);
      return persistPayment(tx, order, {
        orderId, entryType: "reversal", amount: String(receipt.amount), currency: receipt.currency,
        method: receipt.method, idempotencyKey: `reversal:${paymentId}`, reference: receipt.reference,
        reversesId: paymentId, note, actorUserId, receivedAt: new Date(),
      }, actorUserId);
    });
  },
};
