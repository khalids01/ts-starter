import { Permissions } from "@rbac";
import type { ClientSession } from "@auth/client";
import { sessionHasPermission } from "@/features/user/lib/session-permissions";

export function isOwnAssignedRole(
  session: ClientSession | null | undefined,
  roleId: string,
) {
  return session?.primaryRoleId === roleId;
}

export function canEditRolePermissions(
  session: ClientSession | null | undefined,
  role: { id: string; isProtected: boolean },
) {
  if (!session) {
    return false;
  }

  if (role.isProtected || isOwnAssignedRole(session, role.id)) {
    return false;
  }

  return sessionHasPermission(session.permissions, Permissions.AdminRolesUpdate);
}

export function canManageRoles(
  session: ClientSession | null | undefined,
  role: { id: string; isProtected: boolean },
) {
  if (!session) {
    return false;
  }

  if (role.isProtected || isOwnAssignedRole(session, role.id)) {
    return false;
  }

  return sessionHasPermission(session.permissions, Permissions.AdminRolesManage);
}
