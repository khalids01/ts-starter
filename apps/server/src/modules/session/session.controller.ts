import { Elysia } from "elysia";
import { Roles, toPermissionArray } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { loadUserRoles } from "@/rbac/resolve/load-user-roles";

export const sessionController = new Elysia({
  prefix: "/session",
  detail: { tags: ["Session"] },
})
  .use(authGuard)
  .get(
    "/context",
    async ({ user, permissions, userId }) => {
      if (!user || !userId) {
        return { user: null, permissions: [], roles: [] };
      }

      const roles = await loadUserRoles(userId);
      const primaryRoleSlug = roles[0]?.slug ?? Roles.PlatformUser;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingComplete: Boolean(
            (user as { onboardingComplete?: boolean }).onboardingComplete,
          ),
          plan:
            typeof (user as { plan?: string }).plan === "string"
              ? (user as { plan?: string }).plan
              : null,
          subscriptionStatus:
            typeof (user as { subscriptionStatus?: string }).subscriptionStatus ===
            "string"
              ? (user as { subscriptionStatus?: string }).subscriptionStatus
              : null,
        },
        permissions: toPermissionArray(permissions ?? new Set()),
        roles,
        primaryRoleSlug,
      };
    },
    {
      detail: { summary: "Authenticated session context with permissions" },
    },
  );
