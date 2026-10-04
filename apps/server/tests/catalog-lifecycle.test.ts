import { beforeEach, expect, mock, test } from "bun:test";
import { Prisma } from "../../../packages/db/prisma/generated/client";
const counts: Record<string, number> = {};
let row: any;
const update = mock(async (_arg: any) => row);
const remove = mock(async (_arg: any) => row);
const names = [
  "category",
  "productBrand",
  "productAttribute",
  "product",
  "categoryAttribute",
  "productAttributeAssignment",
  "inventoryBatchAttributeAssignment",
  "productVariantAttributeValue",
  "productAttributeAssignmentValue",
  "orderLineItem",
  "stockReservation",
  "inventoryStock",
  "inventoryMovement",
  "inventoryBatch",
  "inventoryUnit",
];
const tx: any = { $queryRaw: mock(async () => []) };
for (const name of names)
  tx[name] = {
    count: mock(async (_arg: any) => counts[name] ?? 0),
    findUnique: mock(async () => row),
    findUniqueOrThrow: mock(async () => row),
    update,
    delete: remove,
  };
const db = { ...tx, $transaction: mock(async (fn: any) => Array.isArray(fn) ? Promise.all(fn) : fn(tx)) };
mock.module("@db/server", () => ({ default: db, Prisma }));
const { changeCatalogLifecycle, assertLifecycleSafe } =
  await import("../src/modules/admin/catalog-lifecycle/service");
beforeEach(() => {
  for (const key of Object.keys(counts)) delete counts[key];
  row = {
    id: "owned",
    archivedAt: null,
    status: "active",
    isActive: false,
    category: { archivedAt: null },
    brand: null,
    parent: null,
  };
  update.mockClear();
  remove.mockClear();
});
for (const [kind, dependency] of [
  ["category", "category"],
  ["category", "product"],
  ["brand", "product"],
  ["attribute", "categoryAttribute"],
  ["attribute", "productVariantAttributeValue"],
  ["attribute", "productAttributeAssignmentValue"],
  ["attribute", "inventoryBatchAttributeAssignment"],
  ["product", "orderLineItem"],
  ["product", "stockReservation"],
] as const) {
  test(`${kind} archive is blocked by ${dependency}`, async () => {
    counts[dependency] = 1;
    await expect(
      changeCatalogLifecycle(kind, "owned", "archive"),
    ).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });
}
for (const kind of ["category", "brand", "attribute", "product"] as const) {
  test(`${kind} must be archived before delete`, async () => {
    await expect(
      changeCatalogLifecycle(kind, "owned", "delete"),
    ).rejects.toThrow("Archive the item");
    expect(remove).not.toHaveBeenCalled();
  });
  test(`${kind} archive/restore preserves enable/status settings`, async () => {
    await changeCatalogLifecycle(kind, "owned", "archive");
    expect(update.mock.calls[0][0].data).toEqual({
      archivedAt: expect.any(Date),
    });
    row.archivedAt = new Date();
    await changeCatalogLifecycle(kind, "owned", "restore");
    expect(update.mock.calls[1][0].data).toEqual({ archivedAt: null });
  });
}
for (const dependency of [
  "orderLineItem",
  "inventoryStock",
  "inventoryMovement",
  "inventoryBatch",
  "inventoryUnit",
  "stockReservation",
]) {
  test(`product deletion preserves ${dependency}`, async () => {
    row.archivedAt = new Date();
    counts[dependency] = 1;
    await expect(
      changeCatalogLifecycle("product", "owned", "delete"),
    ).rejects.toThrow();
    expect(remove).not.toHaveBeenCalled();
  });
}
test("legacy archived product restores as an inactive draft", async () => {
  row.status = "archived";
  await changeCatalogLifecycle("product", "owned", "restore");
  expect(update.mock.calls[0][0].data).toEqual({
    archivedAt: null,
    status: "draft",
  });
});
test("restore requires a current category and brand", async () => {
  row.archivedAt = new Date();
  row.category.archivedAt = new Date();
  await expect(
    changeCatalogLifecycle("product", "owned", "restore"),
  ).rejects.toThrow("Restore the product");
});
test("restore child requires its parent first", async () => {
  row.archivedAt = new Date();
  row.parent = { archivedAt: new Date() };
  await expect(
    changeCatalogLifecycle("category", "owned", "restore"),
  ).rejects.toThrow("parent");
});
test("missing and duplicate archives fail", async () => {
  row = null;
  await expect(
    changeCatalogLifecycle("brand", "owned", "archive"),
  ).rejects.toThrow("not found");
  row = { archivedAt: new Date() };
  await expect(
    changeCatalogLifecycle("brand", "owned", "archive"),
  ).rejects.toThrow("already");
  expect(update).not.toHaveBeenCalled();
});
test("unused archived attribute can be removed", async () => {
  row.archivedAt = new Date();
  await changeCatalogLifecycle("attribute", "owned", "delete");
  expect(remove).toHaveBeenCalledWith({ where: { id: "owned" } });
});
test("only current work blocks product archive", async () => {
  await assertLifecycleSafe(tx, "product", "owned", "archive");
  expect(tx.orderLineItem.count).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ order: expect.any(Object) }),
    }),
  );
});

test("archived products, categories and brands cannot be checked out", async () => {
  const { isVariantSellable } =
    await import("../src/modules/shop/lib/product-mappers");
  const current = {
    isActive: true,
    product: {
      isActive: true,
      status: "active",
      archivedAt: null,
      category: { isActive: true, archivedAt: null },
      brand: { isActive: true, archivedAt: null },
    },
  };
  expect(isVariantSellable(current)).toBe(true);
  expect(
    isVariantSellable({
      ...current,
      product: { ...current.product, archivedAt: new Date() },
    }),
  ).toBe(false);
  expect(
    isVariantSellable({
      ...current,
      product: {
        ...current.product,
        category: { ...current.product.category, archivedAt: new Date() },
      },
    }),
  ).toBe(false);
  expect(
    isVariantSellable({
      ...current,
      product: {
        ...current.product,
        brand: { ...current.product.brand, archivedAt: new Date() },
      },
    }),
  ).toBe(false);
});

for (const [kind, model] of [["category", "category"], ["brand", "productBrand"], ["attribute", "productAttribute"], ["product", "product"]] as const) {
  test(`${kind} archived list paginates and isolates archived records`, async () => {
    const { listArchivedCatalog } = await import("../src/modules/admin/catalog-lifecycle/service");
    tx[model].findMany = mock(async () => [{ id: "owned", name: "Fictional item" }]);
    counts[model] = 41;
    const result = await listArchivedCatalog(kind, 2, 20);
    expect(result).toMatchObject({ total: 41, pages: 3, page: 2, limit: 20 });
    expect(tx[model].findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20, where: kind === "product" ? { OR: [{ archivedAt: { not: null } }, { status: "archived" }] } : { archivedAt: { not: null } } }));
  });
}
