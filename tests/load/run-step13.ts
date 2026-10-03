import { assertTestEnvironment } from "../setup/assert-test-environment";
import { resolve } from "node:path";
import { step13ProductionEnv } from "../runtime/step13-env";
import { startCapacityMetrics } from "./capacity-metrics";
import { checkStep13Invariants } from "./check-step13-invariants";
if (process.env.STEP13_LOAD_APPROVED !== "true") throw new Error("Explicit capacity target, dataset and profile approval required before load execution");
const target = assertTestEnvironment();
if (target.isRemote || !target.databaseName.startsWith("e2e_v3_step13_capacity_") || process.env.STEP13_CAPACITY_DATABASE !== target.databaseName) throw new Error("A separate fictional capacity database is required; the retained correctness DB is excluded");
if (process.env.STEP13_LOAD_LIMIT_POLICY !== "isolated-headroom") throw new Error("Explicit isolated capacity rate-limit policy approval required; merchant defaults are not changed");
const profile = process.env.STEP13_LOAD_PROFILE;
if (!["smoke", "volume", "expected", "peak", "soak"].includes(profile ?? "")) throw new Error("Invalid capacity profile");
if (process.env.STEP13_LOAD_TARGET !== "http://localhost:3013") throw new Error("Reviewed local API target required");
const path = process.env.STEP13_LOAD_FIXTURES;
if (!path || !resolve(path).startsWith(resolve("tests/artifacts/step13") + "/")) throw new Error("Ignored Step 13 fixture manifest required");
const fixture = await Bun.file(path).json();
if (fixture.databaseName !== target.databaseName || fixture.target !== process.env.STEP13_LOAD_TARGET ||
    fixture.datasetVersion !== 1 || !/^[a-z0-9_-]{1,32}$/.test(fixture.runId ?? "") || !fixture.checkoutVariants?.length || !fixture.shippingRateId || !fixture.adminSessionCookie) throw new Error("Incomplete capacity fixture manifest");
const { default: db } = await import("../../packages/db/src/client.server");
let runtime: ReturnType<typeof Bun.spawn> | undefined;
let metrics: Awaited<ReturnType<typeof startCapacityMetrics>> | undefined;
let originalLimits: Awaited<ReturnType<typeof db.rateLimitSettings.findUnique>> | undefined;
let limitsChanged = false;
try {
  const [customers, orders, products, variants] = await Promise.all([db.ecommerceCustomer.count(), db.order.count(), db.product.count(), db.productVariant.count()]);
  if (customers < 10000 || orders < 25000 || products < 1000 || variants < 3000) throw new Error("The agreed Step 8.5 dataset is not prepared");
  const nonFictional = await db.ecommerceCustomer.count({ where: { email: { not: { endsWith: ".example.test" } } } });
  if (nonFictional) throw new Error("The capacity database contains non-fictional customer addresses");
  const apiHash = new Bun.CryptoHasher("sha256").update(await Bun.file("tests/artifacts/step13/api").arrayBuffer()).digest("hex");
  const scriptHash = new Bun.CryptoHasher("sha256").update(await Bun.file("tests/load/step13-k6.js").arrayBuffer()).digest("hex");
  const before = await checkStep13Invariants(db);
  if (!before.passed) throw new Error("Pre-load invariants failed; inspect/reconcile the fictional dataset");
  originalLimits = await db.rateLimitSettings.findUnique({ where: { id: "default" } });
  const headroom = { enabled: true, publicEnabled: true, publicWindowSeconds: 60, publicMaxRequests: 10000, adminEnabled: true, adminWindowSeconds: 60, adminMaxRequests: 1000, specialEnabled: true, specialWindowSeconds: 60, specialMaxRequests: 1000, protectedEnabled: true, protectedWindowSeconds: 60, protectedMaxRequests: 1000 };
  await db.rateLimitSettings.upsert({ where: { id: "default" }, create: { id: "default", ...headroom }, update: headroom });
  limitsChanged = true;
  const executionId = crypto.randomUUID();
  const log = resolve(`tests/artifacts/step13/runtime-${fixture.runId}-${profile}-${executionId}.txt`);
  await Bun.write(log, "");
  runtime = Bun.spawn([resolve("tests/artifacts/step13/api")], {
    env: step13ProductionEnv(resolve("tests/artifacts/step13")), stdout: Bun.file(log), stderr: Bun.file(log),
  });
  let listening = false;
  for (let i = 0; i < 100; i++) {
    if (runtime.exitCode !== null) throw new Error("Capacity API failed to start; existing services are never reused");
    if ((await Bun.file(log).text()).includes("Server is running on http://localhost:3013")) { listening = true; break; }
    await Bun.sleep(100);
  }
  if (!listening) throw new Error("Capacity API startup deadline exceeded");
  const auth = await fetch("http://localhost:3013/api/auth/get-session", { headers: { cookie: fixture.adminSessionCookie }, redirect: "manual", signal: AbortSignal.timeout(5000) });
  const session = auth.ok ? await auth.json() : null;
  if (session?.user?.email !== fixture.adminEmail || !session?.user?.emailVerified) throw new Error("Manifest must authenticate the verified fictional admin in this capacity DB");
  await Bun.write(resolve(`tests/artifacts/step13/metadata-${fixture.runId}-${profile}-${executionId}.json`), JSON.stringify({ datasetVersion: fixture.datasetVersion, fixtureRunId: fixture.runId, fixtureBaseTime: fixture.baseTime, database: target.databaseTarget, apiSha256: apiHash, k6ScriptSha256: scriptHash, profile, executionId, limitPolicy: "isolated-headroom" }, null, 2));
  const summaryPath = resolve(`tests/artifacts/step13/capacity-${fixture.runId}-${profile}-${executionId}.json`);
  const config = resolve("tests/artifacts/step13/k6-local-config.json");
  await Bun.write(config, "{}");
  metrics = await startCapacityMetrics(db, runtime.pid, resolve(`tests/artifacts/step13/resources-${fixture.runId}-${profile}-${executionId}.json`));
  const result = Bun.spawn([process.env.STEP13_K6_BINARY ?? "k6", "run", "--address", "127.0.0.1:6565", "--config", config, "tests/load/step13-k6.js"], {
    env: { PATH: process.env.PATH!, K6_NO_USAGE_REPORT: "true", STEP13_LOAD_APPROVED: "true", STEP13_LOAD_TARGET: "http://localhost:3013", STEP13_LOAD_PROFILE: profile!, STEP13_LOAD_FIXTURES: resolve(path), STEP13_LOAD_SUMMARY: summaryPath, STEP13_LOAD_EXECUTION_ID: executionId }, stdout: "inherit", stderr: "inherit",
  });
  process.exitCode = await result.exited;
  const resources = await metrics.stop();
  metrics = undefined;
  if (resources.errors) process.exitCode = 1;
  const after = await checkStep13Invariants(db, before);
  const summary = await Bun.file(summaryPath).json();
  const persistedMatches = Number.isInteger(summary.checkoutPersisted) && after.ordersChecked - before.ordersChecked === summary.checkoutPersisted;
  await Bun.write(resolve(`tests/artifacts/step13/invariants-${fixture.runId}-${profile}-${executionId}.json`), JSON.stringify({ before, after, persistedMatches, limitPolicy: "isolated-headroom", workers: "paused", providers: "disabled" }, null, 2));
  if (!persistedMatches || !after.passed || after.expiredLeases > before.expiredLeases) process.exitCode = 1;
} finally {
  try { if (metrics) await metrics.stop(); }
  finally {
    try {
      if (runtime && runtime.exitCode === null) {
        runtime.kill("SIGTERM");
        let timer: ReturnType<typeof setTimeout> | undefined;
        const exited = await Promise.race([runtime.exited, new Promise<number>((resolve) => { timer = setTimeout(() => resolve(-1), 35000); })]);
        clearTimeout(timer);
        if (exited === -1) { runtime.kill("SIGKILL"); await runtime.exited; }
        if (exited !== 0) process.exitCode = 1;
      }
    } finally {
      try {
        if (limitsChanged) {
          if (originalLimits) await db.rateLimitSettings.update({ where: { id: "default" }, data: originalLimits });
          else await db.rateLimitSettings.delete({ where: { id: "default" } });
        }
      } finally { await db.$disconnect(); }
    }
  }
}
