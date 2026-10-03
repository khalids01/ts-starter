import { assertTestEnvironment } from "../setup/assert-test-environment";
import { mkdir } from "node:fs/promises";
const target = assertTestEnvironment();
if (target.isRemote || target.databaseName !== "e2e_v3_step10_20261003_03043274") throw new Error("Recorded isolated target required");
const { default: Redis } = await import("../../packages/redis/node_modules/ioredis");
const marker = crypto.randomUUID();
const a = new Redis(process.env.REDIS_URL!, { keyPrefix: `ts-starter:e2e:step13:shop-a:${marker}:` });
const b = new Redis(process.env.REDIS_URL!, { keyPrefix: `ts-starter:e2e:step13:shop-b:${marker}:` });
try {
  await a.set("same-key", "fictional-a", "EX", 5);
  await b.set("same-key", "fictional-b", "EX", 5);
  if (await a.get("same-key") !== "fictional-a" || await b.get("same-key") !== "fictional-b") throw new Error("Redis namespace collision");
  const ttl = await a.ttl("same-key");
  if (ttl < 1 || ttl > 5) throw new Error("Redis TTL failed");
  await mkdir("tests/artifacts/step13", { recursive: true });
  await Bun.write("tests/artifacts/step13/redis-isolation.json", JSON.stringify({ namespacesIndependent: true, expiryConfigured: true, note: "Local test Redis only; actual shops must use distinct Redis deployments" }, null, 2));
  console.log("Redis namespace/TTL checks passed");
} finally {
  await Promise.all([a.del("same-key"), b.del("same-key")]);
  await Promise.all([a.quit(), b.quit()]);
}
