import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

mock.module("@env/server", () => ({ env: {} }));
mock.module("@db/server", () => ({ default: { $transaction: () => { throw new Error("Denied action must not reach persistence"); } } }));
mock.module("@/rbac/resolve/get-effective", () => ({ getEffectivePermissions: async () => { throw new Error("Session permissions must be explicit"); }, createPermissionChecker: (permissions: ReadonlySet<string>) => (permission: string) => permissions.has(permission) }));

const getAuthSessionMock = mock(async () => ({
  user: { id: "admin-1", role: "ADMIN", banned: false, archived: false },
  permissions: [Permissions.AdminAccess],
}));

mock.module("@auth/server", () => ({
  auth: { api: { getSession: getAuthSessionMock } },
  getAuthSession: getAuthSessionMock,
  getSetCookieHeaders: () => [],
}));

afterEach(() => getAuthSessionMock.mockClear());

describe("admin delivery controller RBAC", () => {
  it("requires delivery read permission for connection reads", async () => {
    const { adminDeliveryController } = await import(
      "../src/modules/admin/delivery/delivery.controller"
    );
    const response = await new Elysia().use(adminDeliveryController).handle(
      new Request("http://localhost/admin/delivery/connections"),
    );
    expect(response.status).toBe(403);
  });

  it("requires delivery settings permission for connection mutations", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: { id: "admin-1", role: "ADMIN", banned: false, archived: false },
      permissions: [Permissions.AdminAccess, Permissions.AdminDeliveryRead],
    });
    const { adminDeliveryController } = await import(
      "../src/modules/admin/delivery/delivery.controller"
    );
    const response = await new Elysia().use(adminDeliveryController).handle(
      new Request("http://localhost/admin/delivery/connections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerCode: "steadfast",
          displayName: "Primary",
          environment: "production",
          credentialSource: "server_environment",
        }),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("requires delivery dispatch permission for order recommendations", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: { id: "admin-1", role: "ADMIN", banned: false, archived: false },
      permissions: [Permissions.AdminAccess, Permissions.AdminDeliveryRead],
    });
    const { adminDeliveryController } = await import(
      "../src/modules/admin/delivery/delivery.controller"
    );
    const response = await new Elysia().use(adminDeliveryController).handle(
      new Request("http://localhost/admin/delivery/orders/order-1/recommendation"),
    );
    expect(response.status).toBe(403);
  });

  it("requires dedicated permissions for returns and settlement reconciliation", async () => {
    getAuthSessionMock.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", banned: false, archived: false },
      permissions: [Permissions.AdminAccess, Permissions.AdminDeliveryRead],
    });
    const { adminDeliveryController } = await import(
      "../src/modules/admin/delivery/delivery.controller"
    );
    const app = new Elysia().use(adminDeliveryController);
    const returnResponse = await app.handle(new Request("http://localhost/admin/delivery/returns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ consignmentId: "consignment-1" }) }));
    const settlementResponse = await app.handle(new Request("http://localhost/admin/delivery/settlements", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ consignmentId: "consignment-1", externalId: "PAYOUT-1", amount: "100.00", currency: "BDT" }) }));
    expect(returnResponse.status).toBe(403);
    expect(settlementResponse.status).toBe(403);
  });
});

it("retry-hold requires dispatch permission, not delivery read permission", async () => {
  getAuthSessionMock.mockResolvedValueOnce({ user: { id: "admin-1", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminDeliveryRead] });
  const { adminDeliveryController } = await import("../src/modules/admin/delivery/delivery.controller");
  const response = await new Elysia().use(adminDeliveryController).handle(new Request("http://localhost/admin/delivery/consignments/consignment/retry-hold", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ note: "Reviewed" }) }));
  expect(response.status).toBe(403);
});

it("existing booking evidence requires reconciliation permission even for dispatch operators", async () => {
  getAuthSessionMock.mockResolvedValueOnce({ user: { id: "admin-1", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminDeliveryRead, Permissions.AdminDeliveryDispatch] });
  const { adminDeliveryController } = await import("../src/modules/admin/delivery/delivery.controller");
  const response = await new Elysia().use(adminDeliveryController).handle(new Request("http://localhost/admin/delivery/consignments/consignment/reconcile-booking", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invoice: "ORD-1", externalId: "merchant", providerState: "pending", note: "Merchant evidence" }) }));
  expect(response.status).toBe(403);
});
