import { buildCapacityDataset } from "../load/capacity-dataset";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
// k6 inspect evaluates configuration only: no iterations, HTTP requests or database operations.
const directory = resolve("tests/artifacts/step13");
await mkdir(directory, { recursive: true });
const { manifest } = buildCapacityDataset({ runId: "inspect", actorUserId: "fictional-inspect-actor", baseTime: new Date("2026-10-03T00:00:00Z"), counts: { customers: 10, orders: 20, products: 10, variants: 30 } });
const path = resolve(directory, "inspect-fixtures.json");
await writeFile(path, JSON.stringify({ ...manifest, databaseName: "e2e_v3_step13_capacity_inspect", target: "http://localhost:3013", adminEmail: "capacity-owner@northstar.example.test", adminSessionCookie: "fictional-inspection-cookie-never-authenticates" }), { mode: 0o600 });
const config = resolve(directory, "k6-local-config.json");
await writeFile(config, "{}", { mode: 0o600 });
for (const profile of ["smoke", "volume", "expected", "peak", "soak"]) {
  const output = resolve(directory, `k6-inspect-${profile}.json`);
  await writeFile(output, "", { mode: 0o600 });
  const child = Bun.spawn([process.env.STEP13_K6_BINARY ?? resolve(directory, "tools/k6"), "inspect", "--config", config, "--include-system-env-vars", "--execution-requirements", "tests/load/step13-k6.js"], {
    env: { PATH: process.env.PATH!, K6_NO_USAGE_REPORT: "true", STEP13_LOAD_APPROVED: "true", STEP13_LOAD_EXECUTION_ID: "00000000-0000-4000-8000-000000000000", STEP13_LOAD_PROFILE: profile, STEP13_LOAD_TARGET: "http://localhost:3013", STEP13_LOAD_FIXTURES: path },
    stdout: Bun.file(output), stderr: "inherit",
  });
  if (await child.exited !== 0) throw new Error(`k6 configuration inspection failed: ${profile}`);
  console.log(`k6 inspect passed: ${profile}; no workload executed`);
}
