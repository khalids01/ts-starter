import type { ClientSession } from "@auth/client";
import { Permissions, Roles } from "@rbac";
import { sessionHasPermission } from "@/features/user/lib/session-permissions";

export function isPlatformOwner(session: ClientSession | null | undefined) {
  return session?.primaryRoleSlug === Roles.PlatformOwner;
}

export function sessionHasAnyPermissionPrefix(
  permissions: readonly string[] | undefined,
  prefix: string,
) {
  return (permissions ?? []).some((permission) => permission.startsWith(prefix));
}

export function canShowAdminNavItem(
  session: ClientSession | null | undefined,
  config: { permissionPrefix?: string; always?: boolean },
) {
  if (config.always) {
    return true;
  }

  if (isPlatformOwner(session)) {
    return true;
  }

  if (config.permissionPrefix) {
    return sessionHasAnyPermissionPrefix(
      session?.permissions,
      config.permissionPrefix,
    );
  }

  return false;
}

export function canAccessAdminRolesList(session: ClientSession | null | undefined) {
  if (isPlatformOwner(session)) {
    return true;
  }

  const permissions = session?.permissions ?? [];
  return (
    sessionHasPermission(permissions, Permissions.AdminRolesList) ||
    sessionHasAnyPermissionPrefix(permissions, "admin.roles.")
  );
}

export function canAccessAdminRolesRead(session: ClientSession | null | undefined) {
  if (isPlatformOwner(session)) {
    return true;
  }

  const permissions = session?.permissions ?? [];
  return (
    sessionHasPermission(permissions, Permissions.AdminRolesRead) ||
    sessionHasPermission(permissions, Permissions.AdminRolesList) ||
    sessionHasAnyPermissionPrefix(permissions, "admin.roles.")
  );
}

export function canAccessAdminCatalogRead(session: ClientSession | null | undefined) {
  if (isPlatformOwner(session)) {
    return true;
  }

  const permissions = session?.permissions ?? [];
  return (
    sessionHasPermission(permissions, Permissions.AdminCatalogRead) ||
    sessionHasPermission(permissions, Permissions.AdminCatalogManage) ||
    sessionHasAnyPermissionPrefix(permissions, "admin.catalog.")
  );
}

export function canAccessAdminOrdersRead(session: ClientSession | null | undefined) {
  if (isPlatformOwner(session)) {
    return true;
  }

  const permissions = session?.permissions ?? [];
  return (
    sessionHasPermission(permissions, Permissions.AdminOrdersRead) ||
    sessionHasPermission(permissions, Permissions.AdminOrdersManage) ||
    sessionHasAnyPermissionPrefix(permissions, "admin.orders.")
  );
}

export function canAccessAdminImagesRead(session: ClientSession | null | undefined) {
  if (isPlatformOwner(session)) {
    return true;
  }

  const permissions = session?.permissions ?? [];
  return (
    sessionHasPermission(permissions, Permissions.AdminImagesRead) ||
    sessionHasPermission(permissions, Permissions.AdminImagesManage) ||
    sessionHasAnyPermissionPrefix(permissions, "admin.images.")
  );
}

export function canShowUsersNav(session: ClientSession | null | undefined) {
  return canShowAdminNavItem(session, { permissionPrefix: "admin.users." });
}

export function canShowRolesNav(session: ClientSession | null | undefined) {
  if (isPlatformOwner(session)) {
    return true;
  }

  return sessionHasAnyPermissionPrefix(session?.permissions, "admin.roles.");
}

export function canShowFeedbackNav(session: ClientSession | null | undefined) {
  return (
    isPlatformOwner(session) ||
    sessionHasPermission(session?.permissions ?? [], Permissions.FeedbackModerate)
  );
}

export function canShowRateLimitsNav(session: ClientSession | null | undefined) {
  return (
    isPlatformOwner(session) ||
    sessionHasPermission(session?.permissions ?? [], Permissions.AdminRateLimitManage)
  );
}

export function canShowVisitorsNav(session: ClientSession | null | undefined) {
  return (
    isPlatformOwner(session) ||
    sessionHasPermission(session?.permissions ?? [], Permissions.AdminVisitorsRead)
  );
}

export function canShowActivityNav(session: ClientSession | null | undefined) {
  return (
    isPlatformOwner(session) ||
    sessionHasPermission(session?.permissions ?? [], Permissions.AdminActivityRead)
  );
}

export function canShowWebhooksNav(session: ClientSession | null | undefined) {
  return (
    isPlatformOwner(session) ||
    sessionHasPermission(session?.permissions ?? [], Permissions.AdminWebhooksRead)
  );
}

export function canShowCatalogNav(session: ClientSession | null | undefined) {
  return canShowAdminNavItem(session, { permissionPrefix: "admin.catalog." });
}

export function canShowProductsNav(session: ClientSession | null | undefined) {
  return canShowAdminNavItem(session, { permissionPrefix: "admin.products." });
}

export function canShowInventoryNav(session: ClientSession | null | undefined) {
  return canShowAdminNavItem(session, { permissionPrefix: "admin.inventory." });
}

export function canShowOrdersNav(session: ClientSession | null | undefined) {
  return canShowAdminNavItem(session, { permissionPrefix: "admin.orders." });
}

export function canShowImagesNav(session: ClientSession | null | undefined) {
  return canShowAdminNavItem(session, { permissionPrefix: "admin.images." });
}
