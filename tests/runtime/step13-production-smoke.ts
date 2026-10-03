import { assertTestEnvironment } from "../setup/assert-test-environment";
import { step13ProductionEnv } from "./step13-env";
import { mkdir, chmod, symlink } from "node:fs/promises";
import { resolve } from "node:path";
import { TEST_USERS } from "../users-config";

const target = assertTestEnvironment();
if (target.isRemote || target.databaseName !== "e2e_v3_step10_20261003_03043274") throw new Error("Step 13 requires the recorded isolated database");
const artifacts = resolve("tests/artifacts/step13");
await mkdir(artifacts, { recursive: true });
const safeEnv = step13ProductionEnv(artifacts);
const envFile = resolve(artifacts, "production-local.env");
await Bun.write(envFile, Object.entries(safeEnv).map(([key, value]) => `${key}=${value}`).join("\n") + "\n");
await chmod(envFile, 0o600);
async function command(args: string[], cwd: string, log: string) {
  await Bun.write(resolve(artifacts, log), "");
  const output = Bun.file(resolve(artifacts, log));
  const child = Bun.spawn(args, { cwd, env: safeEnv, stdout: output, stderr: output });
  if (await child.exited !== 0) throw new Error(`Step 13 ${log} failed; inspect the ignored log`);
}
await command([process.execPath, "build", "--compile", "--minify", "--sourcemap", "./src/index.ts", "--outfile", resolve(artifacts, "api")], resolve("apps/server"), "compile.txt");
await command(["node", resolve("apps/web/node_modules/vite/bin/vite.js"), "build", "--outDir", safeEnv.WEB_BUILD_DIR!], resolve("apps/web"), "web-build.txt");

// Reproduce the normal apps/web/dist -> apps/web/node_modules dependency layout.
if (!await Bun.file(resolve(safeEnv.WEB_BUILD_DIR!, "node_modules/lucide-react/package.json")).exists()) {
  await symlink(resolve("apps/web/node_modules"), resolve(safeEnv.WEB_BUILD_DIR!, "node_modules"));
}
for (const log of ["api.txt", "api-stderr.txt", "api-restart.txt", "api-restart-stderr.txt", "web.txt", "web-stderr.txt"]) await Bun.write(resolve(artifacts, log), "");
const { default: db } = await import("../../packages/db/src/client.server");
const existing = await db.rateLimitSettings.findUnique({ where: { id: "default" } });
const patch = { enabled: true, publicEnabled: true, publicWindowSeconds: 2, publicMaxRequests: 2 };
await db.rateLimitSettings.upsert({ where: { id: "default" }, create: { id: "default", ...patch }, update: patch });
let api: ReturnType<typeof Bun.spawn> | undefined;
let web: ReturnType<typeof Bun.spawn> | undefined;
const checks: string[] = [];
function requireCheck(condition: unknown, label: string) {
  if (!condition) throw new Error(label);
  checks.push(label);
}
async function ready(url: string) {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return; } catch {}
    await Bun.sleep(100);
  }
  throw new Error("Step 13 service did not become ready");
}
async function stop(child: typeof api) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const exited = await Promise.race([child.exited, new Promise<number>((resolve) => { timer = setTimeout(() => resolve(-1), 35000); })]);
  clearTimeout(timer);
  if (exited === -1) { child.kill("SIGKILL"); throw new Error("Step 13 shutdown deadline exceeded"); }
  requireCheck(exited === 0, "Runtime exits cleanly on SIGTERM");
}
try {
  api = Bun.spawn([resolve(artifacts, "api")], { env: safeEnv, stdout: Bun.file(resolve(artifacts, "api.txt")), stderr: Bun.file(resolve(artifacts, "api-stderr.txt")) });
  await ready("http://localhost:3013/health/live");
  web = Bun.spawn([process.execPath, resolve("apps/web/scripts/production-server.ts")], { env: safeEnv, stdout: Bun.file(resolve(artifacts, "web.txt")), stderr: Bun.file(resolve(artifacts, "web-stderr.txt")) });
  // Liveness avoids populating the limiter's DB-backed settings cache.
  const statuses: number[] = [];
  for (let i = 0; i < 3; i++) statuses.push((await fetch("http://localhost:3013/shop/settings")).status);
  requireCheck(statuses[0] === 200 && statuses[1] === 200 && statuses[2] === 429, "Production app limiter enforces a real Redis window");
  await Bun.sleep(2100);
  requireCheck((await fetch("http://localhost:3013/shop/settings")).status === 200, "Production limiter window recovers");
  // Restore normal thresholds and wait for the existing ten-second settings cache.
  await db.rateLimitSettings.update({ where: { id: "default" }, data: { publicMaxRequests: existing?.publicMaxRequests ?? 60, publicWindowSeconds: existing?.publicWindowSeconds ?? 60 } });
  await Bun.sleep(10000);
  await ready("http://localhost:3014/shop");
  const html = await (await fetch("http://localhost:3014/shop")).text();
  await Bun.write(resolve(artifacts, "shop-response.html"), html);
  requireCheck(html.includes("<!DOCTYPE html>") || html.includes("<!doctype html>"), "Production web entry returns SSR HTML");
  const asset = html.match(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/)?.[1];
  requireCheck(asset, "SSR references built client assets");
  const response = await fetch("http://localhost:3014" + asset);
  requireCheck(response.ok && response.headers.get("cache-control")?.includes("immutable"), "Production web serves immutable built assets");
  const login = await fetch("http://localhost:3013/api/auth/sign-in/email", { method: "POST", headers: { "content-type": "application/json", origin: safeEnv.CORS_ORIGIN! }, body: JSON.stringify({ email: TEST_USERS.owner.email, password: TEST_USERS.owner.password }) });
  requireCheck(login.ok, "Production auth accepts the verified fictional persona");
  const cookies = login.headers.getSetCookie();
  requireCheck(cookies.some((cookie) => /Secure/i.test(cookie) && /HttpOnly/i.test(cookie)), "Production session cookies are Secure and HttpOnly");
  requireCheck(cookies.some((cookie) => /SameSite=None/i.test(cookie)), "Production cross-site cookie policy is explicit");
  const cookie = cookies.map((value) => value.split(";")[0]).join("; ");
  requireCheck((await fetch("http://localhost:3013/admin/orders", { headers: { cookie } })).ok, "Production cookie authenticates an admin read");
  const dashboard = await fetch("http://localhost:3014/dashboard", { headers: { cookie }, redirect: "manual", signal: AbortSignal.timeout(10000) });
  const dashboardHtml = await dashboard.text();
  requireCheck(dashboard.ok && dashboardHtml.includes(TEST_USERS.owner.email), "Authenticated SSR forwards the production session");
  requireCheck((await fetch("http://localhost:3014/", { signal: AbortSignal.timeout(10000) })).ok, "Production web root renders");
  await stop(web); web = undefined;
  await stop(api); api = undefined;
  // Restart the actual compiled binary and verify auth persistence, without courier network calls.
  api = Bun.spawn([resolve(artifacts, "api")], { env: safeEnv, stdout: Bun.file(resolve(artifacts, "api-restart.txt")), stderr: Bun.file(resolve(artifacts, "api-restart-stderr.txt")) });
  await ready("http://localhost:3013/health/live");
  requireCheck((await fetch("http://localhost:3013/admin/orders", { headers: { cookie } })).ok, "Session survives compiled API restart");
  await stop(api); api = undefined;
  await Bun.write(resolve(artifacts, "smoke.json"), JSON.stringify({ checks, productionMode: true, courierWorkers: "disabled", capacityTest: "not run" }, null, 2));
  console.log(`Step 13 production smoke: ${checks.length} checks passed`);
} finally {
  const cleanup = await Promise.allSettled([stop(web), stop(api)]);
  if (existing) {
    const { id, updatedAt, ...data } = existing;
    await db.rateLimitSettings.update({ where: { id }, data });
  } else await db.rateLimitSettings.delete({ where: { id: "default" } });
  await db.$disconnect();
  if (cleanup.some((result) => result.status === "rejected")) throw new Error("Step 13 subprocess cleanup failed");
}
