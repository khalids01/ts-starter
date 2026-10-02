import { minorUnitsString, moneyStatus, orderMoney } from "../ecommerce/orders/payment-accounting";
import { paymentMinorUnits } from "../ecommerce/orders/payment-policy";

async function mismatch(tx: any, consignment: any, settlement: any, reason: string) {
  await tx.courierSettlement.update({ where: { id: settlement.id }, data: { state: "mismatch" } });
  const existing = await tx.courierException.findFirst({ where: { consignmentId: consignment.id, kind: "settlement_mismatch", state: "open" } });
  if (!existing) await tx.courierException.create({ data: { consignmentId: consignment.id, kind: "settlement_mismatch", details: { settlementId: settlement.id, reason } } });
  return "mismatch";
}

/** Shared by direct settlement recording and delayed delivery; never infer payment from delivery. */
export async function reconcileCourierSettlement(tx: any, consignment: any, settlement: any, actorUserId: string) {
  const credited = await tx.orderPayment.findUnique({ where: { settlementId: settlement.id } });
  if (credited) return "reconciled";
  const order = await tx.order.findUnique({ where: { id: consignment.orderId }, include: { payments: true, refunds: true, recovery: true } });
  let money;
  try {
    if (!order || order.orderStatus === "cancelled" || order.recovery || order.deliveryStatus === "returned") throw new Error("Cancelled or recovered order requires review");
    money = orderMoney(order);
    if (settlement.currency !== consignment.currency || settlement.currency !== order.currency) throw new Error("Collection currency mismatch");
    const collected = paymentMinorUnits(String(settlement.amount));
    if (collected <= 0n || collected !== paymentMinorUnits(String(consignment.codAmount)) || collected !== money.outstanding) {
      throw new Error("Gross customer collection differs from booked COD or remaining evidence; do not double credit");
    }
  } catch (error) { return mismatch(tx, consignment, settlement, (error as Error).message); }
  if (consignment.state !== "delivered" || order.deliveryStatus !== "delivered") {
    await tx.courierSettlement.update({ where: { id: settlement.id }, data: { state: "matched_pending_delivery" } });
    return "matched_pending_delivery";
  }
  const payment = await tx.orderPayment.create({ data: {
    orderId: order.id, entryType: "receipt", amount: minorUnitsString(money.outstanding), currency: order.currency,
    method: "cash_on_delivery", idempotencyKey: `courier-collection:${consignment.id}`, reference: settlement.externalId,
    note: "Gross customer collection reconciled against booked COD", actorUserId, receivedAt: new Date(), settlementId: settlement.id,
  } });
  const status = moneyStatus({ ...money, received: money.total, outstanding: 0n, netReceived: money.total - money.refunded });
  await tx.order.update({ where: { id: order.id }, data: { paymentStatus: status } });
  await tx.courierSettlement.update({ where: { id: settlement.id }, data: { state: "reconciled" } });
  await tx.orderStatusEvent.create({ data: {
    orderId: order.id, type: "payment", previousValue: order.paymentStatus, newValue: status,
    note: "Courier gross COD collection reconciled", actorUserId,
    metadata: { settlementId: settlement.id, consignmentId: consignment.id, paymentId: payment.id },
  } });
  return "reconciled";
}
