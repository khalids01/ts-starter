import prisma from "@db/server";
import type {
  MarkOrderDeliveredInput,
  MarkOrderShippedInput,
  UpdateOrderTrackingInput,
} from "./orders.dto";
import { AdminOrdersServiceError } from "./orders.service";

type FulfillmentActor = { userId?: string };

function text(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || null;
}

function requiredText(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new AdminOrdersServiceError(`${field} is required`);
  }
  return normalized;
}

function fulfillmentResult(order: any) {
  return {
    id: order.id,
    deliveryStatus: order.deliveryStatus,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    fulfillmentNote: order.fulfillmentNote,
    shippedAt: order.shippedAt?.toISOString?.() ?? order.shippedAt ?? null,
    deliveredAt: order.deliveredAt?.toISOString?.() ?? order.deliveredAt ?? null,
  };
}

export const orderFulfillmentService = {
  async markShipped(id: string, input: MarkOrderShippedInput, actor: FulfillmentActor) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      if (!current) throw new AdminOrdersServiceError("Order not found", 404);
      if (current.orderStatus === "cancelled") {
        throw new AdminOrdersServiceError("A cancelled order cannot be shipped", 409);
      }
      if (current.inventoryStatus !== "committed") {
        throw new AdminOrdersServiceError("Confirm the order and commit its stock before shipping", 409);
      }
      if (!["unfulfilled", "preparing", "ready_to_ship"].includes(current.deliveryStatus)) {
        throw new AdminOrdersServiceError("Order is not eligible to be shipped", 409);
      }

      const carrier = requiredText(input.carrier, "Carrier");
      const trackingNumber = requiredText(input.trackingNumber, "Tracking number");
      const note = text(input.note);
      const shippedAt = new Date();
      const updated = await tx.order.update({
        where: { id },
        data: {
          carrier,
          trackingNumber,
          fulfillmentNote: note,
          deliveryStatus: "shipped",
          shippedAt,
        },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          type: "delivery",
          previousValue: current.deliveryStatus,
          newValue: "shipped",
          note,
          actorUserId: actor.userId ?? null,
          metadata: { action: "mark_shipped", carrier, trackingNumber },
        },
      });
      return fulfillmentResult(updated);
    });
  },

  async updateTracking(id: string, input: UpdateOrderTrackingInput, actor: FulfillmentActor) {
    if (input.carrier === undefined && input.trackingNumber === undefined && input.note === undefined) {
      throw new AdminOrdersServiceError("At least one tracking field is required");
    }
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      if (!current) throw new AdminOrdersServiceError("Order not found", 404);
      if (!current.shippedAt) {
        throw new AdminOrdersServiceError("Tracking can only be updated after shipment", 409);
      }
      const carrier = input.carrier === undefined
        ? current.carrier
        : requiredText(input.carrier, "Carrier");
      const trackingNumber = input.trackingNumber === undefined
        ? current.trackingNumber
        : requiredText(input.trackingNumber, "Tracking number");
      const note = input.note === undefined ? current.fulfillmentNote : text(input.note);
      const updated = await tx.order.update({
        where: { id },
        data: { carrier, trackingNumber, fulfillmentNote: note },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          type: "delivery",
          previousValue: current.deliveryStatus,
          newValue: current.deliveryStatus,
          note: text(input.note),
          actorUserId: actor.userId ?? null,
          metadata: {
            action: "tracking_updated",
            previous: { carrier: current.carrier, trackingNumber: current.trackingNumber },
            current: { carrier, trackingNumber },
          },
        },
      });
      return fulfillmentResult(updated);
    });
  },

  async markDelivered(id: string, input: MarkOrderDeliveredInput, actor: FulfillmentActor) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      if (!current) throw new AdminOrdersServiceError("Order not found", 404);
      if (!["shipped", "out_for_delivery"].includes(current.deliveryStatus)) {
        throw new AdminOrdersServiceError("Only a shipped order can be marked delivered", 409);
      }
      const note = text(input.note);
      const deliveredAt = new Date();
      const updated = await tx.order.update({
        where: { id },
        data: { deliveryStatus: "delivered", deliveredAt },
      });
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          type: "delivery",
          previousValue: current.deliveryStatus,
          newValue: "delivered",
          note,
          actorUserId: actor.userId ?? null,
          metadata: { action: "mark_delivered", deliveredAt: deliveredAt.toISOString() },
        },
      });
      return fulfillmentResult(updated);
    });
  },
};
