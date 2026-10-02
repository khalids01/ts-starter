import type { Prisma } from "@db/server";
import { orderMoney } from "../ecommerce/orders/payment-accounting";

export class ShipmentClaimConflict extends Error {}

export async function assertShipmentClaim(tx: Prisma.TransactionClient, orderId: string, dispatchId: string) {
  const claim = await tx.courierShipmentClaim.findUnique({ where: { orderId } });
  if (!claim || claim.dispatchId !== dispatchId) {
    throw new ShipmentClaimConflict("This dispatch does not own the order's shipment claim; reconcile existing shipments before proceeding");
  }
  return claim;
}

async function release(tx: Prisma.TransactionClient, orderId: string, dispatchId: string, actorUserId: string | undefined, reason: string) {
  const deleted = await tx.courierShipmentClaim.deleteMany({ where: { orderId, dispatchId } });
  if (deleted.count !== 1) throw new ShipmentClaimConflict("Shipment ownership changed; reload before releasing it");
  await tx.orderStatusEvent.create({ data: {
    orderId, type: "delivery", newValue: "shipment_claim_released", actorUserId: actorUserId ?? null,
    note: reason, metadata: { action: "shipment_claim_released", dispatchId, reason },
  } });
}

/** Releasing an unsubmitted review never deletes history or restocks goods. */
export async function releaseUnsubmittedShipmentClaim(tx: Prisma.TransactionClient, orderId: string, actorUserId: string | undefined, reason: string) {
  const claim = await tx.courierShipmentClaim.findUnique({
    where: { orderId }, include: { dispatch: { include: { consignment: { include: { operations: true } } } } },
  });
  if (!claim || claim.dispatch.status !== "cancelled") return false;
  const consignment = claim.dispatch.consignment;
  if (consignment) {
    const creates = consignment.operations.filter((row) => row.kind === "create");
    if (consignment.state !== "cancelled_before_submission" || consignment.externalId || consignment.submittedAt
      || creates.length !== 1 || creates[0]!.attemptCount !== 0 || creates[0]!.state !== "cancelled" || creates[0]!.leaseUntil) return false;
  }
  await release(tx, orderId, claim.dispatchId, actorUserId, reason);
  return true;
}

/** Delivered + reconciled money, with no recovery/exception/return, is the terminal release point. */
export async function releaseDeliveredShipmentClaim(tx: Prisma.TransactionClient, consignmentId: string, actorUserId?: string) {
  const consignment = await tx.courierConsignment.findUnique({ where: { id: consignmentId }, include: { order: { include: { payments: true, refunds: true, recovery: true } } } });
  if (!consignment || consignment.state !== "delivered" || consignment.order.deliveryStatus !== "delivered"
    || consignment.order.orderStatus === "cancelled" || consignment.order.inventoryStatus !== "committed" || consignment.order.recovery) return false;
  try { if (orderMoney(consignment.order).outstanding !== 0n) return false; }
  catch { return false; }
  const claim = await tx.courierShipmentClaim.findUnique({ where: { orderId: consignment.orderId } });
  if (!claim || claim.dispatchId !== consignment.dispatchId) return false;
  const unfinishedBooking = await tx.courierOperation.findFirst({ where: { consignmentId, kind: "create", state: { not: "completed" } } });
  if (unfinishedBooking) return false;
  const exception = await tx.courierException.findFirst({ where: { consignment: { orderId: consignment.orderId }, state: "open" } });
  const returned = await tx.courierReturn.findFirst({ where: { consignment: { orderId: consignment.orderId }, state: { not: "cancelled" } } });
  if (exception || returned) return false;
  await tx.courierDispatch.update({ where: { id: claim.dispatchId }, data: { status: "completed" } });
  await release(tx, consignment.orderId, claim.dispatchId, actorUserId, "Delivered shipment with reconciled collection and no unresolved recovery");
  return true;
}
