import type { Permission, RoleSlug, SessionRoleSummary } from "@rbac";

export type AuthClientSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  banned: boolean;
  banReason: string | null;
  archived: boolean;
  onboardingComplete: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  twoFactorEnabled?: boolean | null;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  token: string;
};

export type AuthClientSession = {
  user: AuthClientSessionUser;
  session: AuthSessionRecord;
  permissions: Permission[];
  roles: SessionRoleSummary[];
  primaryRoleSlug: RoleSlug;
  primaryRoleId: string | null;
};

export type ClientSessionUser = Pick<
  AuthClientSessionUser,
  "id" | "name" | "email" | "image" | "onboardingComplete" | "plan" | "subscriptionStatus" | "twoFactorEnabled"
>;

export type ClientSession = {
  user: ClientSessionUser;
  permissions: Permission[];
  roles: SessionRoleSummary[];
  primaryRoleSlug: RoleSlug;
  primaryRoleId: string | null;
};

export type ClientSessionResult = ClientSession | null;

/**
 * Removes server-only session fields before exposing session data to the web app.
 * This module is intentionally isomorphic: root-route SSR needs the same
 * normalization as the browser session hook.
 */
export function toClientSession(
  session: AuthClientSession | null | undefined,
): ClientSessionResult {
  if (!session?.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
      onboardingComplete: session.user.onboardingComplete,
      plan: session.user.plan ?? null,
      subscriptionStatus: session.user.subscriptionStatus ?? null,
      twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
    },
    permissions: session.permissions,
    roles: session.roles,
    primaryRoleSlug: session.primaryRoleSlug,
    primaryRoleId: session.primaryRoleId,
  };
}
