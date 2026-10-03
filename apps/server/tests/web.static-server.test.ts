import { afterAll, expect, it } from "bun:test";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serveBuiltClient } from "../../web/scripts/serve-built-client";
const directory = await mkdtemp(join(tmpdir(), "shop-static-"));
await mkdir(join(directory, "assets"));
await Bun.write(join(directory, "assets/app-12345678.js"), "console.log('fictional');");
afterAll(() => rm(directory, { recursive: true, force: true }));
it("serves built assets with MIME/cache headers and HEAD without a body", async () => {
  const get = await serveBuiltClient(new Request("http://localhost/assets/app-12345678.js"), directory);
  expect(get?.status).toBe(200);
  expect(get?.headers.get("cache-control")).toContain("immutable");
  expect(get?.headers.get("content-type")).toContain("javascript");
  const head = await serveBuiltClient(new Request("http://localhost/assets/app-12345678.js", { method: "HEAD" }), directory);
  expect(await head?.text()).toBe("");
});
it("rejects encoded traversal and lets SSR handle missing routes and mutations", async () => {
  expect((await serveBuiltClient(new Request("http://localhost/%2e%2e%2fsecret.env"), directory))?.status).toBe(404);
  expect(await serveBuiltClient(new Request("http://localhost/"), directory)).toBeNull();
  expect(await serveBuiltClient(new Request("http://localhost/shop"), directory)).toBeNull();
  expect(await serveBuiltClient(new Request("http://localhost/shop", { method: "POST" }), directory)).toBeNull();
});
