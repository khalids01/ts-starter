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
  getSetCookieHeaders: () => [],
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

  it("requires order fulfill permission for fulfillment routes", async () => {
    const routes = [
      { path: "ship", method: "POST", body: { carrier: "Pathao", trackingNumber: "P-123" } },
      { path: "tracking", method: "PATCH", body: { trackingNumber: "P-123" } },
      { path: "delivered", method: "POST", body: {} },
    ];

    for (const route of routes) {
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
        new Request(`http://localhost/admin/orders/order-1/${route.path}`, {
          method: route.method,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(route.body),
        }),
      );

      expect(response.status).toBe(403);
    }
  });

  it("requires dedicated permissions for cancellation and refunds", async () => {
    const routes = [
      {
        path: "cancel",
        otherPermission: Permissions.AdminOrdersRefund,
        body: { reason: "Customer request" },
      },
      {
        path: "refunds",
        otherPermission: Permissions.AdminOrdersCancel,
        body: { amount: "10.00", reason: "Price adjustment" },
      },
    ];

    for (const route of routes) {
      getAuthSessionMock.mockResolvedValueOnce({
        user: {
          id: "admin-1",
          role: "ADMIN",
          banned: false,
          archived: false,
        },
        permissions: [
          Permissions.AdminAccess,
          Permissions.AdminOrdersManage,
          route.otherPermission,
        ],
      });

      const { adminOrdersController } = await import(
        "../src/modules/admin/orders/orders.controller"
      );
      const app = new Elysia().use(adminOrdersController);
      const response = await app.handle(
        new Request(`http://localhost/admin/orders/order-1/${route.path}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(route.body),
        }),
      );

      expect(response.status).toBe(403);
    }
  });
});
