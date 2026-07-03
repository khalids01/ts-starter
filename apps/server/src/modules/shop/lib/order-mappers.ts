import { decimalToString, toIso } from "./format";

export function mapShippingRate(row: any) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    amount: decimalToString(row.amount),
    freeOverAmount: decimalToString(row.freeOverAmount),
    isDefault: row.isDefault,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function mapOrderAddress(row: any) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    orderId: row.orderId,
    type: row.type,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    notes: row.notes,
  };
}

export function mapOrder(row: any) {
  const addresses = (row.addresses ?? []).map(mapOrderAddress);
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    shippingAddress: addresses.find((address: any) => address.type === "shipping") ?? null,
    billingAddress: addresses.find((address: any) => address.type === "billing") ?? null,
    addresses,
    subtotalAmount: decimalToString(row.subtotalAmount),
    discountAmount: decimalToString(row.discountAmount),
    taxAmount: decimalToString(row.taxAmount),
    shippingAmount: decimalToString(row.shippingAmount),
    totalAmount: decimalToString(row.totalAmount),
    currency: row.currency,
    paymentMethod: row.paymentMethod,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    deliveryStatus: row.deliveryStatus,
    inventoryStatus: row.inventoryStatus,
    stockReservedUntil: toIso(row.stockReservedUntil),
    stockCommittedAt: toIso(row.stockCommittedAt),
    stockReleasedAt: toIso(row.stockReleasedAt),
    shippingRateId: row.shippingRateId,
    shippingMethodCode: row.shippingMethodCode,
    shippingMethodLabel: row.shippingMethodLabel,
    customerNotes: row.customerNotes,
    adminNotes: row.adminNotes,
    placedAt: toIso(row.placedAt),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    lineItems: (row.lineItems ?? []).map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      product: item.product ?? null,
      variantId: item.variantId,
      variant: item.variant ?? null,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      imageUrl: item.imageUrl,
      attributesSnapshot: item.attributesSnapshot ?? null,
      quantity: item.quantity,
      unitPrice: decimalToString(item.unitPrice),
      discountAmount: decimalToString(item.discountAmount),
      taxAmount: decimalToString(item.taxAmount),
      subtotalAmount: decimalToString(item.subtotalAmount),
      totalAmount: decimalToString(item.totalAmount),
    })),
    statusEvents: row.statusEvents ?? [],
  };
}
