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

afterEach(() => {
  getAuthSessionMock.mockClear();
});

describe("admin orders controller RBAC", () => {
  it("requires order read permission for read routes", async () => {
    const { adminOrdersController } = await import(
      "../src/modules/admin/orders/orders.controller"
    );
    const app = new Elysia().use(adminOrdersController);

    const response = await app.handle(
      new Request("http://localhost/admin/orders/"),
    );

    expect(response.status).toBe(403);
  });

  it("requires order manage permission for status updates", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "admin-1",
        role: "ADMIN",
        banned: false,
        archived: false,
      },
      permissions: [
        Permissions.AdminAccess,
        Permissions.AdminOrdersRead,
      ],
    });

    const { adminOrdersController } = await import(
      "../src/modules/admin/orders/orders.controller"
    );
    const app = new Elysia().use(adminOrdersController);

    const response = await app.handle(
      new Request("http://localhost/admin/orders/order-1/status", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderStatus: "confirmed",
        }),
      }),
    );

    expect(response.status).toBe(403);
  });
});
