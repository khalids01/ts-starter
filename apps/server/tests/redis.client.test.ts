import { describe, expect, it } from "bun:test";

describe("Redis client", () => {
  it("throws when Redis cannot connect", async () => {
    const proc = Bun.spawn({
      cmd: [
        "bun",
        "-e",
        `
          import { mock } from "bun:test";

          class FakeRedis {
            status = "wait";
            async connect() {
              throw new Error("connection refused");
            }
          }

          mock.module("@env/server", () => ({
            env: {
              REDIS_URL: "redis://localhost:6379",
              REDIS_KEY_PREFIX: "test:",
            },
          }));

          mock.module("ioredis", () => ({
            default: FakeRedis,
          }));

          const { connectRedis } = await import("./packages/redis/src/index.ts");
          await connectRedis();
        `,
      ],
      cwd: new URL("../../..", import.meta.url).pathname,
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stderr, exitCode] = await Promise.all([
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("connection refused");
  });
});
