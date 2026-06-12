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

describe("admin inventory controller RBAC", () => {
  it("requires inventory read permission for read routes", async () => {
    const { adminInventoryController } = await import(
      "../src/modules/admin/inventory/inventory.controller"
    );
    const app = new Elysia().use(adminInventoryController);

    const response = await app.handle(
      new Request("http://localhost/admin/inventory/stocks"),
    );

    expect(response.status).toBe(403);
  });

  it("requires inventory manage permission for mutation routes", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "admin-1",
        role: "ADMIN",
        banned: false,
        archived: false,
      },
      permissions: [Permissions.AdminAccess, Permissions.AdminInventoryRead],
    });

    const { adminInventoryController } = await import(
      "../src/modules/admin/inventory/inventory.controller"
    );
    const app = new Elysia().use(adminInventoryController);

    const response = await app.handle(
      new Request("http://localhost/admin/inventory/receive", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          variantId: "variant-1",
          locationId: "loc-main",
          quantity: 1,
        }),
      }),
    );

    expect(response.status).toBe(403);
  });
});
