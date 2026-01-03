import { auth } from "@/modules/auth/auth.service";
import type { Role } from "@ts-starter/db";

/**
 * Elysia beforeHandle guard to allow access only for specified roles.
 * - Retrieves session via Better Auth using request headers.
 * - Returns 401 if unauthenticated.
 * - Returns 403 if role is not allowed. Admin always passes.
 */
export const rolesGuard = (allowed: Role[]) =>
    async (ctx: any) => {
        // Prefer derived values from sessionCache middleware if available
        const derivedUser = ctx.user as { role?: Role } | undefined;
        if (derivedUser?.role) {
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
