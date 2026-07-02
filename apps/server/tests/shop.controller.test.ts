import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";

const getAuthSessionMock = mock(async () => null);
const listCategoriesMock = mock(async () => [
  {
    id: "cat-1",
    name: "Food",
    slug: "food",
    description: "Fresh food",
    imageUrl: null,
    iconUrl: null,
    parentId: null,
    isFeatured: true,
    sortOrder: 10,
    productCount: 2,
  },
]);

mock.module("@auth/server", () => ({
  auth: {
    api: {
      getSession: getAuthSessionMock,
    },
  },
  getAuthSession: getAuthSessionMock,
}));

mock.module("../src/modules/shop/shop.service", () => ({
  ShopServiceError: class ShopServiceError extends Error {
    constructor(
      message: string,
      public readonly status = 400,
    ) {
      super(message);
    }
  },
  shopService: {
    listCategories: listCategoriesMock,
  },
}));

afterEach(() => {
  getAuthSessionMock.mockClear();
  listCategoriesMock.mockClear();
});

describe("shop controller", () => {
  it("lists active categories without requiring authentication", async () => {
    const { shopController } = await import("../src/modules/shop/shop.controller");
    const app = new Elysia().use(shopController);

    const response = await app.handle(
      new Request("http://localhost/shop/categories"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      expect.objectContaining({
        id: "cat-1",
        name: "Food",
        productCount: 2,
      }),
    ]);
    expect(getAuthSessionMock).toHaveBeenCalled();
    expect(listCategoriesMock).toHaveBeenCalled();
  });
});
