import { Elysia } from "elysia";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** CORS restricts response access; cookie-authenticated mutations also need CSRF checks. */
export function cookieRequestOriginPlugin(trustedUrls: readonly string[]) {
  const trustedOrigins = new Set(trustedUrls.map((url) => new URL(url).origin));
  return new Elysia({ name: "cookie-request-origin" }).onRequest(({ request, set }) => {
    if (SAFE_METHODS.has(request.method) || !request.headers.get("cookie")) return;
    const origin = request.headers.get("origin");
    const crossSiteWithoutOrigin = !origin && request.headers.get("sec-fetch-site") === "cross-site";
    if ((origin !== null && !trustedOrigins.has(origin)) || crossSiteWithoutOrigin) {
      set.status = 403;
      return { message: "Forbidden", status: 403 };
    }
  });
}
