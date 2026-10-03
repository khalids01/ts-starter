import type { PrismaClient } from "../../packages/db/prisma/generated/client";
import { orderMoney } from "../../apps/server/src/modules/ecommerce/orders/payment-accounting";

/** Read-only checks. The caller must validate and own the isolated load target. */
export async function checkStep13Invariants(db: PrismaClient, baseline?: { orderIds: string[]; operationIds: string[] }) {
  let ordersChecked = 0;
  let cursor: string | undefined;
  const checkoutKeys = new Set<string>();
  const orderIds: string[] = [];
  const failures: Record<string, number> = {};
  function fail(key: string) { failures[key] = (failures[key] ?? 0) + 1; }
  while (true) {
    const rows = await db.order.findMany({
      orderBy: { id: "asc" }, take: 500,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { payments: true, refunds: true },
    });
    if (!rows.length) break;
    for (const order of rows) {
      ordersChecked++;
      orderIds.push(order.id);
      try { orderMoney(order); } catch { fail("money_or_receipt_status"); }
      if (order.checkoutKey) {
        if (checkoutKeys.has(order.checkoutKey)) fail("duplicate_checkout_key");
        checkoutKeys.add(order.checkoutKey);
      }
    }
    cursor = rows.at(-1)!.id;
  }
  const key = (row: { variantId: string; locationId: string; batchId: string | null }) => JSON.stringify([row.variantId, row.locationId, row.batchId]);
  const activeReservations = await db.stockReservation.groupBy({ by: ["variantId", "locationId", "batchId"], where: { status: "active" }, _sum: { quantity: true } });
  const movements = await db.inventoryMovement.groupBy({ by: ["variantId", "locationId", "batchId"], _sum: { delta: true } });
  const reserved = new Map(activeReservations.map((row) => [key(row), row._sum.quantity ?? 0]));
  const onHand = new Map(movements.map((row) => [key(row), row._sum.delta ?? 0]));
  const stocks = await db.inventoryStock.findMany();
  for (const stock of stocks) {
    if (stock.quantityReserved !== (reserved.get(key(stock)) ?? 0)) fail("reservation_counter_mismatch");
    if (stock.quantityOnHand !== (onHand.get(key(stock)) ?? 0)) fail("stock_movement_mismatch");
    reserved.delete(key(stock)); onHand.delete(key(stock));
  }
  if ([...reserved.values()].some((quantity) => quantity !== 0)) fail("reservation_without_stock");
  if ([...onHand.values()].some((quantity) => quantity !== 0)) fail("movement_without_stock");
  for (const stock of stocks) if (stock.quantityOnHand < 0 || stock.quantityReserved < 0 || stock.quantityReserved > stock.quantityOnHand) fail("negative_or_oversold_stock");
  const slots = await db.foodDeliverySlot.findMany();
  const bookings = await db.foodOrderBooking.findMany({ select: { slotId: true, quantity: true, state: true, preparedAt: true } });
  const booked = new Map<string, number>();
  for (const booking of bookings) if (booking.state !== "cancelled" || booking.preparedAt) booked.set(booking.slotId, (booked.get(booking.slotId) ?? 0) + booking.quantity);
  for (const slot of slots) {
    if (slot.reservedUnits < 0 || slot.reservedUnits > slot.capacityUnits) fail("food_slot_capacity");
    if (slot.reservedUnits !== (booked.get(slot.id) ?? 0)) fail("food_booking_counter_mismatch");
    booked.delete(slot.id);
  }
  if (booked.size) fail("booking_without_slot");
  const discounts = await db.discountCode.findMany({ include: { redemptions: { select: { customerKey: true } } } });
  for (const discount of discounts) {
    if (discount.usageCount !== discount.redemptions.length) fail("discount_counter_mismatch");
    if (discount.totalUsageLimit !== null && discount.usageCount > discount.totalUsageLimit) fail("discount_total_limit");
    const customers = new Map<string, number>();
    for (const redemption of discount.redemptions) customers.set(redemption.customerKey, (customers.get(redemption.customerKey) ?? 0) + 1);
    if (discount.perCustomerUsageLimit !== null && [...customers.values()].some((count) => count > discount.perCustomerUsageLimit!)) fail("discount_customer_limit");
  }
  const shipments = await db.courierConsignment.findMany({ where: { active: true }, select: { orderId: true, externalId: true, connectionId: true } });
  const orders = new Set<string>();
  const external = new Set<string>();
  for (const shipment of shipments) {
    if (orders.has(shipment.orderId)) fail("duplicate_active_shipment");
    orders.add(shipment.orderId);
    if (shipment.externalId) {
      const key = `${shipment.connectionId}:${shipment.externalId}`;
      if (external.has(key)) fail("duplicate_provider_identity");
      external.add(key);
    }
  }
  const queue = await db.courierOperation.groupBy({ by: ["state"], _count: { _all: true } });
  const expiredLeases = await db.courierOperation.count({ where: { state: "processing", leaseUntil: { lt: new Date() } } });
  const operationIds = (await db.courierOperation.findMany({ select: { id: true } })).map((row) => row.id);
  if (baseline) {
    const currentOrders = new Set(orderIds), currentOperations = new Set(operationIds);
    for (const id of baseline.orderIds) if (!currentOrders.has(id)) fail("lost_order");
    for (const id of baseline.operationIds) if (!currentOperations.has(id)) fail("lost_operation");
  }
  return { orderIds, operationIds, passed: !Object.keys(failures).length, ordersChecked, stockRows: stocks.length, failures, queue, expiredLeases };
}
