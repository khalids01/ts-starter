import prisma from "@db/server";
import {
  withOrderTransaction,
  AdminOrdersServiceError,
} from "./orders.service";
import { NichePolicyError } from "../../ecommerce/niche/policy";
import { openWarrantyClaim } from "../../ecommerce/niche/gadgets";

export const nicheOperationsService = {
  async listSlots() {
    return prisma.foodDeliverySlot.findMany({
      orderBy: { startsAt: "desc" },
      take: 100,
    });
  },
  async createSlot(input: {
    label: string;
    postalCodes: string[];
    startsAt: string;
    endsAt: string;
    cutoffAt: string;
    capacityUnits: number;
  }) {
    const startsAt = new Date(input.startsAt),
      endsAt = new Date(input.endsAt),
      cutoffAt = new Date(input.cutoffAt);
    const postalCodes = [
      ...new Set(
        input.postalCodes
          .map((code) => code.trim().toUpperCase())
          .filter(Boolean),
      ),
    ];
    if (
      !input.label.trim() ||
      !postalCodes.length ||
      ![startsAt, endsAt, cutoffAt].every((date) =>
        Number.isFinite(date.getTime()),
      ) ||
      cutoffAt <= new Date() ||
      cutoffAt > startsAt ||
      startsAt >= endsAt
    )
      throw new AdminOrdersServiceError(
        "Provide an area and future cutoff, start and end in order",
        400,
      );
    return prisma.foodDeliverySlot.create({
      data: {
        label: input.label.trim(),
        postalCodes,
        startsAt,
        endsAt,
        cutoffAt,
        capacityUnits: input.capacityUnits,
      },
    });
  },
  async disableSlot(slotId: string) {
    return withOrderTransaction(async (tx) => {
      const active = await tx.foodOrderBooking.count({
        where: { slotId, state: { in: ["reserved", "preparing", "ready"] } },
      });
      if (active > 0)
        throw new NichePolicyError(
          "Resolve active slot bookings before closing the slot",
        );
      return tx.foodDeliverySlot.update({
        where: { id: slotId },
        data: { isActive: false },
      });
    });
  },
  async preparation(
    orderId: string,
    state: "preparing" | "ready",
    note: string,
    actor: string,
  ) {
    return withOrderTransaction(async (tx) => {
      const booking = await tx.foodOrderBooking.findUnique({
        where: { orderId },
        include: { order: { include: { recovery: true } }, slot: true },
      });
      if (
        !booking ||
        booking.order.orderStatus === "cancelled" ||
        booking.order.inventoryStatus !== "committed" ||
        booking.order.recovery ||
        booking.order.shippedAt ||
        !booking.slot.isActive ||
        booking.slot.endsAt <= new Date()
      )
        throw new NichePolicyError(
          "Order is unavailable for fresh-food preparation",
        );
      if (booking.state === state) return booking;
      if (booking.state !== (state === "preparing" ? "reserved" : "preparing"))
        throw new NichePolicyError(
          "Preparation must move from reserved to preparing to ready",
        );
      if (!note.trim())
        throw new NichePolicyError("Preparation evidence is required", 400);
      const changed = await tx.foodOrderBooking.updateMany({
        where: { orderId, state: booking.state },
        data: {
          state,
          ...(state === "preparing" ? { preparedAt: new Date() } : {}),
        },
      });
      if (changed.count !== 1)
        throw new NichePolicyError("Preparation changed; reload");
      await tx.orderStatusEvent.create({
        data: {
          orderId,
          type: "delivery",
          previousValue: booking.order.deliveryStatus,
          newValue: booking.order.deliveryStatus,
          note: note.trim(),
          actorUserId: actor,
          metadata: {
            action: "food_preparation",
            previousState: booking.state,
            state,
            slotId: booking.slotId,
          },
        },
      });
      return { ...booking, state };
    });
  },
  async openClaim(
    orderId: string,
    input: { allocationId: string; reference: string; issue: string },
    actor: string,
  ) {
    return withOrderTransaction(async (tx) => {
      const allocation = await tx.unitAllocation.findFirst({
        where: { id: input.allocationId, lineItem: { orderId } },
      });
      if (!allocation)
        throw new NichePolicyError("Purchased unit not found", 404);
      return openWarrantyClaim(tx, input, actor);
    });
  },
  async resolveClaim(
    orderId: string,
    claimId: string,
    state: "approved" | "rejected",
    resolution: string,
    actor: string,
  ) {
    return withOrderTransaction(async (tx) => {
      const claim = await tx.warrantyClaim.findFirst({
        where: { id: claimId, allocation: { lineItem: { orderId } } },
        include: {
          allocation: { include: { lineItem: { include: { order: true } } } },
        },
      });
      if (!claim) throw new NichePolicyError("Claim not found", 404);
      if (!resolution.trim())
        throw new NichePolicyError("Resolution evidence is required", 400);
      if (claim.state !== "open")
        throw new NichePolicyError("Claim has already been resolved");
      const changed = await tx.warrantyClaim.updateMany({
        where: { id: claimId, state: "open" },
        data: {
          state,
          resolution: resolution.trim(),
          resolvedByUserId: actor,
          resolvedAt: new Date(),
        },
      });
      if (changed.count !== 1)
        throw new NichePolicyError("Claim changed; reload");
      const order = claim.allocation.lineItem.order;
      await tx.orderStatusEvent.create({
        data: {
          orderId,
          type: "delivery",
          previousValue: order.deliveryStatus,
          newValue: order.deliveryStatus,
          note: resolution.trim(),
          actorUserId: actor,
          metadata: { action: "warranty_claim_resolved", claimId, state },
        },
      });
      return { id: claimId, state };
    });
  },
};
