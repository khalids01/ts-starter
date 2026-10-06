/// <reference lib="dom" />
import type { BrowserContext, Locator, Page } from "@playwright/test";

const CLICK_PAUSE_MS = Number(process.env.TUTORIAL_CLICK_PAUSE_MS ?? 150);
const MOVE_STEPS = Number(process.env.TUTORIAL_MOVE_STEPS ?? 22);
const TYPE_DELAY_MS = Number(process.env.TUTORIAL_TYPE_DELAY_MS ?? 0);

/**
 * Runs inside every page in the recorded context. It paints a synthetic pointer
 * that follows real mouse events, so Playwright's video (which never captures
 * the OS cursor) still shows a moving, clicking pointer.
 */
const cursorInitScript = () => {
  const CURSOR_ID = "__tutorial_cursor";
  const STYLE_ID = "__tutorial_cursor_style";
  const RIPPLE_CLASS = "__tutorial_cursor_ripple";

  const mount = () => {
    const root = document.documentElement;
    if (!root || root.querySelector(`#${CURSOR_ID}`)) return;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        #${CURSOR_ID} {
          position: fixed;
          top: 0;
          left: 0;
          width: 28px;
          height: 28px;
          margin: -4px 0 0 -4px;
          z-index: 2147483647;
          pointer-events: none;
          transform: translate3d(-200px, -200px, 0);
          will-change: transform;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
        }
        .${RIPPLE_CLASS} {
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          width: 46px;
          height: 46px;
          margin: -23px 0 0 -23px;
          border-radius: 9999px;
          border: 3px solid rgba(37, 99, 235, 0.9);
          background: rgba(37, 99, 235, 0.2);
          animation: __tutorial_cursor_ripple 520ms ease-out forwards;
        }
        @keyframes __tutorial_cursor_ripple {
          from { opacity: 0.95; transform: scale(0.2); }
          to { opacity: 0; transform: scale(1); }
        }
      `;
      root.appendChild(style);
    }

    const cursor = document.createElement("div");
    cursor.id = CURSOR_ID;
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">' +
      '<path d="M4 2 L4 22 L9.4 16.9 L12.6 23.4 L16.2 21.7 L13 15.4 L20 15.1 Z" ' +
      'fill="#ffffff" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    root.appendChild(cursor);

    const ripple = (x: number, y: number) => {
      const node = document.createElement("div");
      node.className = RIPPLE_CLASS;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      root.appendChild(node);
      node.addEventListener("animationend", () => node.remove());
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      },
      true,
    );
    window.addEventListener("mousedown", (event) => ripple(event.clientX, event.clientY), true);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
  window.addEventListener("DOMContentLoaded", mount);
};

export async function installCursor(context: BrowserContext): Promise<void> {
  await context.addInitScript(cursorInitScript);
}

export async function cursorMove(page: Page, x: number, y: number): Promise<void> {
  await page.mouse.move(x, y, { steps: MOVE_STEPS });
}

export async function cursorHover(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded().catch(() => undefined);
  const box = await target.boundingBox();
  if (!box) return;
  await cursorMove(page, box.x + box.width / 2, box.y + box.height / 2);
}

export async function cursorClick(
  page: Page,
  target: Locator,
  options?: Parameters<Locator["click"]>[0],
): Promise<void> {
  await clearHighlight(page);
  await cursorHover(page, target);
  await page.waitForTimeout(CLICK_PAUSE_MS);
  await target.click(options);
}

export async function cursorFill(page: Page, target: Locator, value: string): Promise<void> {
  await cursorHover(page, target);
  await page.waitForTimeout(CLICK_PAUSE_MS);
  if (TYPE_DELAY_MS > 0) {
    await target.fill("");
    await target.pressSequentially(value, { delay: TYPE_DELAY_MS });
    return;
  }
  await target.fill(value);
}

const highlightScript = (args: {
  box: { x: number; y: number; width: number; height: number };
  pad: number;
}) => {
  const root = document.documentElement;
  let el = document.getElementById("__tutorial_highlight");
  if (!el) {
    el = document.createElement("div");
    el.id = "__tutorial_highlight";
    el.setAttribute("aria-hidden", "true");
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.zIndex = "2147483640";
    el.style.borderRadius = "10px";
    el.style.border = "3px solid rgba(37, 99, 235, 0.95)";
    el.style.boxShadow = "0 0 0 9999px rgba(15, 23, 42, 0.45)";
    el.style.transition =
      "left 140ms ease-out, top 140ms ease-out, width 140ms ease-out, height 140ms ease-out";
    root.appendChild(el);
  }
  el.style.left = `${args.box.x - args.pad}px`;
  el.style.top = `${args.box.y - args.pad}px`;
  el.style.width = `${args.box.width + args.pad * 2}px`;
  el.style.height = `${args.box.height + args.pad * 2}px`;
};

/** Draws a dimmed spotlight around `target`. Safe to call repeatedly. */
export async function highlight(page: Page, target: Locator, padding = 8): Promise<void> {
  await target.scrollIntoViewIfNeeded().catch(() => undefined);
  const box = await target.boundingBox();
  if (!box) return;
  await page.evaluate(highlightScript, { box, pad: padding });
}

export async function clearHighlight(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.getElementById("__tutorial_highlight")?.remove();
  });
}

/**
 * Points at `target` and spotlights it. Never throws: highlighting is cosmetic,
 * so a missing element just means no highlight for that beat.
 */
export async function narrate(page: Page, target: Locator, padding = 8): Promise<void> {
  try {
    await highlight(page, target, padding);
    await cursorHover(page, target);
  } catch {
    // ignore: highlight is best-effort
  }
}

