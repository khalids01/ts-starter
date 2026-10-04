import { assertBuildBrand } from "../../../packages/config/src/brand.config";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { serveBuiltClient } from "./serve-built-client";

const buildDirectory = resolve(
  process.env.WEB_BUILD_DIR ?? resolve(import.meta.dir, "../dist"),
);
const manifest = await Bun.file(resolve(buildDirectory, "brand.json")).json();
if (manifest.version !== 1)
  throw new Error("Unsupported web brand manifest; rebuild the web app");
assertBuildBrand(manifest.brand, process.env.BRAND);
const port = Number(process.env.VITE_PORT ?? process.env.PORT ?? "3001");
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid web port");
const entry = await import(
  pathToFileURL(resolve(buildDirectory, "server/server.js")).href
);
const server = Bun.serve({
  hostname: process.env.HOST ?? "0.0.0.0",
  port,
  async fetch(request) {
    const asset = await serveBuiltClient(
      request,
      resolve(buildDirectory, "client"),
    );
    if (asset) return asset;
    const response = await entry.default.fetch(request);
    // Vite's Node-targeted H3 output can return a Response-compatible NodeResponse.
    return response instanceof Response
      ? response
      : new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
  },
  error() {
    return new Response("Internal server error", { status: 500 });
  },
});
console.log(`Web server is running on port ${port}`);
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 30_000);
  deadline.unref();
  await server.stop(false);
  clearTimeout(deadline);
  process.exit(0);
}
process.once("SIGTERM", () => void shutdown());
process.once("SIGINT", () => void shutdown());
