import { afterEach, describe, expect, it, mock } from "bun:test";

const getSessionMock = mock(async () => null);

mock.module("@/modules/auth/auth.service", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

afterEach(() => {
  getSessionMock.mockReset();
});

describe("rolesGuard", () => {
  it("returns 401 when there is no session", async () => {
    const { rolesGuard } = await import("../src/guards/roles.guard");
    const ctx = {
      request: new Request("http://localhost/admin"),
      set: { status: 200 },
    } as any;

    const result = await rolesGuard(["OWNER"])(ctx);

    expect(ctx.set.status).toBe(401);
    expect(result).toEqual({ message: "Unauthorized", status: 401 });
  });

  it("returns 403 when the user role is not allowed", async () => {
    const { rolesGuard } = await import("../src/guards/roles.guard");
    const ctx = {
      request: new Request("http://localhost/admin"),
      set: { status: 200 },
      user: { role: "USER" },
    } as any;

    const result = await rolesGuard(["OWNER"])(ctx);

    expect(ctx.set.status).toBe(403);
    expect(result).toEqual({ message: "Forbidden", status: 403 });
  });

  it("allows admins to bypass role restrictions", async () => {
    const { rolesGuard } = await import("../src/guards/roles.guard");
    const ctx = {
      request: new Request("http://localhost/admin"),
      set: { status: 200 },
      user: { role: "ADMIN" },
    } as any;

    const result = await rolesGuard(["OWNER"])(ctx);

    expect(result).toBeUndefined();
    expect(ctx.set.status).toBe(200);
  });
});
