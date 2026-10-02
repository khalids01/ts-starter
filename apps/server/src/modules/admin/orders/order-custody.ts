import type { Prisma } from "@db/server";
import { shipmentNeedsRecovery, manualShipmentNeedsRecovery } from "../../ecommerce/orders/recovery-policy";
import { AdminOrdersServiceError } from "./orders.service";

/** Called inside the same serializable transaction as cancellation/recovery. */
export async function stopUnsubmittedDispatches(tx: Prisma.TransactionClient, orderId: string) {
  const shipments = await tx.courierConsignment.findMany({
    where: { orderId },
    include: { operations: true },
  });
  let recoveryRequired = false;
  for (const shipment of shipments) {
    const uncertain = shipmentNeedsRecovery(shipment);
    recoveryRequired ||= uncertain;
    // Claiming a job and cancelling it race on this row. A lost race rolls back.
    for (const operation of shipment.operations.filter((item) => item.kind === "create" && item.state === "pending" && item.attemptCount === 0)) {
      const stopped = await tx.courierOperation.updateMany({
        where: { id: operation.id, state: "pending", attemptCount: 0, leaseUntil: null },
        data: { state: "cancelled", lastErrorCode: "order_cancelled" },
      });
      if (stopped.count !== 1) throw new AdminOrdersServiceError("Dispatch changed; reload the order before cancelling or restocking", 409);
    }
    if (!uncertain) {
      await tx.courierConsignment.update({ where: { id: shipment.id }, data: { state: "cancelled_before_submission", active: false } });
      await tx.courierDispatch.update({ where: { id: shipment.dispatchId }, data: { status: "cancelled" } });
    } else {
      // Retries may already have reached the provider; stop automatic resubmission,
      // but preserve processing leases/results for reconciliation.
      await tx.courierOperation.updateMany({
        where: { consignmentId: shipment.id, kind: "create", state: { in: ["pending", "retry"] } },
        data: { state: "manual_review", leaseUntil: null, lastErrorCode: "order_recovery_required" },
      });
      const existing = await tx.courierException.findFirst({ where: { consignmentId: shipment.id, kind: "order_recovery_required", state: "open" } });
      if (!existing) await tx.courierException.create({ data: { consignmentId: shipment.id, kind: "order_recovery_required", details: { orderId, physicalReceiptRequired: true } } });
    }
  }
  await tx.courierDispatch.updateMany({ where: { orderId, status: "confirmed", consignment: { is: null } }, data: { status: "cancelled" } });
  return { recoveryRequired, shipments };
}

export async function orderNeedsPhysicalRecovery(tx: Prisma.TransactionClient, order: {
  id: string; shippedAt: Date | null; deliveredAt: Date | null; deliveryStatus: string;
}, courierRecoveryRequired: boolean) {
  const statusEvents = await tx.orderStatusEvent.findMany({ where: { orderId: order.id, type: "delivery" }, select: { newValue: true } });
  return courierRecoveryRequired || manualShipmentNeedsRecovery({ ...order, statusEvents });
}

export async function assertNoBookingInProgress(tx: Prisma.TransactionClient, orderId: string) {
  const inProgress = await tx.courierOperation.findFirst({
    where: { consignment: { orderId }, kind: "create", state: { in: ["pending", "retry", "processing"] } },
  });
  if (inProgress) throw new AdminOrdersServiceError("Resolve the pending or uncertain courier booking before recording receipt or restocking", 409);
}
