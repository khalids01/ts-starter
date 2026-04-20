import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "@env/web";

import { authClient } from "@/lib/auth-client";
import type { ClientSession } from "@/features/user/lib/client-session";

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

      return {
        user: {
          id: String(user.id ?? ""),
          name: String(user.name ?? ""),
          email: String(user.email ?? ""),
          role: String(user.role ?? "USER"),
          onboardingComplete: Boolean(user.onboardingComplete),
          plan: typeof user.plan === "string" ? user.plan : null,
          subscriptionStatus:
            typeof user.subscriptionStatus === "string"
              ? user.subscriptionStatus
              : null,
        },
      } satisfies NonNullable<ClientSession>;
    } catch {
      return null;
    }
  },
);
