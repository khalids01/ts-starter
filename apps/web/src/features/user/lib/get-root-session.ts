import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "@env/web";

import { authClient } from "@/lib/auth-client";

export const getRootSession = createServerFn({ method: "GET" }).handler(async () => {
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
    return session;
  } catch {
    return null;
  }
});
