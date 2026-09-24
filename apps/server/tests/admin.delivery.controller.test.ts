import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

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
});
