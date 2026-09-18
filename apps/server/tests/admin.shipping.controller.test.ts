import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

const getAuthSessionMock = mock(async () => ({ user: { id: "admin-1", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess] }));
mock.module("@auth/server", () => ({ auth: { api: { getSession: getAuthSessionMock } }, getAuthSession: getAuthSessionMock, getSetCookieHeaders: () => [] }));
afterEach(() => getAuthSessionMock.mockClear());

describe("admin shipping controller RBAC", () => {
  it("requires shipping read permission", async () => {
    const { adminShippingController } = await import("../src/modules/admin/shipping/shipping.controller");
    const response = await new Elysia().use(adminShippingController).handle(new Request("http://localhost/admin/shipping/rates"));
    expect(response.status).toBe(403);
  });

  it("requires shipping manage permission", async () => {
    getAuthSessionMock.mockResolvedValueOnce({ user: { id: "admin-1", role: "ADMIN", banned: false, archived: false }, permissions: [Permissions.AdminAccess, Permissions.AdminShippingRead] });
    const { adminShippingController } = await import("../src/modules/admin/shipping/shipping.controller");
    const response = await new Elysia().use(adminShippingController).handle(new Request("http://localhost/admin/shipping/rates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: "standard", label: "Standard", amount: "80", currency: "BDT" }) }));
    expect(response.status).toBe(403);
  });
});
