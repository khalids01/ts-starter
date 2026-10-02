import { OrderMoneyError } from "./payment-accounting";
/** Payment evidence invalidates reviewed booking requests; never silently rewrite them. */
export async function invalidatePaymentDispatches(tx: any, orderId: string) {
  await tx.courierDispatch.updateMany({
    where: { orderId, status: "confirmed", consignment: { is: null } },
    data: { status: "cancelled" },
  });
  const consignments = await tx.courierConsignment.findMany({ where: { orderId, active: true }, include: { operations: true } });
  for (const consignment of consignments) {
    const creates = consignment.operations.filter((row: any) => row.kind === "create");
    const operation = creates[0];
    if (creates.length === 1 && operation.state === "pending" && operation.attemptCount === 0
      && !consignment.externalId && !consignment.submittedAt && consignment.state === "pending_submission") {
      const stopped = await tx.courierOperation.updateMany({
        where: { id: operation.id, state: "pending", attemptCount: 0, leaseUntil: null },
        data: { state: "cancelled", lastErrorCode: "payment_review_changed" },
      });
      if (stopped.count !== 1) throw new OrderMoneyError("Booking changed during payment recording; reload and retry");
      await tx.courierConsignment.update({ where: { id: consignment.id }, data: { state: "cancelled_before_submission", active: false } });
      await tx.courierDispatch.update({ where: { id: consignment.dispatchId }, data: { status: "cancelled" } });
    } else {
      await tx.courierOperation.updateMany({
        where: { consignmentId: consignment.id, kind: "create", state: { in: ["pending", "retry"] } },
        data: { state: "manual_review", leaseUntil: null, lastErrorCode: "payment_review_changed" },
      });
      const existing = await tx.courierException.findFirst({ where: { consignmentId: consignment.id, kind: "payment_review_changed", state: "open" } });
      if (!existing) await tx.courierException.create({ data: { consignmentId: consignment.id, kind: "payment_review_changed", details: { orderId, bookingAmountFrozen: true } } });
    }
  }
}
