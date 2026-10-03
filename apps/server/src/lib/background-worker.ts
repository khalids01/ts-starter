/** Prevent overlapping ticks and let shutdown drain the currently running tick. */
export function createBackgroundWorker(options: {
  run: () => Promise<unknown>;
  intervalMs: number;
  initialDelayMs?: number;
  onError?: () => void;
}) {
  let interval: ReturnType<typeof setInterval> | undefined;
  let initial: ReturnType<typeof setTimeout> | undefined;
  let active: Promise<void> | undefined;
  let stopped = true;
  const tick = () => {
    if (stopped || active) return;
    active = Promise.resolve().then(options.run).then(() => {}, () => options.onError?.())
      .finally(() => { active = undefined; });
  };
  return {
    get stopped() { return stopped; },
    start() {
      if (!stopped) return;
      stopped = false;
      interval = setInterval(tick, options.intervalMs);
      interval.unref?.();
      if (options.initialDelayMs) {
        initial = setTimeout(tick, options.initialDelayMs);
        initial.unref?.();
      } else tick();
    },
    async stop() {
      stopped = true;
      clearInterval(interval);
      clearTimeout(initial);
      interval = initial = undefined;
      await active;
    },
  };
}
