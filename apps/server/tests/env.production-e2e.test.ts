import { expect, it } from "bun:test";

it("fails before production can enable E2E authentication and rate-limit bypasses", async () => {
  const result = Bun.spawn([process.execPath, "-e", 'await import("./packages/env/src/env.server.ts")'], {
    cwd: new URL("../../../", import.meta.url).pathname,
    env: { ...process.env, NODE_ENV: "production", E2E_MODE: "true" },
    stdout: "pipe", stderr: "pipe",
  });
  const stderr = await new Response(result.stderr).text();
  expect(await result.exited).not.toBe(0);
  expect(stderr).toContain("E2E_MODE cannot be enabled in production");
});
