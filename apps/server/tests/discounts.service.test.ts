import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const findUniqueMock = mock(async () => discountRow());
const redemptionCountMock = mock(async () => 0);
const createMock = mock(async (args: any) => ({ id: "discount-1", usageCount: 0, createdAt: new Date(), updatedAt: new Date(), ...args.data }));
const updateMock = mock(async (args: any) => ({ ...discountRow(), ...args.data }));
const findManyMock = mock(async () => [discountRow()]);

const prismaMock = {
  discountCode: {
    findUnique: findUniqueMock,
    findMany: findManyMock,
    create: createMock,
    update: updateMock,
  },
  discountRedemption: { count: redemptionCountMock },
};

mock.module("@db/server", () => ({ default: prismaMock }));

function discountRow(overrides: Record<string, any> = {}) {
  return {
    id: "discount-1",
    code: "SAVE10",
    description: "Save ten percent",
    type: "percentage",
    value: "10.00",
    currency: null,
    isActive: true,
    startsAt: null,
    endsAt: null,
    minimumOrderAmount: null,
    totalUsageLimit: 10,
    perCustomerUsageLimit: 1,
    usageCount: 0,
    createdAt: new Date("2026-09-20T00:00:00.000Z"),
    updatedAt: new Date("2026-09-20T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  findUniqueMock.mockResolvedValue(discountRow());
  redemptionCountMock.mockResolvedValue(0);
});

afterEach(() => {
  for (const fn of [findUniqueMock, redemptionCountMock, createMock, updateMock, findManyMock]) fn.mockClear();
});

describe("discount service", () => {
  it("calculates percentage and fixed discounts deterministically", async () => {
    const { evaluateDiscount } = await import("../src/modules/ecommerce/discounts/discounts.service");
    const percentage = await evaluateDiscount(prismaMock as any, {
      code: "save10", subtotalAmount: "199.99", currency: "BDT", customerKey: "user:1",
    });
    expect(percentage.amount).toBe("19.99");

    findUniqueMock.mockResolvedValueOnce(discountRow({ type: "fixed_amount", value: "500.00", currency: "BDT" }));
    const fixed = await evaluateDiscount(prismaMock as any, {
      code: "SAVE10", subtotalAmount: "300.00", currency: "BDT",
    });
    expect(fixed.amount).toBe("300.00");
  });

  it("rejects inactive, expired, currency-mismatched, and below-minimum codes", async () => {
    const { evaluateDiscount } = await import("../src/modules/ecommerce/discounts/discounts.service");
    const cases = [
      [discountRow({ isActive: false }), "not available"],
      [discountRow({ endsAt: new Date("2026-09-19T00:00:00.000Z") }), "expired"],
      [discountRow({ type: "fixed_amount", currency: "USD" }), "currency"],
      [discountRow({ minimumOrderAmount: "500.00" }), "at least"],
    ] as const;
    for (const [row, message] of cases) {
      findUniqueMock.mockResolvedValueOnce(row);
      await expect(evaluateDiscount(prismaMock as any, {
        code: "SAVE10", subtotalAmount: "300.00", currency: "BDT", now: new Date("2026-09-20T00:00:00.000Z"),
      })).rejects.toThrow(message);
    }
  });

  it("enforces total and per-customer usage limits", async () => {
    const { evaluateDiscount } = await import("../src/modules/ecommerce/discounts/discounts.service");
    findUniqueMock.mockResolvedValueOnce(discountRow({ usageCount: 10 }));
    await expect(evaluateDiscount(prismaMock as any, {
      code: "SAVE10", subtotalAmount: "300.00", currency: "BDT",
    })).rejects.toThrow("usage limit");

    redemptionCountMock.mockResolvedValueOnce(1);
    await expect(evaluateDiscount(prismaMock as any, {
      code: "SAVE10", subtotalAmount: "300.00", currency: "BDT", customerKey: "user:1",
    })).rejects.toThrow("maximum number of times");
  });

  it("normalizes admin codes and validates percentage limits", async () => {
    const { discountService } = await import("../src/modules/ecommerce/discounts/discounts.service");
    await discountService.create({ code: " welcome-10 ", type: "percentage", value: "10", currency: null });
    expect(createMock).toHaveBeenCalledWith({ data: expect.objectContaining({ code: "WELCOME-10", value: "10.00", currency: null }) });
    await expect(discountService.create({ code: "BAD", type: "percentage", value: "101" })).rejects.toThrow("cannot exceed 100");
  });
});
