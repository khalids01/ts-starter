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

describe("admin discounts controller RBAC", () => {
  it("requires discount read permission for listing", async () => {
    const { adminDiscountsController } = await import("../src/modules/admin/discounts/discounts.controller");
    const response = await new Elysia().use(adminDiscountsController).handle(
      new Request("http://localhost/admin/discounts/"),
    );
    expect(response.status).toBe(403);
  });

  it("requires discount manage permission for mutations", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: { id: "admin-1", role: "ADMIN", banned: false, archived: false },
      permissions: [Permissions.AdminAccess, Permissions.AdminDiscountsRead],
    });
    const { adminDiscountsController } = await import("../src/modules/admin/discounts/discounts.controller");
    const response = await new Elysia().use(adminDiscountsController).handle(
      new Request("http://localhost/admin/discounts/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: "SAVE10", type: "percentage", value: "10" }),
      }),
    );
    expect(response.status).toBe(403);
  });
});
