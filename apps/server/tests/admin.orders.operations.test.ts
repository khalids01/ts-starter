import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const orderFindUniqueMock = mock(async () => orderRow());
const orderUpdateMock = mock(async (args: any) => ({ ...orderRow(), ...args.data }));
const refundAggregateMock = mock(async () => ({ _sum: { amount: null } }));
const refundCreateMock = mock(async (args: any) => ({ id: "refund-1", ...args.data }));
const statusEventCreateMock = mock(async (args: any) => ({ id: "event-1", ...args.data }));
const reservationFindManyMock = mock(async () => [reservationRow()]);
const reservationUpdateMock = mock(async (args: any) => args);
const inventoryStockUpdateMock = mock(async (args: any) => args);
const inventoryMovementCreateMock = mock(async (args: any) => args);
const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  order: {
    findUnique: orderFindUniqueMock,
    update: orderUpdateMock,
  },
  orderRefund: {
    aggregate: refundAggregateMock,
    create: refundCreateMock,
  },
  orderStatusEvent: {
    create: statusEventCreateMock,
  },
  stockReservation: {
    findMany: reservationFindManyMock,
    update: reservationUpdateMock,
  },
  inventoryStock: {
    update: inventoryStockUpdateMock,
  },
  inventoryMovement: {
    create: inventoryMovementCreateMock,
  },
};

mock.module("@db/server", () => ({
  default: prismaMock,
}));

function orderRow(overrides: Record<string, any> = {}) {
  return {
    id: "order-1",
    totalAmount: "300.00",
    currency: "BDT",
    orderStatus: "confirmed",
    paymentStatus: "paid",
    deliveryStatus: "unfulfilled",
    inventoryStatus: "committed",
    deliveredAt: null,
    ...overrides,
  };
}

function reservationRow(overrides: Record<string, any> = {}) {
  return {
    id: "reservation-1",
    variantId: "variant-1",
    locationId: "location-1",
    batchId: null,
    quantity: 2,
    status: "committed",
    createdAt: new Date("2026-09-20T10:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  orderFindUniqueMock.mockResolvedValue(orderRow());
  refundAggregateMock.mockResolvedValue({ _sum: { amount: null } });
  reservationFindManyMock.mockResolvedValue([reservationRow()]);
});

afterEach(() => {
  for (const fn of [
    orderFindUniqueMock,
    orderUpdateMock,
    refundAggregateMock,
    refundCreateMock,
    statusEventCreateMock,
    reservationFindManyMock,
    reservationUpdateMock,
    inventoryStockUpdateMock,
    inventoryMovementCreateMock,
    transactionMock,
  ]) {
    fn.mockClear();
  }
});

describe("order cancellation and refund operations", () => {
  it("cancels a committed order and restocks inventory once", async () => {
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    const result = await orderOperationsService.cancelOrder(
      "order-1",
      { reason: "Customer request", note: "Confirmed by phone" },
      { userId: "admin-1" },
    );

    expect(inventoryStockUpdateMock).toHaveBeenCalledWith({
      where: { stockKey: "variant-1:location-1:no_batch" },
      data: { quantityOnHand: { increment: 2 } },
    });
    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { orderStatus: "cancelled" },
    });
    expect(statusEventCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        previousValue: "confirmed",
        newValue: "cancelled",
        actorUserId: "admin-1",
        metadata: expect.objectContaining({
          reason: "Customer request",
          inventorySideEffect: "restocked",
        }),
      }),
    });
    expect(result.inventorySideEffect).toBe("restocked");
  });

  it("rejects repeated cancellation without another inventory movement", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ orderStatus: "cancelled", inventoryStatus: "restocked" }),
    );
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    await expect(
      orderOperationsService.cancelOrder(
        "order-1",
        { reason: "Duplicate request" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Order is already cancelled");
    expect(inventoryStockUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects cancellation after delivery", async () => {
    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ deliveryStatus: "delivered", deliveredAt: new Date() }),
    );
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    await expect(
      orderOperationsService.cancelOrder(
        "order-1",
        { reason: "Too late" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("A delivered order cannot be cancelled");
  });

  it("records a partial manual refund without restocking", async () => {
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    const result = await orderOperationsService.recordRefund(
      "order-1",
      {
        amount: "100.00",
        reason: "Damaged packaging",
        restockInventory: false,
      },
      { userId: "admin-1" },
    );

    expect(refundCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: "100.00",
        currency: "BDT",
        reason: "Damaged packaging",
        restockInventory: false,
      }),
    });
    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { paymentStatus: "partially_refunded" },
    });
    expect(inventoryStockUpdateMock).not.toHaveBeenCalled();
    expect(result.totalRefunded).toBe("100.00");
  });

  it("marks payment refunded when cumulative refunds reach the order total", async () => {
    refundAggregateMock.mockResolvedValueOnce({
      _sum: { amount: "100.00" },
    });
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    const result = await orderOperationsService.recordRefund(
      "order-1",
      { amount: "200.00", reason: "Full return" },
      { userId: "admin-1" },
    );

    expect(result.paymentStatus).toBe("refunded");
    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { paymentStatus: "refunded" },
    });
  });

  it("rejects a refund above the remaining order total", async () => {
    refundAggregateMock.mockResolvedValueOnce({
      _sum: { amount: "250.00" },
    });
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    await expect(
      orderOperationsService.recordRefund(
        "order-1",
        { amount: "60.00", reason: "Too much" },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Refund exceeds the remaining order total of 50.00 BDT");
    expect(refundCreateMock).not.toHaveBeenCalled();
  });

  it("restocks refund inventory once and rejects another restock", async () => {
    const { orderOperationsService } = await import(
      "../src/modules/admin/orders/order-operations.service"
    );

    await orderOperationsService.recordRefund(
      "order-1",
      {
        amount: "50.00",
        reason: "Returned item",
        restockInventory: true,
      },
      { userId: "admin-1" },
    );
    expect(inventoryStockUpdateMock).toHaveBeenCalledTimes(1);

    orderFindUniqueMock.mockResolvedValueOnce(
      orderRow({ paymentStatus: "partially_refunded", inventoryStatus: "restocked" }),
    );
    await expect(
      orderOperationsService.recordRefund(
        "order-1",
        {
          amount: "25.00",
          reason: "Duplicate restock",
          restockInventory: true,
        },
        { userId: "admin-1" },
      ),
    ).rejects.toThrow("Order inventory has already been restocked");
    expect(inventoryStockUpdateMock).toHaveBeenCalledTimes(1);
  });
});
