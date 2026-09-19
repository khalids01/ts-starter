import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const orderFindUniqueMock = mock(async () => orderRow());
const orderUpdateMock = mock(async (args: any) =>
  orderRow({ ...args.data, id: args.where.id }),
);
const statusEventCreateMock = mock(async (args: any) => ({
  id: "event-1",
  ...args.data,
}));
const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  order: {
    findUnique: orderFindUniqueMock,
    update: orderUpdateMock,
  },
  orderStatusEvent: {
    create: statusEventCreateMock,
  },
};

mock.module("@db/server", () => ({
  default: prismaMock,
}));

function orderRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "order-1",
    orderStatus: overrides.orderStatus ?? "confirmed",
    deliveryStatus: overrides.deliveryStatus ?? "unfulfilled",
    inventoryStatus: overrides.inventoryStatus ?? "committed",
    carrier: overrides.carrier ?? null,
    trackingNumber: overrides.trackingNumber ?? null,
    fulfillmentNote: overrides.fulfillmentNote ?? null,
    shippedAt: overrides.shippedAt ?? null,
    deliveredAt: overrides.deliveredAt ?? null,
  };
}

beforeEach(() => {
  orderFindUniqueMock.mockResolvedValue(orderRow());
});

afterEach(() => {
  for (const fn of [orderFindUniqueMock, orderUpdateMock, statusEventCreateMock, transactionMock]) {
    fn.mockClear();
  }
});

describe("order fulfillment service", () => {
  it("marks a committed order shipped and records an audit event", async () => {
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    const result = await orderFulfillmentService.markShipped(
      "order-1",
      { carrier: " Pathao ", trackingNumber: " P-123 ", note: " Handed over " },
      { userId: "admin-1" },
    );

    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: expect.objectContaining({
        carrier: "Pathao",
        trackingNumber: "P-123",
        fulfillmentNote: "Handed over",
        deliveryStatus: "shipped",
        shippedAt: expect.any(Date),
      }),
    });
    expect(statusEventCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order-1",
        type: "delivery",
        previousValue: "unfulfilled",
        newValue: "shipped",
        note: "Handed over",
        actorUserId: "admin-1",
        metadata: {
          action: "mark_shipped",
          carrier: "Pathao",
          trackingNumber: "P-123",
        },
      }),
    });
    expect(result).toMatchObject({
      id: "order-1",
      deliveryStatus: "shipped",
      carrier: "Pathao",
      trackingNumber: "P-123",
      deliveredAt: null,
    });
  });

  it("rejects shipping when stock is not committed", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(orderRow({ inventoryStatus: "reserved" }));
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.markShipped(
        "order-1",
        { carrier: "Pathao", trackingNumber: "P-123" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Confirm the order and commit its stock before shipping");
  });

  it("rejects shipping a cancelled order", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ orderStatus: "cancelled" }),
    );
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.markShipped(
        "order-1",
        { carrier: "Pathao", trackingNumber: "P-123" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("A cancelled order cannot be shipped");
  });

  it("rejects shipping an order that is already shipped", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ deliveryStatus: "shipped", shippedAt: new Date() }),
    );
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.markShipped(
        "order-1",
        { carrier: "Pathao", trackingNumber: "P-123" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Order is not eligible to be shipped");
  });

  it("rejects whitespace-only shipment details after normalization", async () => {
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.markShipped(
        "order-1",
        { carrier: "   ", trackingNumber: "P-123" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Carrier is required");
  });

  it("audits previous tracking values when correcting tracking", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({
        deliveryStatus: "shipped",
        carrier: "Old carrier",
        trackingNumber: "OLD-1",
        fulfillmentNote: "Old note",
        shippedAt: new Date("2026-06-16T09:00:00.000Z"),
      }),
    );
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    const result = await orderFulfillmentService.updateTracking(
      "order-1",
      { trackingNumber: " NEW-2 " },
      { userId: "admin-1" },
    );

    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: {
        carrier: "Old carrier",
        trackingNumber: "NEW-2",
        fulfillmentNote: "Old note",
      },
    });
    expect(statusEventCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order-1",
        type: "delivery",
        previousValue: "shipped",
        newValue: "shipped",
        metadata: {
          action: "tracking_updated",
          previous: { carrier: "Old carrier", trackingNumber: "OLD-1" },
          current: { carrier: "Old carrier", trackingNumber: "NEW-2" },
        },
      }),
    });
    expect(result.trackingNumber).toBe("NEW-2");
  });

  it("rejects tracking updates before shipment", async () => {
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.updateTracking(
        "order-1",
        { trackingNumber: "NEW-2" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Tracking can only be updated after shipment");
  });

  it("rejects tracking updates without any field", async () => {
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.updateTracking("order-1", {}, { userId: "admin-1" }),
    ).rejects.toThrow("At least one tracking field is required");
  });

  it("rejects whitespace-only tracking corrections", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({
        deliveryStatus: "shipped",
        carrier: "Pathao",
        trackingNumber: "OLD-1",
        shippedAt: new Date("2026-06-16T09:00:00.000Z"),
      }),
    );
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.updateTracking(
        "order-1",
        { trackingNumber: "   " },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Tracking number is required");
  });

  it("marks a shipped order delivered and records the timestamp", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ deliveryStatus: "shipped", shippedAt: new Date("2026-06-16T09:00:00.000Z") }),
    );
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    const result = await orderFulfillmentService.markDelivered(
      "order-1",
      { note: "Received by customer" },
      { userId: "admin-1" },
    );

    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: {
        deliveryStatus: "delivered",
        deliveredAt: expect.any(Date),
      },
    });
    expect(statusEventCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order-1",
        type: "delivery",
        previousValue: "shipped",
        newValue: "delivered",
        note: "Received by customer",
        actorUserId: "admin-1",
      }),
    });
    expect(result.deliveryStatus).toBe("delivered");
  });

  it("rejects marking an unshipped order delivered", async () => {
    const { orderFulfillmentService } = await import(
      "../src/modules/admin/orders/fulfillment.service"
    );

    await expect(
      orderFulfillmentService.markDelivered("order-1", {}, { userId: "admin-1" }),
    ).rejects.toThrow("Only a shipped order can be marked delivered");
  });
});
