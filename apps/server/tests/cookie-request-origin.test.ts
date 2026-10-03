import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { cookieRequestOriginPlugin } from "../src/plugins/cookie-request-origin";

function harness() {
  let mutations = 0;
  const app = new Elysia().use(cookieRequestOriginPlugin(["https://shop.example.test", "https://api.example.test/api/auth"]))
    .use(new Elysia().post("/admin/mutation", () => { mutations++; return "changed"; }))
    .get("/public", () => "read")
    .options("/admin/mutation", () => new Response(null, { status: 204 }));
  return { app, count: () => mutations };
}

describe("cookie-authenticated mutation origins", () => {
  it("rejects foreign/null origins and cross-site metadata before nested route execution", async () => {
    const { app, count } = harness();
    for (const headers of [
      { origin: "https://attacker.example.test" }, { origin: "null" },
      { origin: "https://shop.example.test.evil.example" }, { "sec-fetch-site": "cross-site" },
    ]) {
      const response = await app.handle(new Request("https://api.example.test/admin/mutation", {
        method: "POST", headers: { cookie: "fictional=session", ...headers },
      }));
      expect(response.status).toBe(403);
    }
    expect(count()).toBe(0);
  });

  it("allows trusted origins, server-to-server calls and signed cookie-free callbacks", async () => {
    const { app, count } = harness();
    for (const headers of [
      { cookie: "fictional=session", origin: "https://shop.example.test", "sec-fetch-site": "cross-site" },
      { cookie: "fictional=session", origin: "https://api.example.test" },
      { cookie: "fictional=session" },
      { authorization: "Bearer fictional-provider-token" },
    ]) {
      expect((await app.handle(new Request("https://api.example.test/admin/mutation", { method: "POST", headers }))).status).toBe(200);
    }
    expect(count()).toBe(4);
  });

  it("preserves safe reads and preflight", async () => {
    const { app } = harness();
    expect((await app.handle(new Request("https://api.example.test/public", { headers: { cookie: "fictional=session", origin: "https://attacker.example.test" } }))).status).toBe(200);
    expect((await app.handle(new Request("https://api.example.test/admin/mutation", { method: "OPTIONS", headers: { cookie: "fictional=session", origin: "https://attacker.example.test" } }))).status).toBe(204);
  });
});
