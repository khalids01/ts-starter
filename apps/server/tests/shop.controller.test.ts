import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { authGuard } from "../src/guards/auth.guard";

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
const listFiltersMock = mock(async () => ({
  categories: [],
  brands: [],
  priceRange: { min: 0, max: 0, currency: "BDT" },
  availability: { inStock: 0, outOfStock: 0 },
  attributes: [],
}));

mock.module("@auth/server", () => ({
  auth: {
    api: {
      getSession: getAuthSessionMock,
    },
  },
  getAuthSession: getAuthSessionMock,
}));

afterEach(() => {
  getAuthSessionMock.mockClear();
  listCategoriesMock.mockClear();
  listFiltersMock.mockClear();
});

describe("shop controller", () => {
  it("lists active categories without requiring authentication", async () => {
    const app = new Elysia({ prefix: "/shop" })
      .use(authGuard)
      .get("/categories", () => listCategoriesMock());

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

  it("lists storefront filters without requiring authentication", async () => {
    const app = new Elysia({ prefix: "/shop" })
      .use(authGuard)
      .get("/filters", ({ query }) => listFiltersMock(query));

    const response = await app.handle(
      new Request("http://localhost/shop/filters?categoryId=cat-1"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        priceRange: { min: 0, max: 0, currency: "BDT" },
        attributes: [],
      }),
    );
    expect(getAuthSessionMock).toHaveBeenCalled();
    expect(listFiltersMock).toHaveBeenCalledWith({ categoryId: "cat-1" });
  });
});
