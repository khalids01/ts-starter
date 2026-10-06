/**
 * Narration-derived pacing. Each entry is a screen from the storyboard and the
 * cumulative second in the narration timeline (`audio_normalized.mp3`) by which
 * that screen should already be visible. The recorder performs the real actions
 * for a segment, then waits until its `untilSec` before moving on, so the
 * continuous recording lines up with the pre-recorded voice track.
 *
 * `untilSec` values were read from `captions.vtt`. Retiming the narration means
 * updating these numbers and `TUTORIAL_DURATION_SEC` (the final cue end).
 */
export type TutorialSegment = {
  key: string;
  label: string;
  untilSec: number;
};

export const TUTORIAL_DURATION_SEC = 359.31;

export const TUTORIAL_SEGMENTS: TutorialSegment[] = [
  { key: "01-products-start", label: "Admin overview and Products", untilSec: 41.4 },
  { key: "02-category", label: "Category selection", untilSec: 58.1 },
  { key: "03-product-basics", label: "Basics and Save basics", untilSec: 103.5 },
  { key: "04-product-specs", label: "Specs", untilSec: 113.6 },
  { key: "05-product-highlights", label: "Highlights", untilSec: 126.4 },
  { key: "06-product-variant", label: "Variant", untilSec: 152.6 },
  { key: "07-receive-inventory", label: "Receive inventory", untilSec: 181.5 },
  { key: "08-inventory-confirmed", label: "Inventory confirmed", untilSec: 185.0 },
  { key: "09-product-ready", label: "Validate and activate", untilSec: 197.5 },
  { key: "10-storefront-product", label: "Storefront product", untilSec: 204.7 },
  { key: "11-customer-checkout", label: "Customer checkout", untilSec: 218.6 },
  { key: "12-order-created", label: "Order confirmation", untilSec: 223.4 },
  { key: "13-admin-order-review", label: "Admin order review", untilSec: 235.2 },
  { key: "14-order-confirmed", label: "Order confirmed", untilSec: 252.5 },
  { key: "15-payment-evidence", label: "Payment evidence", untilSec: 284.5 },
  { key: "16-mark-shipped", label: "Mark shipped", untilSec: 302.2 },
  { key: "17-mark-delivered", label: "Mark delivered", untilSec: 318.6 },
  { key: "18-order-completed", label: "Order completed", untilSec: 335.6 },
];

export class Pacer {
  private readonly startMs: number;
  private readonly targets: Map<string, number>;

  constructor(segments: TutorialSegment[] = TUTORIAL_SEGMENTS, startMs = performance.now()) {
    this.startMs = startMs;
    this.targets = new Map(segments.map((segment) => [segment.key, segment.untilSec]));
  }

  elapsedSec(): number {
    return (performance.now() - this.startMs) / 1000;
  }

  async holdUntil(sec: number): Promise<void> {
    const remainingMs = sec * 1000 - (performance.now() - this.startMs);
    if (remainingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingMs));
    }
  }

  async reach(key: string): Promise<void> {
    const until = this.targets.get(key);
    if (until === undefined) {
      throw new Error(`Unknown tutorial segment: ${key}`);
    }
    await this.holdUntil(until);
  }

  async finish(): Promise<void> {
    await this.holdUntil(TUTORIAL_DURATION_SEC);
  }
}
