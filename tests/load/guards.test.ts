import { expect, it } from "bun:test";

it("refuses fixture application and workload execution without approval before database import", async () => {
  for (const args of [["tests/load/generate-step13.ts", "--apply"], ["tests/load/run-step13.ts"]]) {
    const process = Bun.spawn([Bun.argv[0]!, ...args], { env: { PATH: Bun.env.PATH! }, stdout: "pipe", stderr: "pipe" });
    const error = await new Response(process.stderr).text();
    expect(await process.exited).not.toBe(0);
    expect(error).toMatch(/approval|required/i);
    expect(error).not.toMatch(/PrismaClientInitializationError|Can't reach database/);
  }
});
it("rejects the retained correctness DB even with the explicit fixture flag", async () => {
  const process = Bun.spawn([Bun.argv[0]!, "tests/load/generate-step13.ts", "--apply"], {
    env: { PATH: Bun.env.PATH!, NODE_ENV: "test", E2E_MODE: "true", DATABASE_URL: "postgresql://fake:fake@127.0.0.1:5433/e2e_v3_step10_20261003_03043274", REDIS_URL: "redis://127.0.0.1:6380", REDIS_KEY_PREFIX: "ts-starter:e2e:guard:", STEP13_FIXTURES_APPROVED: "true", STEP13_CAPACITY_DATABASE: "e2e_v3_step10_20261003_03043274", STEP13_FIXTURE_RUN_ID: "guard", STEP13_FIXTURE_ACTOR_ID: "fictional" },
    stdout: "pipe", stderr: "pipe",
  });
  const error = await new Response(process.stderr).text();
  expect(await process.exited).not.toBe(0);
  expect(error).toContain("exact local capacity DB/fixture approval");
});
