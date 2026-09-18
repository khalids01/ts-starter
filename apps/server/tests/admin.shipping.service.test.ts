import { beforeEach, describe, expect, it, mock } from "bun:test";

const findManyMock = mock(async () => [] as any[]);
const findFirstMock = mock(async () => null as any);
const findUniqueMock = mock(async () => null as any);
const createMock = mock(async (args: any) => rateRow(args.data));
const updateMock = mock(async (args: any) => rateRow({ id: args.where.id, ...args.data }));
const updateManyMock = mock(async () => ({ count: 1 }));
const prismaMock = {
  shippingRate: {
    findMany: findManyMock,
    findFirst: findFirstMock,
    findUnique: findUniqueMock,
    create: createMock,
    update: updateMock,
    updateMany: updateManyMock,
  },
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
  };
}

beforeEach(() => {
  findManyMock.mockResolvedValue([]);
  findFirstMock.mockResolvedValue(null);
  findUniqueMock.mockResolvedValue(null);
  for (const fn of [findManyMock, findFirstMock, findUniqueMock, createMock, updateMock, updateManyMock, transactionMock]) fn.mockClear();
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

  it("blocks disabling the current default", async () => {
    findUniqueMock.mockResolvedValue(rateRow({ isDefault: true }));
    const { shippingService, ShippingServiceError } = await import("../src/modules/ecommerce/shipping/shipping.service");
    await expect(shippingService.disableRate("rate-1")).rejects.toBeInstanceOf(ShippingServiceError);
  });
});
