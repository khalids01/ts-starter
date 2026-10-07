import { chromium, request, type Page } from "@playwright/test";
import { assertTestEnvironment } from "../../tests/setup/assert-test-environment";
import { TEST_USERS } from "../../tests/users-config";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";
import { highlight, cursorHover, installCursor, clearHighlight } from "./cursor";
import { substitute, resolveTarget, perform, check } from "./record";
import type { Fixtures } from "./types";
import type { ProductionPlan } from "./production-plan";
import type { RecordingPlan } from "./types";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { sha, load, run, duration, sectionAudioPath, producerHash } from "./media";

export async function captureSections(directory: string, production: ProductionPlan, plan: RecordingPlan, planHash: string) {
  const capturePointer = resolve(directory, "artifacts", "last-synchronized-capture.json");
  const audioPath = (segment: ProductionPlan["segments"][number]) => sectionAudioPath(directory, segment);
  const environment = assertTestEnvironment();
  if (environment.isRemote || process.env.TUTORIAL_RECORD_APPROVED !== "true" || process.env.COURIER_WORKERS_ENABLED !== "false" || process.env.ENABLE_POLAR !== "false") throw new Error("Approved isolated recording environment with disabled integrations required");
  const fixtures = JSON.parse(await readFile(resolve(directory, "fixtures.local.json"), "utf8")) as Fixtures;
  if (!/^tutorial-[a-z0-9-]+$/.test(fixtures.marker)) throw new Error("Fictional fixture marker required");
  const values: Record<string, string> = { ...fixtures.values, marker: fixtures.marker };
  const actions = production.segments.flatMap(segment => segment.actions);
  const captures = actions.filter(action => action.kind === "submit").map(action => action.capture.key);
  const preflightValues = { ...values, ...Object.fromEntries(captures.map(key => [key, "captured-later"])) };
  substitute(JSON.stringify(production), preflightValues);
  substitute(JSON.stringify(fixtures), preflightValues);
  const existingIds = Object.keys(values).filter(key => key.endsWith("Id") && JSON.stringify(production).includes(`{{${key}}}`));
  for (const key of existingIds) {
    if (!fixtures.ownershipChecks.some(item => item.path.includes(`{{${key}}}`) && typeof item.equals === "string" && substitute(item.equals, values).startsWith(fixtures.marker))) throw new Error(`Add a marker-owned API check for ${key} before capture`);
  }
  if (plan.mode === "workflow" && (!fixtures.outcomeChecks.length || !fixtures.cleanup.length)) throw new Error("Workflow requires outcome checks and cleanup");
  for (const action of fixtures.cleanup) {
    if (!action.verify?.some(item => typeof item.equals === "string" && substitute(item.equals, preflightValues).startsWith(fixtures.marker))) throw new Error("Cleanup needs marker-owned verification");
  }
  // Fail before business actions if any narration input is absent or altered.
  const audioInputs = new Map<string, { hash: string; duration: number }>();
  for (const segment of production.segments) {
    const path = audioPath(segment);
    const receipt = await load<{ wavSha256?: string }>(`${path}.json`);
    if (!receipt?.wavSha256 || receipt.wavSha256 !== sha(await readFile(path))) throw new Error(`Missing or changed approved audio: ${segment.id}`);
    audioInputs.set(segment.id, { hash: sha(await readFile(path)), duration: await duration(path) });
  }
  const buildManifest = await readFile(resolve(directory, "../../apps/web/dist/brand.json"), "utf8");
  const build = JSON.parse(buildManifest) as { brand: string };
  if (build.brand !== process.env.BRAND) throw new Error("Set BRAND to the existing production build brand. This producer never rebuilds it.");
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-synchronized`;
  const output = resolve(directory, "artifacts", runId);
  await mkdir(output, { recursive: true });
  const attemptPath = resolve(directory, "artifacts", "last-synchronized-attempt.json");
  await writeFile(attemptPath, JSON.stringify({ runId, complete: false }) + "\n");
  const productionCodeHash = await producerHash();
  const sourceCommit = await run(["git", "rev-parse", "HEAD"]);
  const api = await request.newContext({ baseURL: e2eRuntimeConfig.serverUrl, storageState: TEST_USERS.owner.storageStatePath });
  const records: Array<{ id: string; image: string; imageSha256: string; audio: string; audioSha256: string; audioDurationSec: number }> = [];
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let allowedSubmission: string | undefined;
  let captured = false;
  try {
    const response = await api.get("/session/context");
    if (!response.ok()) throw new Error("Owner session unavailable");
    const session = await response.json();
    if (session.primaryRoleSlug !== "platform.owner" || session.user?.email !== TEST_USERS.owner.email) throw new Error("Fictional owner session required");
    await check(api, fixtures.ownershipChecks, values);
    browser = await chromium.launch({ headless: process.env.TUTORIAL_HEADED !== "true" });
    const context = await browser.newContext({ baseURL: e2eRuntimeConfig.webUrl, storageState: TEST_USERS.owner.storageStatePath, viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
    await installCursor(context);
    await context.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = "[data-tutorial-control] { visibility: hidden !important; }";
        document.head.appendChild(style);
      }, { once: true });
    });
    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      const read = ["GET", "HEAD", "OPTIONS"].includes(route.request().method());
      const submitted = plan.mode === "workflow" && route.request().method() === "POST" && url.origin === e2eRuntimeConfig.serverUrl && url.pathname === allowedSubmission;
      if (local && (read || submitted)) await route.continue(); else await route.abort("blockedbyclient");
    });
    let page: Page | undefined;
    let scene: string | undefined;
    for (const segment of production.segments) {
      if (scene !== segment.scene) {
        await page?.close();
        page = await context.newPage();
        page.setDefaultTimeout(20_000);
        scene = segment.scene;
      }
      if (!page) throw new Error("Missing scene page");
      await page.evaluate(() => document.getElementById("__tutorial_example")?.remove());
      await clearHighlight(page);
      for (const action of segment.actions) {
        allowedSubmission = action.kind === "submit" ? substitute(action.capture.responsePath, values) : undefined;
        try {
          await perform(page, action, values);
          if (action.kind === "submit") await writeFile(resolve(output, "created-resources.json"), JSON.stringify(Object.fromEntries(captures.filter(key => values[key]).map(key => [key, values[key]])), null, 2) + "\n");
        } finally { allowedSubmission = undefined; }
      }
      await settleProductionPage(page);
      await check(api, segment.checks ?? [], values);
      const target = resolveTarget(page, segment.target, values);
      await target.waitFor({ state: "visible" });
      if (await target.count() !== 1) throw new Error(`Ambiguous target: ${plan.id}/${segment.id}`);
      await target.scrollIntoViewIfNeeded();
      await settleProductionPage(page);
      await cursorHover(page, target);
      // Do not allow a failed cosmetic helper to silently produce an unfocused frame.
      const before = await target.boundingBox();
      if (!before || before.width < 1 || before.height < 1 || before.height > 860 || before.width > 1400) throw new Error(`Target cannot fit the recording viewport: ${segment.id}. Use a smaller panel or field.`);
      await highlight(page, target);
      await page.waitForTimeout(300);
      const after = await target.boundingBox();
      if (!after || ["x", "y", "width", "height"].some(key => Math.abs(after[key as keyof typeof after] - before[key as keyof typeof before]) > 1)) throw new Error(`Layout moved during spotlight: ${segment.id}`);
      if (segment.frameLabel) await page.evaluate(label => {
        const badge = document.createElement("div");
        badge.id = "__tutorial_example";
        badge.textContent = `Prepared fictional example · ${label}`;
        Object.assign(badge.style, { position: "fixed", right: "16px", bottom: "16px", padding: "10px 14px", borderRadius: "8px", background: "#0f172a", color: "#fff", font: "14px system-ui", zIndex: "2147483645" });
        document.body.appendChild(badge);
      }, segment.frameLabel);
      const image = resolve(output, `${segment.id}.png`);
      await page.screenshot({ path: image, animations: "disabled" });
      const input = audioInputs.get(segment.id)!;
      if (sha(await readFile(audioPath(segment))) !== input.hash) throw new Error(`Audio changed during capture: ${segment.id}`);
      records.push({ id: segment.id, image, imageSha256: sha(await readFile(image)), audio: audioPath(segment), audioSha256: input.hash, audioDurationSec: input.duration });
      console.log(`Captured fully styled section ${plan.id}/${segment.id}`);
    }
    await check(api, fixtures.outcomeChecks, values);
    captured = true;
  } finally {
    try {
      await browser?.close();
    } finally {
    try {
      // No cleanup until this run actually created a captured resource.
      if (captures.some(key => values[key])) {
        for (const action of fixtures.cleanup) {
          if (captures.some(key => action.path.includes(`{{${key}}}`) && !values[key])) continue;
          await check(api, action.verify, values);
          const path = substitute(action.path, values);
          if (!path.startsWith("/admin/") || path.startsWith("//")) throw new Error("Unsafe cleanup path");
          const response = await api.fetch(path, { method: action.method, data: action.data });
          if (!response.ok()) throw new Error(`Cleanup failed (${response.status()}): ${path}`);
        }
      }
    } finally { await api.dispose(); }
    }
  }
  if (!captured) throw new Error("Incomplete capture");
  if (await run(["git", "rev-parse", "HEAD"]) !== sourceCommit || sha(await readFile(resolve(directory, "production.json"))) !== planHash || await producerHash() !== productionCodeHash) throw new Error("Source changed during capture");
  const capture = { complete: true, runId, output, planHash, sourceCommit, productionCodeHash, productionBuildManifestSha256: sha(buildManifest), records };
  await writeFile(resolve(output, "capture.json"), JSON.stringify(capture, null, 2) + "\n");
  await writeFile(`${capturePointer}.tmp`, JSON.stringify(capture, null, 2) + "\n");
  await rename(`${capturePointer}.tmp`, capturePointer);
  await writeFile(attemptPath, JSON.stringify({ runId, complete: true }) + "\n");

}

async function settleProductionPage(page: Page) {
  await page.waitForLoadState("networkidle");
  if (await page.locator('script[src*="/@vite/"], script[src*="@react-refresh"]').count()) throw new Error("Development server detected; use the existing production build");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }" });
  const styles = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(link => ({ url: link.href, ready: Boolean(link.sheet) })));
  if (!styles.length || styles.some(style => !style.ready || !style.url.includes("/assets/"))) throw new Error("Built CSS not fully loaded");
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('[aria-busy="true"], [data-slot="skeleton"]')).some(el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0));
  const errors = page.locator('[role="alert"]').filter({ hasText: /failed|error|unable|could not/i });
  if (await errors.count()) throw new Error("Page contains a loading or API error; do not capture it");
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).filter(image => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.top < innerHeight && box.bottom > 0;
    }).map(async image => {
      await image.decode();
      if (!image.naturalWidth) throw new Error("Visible image failed to load");
    }));
  });
  await page.waitForTimeout(300);
}
