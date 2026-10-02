import type { Prisma } from "@db/server";
import { NichePolicyError, unitIdentifiers } from "./policy";

export async function assertNicheShipmentReady(
  tx: Prisma.TransactionClient,
  orderId: string,
  now = new Date(),
) {
  const lines = await tx.orderLineItem.findMany({
    where: { orderId },
    include: { units: true },
  });
  for (const line of lines) {
    if (line.serialTracking !== "none") {
      if (
        line.units.length !== line.quantity ||
        line.units.some(
          (unit) =>
            unit.state !== "assigned" || unit.variantId !== line.variantId,
        )
      )
        throw new NichePolicyError(
          "Assign one eligible tracked unit per item before shipment",
        );
      for (const unit of line.units)
        unitIdentifiers(line.serialTracking, unit.serial, unit.imei);
    }
  }
  if (lines.some((line) => line.fulfillmentKind === "fresh_food")) {
    const booking = await tx.foodOrderBooking.findUnique({
      where: { orderId },
      include: { slot: true },
    });
    if (
      !booking ||
      booking.state !== "ready" ||
      !booking.slot.isActive ||
      now < booking.slot.startsAt ||
      now >= booking.slot.endsAt
    )
      throw new NichePolicyError(
        "Fresh food must be ready within its active delivery window",
      );
    // General parcel services have no verified freshness/temperature guarantee.
    return { freshFood: true };
  }
  return { freshFood: false };
}
