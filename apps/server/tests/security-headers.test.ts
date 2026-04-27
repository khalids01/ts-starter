import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { securityHeadersPlugin } from "../src/plugins/security-headers";

describe("security headers", () => {
  it("sets baseline security headers", async () => {
    const app = new Elysia()
      .use(securityHeadersPlugin())
      .get("/", () => ({ ok: true }));

    const response = await app.handle(new Request("http://localhost/"));

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("permissions-policy")).toBe(
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
    expect(response.headers.get("content-security-policy")).toBe(
      "frame-ancestors 'none'",
    );
    expect(response.headers.get("strict-transport-security")).toBeNull();
  });

  it("sets HSTS only for production", async () => {
    const app = new Elysia()
      .use(securityHeadersPlugin({ production: true }))
      .get("/", () => ({ ok: true }));

    const response = await app.handle(new Request("http://localhost/"));

    expect(response.headers.get("strict-transport-security")).toBe(
      "max-age=31536000; includeSubDomains",
    );
  });
});

