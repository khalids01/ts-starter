import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

mock.module("@/rbac/resolve/get-effective", () => ({
  getEffectivePermissions: async () => { throw new Error("Tests must supply session permissions"); },
  createPermissionChecker: (permissions: ReadonlySet<string>) => (permission: string) => permissions.has(permission),
}));

mock.module("@db/server", () => ({ default: { $transaction: () => { throw new Error("A denied request must not reach persistence"); } } }));

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


describe("physical recovery action permissions", () => {
  it("requires fulfillment for receipt and inspection", async () => {
    for (const method of ["POST", "PATCH"]) {
      getAuthSessionMock.mockResolvedValueOnce({ user: { id: "reader", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminOrdersManage, Permissions.AdminInventoryManage] });
      const { adminOrdersController } = await import("../src/modules/admin/orders/orders.controller");
      const response = await new Elysia().use(adminOrdersController).handle(new Request("http://localhost/admin/orders/order-1/recovery", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(method === "POST" ? { allItemsReceived: true, note: "Receipt" } : { disposition: "sellable", note: "Inspection" }) }));
      expect(response.status).toBe(403);
    }
  });
  it("requires both fulfillment and inventory management to restock", async () => {
    for (const permission of [Permissions.AdminOrdersFulfill, Permissions.AdminInventoryManage]) {
      getAuthSessionMock.mockResolvedValueOnce({ user: { id: "restricted", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, permission] });
      const { adminOrdersController } = await import("../src/modules/admin/orders/orders.controller");
      const response = await new Elysia().use(adminOrdersController).handle(new Request("http://localhost/admin/orders/order-1/recovery/restock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ note: "Restock" }) }));
      expect(response.status).toBe(403);
    }
  });
  it("rejects refund restocking with refund permission alone before touching persistence", async () => {
    getAuthSessionMock.mockResolvedValueOnce({ user: { id: "refund-only", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminOrdersRefund] });
    const { adminOrdersController } = await import("../src/modules/admin/orders/orders.controller");
    const response = await new Elysia().use(adminOrdersController).handle(new Request("http://localhost/admin/orders/order-1/refunds", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount: "10", reason: "Refund", restockInventory: true }) }));
    expect(response.status).toBe(403);
  });
});


describe("payment action permissions", () => {
  it("rejects order managers without dedicated payment authority", async () => {
    getAuthSessionMock.mockResolvedValueOnce({ user: { id: "manager", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminOrdersManage] });
    const { adminOrdersController } = await import("../src/modules/admin/orders/orders.controller");
    const response = await new Elysia().use(adminOrdersController).handle(new Request("http://localhost/admin/orders/order-1/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: "10", currency: "BDT", method: "manual_bank", reference: "TX-1", note: "Verified" }) }));
    expect(response.status).toBe(403);
  });
});

it.each([
  ["POST", "/admin/orders/order-1/preparation", { state: "preparing", note: "Evidence" }],
  ["POST", "/admin/orders/order-1/units", { lineItemId: "line", unitId: "unit" }],
  ["DELETE", "/admin/orders/order-1/units/unit", undefined],
  ["POST", "/admin/orders/order-1/warranty-claims", { allocationId: "allocation", reference: "ref", issue: "Fault" }],
  ["PATCH", "/admin/orders/order-1/warranty-claims/claim", { state: "approved", resolution: "Evidence" }],
  ["POST", "/admin/orders/food-slots", { label: "Slot", postalCodes: ["1207"], startsAt: "2099-01-01T10:00:00Z", endsAt: "2099-01-01T11:00:00Z", cutoffAt: "2099-01-01T09:00:00Z", capacityUnits: 1 }],
  ["DELETE", "/admin/orders/food-slots/slot", undefined],
] as const)("niche mutation requires action permission: %s %s", async (method, path, body) => {
  getAuthSessionMock.mockResolvedValueOnce({ user: { id: "admin-1", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminOrdersRead] });
  const { adminOrdersController } = await import("../src/modules/admin/orders/orders.controller");
  const app = new Elysia().use(adminOrdersController);
  const response = await app.handle(new Request(`http://localhost${path}`, { method, ...(body ? { headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}) }));
  expect(response.status).toBe(403);
});
