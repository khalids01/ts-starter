import { beforeEach, describe, expect, it, mock } from "bun:test";

const findManyMock = mock(async () => [] as any[]);
const findFirstMock = mock(async () => null as any);
const findUniqueMock = mock(async () => null as any);
const createMock = mock(async (args: any) => rateRow(args.data));
const updateMock = mock(async (args: any) => rateRow({ id: args.where.id, ...args.data }));
const deleteMock = mock(async () => ({}));
const updateManyMock = mock(async () => ({ count: 1 }));
const mappingCountMock = mock(async () => 0);
const orderCountMock = mock(async () => 0);
const prismaMock = {
  shippingRate: {
    findMany: findManyMock,
    findFirst: findFirstMock,
    findUnique: findUniqueMock,
    create: createMock,
    update: updateMock,
    delete: deleteMock,
    updateMany: updateManyMock,
  },
  courierServiceMethod: { count: mappingCountMock },
  order: { count: orderCountMock },
  activityEvent: { create: mock(async ({ data }: any) => data) },
};
const transactionMock = mock(async (callback: any) => callback(prismaMock));

mock.module("@db/server", () => ({ default: { ...prismaMock, $transaction: transactionMock } }));

function rateRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "rate-1",
    code: overrides.code ?? "standard",
    label: overrides.label ?? "Standard",
    amount: overrides.amount ?? "80.00",
    currency: overrides.currency ?? "BDT",
    freeOverAmount: overrides.freeOverAmount ?? null,
    isDefault: overrides.isDefault ?? false,
    isActive: overrides.isActive ?? true,
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: new Date("2026-09-19T00:00:00.000Z"),
    updatedAt: new Date("2026-09-19T00:00:00.000Z"),
    archivedAt: overrides.archivedAt ?? null,
  };
}

beforeEach(() => {
  findManyMock.mockResolvedValue([]);
  findFirstMock.mockResolvedValue(null);
  findUniqueMock.mockResolvedValue(null);
  mappingCountMock.mockResolvedValue(0);
  orderCountMock.mockResolvedValue(0);
  for (const fn of [findManyMock, findFirstMock, findUniqueMock, createMock, updateMock, deleteMock, updateManyMock, mappingCountMock, orderCountMock, transactionMock]) fn.mockClear();
});

describe("shippingService", () => {
  it("makes the first active rate the currency default", async () => {
    const { shippingService } = await import("../src/modules/ecommerce/shipping/shipping.service");
    const result = await shippingService.createRate({ code: "Inside City", label: "Inside city", amount: "60", currency: "bdt" });
    expect(result).toEqual(expect.objectContaining({ code: "inside-city", currency: "BDT", isDefault: true }));
    expect(createMock.mock.calls[0]?.[0].data).toEqual(expect.objectContaining({ amount: "60.00", isDefault: true }));
  });

  it("clears the previous default when another active rate becomes default", async () => {
    findUniqueMock.mockResolvedValue(rateRow({ id: "rate-2", isDefault: false }));
    const { shippingService } = await import("../src/modules/ecommerce/shipping/shipping.service");
    await shippingService.updateRate("rate-2", { isDefault: true });
    expect(updateManyMock).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ currency: "BDT", isDefault: true }) }));
  });

  it("blocks archiving the current default with structured dependency details", async () => {
    findUniqueMock.mockResolvedValue(rateRow({ isDefault: true }));
    const { shippingService, ShippingServiceError } = await import("../src/modules/ecommerce/shipping/shipping.service");
    await expect(shippingService.archiveRate("rate-1")).rejects.toMatchObject({
      status: 409,
      code: "RESOURCE_IN_USE",
      dependencies: [{ type: "default_shipping_method", count: 1 }],
    });
    expect(ShippingServiceError).toBeDefined();
  });

  it("archives and restores a non-default method as inactive", async () => {
    findUniqueMock.mockResolvedValueOnce(rateRow()).mockResolvedValueOnce(rateRow({ archivedAt: new Date() }));
    const { shippingService } = await import("../src/modules/ecommerce/shipping/shipping.service");
    await shippingService.archiveRate("rate-1", "admin-1");
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ isActive: false, archivedAt: expect.any(Date) }) }));
    await shippingService.restoreRate("rate-1", "admin-1");
    expect(updateMock).toHaveBeenLastCalledWith(expect.objectContaining({ data: { archivedAt: null, isActive: false, isDefault: false } }));
  });

  it("blocks permanent deletion when orders depend on the archived method", async () => {
    findUniqueMock.mockResolvedValue(rateRow({ archivedAt: new Date() }));
    orderCountMock.mockResolvedValue(2);
    const { shippingService } = await import("../src/modules/ecommerce/shipping/shipping.service");
    await expect(shippingService.deleteRate("rate-1", "admin-1")).rejects.toMatchObject({ code: "RESOURCE_IN_USE", dependencies: [expect.objectContaining({ type: "orders", count: 2 })] });
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
