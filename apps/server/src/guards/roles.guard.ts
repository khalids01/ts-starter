import { auth } from "@/modules/auth/auth.service";
import type { Role } from "@db";
import { getAccountStatusRejection } from "./account-status";

type RolesGuardContext = {
  request: Request;
  set: {
    status?: number | string;
  };
  user?: {
    role?: Role | string | null;
    banned?: boolean | null;
    archived?: boolean | null;
  } | null;
};

/**
 * Elysia beforeHandle guard to allow access only for specified roles.
 * - Retrieves session via Better Auth using request headers.
 * - Returns 401 if unauthenticated.
 * - Returns 403 if role is not allowed. Admin always passes.
 */
export const rolesGuard =
  (allowed: Role[]) => async (ctx: RolesGuardContext) => {
    // Prefer derived values from sessionCache middleware if available
    const derivedUser = ctx.user as { role?: Role; banned?: boolean; archived?: boolean } | undefined;
    if (derivedUser?.role) {
      const rejection = getAccountStatusRejection(derivedUser);
      if (rejection) {
        ctx.set.status = rejection.status;
        return rejection;
      }

      const role = derivedUser.role as Role;
      if (role === "ADMIN") return; // admin bypass
      if (!allowed.includes(role)) {
        ctx.set.status = 403;
        return { message: "Forbidden", status: 403 };
      }
      return;
    }

    const session = await auth.api.getSession({ headers: ctx.request.headers });
    if (!session) {
      ctx.set.status = 401;
      return { message: "Unauthorized", status: 401 };
    }

    const rejection = getAccountStatusRejection(session.user);
    if (rejection) {
      ctx.set.status = rejection.status;
      return rejection;
    }

    const role = session.user.role as Role | undefined;
    if (!role) {
      ctx.set.status = 401;
      return { message: "Unauthorized", status: 401 };
    }

    if (role === "ADMIN") return; // admin bypass
    if (!allowed.includes(role)) {
      ctx.set.status = 403;
      return { message: "Forbidden", status: 403 };
    }

    // proceed
    return;
  };
