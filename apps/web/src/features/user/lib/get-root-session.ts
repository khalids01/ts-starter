import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Roles } from "@rbac";
import { env } from "@env/web";

import { authClient } from "@/lib/auth-client";
import type {
  ClientSession,
  SessionRole,
} from "@/features/user/lib/client-session";

export const getRootSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const cookieHeader = String(headers.get("cookie") ?? "");
    const sessionCookieName = env.AUTH_SESSION_COOKIE_NAME;

    const hasSessionCookie = cookieHeader
      .split(";")
      .some((cookie: string) =>
        cookie.trim().startsWith(`${sessionCookieName}=`),
      );

    if (!hasSessionCookie) {
      return null;
    }

    try {
      const session = await authClient.getSession({
        fetchOptions: {
          headers,
          throw: true,
        },
      });

      if (!session?.user) {
        return null;
      }

      const user = session.user as Record<string, unknown>;

      let permissions: string[] = [];
      let roles: SessionRole[] = [];
      let primaryRoleSlug = Roles.PlatformUser;

      try {
        const contextResponse = await fetch(
          `${env.VITE_SERVER_URL}/session/context`,
          {
            headers,
            credentials: "include",
          },
        );

        if (contextResponse.ok) {
          const context = (await contextResponse.json()) as {
            permissions?: string[];
            roles?: Array<{ slug: string; name: string }>;
            primaryRoleSlug?: string;
          };
          permissions = Array.isArray(context.permissions)
            ? context.permissions
            : [];
          roles = Array.isArray(context.roles) ? context.roles : [];
          primaryRoleSlug =
            typeof context.primaryRoleSlug === "string"
              ? context.primaryRoleSlug
              : roles[0]?.slug ?? Roles.PlatformUser;
        }
      } catch {
        permissions = [];
      }

      return {
        user: {
          id: String(user.id ?? ""),
          name: String(user.name ?? ""),
          email: String(user.email ?? ""),
          onboardingComplete: Boolean(user.onboardingComplete),
          plan: typeof user.plan === "string" ? user.plan : null,
          subscriptionStatus:
            typeof user.subscriptionStatus === "string"
              ? user.subscriptionStatus
              : null,
        },
        permissions,
        roles,
        primaryRoleSlug,
      } satisfies NonNullable<ClientSession>;
    } catch {
      return null;
    }
  },
);
