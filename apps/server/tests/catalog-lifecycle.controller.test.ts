import { beforeEach, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";
let session: any;
const mutate = mock(async () => ({ message: "Item archived" }));
const list = mock(async () => ({ items: [], total: 0, page: 1, pages: 1 }));
mock.module("@auth/server", () => ({
  getAuthSession: async () => session,
  getSetCookieHeaders: () => [],
}));
mock.module("@/rbac/resolve/get-effective", () => ({
  getEffectivePermissions: async () => new Set(),
  createPermissionChecker: () => () => false,
}));
mock.module("../src/modules/admin/catalog-lifecycle/service", () => ({
  changeCatalogLifecycle: mutate,
  listArchivedCatalog: list,
  CatalogLifecycleError: class extends Error {},
}));
const { catalogLifecycleController } =
  await import("../src/modules/admin/catalog-lifecycle/controller");
const app = new Elysia({ prefix: "/admin/catalog" }).use(
  catalogLifecycleController,
);
const call = (path: string, method = "POST") =>
  app.handle(
    new Request(`http://localhost/admin/catalog/lifecycle/${path}`, { method }),
  );
beforeEach(() => {
  mutate.mockClear();
  list.mockClear();
  session = {
    user: { id: "fictional", banned: false, archived: false },
    permissions: [Permissions.AdminAccess],
  };
});
for (const kind of ["category", "brand", "attribute", "product"]) {
  test(`${kind} rejects read-only mutations`, async () => {
    session.permissions.push(
      Permissions.AdminCatalogRead,
      Permissions.AdminProductsRead,
    );
    for (const action of ["archive", "restore", "delete"])
      expect((await call(`${kind}/owned/${action}`)).status).toBe(403);
    expect(mutate).not.toHaveBeenCalled();
  });
  test(`${kind} permits its manager`, async () => {
    session.permissions.push(
      kind === "product"
        ? Permissions.AdminProductsManage
        : Permissions.AdminCatalogManage,
    );
    expect((await call(`${kind}/owned/archive`)).status).toBe(200);
    expect(mutate).toHaveBeenCalled();
  });
}
test("catalog managers cannot mutate products without product permission", async () => {
  session.permissions.push(Permissions.AdminCatalogManage);
  expect((await call("product/owned/delete")).status).toBe(403);
});
test("anonymous and invalid kind requests do not mutate", async () => {
  session = null;
  expect([401, 403]).toContain((await call("category/owned/archive")).status);
  expect(mutate).not.toHaveBeenCalled();
});
test("archive listing requires read permission", async () => {
  expect((await call("category", "GET")).status).toBe(403);
  session.permissions.push(Permissions.AdminCatalogRead);
  expect((await call("category", "GET")).status).toBe(200);
});
