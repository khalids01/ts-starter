import type { Prisma } from "../../packages/db/prisma/generated/client";

export const CAPACITY_DATASET_VERSION = 1;
export const CAPACITY_COUNTS = { customers: 10_000, orders: 25_000, products: 1_000, variants: 3_000 };
export type DatasetOptions = { runId: string; actorUserId: string; baseTime: Date; counts?: typeof CAPACITY_COUNTS };

/** Pure preparation: no environment loading, database connection, or external requests. */
export function buildCapacityDataset({ runId, actorUserId, baseTime, counts = CAPACITY_COUNTS }: DatasetOptions) {
  if (!/^[a-z0-9_-]{1,32}$/.test(runId) || !actorUserId || !Number.isFinite(baseTime.getTime())) throw new Error("Invalid fixture identity/time");
  if (!Object.values(counts).every((n) => Number.isInteger(n) && n > 0) || counts.variants !== counts.products * 3 || counts.products > 1000 || counts.orders > 25000 || counts.customers > 10000) throw new Error("Invalid or oversized fixture counts");
  const id = (kind: string, n: number | string) => `cap13-${runId}-${kind}-${n}`;
  const after = (days: number) => new Date(baseTime.getTime() + days * 86_400_000);
  const at = (i: number) => new Date(baseTime.getTime() - (i % 30) * 86_400_000);
  const kinds = ["standard", "packaged_food", "fresh_food", "gadget", "clothing"] as const;
  const rows = {
    categories: [] as Prisma.CategoryCreateManyInput[], products: [] as Prisma.ProductCreateManyInput[], variants: [] as Prisma.ProductVariantCreateManyInput[],
    customers: [] as Prisma.EcommerceCustomerCreateManyInput[], locations: [] as Prisma.InventoryLocationCreateManyInput[], batches: [] as Prisma.InventoryBatchCreateManyInput[], stocks: [] as Prisma.InventoryStockCreateManyInput[],
    orders: [] as Prisma.OrderCreateManyInput[], addresses: [] as Prisma.OrderAddressCreateManyInput[], lines: [] as Prisma.OrderLineItemCreateManyInput[], events: [] as Prisma.OrderStatusEventCreateManyInput[],
    payments: [] as Prisma.OrderPaymentCreateManyInput[], refunds: [] as Prisma.OrderRefundCreateManyInput[], reservations: [] as Prisma.StockReservationCreateManyInput[], movements: [] as Prisma.InventoryMovementCreateManyInput[],
    slots: [] as Prisma.FoodDeliverySlotCreateManyInput[], bookings: [] as Prisma.FoodOrderBookingCreateManyInput[], discounts: [] as Prisma.DiscountCodeCreateManyInput[], redemptions: [] as Prisma.DiscountRedemptionCreateManyInput[],
    units: [] as Prisma.InventoryUnitCreateManyInput[], allocations: [] as Prisma.UnitAllocationCreateManyInput[], warrantyClaims: [] as Prisma.WarrantyClaimCreateManyInput[],
    visitors: [] as Prisma.VisitorIdentityCreateManyInput[], sessions: [] as Prisma.VisitorSessionCreateManyInput[], activities: [] as Prisma.ActivityEventCreateManyInput[],
    shipping: [] as Prisma.ShippingRateCreateManyInput[], attributes: [] as Prisma.ProductAttributeCreateManyInput[], categoryAttributes: [] as Prisma.CategoryAttributeCreateManyInput[], assignments: [] as Prisma.ProductAttributeAssignmentCreateManyInput[],
  };
  const consumed = new Array<number>(counts.variants).fill(0);
  const reserved = new Array<number>(counts.variants).fill(0);
  let slotReserved = 0;
  let discountUses = 0;
  for (const [n, kind] of kinds.entries()) rows.categories.push({ id: id("category", n), name: `Fictional ${kind}`, slug: id("category", n), fulfillmentKind: kind, serialTracking: kind === "gadget" ? "serial" : "none", warrantyDays: kind === "gadget" ? 365 : 0 });
  for (let n = 0; n < 2; n++) rows.locations.push({ id: id("location", n), code: id("location", n), name: `Fictional warehouse ${n}` });
  rows.shipping.push({ id: id("shipping", 0), code: id("shipping", 0), label: "Fictional local delivery", amount: "60.00", isDefault: true });
  rows.attributes.push({ id: id("attribute", 0), name: "Fictional specification", slug: id("attribute", 0), type: "text", filterable: true });
  for (let n = 0; n < kinds.length; n++) rows.categoryAttributes.push({ id: id("category-attribute", n), categoryId: id("category", n), attributeId: id("attribute", 0), scope: "product", filterable: true });
  for (let n = 0; n < counts.products; n++) {
    // Ten percent draft products exercise admin filtering; checkout manifests exclude them.
    rows.products.push({ id: id("product", n), categoryId: id("category", n % 5), name: `Fictional product ${n}`, slug: id("product", n), status: n % 10 === 9 ? "draft" : "active", description: "Isolated capacity fixture", searchKeywords: ["fictional", kinds[n % 5]!] });
    rows.assignments.push({ id: id("assignment", n), productId: id("product", n), attributeId: id("attribute", 0), rawText: `Fictional specification ${n % 20}`, displayValue: `Specification ${n % 20}` });
  }
  for (let n = 0; n < counts.variants; n++) {
    const product = Math.floor(n / 3);
    rows.variants.push({ id: id("variant", n), productId: id("product", product), sku: id("sku", n), name: `Variant ${n % 3}`, price: "200.00", costPrice: "100.00", isDefault: n % 3 === 0 });
    rows.batches.push({ id: id("batch", n), variantId: id("variant", n), batchNumber: id("batch-number", n), expiryDate: [1, 2].includes(product % 5) ? after(90) : null, receivedAt: at(29), unitCost: "100.00" });
  }
  for (let n = 0; n < counts.customers; n++) {
    const email = `capacity-${runId}-${n}@northstar.example.test`;
    rows.customers.push({ id: id("customer", n), email, normalizedEmail: email, name: `Fictional customer ${n}`, phone: "01700000000", createdAt: at(n) });
    rows.visitors.push({ id: id("visitor", n), visitorId: id("visitor-key", n), firstSeenAt: at(n), lastSeenAt: baseTime });
    rows.sessions.push({ id: id("session", n), visitorIdentityId: id("visitor", n), entryPath: "/shop", lastPath: "/shop", startedAt: at(n), lastSeenAt: baseTime, endedAt: baseTime, eventCount: 3, deviceType: n % 2 ? "mobile" : "desktop" });
  }
  for (let n = 0; n < counts.orders; n++) {
    const v = (n * 37 + Math.floor(n / counts.variants)) % counts.variants;
    const p = Math.floor(v / 3), kind = kinds[p % 5]!;
    const stage = n % 10, isReserved = stage < 2, cancelled = stage === 2, committed = !isReserved && !cancelled;
    const discounted = !cancelled && n % 4 === 0;
    const total = discounted ? "250.00" : "260.00";
    const partial = stage === 3, refund = stage === 9;
    const email = `capacity-${runId}-${n % counts.customers}@northstar.example.test`;
    const orderId = id("order", n), lineId = id("line", n);
    const createdAt = at(n);
    const stock = { variantId: id("variant", v), locationId: id("location", v % 2), batchId: id("batch", v) };
    const orderStatus = isReserved ? "pending" : cancelled ? "cancelled" : partial ? "processing" : "completed";
    rows.orders.push({ id: orderId, orderNumber: id("order-number", n), checkoutKey: id("checkout", n), ecommerceCustomerId: id("customer", n % counts.customers), customerName: `Fictional customer ${n % counts.customers}`, customerEmail: email, currency: "BDT", subtotalAmount: "200.00", shippingAmount: "60.00", discountAmount: discounted ? "10.00" : "0.00", totalAmount: total, shippingRateId: id("shipping", 0), paymentMethod: "cash_on_delivery", orderStatus, paymentStatus: isReserved || cancelled ? "unpaid" : partial ? "partially_paid" : refund ? "partially_refunded" : "paid", inventoryStatus: isReserved ? "reserved" : cancelled ? "released" : "committed", deliveryStatus: isReserved || cancelled ? "unfulfilled" : partial ? "preparing" : "delivered", stockReservedUntil: isReserved ? after(7) : null, stockCommittedAt: committed ? createdAt : null, stockReleasedAt: cancelled ? createdAt : null, deliveredAt: committed && !partial ? createdAt : null, placedAt: createdAt, createdAt });
    rows.addresses.push({ id: id("address", n), orderId, type: "shipping", fullName: "Fictional capacity buyer", email, line1: "1 Fictional Road", city: "Dhaka", postalCode: "1205", country: "Bangladesh" });
    rows.lines.push({ id: lineId, orderId, productId: id("product", p), variantId: stock.variantId, productName: `Fictional product ${p}`, sku: id("sku", v), quantity: 1, unitPrice: "200.00", subtotalAmount: "200.00", discountAmount: discounted ? "10.00" : "0.00", totalAmount: discounted ? "190.00" : "200.00", fulfillmentKind: kind, serialTracking: kind === "gadget" ? "serial" : "none", warrantyDays: kind === "gadget" ? 365 : 0 });
    rows.events.push({ id: id("event", n), orderId, type: "order", newValue: orderStatus, createdAt, note: "Fictional fixture state" });
    rows.activities.push({ id: id("activity", n), type: "capacity.fixture.order", actorUserId, message: "Fictional capacity order", metadata: { orderId }, createdAt });
    rows.reservations.push({ id: id("reservation", n), ...stock, quantity: 1, status: isReserved ? "active" : cancelled ? "released" : "committed", expiresAt: after(7), referenceType: "order", referenceId: orderId });
    rows.movements.push({ id: id("movement-reserve", n), ...stock, type: "sale_reserve", delta: 0, referenceType: "order", referenceId: orderId, createdAt });
    if (!isReserved) rows.movements.push({ id: id("movement-final", n), ...stock, type: cancelled ? "reservation_release" : "sale_commit", delta: cancelled ? 0 : -1, referenceType: "order", referenceId: orderId, createdAt });
    if (isReserved) reserved[v] = reserved[v]! + 1;
    if (committed) consumed[v] = consumed[v]! + 1;
    if (committed) rows.payments.push({ id: id("payment", n), orderId, entryType: "receipt", amount: partial ? "100.00" : total, currency: "BDT", method: "cash_on_delivery", idempotencyKey: id("receipt-key", n), actorUserId, receivedAt: createdAt });
    if (refund) rows.refunds.push({ id: id("refund", n), orderId, amount: "20.00", currency: "BDT", reason: "Fictional partial refund", actorUserId, restockInventory: false });
    if (discounted) {
      discountUses++;
      rows.redemptions.push({ id: id("redemption", n), orderId, discountCodeId: id("discount", 0), customerKey: `email:${email}`, amount: "10.00", currency: "BDT" });
      rows.orders.at(-1)!.discountCodeId = id("discount", 0);
    }
    if (kind === "fresh_food") {
      if (!cancelled) slotReserved++;
      rows.bookings.push({ orderId, slotId: id("slot", 0), quantity: 1, state: cancelled ? "cancelled" : isReserved ? "reserved" : partial ? "prepared" : "completed", preparedAt: committed ? createdAt : null });
    }
    if (kind === "gadget" && committed) {
      rows.units.push({ id: id("unit-sold", n), ...stock, serial: id("serial-sold", n), state: partial ? "assigned" : "shipped", lineItemId: lineId, registeredByUserId: actorUserId });
      rows.allocations.push({ id: id("allocation", n), unitId: id("unit-sold", n), lineItemId: lineId, state: partial ? "assigned" : "shipped" });
      if (!partial && n % 7 === 0) rows.warrantyClaims.push({ id: id("warranty", n), allocationId: id("allocation", n), reference: id("warranty-reference", n), issue: "Fictional gadget claim", openedByUserId: actorUserId });
    }
  }
  for (let n = 0; n < counts.variants; n++) {
    const stock = { variantId: id("variant", n), locationId: id("location", n % 2), batchId: id("batch", n) };
    rows.stocks.push({ id: id("stock", n), stockKey: `${stock.variantId}:${stock.locationId}:${stock.batchId}`, ...stock, quantityOnHand: 5000 - consumed[n]!, quantityReserved: reserved[n]! });
    rows.movements.push({ id: id("movement-purchase", n), ...stock, type: "purchase", delta: 5000, referenceType: "capacity_fixture", referenceId: runId, createdAt: at(29) });
    if (Math.floor(n / 3) % 5 === 3) for (let unit = 0; unit < 10; unit++) rows.units.push({ id: id("unit-available", `${n}-${unit}`), ...stock, serial: id("serial-available", `${n}-${unit}`), registeredByUserId: actorUserId });
  }
  rows.slots.push({ id: id("slot", 0), label: "Fictional capacity food slot", postalCodes: ["1205"], startsAt: after(8), endsAt: after(9), cutoffAt: after(7), capacityUnits: slotReserved + 10000, reservedUnits: slotReserved });
  rows.discounts.push({ id: id("discount", 0), code: id("discount-code", 0), type: "fixed_amount", value: "10.00", currency: "BDT", usageCount: discountUses, totalUsageLimit: discountUses + 10000, perCustomerUsageLimit: Math.ceil(counts.orders / counts.customers) + 10 });
  const checkoutVariants = rows.variants.flatMap((variant, index) => {
    const productIndex = Math.floor(index / 3);
    if (rows.products[productIndex]!.status !== "active") return [];
    return [{ id: variant.id!, foodSlotId: kinds[productIndex % 5] === "fresh_food" ? id("slot", 0) : undefined }];
  });
  return { rows, manifest: { datasetVersion: CAPACITY_DATASET_VERSION, runId, baseTime: baseTime.toISOString(), adminEmail: "", adminSessionCookie: "", shopperEmails: rows.customers.slice(0, 100).map((c) => c.email), variantIds: checkoutVariants.map((v) => v.id), checkoutVariants, shippingRateId: id("shipping", 0), customerIds: rows.customers.slice(0, 20).map((c) => c.id), orderIds: rows.orders.slice(0, 20).map((o) => o.id), productSlugs: rows.products.filter((p) => p.status === "active").slice(0, 20).map((p) => p.slug), productIds: rows.products.filter((p) => p.status === "active").slice(0, 20).map((p) => p.id), counts: Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values.length])) } };
}
export type CapacityDataset = ReturnType<typeof buildCapacityDataset>;
