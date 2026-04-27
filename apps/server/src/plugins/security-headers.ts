import { Elysia } from "elysia";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Content-Security-Policy": "frame-ancestors 'none'",
} as const;

const PRODUCTION_SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
} as const;

type SecurityHeadersOptions = {
  production?: boolean;
};

export function securityHeadersPlugin(options: SecurityHeadersOptions = {}) {
  return new Elysia({ name: "security-headers" }).onRequest(({ set }) => {
    Object.assign(set.headers, SECURITY_HEADERS);

    if (options.production) {
      Object.assign(set.headers, PRODUCTION_SECURITY_HEADERS);
    }
  });
}

