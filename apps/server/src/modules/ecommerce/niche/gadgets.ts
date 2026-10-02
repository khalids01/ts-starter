import type { Prisma } from "@db/server";
import { NichePolicyError, unitIdentifiers, warrantyDeadline } from "./policy";
import { stockSellable } from "../inventory/stock-policy";

export async function registerUnit(
  tx: Prisma.TransactionClient,
  input: {
    variantId: string;
    locationId: string;
    batchId?: string | null;
    serial?: string | null;
    imei?: string | null;
  },
  actor: string,
) {
  const variant = await tx.productVariant.findUnique({
    where: { id: input.variantId },
    include: { product: { include: { category: true } } },
  });
  if (!variant || variant.product.category.fulfillmentKind !== "gadget")
    throw new NichePolicyError(
      "Choose a gadget variant with unit tracking",
      400,
    );
  const identifiers = unitIdentifiers(
    variant.product.category.serialTracking,
    input.serial,
    input.imei,
  );
  const stocks = await tx.inventoryStock.findMany({
    where: {
      variantId: input.variantId,
      locationId: input.locationId,
      batchId: input.batchId ?? null,
    },
    include: { batch: true, location: true },
  });
  const count = await tx.inventoryUnit.count({
    where: {
      variantId: input.variantId,
      locationId: input.locationId,
      batchId: input.batchId ?? null,
      state: "available",
    },
  });
  if (
    !stocks.some((stock) => stockSellable(stock)) ||
    count >=
      stocks.reduce(
        (sum, stock) => sum + (stockSellable(stock) ? stock.quantityOnHand : 0),
        0,
      )
  )
    throw new NichePolicyError(
      "Receive eligible inventory before registering additional units",
    );
  return tx.inventoryUnit.create({
    data: {
      ...input,
      batchId: input.batchId ?? null,
      ...identifiers,
      registeredByUserId: actor,
    },
  });
}

export async function assignUnit(
  tx: Prisma.TransactionClient,
  orderId: string,
  lineItemId: string,
  unitId: string,
  actor: string,
) {
  const line = await tx.orderLineItem.findFirst({
    where: { id: lineItemId, orderId },
    include: {
      units: true,
      order: {
        include: {
          shipmentClaim: true,
          recovery: true,
          courierConsignments: true,
        },
      },
    },
  });
  if (
    !line ||
    line.fulfillmentKind !== "gadget" ||
    line.serialTracking === "none"
  )
    throw new NichePolicyError("This item does not use unit tracking");
  if (
    line.order.orderStatus === "cancelled" ||
    line.order.inventoryStatus !== "committed" ||
    line.order.shippedAt ||
    line.order.recovery ||
    line.order.shipmentClaim ||
    line.order.courierConsignments.some(
      (c) => c.state !== "cancelled_before_submission",
    )
  )
    throw new NichePolicyError(
      "Assign units after commitment and before courier review or shipment",
    );
  if (line.units.some((unit) => unit.id === unitId)) return;
  if (line.units.length >= line.quantity)
    throw new NichePolicyError("All units for this item are already assigned");
  const unit = await tx.inventoryUnit.findUnique({
    where: { id: unitId },
    include: { location: true, batch: true },
  });
  if (
    !unit ||
    unit.variantId !== line.variantId ||
    unit.state !== "available" ||
    unit.lineItemId ||
    !unit.location.isActive ||
    !stockSellable({ ...unit, quantityOnHand: 1, quantityReserved: 0 })
  )
    throw new NichePolicyError(
      "Unit is unavailable or belongs to a different item",
    );
  unitIdentifiers(line.serialTracking, unit.serial, unit.imei);
  const reservations = await tx.stockReservation.findMany({
    where: {
      referenceType: "order",
      referenceId: orderId,
      variantId: unit.variantId,
      locationId: unit.locationId,
      batchId: unit.batchId,
      status: "committed",
    },
  });
  const allocated = await tx.inventoryUnit.count({
    where: {
      lineItem: { orderId },
      variantId: unit.variantId,
      locationId: unit.locationId,
      batchId: unit.batchId,
      state: "assigned",
    },
  });
  if (allocated >= reservations.reduce((sum, r) => sum + r.quantity, 0))
    throw new NichePolicyError(
      "Unit does not match this order's committed location and batch",
    );
  const claimed = await tx.inventoryUnit.updateMany({
    where: { id: unitId, state: "available", lineItemId: null },
    data: { state: "assigned", lineItemId },
  });
  if (claimed.count !== 1)
    throw new NichePolicyError("Unit was assigned elsewhere; reload");
  await tx.unitAllocation.upsert({
    where: { unitId_lineItemId: { unitId, lineItemId } },
    create: { unitId, lineItemId },
    update: { state: "assigned" },
  });
  await tx.orderStatusEvent.create({
    data: {
      orderId,
      type: "delivery",
      previousValue: line.order.deliveryStatus,
      newValue: line.order.deliveryStatus,
      actorUserId: actor,
      note: "Tracked unit assigned",
      metadata: { action: "unit_assigned", unitId, lineItemId },
    },
  });
}

export async function markOrderUnits(
  tx: Prisma.TransactionClient,
  orderId: string,
  state: "shipped" | "returned" | "available" | "unsafe",
) {
  const filter = { lineItem: { orderId } };
  await tx.unitAllocation.updateMany({
    where: { ...filter, state: { in: ["assigned", "shipped", "returned"] } },
    data: { state: state === "available" ? "returned" : state },
  });
  await tx.inventoryUnit.updateMany({
    where: filter,
    data: { state, ...(state === "available" ? { lineItemId: null } : {}) },
  });
}

export async function openWarrantyClaim(
  tx: Prisma.TransactionClient,
  input: { allocationId: string; reference: string; issue: string },
  actor: string,
  customerUserId?: string,
) {
  const allocation = await tx.unitAllocation.findUnique({
    where: { id: input.allocationId },
    include: { lineItem: { include: { order: true } } },
  });
  const line = allocation?.lineItem;
  const order = line?.order;
  if (
    !allocation ||
    !line ||
    !order ||
    (customerUserId && order.userId !== customerUserId)
  )
    throw new NichePolicyError("Purchased unit not found", 404);
  if (
    line.fulfillmentKind !== "gadget" ||
    line.warrantyDays <= 0 ||
    !order.deliveredAt ||
    order.orderStatus === "cancelled" ||
    order.paymentStatus === "refunded" ||
    allocation.state !== "shipped" ||
    new Date() >= warrantyDeadline(order.deliveredAt, line.warrantyDays)
  )
    throw new NichePolicyError("This purchase is not eligible for warranty");
  const reference = input.reference.trim();
  const issue = input.issue.trim();
  if (!reference || !issue)
    throw new NichePolicyError("Claim reference and issue are required", 400);
  const existing = await tx.warrantyClaim.findUnique({ where: { reference } });
  if (existing) {
    if (existing.allocationId !== allocation.id || existing.issue !== issue)
      throw new NichePolicyError(
        "Claim reference was already used for different evidence",
      );
    return existing;
  }
  if (
    await tx.warrantyClaim.findFirst({
      where: { allocationId: allocation.id, state: "open" },
    })
  )
    throw new NichePolicyError(
      "This purchase already has an open warranty claim",
    );
  const claim = await tx.warrantyClaim.create({
    data: {
      allocationId: allocation.id,
      reference,
      issue,
      openedByUserId: actor,
    },
  });
  await tx.orderStatusEvent.create({
    data: {
      orderId: order.id,
      type: "delivery",
      previousValue: order.deliveryStatus,
      newValue: order.deliveryStatus,
      actorUserId: actor,
      note: "Warranty claim opened",
      metadata: {
        action: "warranty_claim_opened",
        claimId: claim.id,
        allocationId: allocation.id,
      },
    },
  });
  return claim;
}

export async function unassignUnit(
  tx: Prisma.TransactionClient,
  orderId: string,
  unitId: string,
  actor: string,
) {
  const unit = await tx.inventoryUnit.findFirst({
    where: { id: unitId, lineItem: { orderId } },
    include: {
      lineItem: {
        include: {
          order: {
            include: {
              shipmentClaim: true,
              courierConsignments: true,
              recovery: true,
            },
          },
        },
      },
    },
  });
  const order = unit?.lineItem?.order;
  if (
    !unit ||
    !order ||
    unit.state !== "assigned" ||
    order.orderStatus === "cancelled" ||
    order.inventoryStatus !== "committed" ||
    order.shippedAt ||
    order.recovery ||
    order.shipmentClaim ||
    order.courierConsignments.some(
      (c) => c.state !== "cancelled_before_submission",
    )
  )
    throw new NichePolicyError(
      "Only unshipped units without courier review can be unassigned",
    );
  const changed = await tx.inventoryUnit.updateMany({
    where: { id: unitId, state: "assigned", lineItemId: unit.lineItemId },
    data: { state: "available", lineItemId: null },
  });
  if (changed.count !== 1)
    throw new NichePolicyError("Assignment changed; reload");
  await tx.unitAllocation.update({
    where: { unitId_lineItemId: { unitId, lineItemId: unit.lineItemId! } },
    data: { state: "released" },
  });
  await tx.orderStatusEvent.create({
    data: {
      orderId,
      type: "delivery",
      previousValue: order.deliveryStatus,
      newValue: order.deliveryStatus,
      actorUserId: actor,
      note: "Tracked unit unassigned before shipment",
      metadata: { action: "unit_unassigned", unitId },
    },
  });
}
