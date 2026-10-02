import { CourierProviderRequestError } from "./provider";
export const COURIER_LEASE_MS = 120_000;
export const COURIER_REQUEST_MS = 30_000;
export class CourierRequestDeadlineError extends CourierProviderRequestError {
  constructor() {
    super("Courier request deadline exceeded", {
      code: "network",
      retryable: true,
    });
  }
}
/** Registered adapters must honor the signal; the outer deadline also bounds an unresponsive adapter. */
export async function withCourierDeadline<T>(
  call: (signal: AbortSignal) => Promise<T>,
  timeoutMs = COURIER_REQUEST_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.min(Math.max(timeoutMs, 1), COURIER_REQUEST_MS),
  );
  try {
    return await Promise.race([
      call(controller.signal),
      new Promise<never>((_, reject) =>
        controller.signal.addEventListener(
          "abort",
          () => reject(new CourierRequestDeadlineError()),
          { once: true },
        ),
      ),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
