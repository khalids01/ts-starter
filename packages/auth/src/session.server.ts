import { splitSetCookieHeader } from "better-auth/cookies";
import { auth } from "./auth-instance.server";

export type AuthGetSessionResult = Awaited<
  ReturnType<typeof auth.api.getSession>
>;

export type AuthSessionData = NonNullable<AuthGetSessionResult>;

export type AuthUser = AuthSessionData["user"];

export type AuthResponseHeadersHandler = (headers: Headers) => void;

export function getSetCookieHeaders(headers: Headers): string[] {
  const nativeCookies = (headers as Headers & {
    getSetCookie?: () => string[];
  }).getSetCookie?.();
  const cookies = nativeCookies ??
    (headers.get("set-cookie") ? [headers.get("set-cookie")!] : []);

  return cookies.flatMap(splitSetCookieHeader);
}

export async function handleAuthRequest(request: Request): Promise<Response> {
  const response = await auth.handler(request);
  const cookies = getSetCookieHeaders(response.headers);

  if (cookies.length === 0) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append("set-cookie", cookie);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function getAuthSession(
  headers: Headers,
  onResponseHeaders?: AuthResponseHeadersHandler,
): Promise<AuthGetSessionResult> {
  const result = await auth.api.getSession({
    headers,
    returnHeaders: true,
  });

  onResponseHeaders?.(result.headers);
  return result.response;
}
