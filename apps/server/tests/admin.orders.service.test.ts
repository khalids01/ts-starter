import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const orderCountMock = mock(async () => 1);
const orderFindManyMock = mock(async () => [orderRow()]);
const orderFindUniqueMock = mock(async () => orderRow());
const orderUpdateMock = mock(async (args: any) =>
  orderRow({ id: args.where.id, ...args.data }),
);
const orderUpdateManyMock = mock(async () => ({ count: 1 }));
const orderFindUniqueOrThrowMock = mock(async () =>
  orderRow({
    orderStatus: "confirmed",
    statusEvents: [
      statusEventRow({
        previousValue: "pending",
        newValue: "confirmed",
      }),
    ],
  }),
);
const statusEventCreateManyMock = mock(async () => ({ count: 1 }));
const stockReservationFindManyMock = mock(async () => []);
const stockReservationUpdateMock = mock(async (args: any) =>
  reservationRow({ id: args.where.id, ...args.data }),
);
const inventoryStockUpdateMock = mock(async () => ({ id: "stock-1" }));
const inventoryMovementCreateMock = mock(async (args: any) => ({
  id: "movement-1",
  ...args.data,
}));
const orderAddressUpsertMock = mock(async (args: any) => args.create);
const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  order: {
    count: orderCountMock,
    findMany: orderFindManyMock,
    findUnique: orderFindUniqueMock,
    update: orderUpdateMock,
    updateMany: orderUpdateManyMock,
    findUniqueOrThrow: orderFindUniqueOrThrowMock,
  },
  orderStatusEvent: {
    createMany: statusEventCreateManyMock,
  },
  stockReservation: {
    findMany: stockReservationFindManyMock,
    update: stockReservationUpdateMock,
  },
  inventoryStock: {
    update: inventoryStockUpdateMock,
  },
  inventoryMovement: {
    create: inventoryMovementCreateMock,
  },
  orderAddress: {
    upsert: orderAddressUpsertMock,
  },
};

mock.module("@db/server", () => ({
  default: prismaMock,
}));

function userRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "user-1",
    name: overrides.name ?? "Customer",
    email: overrides.email ?? "customer@example.com",
    image: overrides.image ?? null,
  };
}

function lineItemRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "line-1",
    orderId: overrides.orderId ?? "order-1",
    productId: overrides.productId ?? "product-1",
    product: overrides.product ?? {
      id: "product-1",
      name: "Mango",
      slug: "mango",
      coverImageUrl: null,
    },
    variantId: overrides.variantId ?? "variant-1",
    variant: overrides.variant ?? {
      id: "variant-1",
      sku: "MANGO-1KG",
      name: "1kg",
      imageUrls: [],
    },
    productName: overrides.productName ?? "Mango",
    variantName: overrides.variantName ?? "1kg",
    sku: overrides.sku ?? "MANGO-1KG",
    imageUrl: overrides.imageUrl ?? null,
    attributesSnapshot: overrides.attributesSnapshot ?? null,
    quantity: overrides.quantity ?? 2,
    unitPrice: overrides.unitPrice ?? "120.00",
    discountAmount: overrides.discountAmount ?? "0.00",
    taxAmount: overrides.taxAmount ?? "0.00",
    subtotalAmount: overrides.subtotalAmount ?? "240.00",
    totalAmount: overrides.totalAmount ?? "240.00",
    createdAt: new Date("2026-06-15T09:00:00.000Z"),
    updatedAt: new Date("2026-06-15T09:00:00.000Z"),
  };
}

function addressRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "address-1",
    orderId: overrides.orderId ?? "order-1",
    type: overrides.type ?? "shipping",
    fullName: overrides.fullName ?? "Customer",
    email: overrides.email ?? "customer@example.com",
    phone: overrides.phone ?? null,
    line1: overrides.line1 ?? "House 1",
    line2: overrides.line2 ?? null,
    city: overrides.city ?? "Dhaka",
    state: overrides.state ?? null,
    postalCode: overrides.postalCode ?? null,
    country: overrides.country ?? "Bangladesh",
    notes: overrides.notes ?? null,
    createdAt: new Date("2026-06-15T09:00:00.000Z"),
    updatedAt: new Date("2026-06-15T09:00:00.000Z"),
  };
}

function statusEventRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "event-1",
    orderId: overrides.orderId ?? "order-1",
    type: overrides.type ?? "order",
    previousValue: overrides.previousValue ?? null,
    newValue: overrides.newValue ?? "pending",
    note: overrides.note ?? null,
    metadata: overrides.metadata ?? null,
    actorUserId: overrides.actorUserId ?? "admin-1",
    actorUser: overrides.actorUser ?? userRow({ id: "admin-1", email: "admin@example.com" }),
    createdAt: new Date("2026-06-15T09:00:00.000Z"),
  };
}

function orderRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "order-1",
    orderNumber: overrides.orderNumber ?? "ORD-1001",
    userId: overrides.userId ?? "user-1",
    user: overrides.user ?? userRow(),
    customerName: overrides.customerName ?? "Customer",
    customerEmail: overrides.customerEmail ?? "customer@example.com",
    customerPhone: overrides.customerPhone ?? null,
    addresses: overrides.addresses ?? [
      addressRow({ type: "shipping" }),
      addressRow({ id: "address-2", type: "billing" }),
    ],
    subtotalAmount: overrides.subtotalAmount ?? "240.00",
    discountAmount: overrides.discountAmount ?? "0.00",
    taxAmount: overrides.taxAmount ?? "0.00",
    shippingAmount: overrides.shippingAmount ?? "60.00",
    totalAmount: overrides.totalAmount ?? "300.00",
    currency: overrides.currency ?? "BDT",
    paymentMethod: overrides.paymentMethod ?? "cash_on_delivery",
    orderStatus: overrides.orderStatus ?? "pending",
    paymentStatus: overrides.paymentStatus ?? "unpaid",
    deliveryStatus: overrides.deliveryStatus ?? "unfulfilled",
    inventoryStatus: overrides.inventoryStatus ?? "reserved",
    stockReservedUntil: overrides.stockReservedUntil ?? new Date("2026-06-15T09:30:00.000Z"),
    stockCommittedAt: overrides.stockCommittedAt ?? null,
    stockReleasedAt: overrides.stockReleasedAt ?? null,
    shippingRateId: overrides.shippingRateId ?? "ship-inside",
    shippingMethodCode: overrides.shippingMethodCode ?? "inside_city",
    shippingMethodLabel: overrides.shippingMethodLabel ?? "Inside city",
    customerNotes: overrides.customerNotes ?? null,
    adminNotes: overrides.adminNotes ?? null,
    placedAt: new Date("2026-06-15T09:00:00.000Z"),
    createdAt: new Date("2026-06-15T09:00:00.000Z"),
    updatedAt: new Date("2026-06-15T09:00:00.000Z"),
    lineItems: overrides.lineItems ?? [lineItemRow()],
    statusEvents: overrides.statusEvents ?? [],
    _count: overrides._count ?? { lineItems: 1 },
  };
}

function reservationRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "reservation-1",
    variantId: overrides.variantId ?? "variant-1",
    locationId: overrides.locationId ?? "loc-main",
    batchId: overrides.batchId ?? null,
    quantity: overrides.quantity ?? 2,
    status: overrides.status ?? "active",
    expiresAt: overrides.expiresAt ?? new Date("2026-06-15T09:30:00.000Z"),
    referenceType: overrides.referenceType ?? "order",
    referenceId: overrides.referenceId ?? "order-1",
    createdAt: new Date("2026-06-15T09:00:00.000Z"),
    updatedAt: new Date("2026-06-15T09:00:00.000Z"),
  };
}

beforeEach(() => {
  orderCountMock.mockResolvedValue(1);
  orderFindManyMock.mockResolvedValue([orderRow()]);
  orderFindUniqueMock.mockResolvedValue(orderRow());
  stockReservationFindManyMock.mockResolvedValue([]);
  orderFindUniqueOrThrowMock.mockResolvedValue(
    orderRow({
      orderStatus: "confirmed",
      statusEvents: [
        statusEventRow({
          previousValue: "pending",
          newValue: "confirmed",
        }),
      ],
    }),
  );
});

afterEach(() => {
  for (const fn of [
    orderCountMock,
    orderFindManyMock,
    orderFindUniqueMock,
    orderUpdateMock,
    orderUpdateManyMock,
    orderFindUniqueOrThrowMock,
    statusEventCreateManyMock,
    stockReservationFindManyMock,
    stockReservationUpdateMock,
    inventoryStockUpdateMock,
    inventoryMovementCreateMock,
    orderAddressUpsertMock,
    transactionMock,
  ]) {
    fn.mockClear();
  }
});

describe("admin orders service", () => {
  it("lists orders with mapped totals and line item counts", async () => {
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    const result = await adminOrdersService.listOrders({ page: 1, limit: 20 });

    expect(result.items[0]?.orderNumber).toBe("ORD-1001");
    expect(result.items[0]?.totalAmount).toBe("300.00");
    expect(result.items[0]?.lineItemCount).toBe(1);
  });

  it("rejects status updates without a status", async () => {
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    await expect(
      adminOrdersService.updateOrderStatuses("order-1", {}, { userId: "admin-1" }),
    ).rejects.toThrow("At least one status is required");
  });

  it("creates timeline events for changed statuses", async () => {
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    const result = await adminOrdersService.updateOrderStatuses(
      "order-1",
      { orderStatus: "confirmed", note: "Customer verified" },
      { userId: "admin-1" },
    );

    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { orderStatus: "confirmed" },
    });
    expect(statusEventCreateManyMock.mock.calls[0]?.[0].data).toEqual([
      {
        orderId: "order-1",
        type: "order",
        previousValue: "pending",
        newValue: "confirmed",
        note: "Customer verified",
        actorUserId: "admin-1",
      },
    ]);
    expect(result.statusEvents?.[0]?.newValue).toBe("confirmed");
  });

  it("commits reserved stock when an order is confirmed", async () => {
    stockReservationFindManyMock.mockResolvedValueOnce([reservationRow()]);
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    await adminOrdersService.updateOrderStatuses(
      "order-1",
      { orderStatus: "confirmed", note: "Customer verified" },
      { userId: "admin-1" },
    );

    expect(inventoryStockUpdateMock).toHaveBeenCalledWith({
      where: { stockKey: "variant-1:loc-main:no_batch" },
      data: {
        quantityOnHand: { decrement: 2 },
        quantityReserved: { decrement: 2 },
      },
    });
    expect(stockReservationUpdateMock).toHaveBeenCalledWith({
      where: { id: "reservation-1" },
      data: { status: "committed" },
    });
    expect(inventoryMovementCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "sale_commit",
        delta: -2,
        referenceType: "order",
        referenceId: "order-1",
      }),
    });
  });

  it("releases reserved stock when a pending order is cancelled", async () => {
    stockReservationFindManyMock.mockResolvedValueOnce([reservationRow()]);
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    await adminOrdersService.updateOrderStatuses(
      "order-1",
      { orderStatus: "cancelled" },
      { userId: "admin-1" },
    );

    expect(inventoryStockUpdateMock).toHaveBeenCalledWith({
      where: { stockKey: "variant-1:loc-main:no_batch" },
      data: { quantityReserved: { decrement: 2 } },
    });
    expect(stockReservationUpdateMock).toHaveBeenCalledWith({
      where: { id: "reservation-1" },
      data: { status: "released" },
    });
    expect(inventoryMovementCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "reservation_release",
        delta: 0,
      }),
    });
  });

  it("restocks committed stock once when delivery is returned", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ orderStatus: "confirmed", inventoryStatus: "committed" }),
    );
    stockReservationFindManyMock.mockResolvedValueOnce([
      reservationRow({ status: "committed" }),
    ]);
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    await adminOrdersService.updateOrderStatuses(
      "order-1",
      { deliveryStatus: "returned" },
      { userId: "admin-1" },
    );

    expect(inventoryStockUpdateMock).toHaveBeenCalledWith({
      where: { stockKey: "variant-1:loc-main:no_batch" },
      data: { quantityOnHand: { increment: 2 } },
    });
    expect(inventoryMovementCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "return",
        delta: 2,
      }),
    });
  });

  it("releases expired reservations in bulk", async () => {
    stockReservationFindManyMock.mockResolvedValueOnce([
      reservationRow({
        expiresAt: new Date("2026-06-15T08:00:00.000Z"),
      }),
    ]);
    const { adminOrdersService } = await import(
      "../src/modules/admin/orders/orders.service"
    );

    const result = await adminOrdersService.releaseExpiredReservations({
      userId: "admin-1",
    });

    expect(result).toEqual({ releasedReservations: 1, affectedOrders: 1 });
    expect(stockReservationUpdateMock).toHaveBeenCalledWith({
      where: { id: "reservation-1" },
      data: { status: "expired" },
    });
    expect(orderUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: ["order-1"] },
        inventoryStatus: "reserved",
      },
      data: expect.objectContaining({ inventoryStatus: "released" }),
    });
  });
});
