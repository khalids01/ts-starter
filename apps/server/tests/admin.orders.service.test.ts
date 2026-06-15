import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const orderCountMock = mock(async () => 1);
const orderFindManyMock = mock(async () => [orderRow()]);
const orderFindUniqueMock = mock(async () => orderRow());
const orderUpdateMock = mock(async (args: any) =>
  orderRow({ id: args.where.id, ...args.data }),
);
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
const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  order: {
    count: orderCountMock,
    findMany: orderFindManyMock,
    findUnique: orderFindUniqueMock,
    update: orderUpdateMock,
    findUniqueOrThrow: orderFindUniqueOrThrowMock,
  },
  orderStatusEvent: {
    createMany: statusEventCreateManyMock,
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
    billingAddress: overrides.billingAddress ?? null,
    shippingAddress: overrides.shippingAddress ?? { city: "Dhaka" },
    subtotalAmount: overrides.subtotalAmount ?? "240.00",
    discountAmount: overrides.discountAmount ?? "0.00",
    taxAmount: overrides.taxAmount ?? "0.00",
    shippingAmount: overrides.shippingAmount ?? "60.00",
    totalAmount: overrides.totalAmount ?? "300.00",
    currency: overrides.currency ?? "BDT",
    orderStatus: overrides.orderStatus ?? "pending",
    paymentStatus: overrides.paymentStatus ?? "unpaid",
    deliveryStatus: overrides.deliveryStatus ?? "unfulfilled",
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

beforeEach(() => {
  orderCountMock.mockResolvedValue(1);
  orderFindManyMock.mockResolvedValue([orderRow()]);
  orderFindUniqueMock.mockResolvedValue(orderRow());
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
    orderFindUniqueOrThrowMock,
    statusEventCreateManyMock,
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
});
