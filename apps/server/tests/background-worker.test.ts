import { expect, it } from "bun:test";
import { createBackgroundWorker } from "../src/lib/background-worker";

it("does not overlap ticks and waits for active work before stopping", async () => {
  let finish!: () => void;
  let calls = 0;
  const blocked = new Promise<void>((resolve) => { finish = resolve; });
  const worker = createBackgroundWorker({ intervalMs: 5, run: async () => { calls++; await blocked; } });
  worker.start();
  await Bun.sleep(20);
  expect(calls).toBe(1);
  let drained = false;
  const stopping = worker.stop().then(() => { drained = true; });
  await Bun.sleep(10);
  expect(drained).toBe(false);
  finish();
  await stopping;
  await Bun.sleep(10);
  expect(calls).toBe(1);
});

it("cancels delayed startup and can restart after a clean stop", async () => {
  let calls = 0;
  const worker = createBackgroundWorker({ intervalMs: 100, initialDelayMs: 20, run: async () => { calls++; } });
  worker.start();
  await worker.stop();
  await Bun.sleep(30);
  expect(calls).toBe(0);
  worker.start();
  await Bun.sleep(30);
  await worker.stop();
  expect(calls).toBe(1);
});
