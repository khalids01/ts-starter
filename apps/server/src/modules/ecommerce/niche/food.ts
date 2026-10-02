import type { Prisma } from "@db/server";
import { NichePolicyError } from "./policy";

export function assertFoodSlot(
  slot: {
    isActive: boolean;
    cutoffAt: Date;
    startsAt: Date;
    endsAt: Date;
    postalCodes: string[];
    capacityUnits: number;
    reservedUnits: number;
  } | null,
  postalCode: string,
  quantity: number,
  now = new Date(),
) {
  if (!slot || !slot.isActive || slot.cutoffAt <= now || slot.endsAt <= now)
    throw new NichePolicyError("Delivery slot is closed; choose another slot");
  if (!slot.postalCodes.includes(postalCode.trim().toUpperCase()))
    throw new NichePolicyError(
      "Fresh-food delivery is unavailable for this postal code",
    );
  if (slot.capacityUnits - slot.reservedUnits < quantity)
    throw new NichePolicyError("Preparation capacity is full for this slot");
}

export async function reserveFoodSlot(
  tx: Prisma.TransactionClient,
  input: {
    orderId: string;
    slotId?: string;
    postalCode?: string | null;
    quantity: number;
  },
) {
  if (input.quantity === 0) {
    if (input.slotId)
      throw new NichePolicyError(
        "Delivery slots are only for fresh-food orders",
        400,
      );
    return;
  }
  if (!input.slotId)
    throw new NichePolicyError("Choose a delivery slot for fresh food", 400);
  const now = new Date();
  const slot = await tx.foodDeliverySlot.findUnique({
    where: { id: input.slotId },
  });
  assertFoodSlot(slot, input.postalCode ?? "", input.quantity, now);
  const claimed = await tx.foodDeliverySlot.updateMany({
    where: {
      id: slot!.id,
      isActive: true,
      cutoffAt: { gt: now },
      reservedUnits: { lte: slot!.capacityUnits - input.quantity },
    },
    data: { reservedUnits: { increment: input.quantity } },
  });
  if (claimed.count !== 1)
    throw new NichePolicyError(
      "Preparation capacity changed; choose another slot",
    );
  await tx.foodOrderBooking.create({
    data: {
      orderId: input.orderId,
      slotId: slot!.id,
      quantity: input.quantity,
    },
  });
}

/** Before preparation capacity is released; after preparation it remains consumed. */
export async function cancelFoodBooking(
  tx: Prisma.TransactionClient,
  orderId: string,
) {
  const booking = await tx.foodOrderBooking.findUnique({ where: { orderId } });
  if (!booking || ["cancelled", "completed"].includes(booking.state))
    return false;
  const previousState = booking.state;
  const changed = await tx.foodOrderBooking.updateMany({
    where: { orderId, state: booking.state },
    data: { state: "cancelled" },
  });
  if (changed.count !== 1)
    throw new NichePolicyError("Preparation changed; reload before cancelling");
  if (previousState === "reserved")
    await tx.foodDeliverySlot.update({
      where: { id: booking.slotId },
      data: { reservedUnits: { decrement: booking.quantity } },
    });
  return previousState !== "reserved";
}
