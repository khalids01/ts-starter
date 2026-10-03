import { expect, request as playwrightRequest, test } from "@playwright/test";
import { e2eRuntimeConfig } from "../../../packages/config/src/e2e.config";

test("security headers and cross-origin policy are enforced", async ({ request }) => {
  const response = await request.get(`${e2eRuntimeConfig.serverUrl}/`);
  expect(response.ok()).toBeTruthy();
  const contentSecurityPolicy = response.headers()["content-security-policy"];
  expect(contentSecurityPolicy).toContain("default-src 'none'");
  expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");

  const preflight = await request.fetch(`${e2eRuntimeConfig.serverUrl}/admin/products`, {
    method: "OPTIONS",
    headers: {
      origin: "https://attacker.example.test",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
  });
  expect(preflight.headers()["access-control-allow-origin"]).not.toBe("https://attacker.example.test");
});

test("anonymous callers cannot reach protected admin reads or mutations", async () => {
  const anonymous = await playwrightRequest.newContext({
    baseURL: e2eRuntimeConfig.serverUrl,
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: { cookie: "" },
  });
  try {
    const responses = await Promise.all([
      anonymous.get("/admin/customers"),
      anonymous.get("/admin/orders"),
      anonymous.post("/admin/products", {
        data: { categoryId: "forbidden", name: "Forbidden product" },
      }),
      anonymous.post("/admin/roles", {
        data: { slug: "guest-escalation", name: "Guest escalation" },
      }),
    ]);
    const labels = ["customers read", "orders read", "product creation", "role creation"];
    for (const [index, response] of responses.entries()) {
      expect(
        [401, 403],
        `${labels[index]} returned ${response.status()}: ${await response.text()}`,
      ).toContain(response.status());
    }
  } finally {
    await anonymous.dispose();
  }
});

test("oversized bodies and hostile public input fail without server errors", async ({ request }) => {
  const oversized = await request.post(`${e2eRuntimeConfig.serverUrl}/shop/checkout`, {
    headers: { "content-type": "application/json" },
    data: { padding: "x".repeat(1_100_000) },
  });
  expect(oversized.status()).toBe(413);

  const hostile = await request.get(`${e2eRuntimeConfig.serverUrl}/shop/products/${encodeURIComponent("' OR 1=1 --")}`);
  expect(hostile.status()).toBeLessThan(500);
});

test("cross-origin sign-out and forged session cookies fail without revoking the owner session", async ({ request }) => {
  const denied = await request.post(`${e2eRuntimeConfig.serverUrl}/api/auth/sign-out`, {
    headers: { origin: "https://attacker.example.test" }, data: {},
  });
  expect(denied.status()).toBe(403);
  const session = await request.get(`${e2eRuntimeConfig.serverUrl}/api/auth/get-session`);
  expect(session.status()).toBe(200);
  expect((await session.json())?.user?.id).toBeTruthy();
  const forged = await playwrightRequest.newContext({
    baseURL: e2eRuntimeConfig.serverUrl, storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: { cookie: "better-auth.session_token=fictional-forged-session.invalid-signature" },
  });
  try {
    expect([401, 403]).toContain((await forged.get("/admin/orders")).status());
    expect(await (await forged.get("/api/auth/get-session")).json()).toBeNull();
  } finally { await forged.dispose(); }
});
