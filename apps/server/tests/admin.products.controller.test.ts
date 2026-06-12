import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

const getAuthSessionMock = mock(async () => ({
  user: {
    id: "admin-1",
    role: "ADMIN",
    banned: false,
    archived: false,
  },
  permissions: [Permissions.AdminAccess],
}));

mock.module("@auth/server", () => ({
  auth: {
    api: {
      getSession: getAuthSessionMock,
    },
  },
  getAuthSession: getAuthSessionMock,
}));

mock.module("../src/rbac/resolve/get-effective.ts", () => ({
  getEffectivePermissions: mock(async () => new Set()),
  createPermissionChecker: (permissions: Set<string>) => (required: string) =>
    permissions.has(required),
}));

afterEach(() => {
  getAuthSessionMock.mockClear();
});

describe("admin products controller RBAC", () => {
  it("requires product read permission for read routes", async () => {
    const { adminProductsController } = await import(
      "../src/modules/admin/products/products.controller"
    );
    const app = new Elysia().use(adminProductsController);

    const response = await app.handle(
      new Request("http://localhost/admin/products/"),
    );

    expect(response.status).toBe(403);
  });

  it("requires product manage permission for mutation routes", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "admin-1",
        role: "ADMIN",
        banned: false,
        archived: false,
      },
      permissions: [
        Permissions.AdminAccess,
        Permissions.AdminProductsRead,
      ],
    });

    const { adminProductsController } = await import(
      "../src/modules/admin/products/products.controller"
    );
    const app = new Elysia().use(adminProductsController);

    const response = await app.handle(
      new Request("http://localhost/admin/products/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          categoryId: "cat-1",
          name: "Draft product",
        }),
      }),
    );

    expect(response.status).toBe(403);
  });
});
