import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Roles } from "@rbac";

const assignUserRoleMock = mock(async () => undefined);
const hasRoleAssignmentMock = mock(async () => false);

describe("defaultUserRoleOnSignup", () => {
  beforeEach(() => {
    assignUserRoleMock.mockClear();
    hasRoleAssignmentMock.mockClear();
  });

  it("assigns platform.user after session create", async () => {
    const { defaultUserRoleOnSignup } = await import(
      "../../../packages/auth/src/lib/default-user-role.server.ts"
    );

    const plugin = defaultUserRoleOnSignup(assignUserRoleMock, hasRoleAssignmentMock);
    const afterHook = plugin.init()?.options?.databaseHooks?.session?.create?.after;

    expect(afterHook).toBeDefined();
    await afterHook!({ userId: "user-123" });

    expect(assignUserRoleMock).toHaveBeenCalledWith(
      "user-123",
      Roles.PlatformUser,
    );
  });

  it("does nothing when user id is missing", async () => {
    const { defaultUserRoleOnSignup } = await import(
      "../../../packages/auth/src/lib/default-user-role.server.ts"
    );

    const plugin = defaultUserRoleOnSignup(assignUserRoleMock, hasRoleAssignmentMock);
    const afterHook = plugin.init()?.options?.databaseHooks?.session?.create?.after;

    await afterHook!({});

    expect(assignUserRoleMock).not.toHaveBeenCalled();
  });

  it("does not replace an existing role", async () => {
    hasRoleAssignmentMock.mockResolvedValueOnce(true);

    const { defaultUserRoleOnSignup } = await import(
      "../../../packages/auth/src/lib/default-user-role.server.ts"
    );

    const plugin = defaultUserRoleOnSignup(assignUserRoleMock, hasRoleAssignmentMock);
    const afterHook = plugin.init()?.options?.databaseHooks?.session?.create?.after;

    await afterHook!({ userId: "owner-123" });

    expect(assignUserRoleMock).not.toHaveBeenCalled();
  });
});
