import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const countMock = mock(async () => 0);
const findManyMock = mock(async (): Promise<any[]> => []);
const findUniqueMock = mock(async (): Promise<any> => null);
const updateMock = mock(async (): Promise<any> => null);

mock.module("@db/server", () => ({
  default: {
    ecommerceCustomer: {
      count: countMock,
      findMany: findManyMock,
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

const customer = (overrides: Record<string, unknown> = {}) => ({
  id: "customer-1",
  userId: null,
  name: "Nusrat Jahan",
  email: "nusrat@example.test",
  phone: null,
  adminNote: null,
  createdAt: new Date("2026-09-20T00:00:00.000Z"),
  updatedAt: new Date("2026-09-21T00:00:00.000Z"),
  _count: { orders: 1 },
  orders: [],
  user: null,
  ...overrides,
});

beforeEach(() => {
  countMock.mockResolvedValue(0);
  findManyMock.mockResolvedValue([]);
  findUniqueMock.mockResolvedValue(null);
  updateMock.mockResolvedValue(null);
});

afterEach(() => {
  for (const fn of [countMock, findManyMock, findUniqueMock, updateMock]) fn.mockClear();
});

describe("admin customers service", () => {
  it("normalizes search and bounds list pagination", async () => {
    countMock.mockResolvedValueOnce(205);
    findManyMock.mockResolvedValueOnce([customer()]);
    const { adminCustomersService } = await import("../src/modules/admin/customers/customers.service");

    const result = await adminCustomersService.list({ page: 99, limit: 100, search: "  NUSRAT  " });

    expect(result).toMatchObject({ total: 205, pages: 3, page: 3, limit: 100 });
    expect(findManyMock).toHaveBeenCalledWith(expect.objectContaining({
      skip: 200,
      take: 100,
      where: { OR: expect.arrayContaining([{ normalizedEmail: { contains: "nusrat" } }]) },
    }));
  });

  it("returns separated spend and latest addresses in customer detail", async () => {
    findUniqueMock.mockResolvedValueOnce(customer({
      orders: [{
        id: "order-1",
        orderNumber: "ORD-1",
        totalAmount: "100.00",
        currency: "BDT",
        orderStatus: "completed",
        paymentStatus: "paid",
        deliveryStatus: "delivered",
        placedAt: new Date("2026-09-21T00:00:00.000Z"),
        refunds: [],
        addresses: [
          { id: "new", type: "shipping", createdAt: new Date("2026-09-21T00:00:00.000Z"), updatedAt: new Date("2026-09-21T00:00:00.000Z") },
          { id: "old", type: "shipping", createdAt: new Date("2026-09-20T00:00:00.000Z"), updatedAt: new Date("2026-09-20T00:00:00.000Z") },
        ],
      }],
    }));
    const { adminCustomersService } = await import("../src/modules/admin/customers/customers.service");

    const result = await adminCustomersService.detail("customer-1");

    expect(result.completedSpend).toEqual([{ currency: "BDT", amount: "100.00" }]);
    expect(result.latestAddresses.map((address: any) => address.id)).toEqual(["new"]);
    expect(result.orders[0]).not.toHaveProperty("addresses");
  });

  it("returns not found for missing customers", async () => {
    const { adminCustomersService } = await import("../src/modules/admin/customers/customers.service");
    await expect(adminCustomersService.detail("missing")).rejects.toMatchObject({ status: 404 });
    await expect(adminCustomersService.update("missing", { name: "Missing" })).rejects.toMatchObject({ status: 404 });
  });

  it("trims updates, clears nullable fields, and maps duplicate email conflicts", async () => {
    findUniqueMock.mockResolvedValue(customer());
    updateMock.mockResolvedValueOnce(customer());
    const { adminCustomersService } = await import("../src/modules/admin/customers/customers.service");

    await adminCustomersService.update("customer-1", {
      name: "  Updated Name  ",
      email: "  UPDATED@Example.Test  ",
      phone: "   ",
      adminNote: null,
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "customer-1" },
      data: {
        name: "Updated Name",
        email: "UPDATED@Example.Test",
        normalizedEmail: "updated@example.test",
        phone: null,
        adminNote: null,
      },
    });

    updateMock.mockRejectedValueOnce({ code: "P2002" });
    await expect(adminCustomersService.update("customer-1", { email: "taken@example.test" }))
      .rejects.toMatchObject({ status: 409 });
  });
});
