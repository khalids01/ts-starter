import type { Prisma } from "@db/server";
import { assertNoBookingInProgress, stopUnsubmittedDispatches } from "./order-custody";
import { AdminOrdersServiceError, restockCommittedReservations, withOrderTransaction } from "./orders.service";
import type { InspectOrderRecoveryInput, ReceiveOrderRecoveryInput } from "./orders.dto";

function requiredNote(value: string) {
  const note = value.trim();
  if (!note) throw new AdminOrdersServiceError("Physical receipt or inspection evidence is required");
  return note;
}

export async function restockReceivedOrder(tx: Prisma.TransactionClient, orderId: string, actorUserId: string, note: string) {
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { recovery: true } });
  if (!order) throw new AdminOrdersServiceError("Order not found", 404);
  if (order.inventoryStatus !== "committed") throw new AdminOrdersServiceError("Only committed inventory that has not been restocked can be recovered", 409);
  const recovery = order.recovery;
  if (!recovery?.receivedAt || recovery.disposition !== "sellable" || !recovery.inspectedAt || !recovery.inspectedByUserId || recovery.restockedAt) {
    throw new AdminOrdersServiceError("Record full physical receipt and a sellable inspection before restocking", 409);
  }
  await stopUnsubmittedDispatches(tx, orderId, actorUserId);
  await assertNoBookingInProgress(tx, orderId);
  const stamped = await tx.orderRecovery.updateMany({
    where: { id: recovery.id, disposition: "sellable", restockedAt: null },
    data: { restockedAt: new Date(), restockedByUserId: actorUserId },
  });
  if (stamped.count !== 1) throw new AdminOrdersServiceError("Recovery changed or has already been restocked", 409);
  const affectedReservations = await restockCommittedReservations(tx, { orderId, actorUserId, reason: note });
  await tx.orderStatusEvent.create({ data: {
    orderId, type: "delivery", previousValue: order.deliveryStatus, newValue: "returned", note, actorUserId,
    metadata: { action: "physical_inventory_restocked", recoveryId: recovery.id, affectedReservations, wholeOrder: true },
  } });
  return { orderId, inventoryStatus: "restocked", affectedReservations };
}

export const orderRecoveryService = {
  async receive(orderId: string, input: ReceiveOrderRecoveryInput, actorUserId: string) {
    const receiptNote = requiredNote(input.note);
    if (input.allItemsReceived !== true) throw new AdminOrdersServiceError("Whole-order recovery requires every item to be physically received", 409);
    return withOrderTransaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { recovery: true } });
      if (!order) throw new AdminOrdersServiceError("Order not found", 404);
      if (order.inventoryStatus !== "committed") throw new AdminOrdersServiceError("Only committed order inventory can be received", 409);
      if (order.recovery) throw new AdminOrdersServiceError("Physical receipt has already been recorded", 409);
      // Receipt is an operator attestation; provider return completion alone is insufficient.
      if (order.orderStatus !== "cancelled" && !["shipped", "out_for_delivery", "delivered", "returned", "failed"].includes(order.deliveryStatus)) {
        throw new AdminOrdersServiceError("Cancel an unshipped order before recording its recovery", 409);
      }
      await stopUnsubmittedDispatches(tx, orderId, actorUserId);
      await assertNoBookingInProgress(tx, orderId);
      const recovery = await tx.orderRecovery.create({ data: { orderId, receivedAt: new Date(), receivedByUserId: actorUserId, receiptNote } });
      await tx.order.update({ where: { id: orderId }, data: { deliveryStatus: "returned" } });
      await tx.orderStatusEvent.create({ data: {
        orderId, type: "delivery", previousValue: order.deliveryStatus, newValue: "returned", note: receiptNote, actorUserId,
        metadata: { action: "physical_receipt_recorded", recoveryId: recovery.id, wholeOrder: true, disposition: "awaiting_inspection", inventorySideEffect: "none" },
      } });
      return recovery;
    });
  },

  async inspect(orderId: string, input: InspectOrderRecoveryInput, actorUserId: string) {
    const note = requiredNote(input.note);
    return withOrderTransaction(async (tx) => {
      const recovery = await tx.orderRecovery.findUnique({ where: { orderId } });
      if (!recovery) throw new AdminOrdersServiceError("Record physical receipt before inspection", 409);
      if (recovery.restockedAt) throw new AdminOrdersServiceError("Restocked inventory cannot be inspected again", 409);
      const updated = await tx.orderRecovery.update({ where: { orderId }, data: { disposition: input.disposition, inspectedAt: new Date(), inspectedByUserId: actorUserId, inspectionNote: note } });
      await tx.orderStatusEvent.create({ data: {
        orderId, type: "delivery", previousValue: "returned", newValue: "returned", note, actorUserId,
        metadata: { action: "physical_receipt_inspected", recoveryId: recovery.id, previousDisposition: recovery.disposition, disposition: input.disposition, inventorySideEffect: "none" },
      } });
      return updated;
    });
  },

  async restock(orderId: string, note: string, actorUserId: string) {
    const reason = requiredNote(note);
    return withOrderTransaction((tx) => restockReceivedOrder(tx, orderId, actorUserId, reason));
  },
};
