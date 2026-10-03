import type { PrismaClient } from "../../packages/db/prisma/generated/client";
import { availableParallelism, cpus, totalmem, platform, arch } from "node:os";
import { readFile, readdir, writeFile } from "node:fs/promises";

async function optionalFile(path: string) { try { return (await readFile(path, "utf8")).trim(); } catch { return null; } }
export async function startCapacityMetrics(db: PrismaClient, pid: number, output: string) {
  const { default: Redis } = await import("../../packages/redis/node_modules/ioredis");
  const redis = new Redis(process.env.REDIS_URL!, { connectTimeout: 2000, commandTimeout: 2000, maxRetriesPerRequest: 1 });
  // Errors are recorded as sampling failures, without potentially sensitive error details.
  redis.on("error", () => {});
  const hardware = { platform: platform(), architecture: arch(), availableCPUs: availableParallelism(), cpuModel: cpus()[0]?.model, hostMemoryBytes: totalmem(), cpuMax: await optionalFile("/sys/fs/cgroup/cpu.max"), memoryMax: await optionalFile("/sys/fs/cgroup/memory.max"), redisInstancePort: new URL(process.env.REDIS_URL!).port || "6379", redisResourceScope: "entire configured test instance", sharedLocalHost: true };
  const samples: unknown[] = [], errors: { at: string; reason: string }[] = [];
  let current: Promise<void> | undefined;
  async function sample() {
    try {
      const [status, stat, descriptors, database, queue, oldest, expiredLeases, redisInfo] = await Promise.all([
        optionalFile(`/proc/${pid}/status`), optionalFile(`/proc/${pid}/stat`), readdir(`/proc/${pid}/fd`),
        db.$queryRaw<{ connections: number; active: number; waiting: number; locks: number; commits: bigint; rollbacks: bigint; deadlocks: bigint }[]>`
          SELECT (SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database()) AS connections,
                 (SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database() AND state = 'active') AS active,
                 (SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock') AS waiting,
                 (SELECT count(*)::int FROM pg_locks l JOIN pg_stat_activity a ON a.pid = l.pid WHERE a.datname = current_database() AND NOT l.granted) AS locks,
                 xact_commit AS commits, xact_rollback AS rollbacks, deadlocks FROM pg_stat_database WHERE datname = current_database()`,
        db.courierOperation.groupBy({ by: ["state"], _count: { _all: true } }),
        db.courierOperation.findFirst({ where: { state: { in: ["pending", "retry", "processing"] } }, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
        db.courierOperation.count({ where: { state: "processing", leaseUntil: { lt: new Date() } } }),
        redis.info(),
      ]);
      const redisValues = Object.fromEntries(redisInfo.split(/\r?\n/).flatMap((line) => {
        const [key, value] = line.split(":");
        return key && ["used_memory", "connected_clients", "blocked_clients", "evicted_keys", "rejected_connections", "instantaneous_ops_per_sec"].includes(key) ? [[key, Number(value)]] : [];
      }));
      const cpu = stat?.slice(stat.lastIndexOf(")") + 2).split(" ");
      samples.push({ at: new Date().toISOString(), api: { rssBytes: Number(status?.match(/VmRSS:\s+(\d+)/)?.[1] ?? 0) * 1024, openFDs: descriptors.length, cpuUserTicks: Number(cpu?.[11]), cpuSystemTicks: Number(cpu?.[12]) }, database: database[0], redis: redisValues, queue, oldestQueueAgeMs: oldest ? Math.max(0, Date.now() - oldest.createdAt.getTime()) : 0, expiredLeases });
    } catch { errors.push({ at: new Date().toISOString(), reason: "Resource sampling failed; results need investigation" }); }
    try {
      await writeFile(`${output}.live.json`, JSON.stringify({ at: new Date().toISOString(), samples: samples.length, errors: errors.length, latest: samples.at(-1) }, (_, value) => typeof value === "bigint" ? value.toString() : value, 2), { mode: 0o600 });
    } catch { errors.push({ at: new Date().toISOString(), reason: "Live resource report write failed" }); }
  }
  await sample();
  const timer = setInterval(() => {
    if (current) return;
    current = sample().finally(() => { current = undefined; });
  }, 5000);
  timer.unref();
  return { async stop() {
    clearInterval(timer);
    try {
      await current;
      await sample();
      await writeFile(output, JSON.stringify({ hardware, intervalMs: 5000, observerOverhead: "Read-only DB/Redis/proc sampling; included in measured workload", samples, errors }, (_, value) => typeof value === "bigint" ? value.toString() : value, 2), { mode: 0o600 });
      return { samples: samples.length, errors: errors.length };
    } finally { redis.disconnect(); }
  } };
}
