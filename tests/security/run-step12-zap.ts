import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { assertTestEnvironment } from "../setup/assert-test-environment";

// This flag records a prior, explicit approval; it does not grant permission.
if (process.env.STEP12_ZAP_APPROVED !== "true") {
  throw new Error("Explicit approval for the Step 12 localhost active scan is required");
}
const target = assertTestEnvironment();
if (target.isRemote || target.databaseName !== "e2e_v3_step10_20261003_03043274" ||
    process.env.E2E_MODE !== "true" || process.env.STEAD_FAST_BASE_URL !== "http://localhost:3903") {
  throw new Error("Step 12 scanner requires the recorded isolated local fixture environment");
}
for (const url of ["http://localhost:3000/", "http://localhost:3001/shop"]) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Isolated Step 12 services must be running before scanning");
}
const output = resolve("tests/artifacts/step12/zap");
const plan = resolve("tests/security/step12-zap-plan.yaml");
await mkdir(output, { recursive: true });
const scanner = Bun.spawn([
  "docker", "run", "--rm", "--network=host",
  "--user", `${process.getuid!()}:${process.getgid!()}`,
  "-v", `${output}:/zap/wrk:rw`, "-v", `${plan}:/zap/step12.yaml:ro`,
  "ghcr.io/zaproxy/zaproxy:stable", "zap.sh", "-cmd", "-autorun", "/zap/step12.yaml",
], { stdout: "inherit", stderr: "inherit" });
process.exit(await scanner.exited);
