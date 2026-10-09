import { chromium, request, type Locator, type Page, type APIRequestContext } from "@playwright/test";
import { mkdir, readFile, writeFile, rename, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { assertTestEnvironment } from "../../tests/setup/assert-test-environment";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";
import { TEST_USERS } from "../../tests/users-config";
import { cursorClick, cursorFill, installCursor, highlight, clearHighlight } from "./cursor";
import type { Action, Fixtures, FixtureCheck, RecordingManifest, RecordingPlan, Target } from "./types";

export function substitute(value: string, values: Record<string, string>): string {
  return value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => {
    if (!values[key] || values[key].includes("REPLACE")) throw new Error(`Supply fixture value: ${key}`);
    return values[key];
  });
}
export function resolveTarget(page: Page, target: Target, values: Record<string, string>): Locator {
  let scope: Page | Locator = target.within === "page" ? page : page.locator('main, [role="dialog"]');
  if (target.role === "dialog") scope = page;
  if (target.dialog) scope = page.getByRole("dialog", { name: substitute(target.dialog, values), exact: true });
  if (target.row) scope = scope.getByRole("row").filter({ hasText: substitute(target.row, values) });
  if (target.role) return scope.getByRole(target.role, { name: target.name ? substitute(target.name, values) : undefined, exact: target.exact ?? true });
  if (target.text) return scope.getByText(substitute(target.text, values), { exact: target.exact ?? true });
  if (target.css) return scope.locator(substitute(target.css, values));
  if (target.field) {
    const name = substitute(target.field, values);
    // Some existing forms use a visual Label without an associated input ID.
    return scope.locator("label").filter({ hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) })
      .locator("..").locator('input:not([aria-hidden="true"]):not([type="hidden"]),textarea,button[role="combobox"],select');
  }
  throw new Error("A recording target must specify a role, field, text or CSS selector");
}
export async function perform(page: Page, action: Action, values: Record<string, string>): Promise<void> {
  if (action.kind === "goto") {
    const path = substitute(action.path, values);
    if (!path.startsWith("/admin/") || path.startsWith("//")) throw new Error(`Unsafe tutorial route: ${path}`);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.locator("main").first().waitFor();
    return;
  }
  if (action.kind === "wait") {
    if (!Number.isFinite(action.durationMs) || action.durationMs < 0 || action.durationMs > 30_000) throw new Error("Invalid tutorial pause");
    await page.waitForTimeout(action.durationMs);
    return;
  }
  if (action.kind === "key") { await page.keyboard.press(action.key); return; }
  const target = resolveTarget(page, action.target, values);
  if (action.kind === "file") {
    const assetRoot = await realpath(resolve(import.meta.dir, ".."));
    const asset = await realpath(resolve(action.path));
    if (!asset.startsWith(assetRoot + "/") || !/\.(svg|png|jpe?g|webp)$/i.test(asset)) throw new Error("File selection must use a tutorial-owned image asset");
    if (await target.count() !== 1) throw new Error("Ambiguous tutorial file input");
    await target.setInputFiles(asset);
    return;
  }
  await target.waitFor({ state: "visible" });
  if (await target.count() !== 1) throw new Error(`Ambiguous tutorial target: ${JSON.stringify(action.target)}`);
  if (action.kind === "submit") {
    const [response] = await Promise.all([
      page.waitForResponse(response => new URL(response.url()).pathname === substitute(action.capture.responsePath, values) && response.request().method() === "POST"),
      cursorClick(page, target),
    ]);
    if (!response.ok()) throw new Error(`Tutorial submission failed: ${response.status()}`);
    let result: unknown = await response.json();
    for (const part of action.capture.field.split(".")) result = (result as Record<string, unknown> | null)?.[part];
    if (typeof result !== "string" || !/^[a-zA-Z0-9_-]+$/.test(result)) throw new Error("Submission did not return a valid resource ID");
    values[action.capture.key] = result;
  } else if (action.kind === "click") await cursorClick(page, target);
  else if (action.kind === "fill") await cursorFill(page, target, substitute(action.value, values));
  else if (action.kind === "select") {
    if (await target.evaluate(el => el.tagName === "SELECT")) await target.selectOption({ label: substitute(action.option, values) });
    else {
      await cursorClick(page, target);
      await cursorClick(page, page.getByRole("option", { name: substitute(action.option, values), exact: true }));
    }
  } else if (action.kind === "show") {
    await target.scrollIntoViewIfNeeded();
    await highlight(page, target);
    await page.waitForTimeout(1_200);
    await clearHighlight(page);
  }
}
export async function check(api: APIRequestContext, checks: FixtureCheck[], values: Record<string, string>) {
  for (const item of checks) {
    const path = substitute(item.path, values);
    if (!path.startsWith("/admin/") || path.startsWith("//")) throw new Error("Only admin fixture checks are allowed");
    const response = await api.get(path);
    if (!response.ok()) throw new Error(`Fixture check failed (${response.status()}): ${path}`);
    let actual: unknown = await response.json();
    for (const part of item.field.split(".")) actual = (actual as Record<string, unknown> | null)?.[part];
    if (item.find) {
      if (!Array.isArray(actual)) throw new Error("Fixture find check requires an array");
      const selected = actual.find(row => row[item.find!.field] === substitute(item.find!.equals, values));
      actual = item.property ? selected?.[item.property] : selected;
    }
    const expected = typeof item.equals === "string" ? substitute(item.equals, values) : item.equals;
    if (actual !== expected) throw new Error(`Fixture assertion failed: ${path} ${item.field}`);
  }
}
export async function recordTutorial(directory: string): Promise<void> {
  const environment = assertTestEnvironment();
  if (environment.isRemote) throw new Error("Tutorial recordings require the local isolated environment");
  if (process.env.TUTORIAL_RECORD_APPROVED !== "true") throw new Error("Set TUTORIAL_RECORD_APPROVED=true only after authorizing this isolated recording");
  if (process.env.COURIER_WORKERS_ENABLED !== "false" || process.env.ENABLE_POLAR !== "false") {
    throw new Error("Set COURIER_WORKERS_ENABLED=false and ENABLE_POLAR=false in the recording environment and running API");
  }
  const planText = await readFile(resolve(directory, "tutorial.json"), "utf8");
  const plan = JSON.parse(planText) as RecordingPlan;
  const fixtures = JSON.parse(await readFile(resolve(directory, "fixtures.local.json"), "utf8")) as Fixtures;
  if (!/^tutorial-[a-z0-9-]+$/.test(fixtures.marker)) throw new Error("Fixture marker must start with tutorial- and contain only lowercase letters, digits and hyphens");
  const values: Record<string, string> = { ...fixtures.values, marker: fixtures.marker };
  if (plan.mode === "workflow" && (!fixtures.outcomeChecks.length || !fixtures.cleanup.length)) {
    throw new Error("Workflow recordings require owned-fixture checks, persisted outcome checks and cleanup actions");
  }
  // Preflight every variable before any browser action or mutation.
  const captures = plan.scenes.flatMap(scene => scene.actions.filter(action => action.kind === "submit").map(action => action.capture.key));
  const preflightValues = { ...values, ...Object.fromEntries(captures.map(key => [key, "captured-later"])) };
  substitute(JSON.stringify(plan), preflightValues);
  substitute(JSON.stringify(fixtures), preflightValues);
  for (const action of fixtures.cleanup) {
    if (!action.verify?.some(item => typeof item.equals === "string" && substitute(item.equals, preflightValues).startsWith(fixtures.marker))) {
      throw new Error("Each cleanup action needs a marker-owned verification check");
    }
  }
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const runDirectory = resolve(directory, "artifacts", runId);
  await mkdir(runDirectory, { recursive: true });
  const attemptPath = resolve(directory, "artifacts", "last-attempt.json");
  await writeFile(attemptPath, JSON.stringify({ runId, complete: false }, null, 2) + "\n");
  const api = await request.newContext({ baseURL: e2eRuntimeConfig.serverUrl, storageState: TEST_USERS.owner.storageStatePath });
  await check(api, fixtures.ownershipChecks, values);
  const browser = await chromium.launch({ headless: process.env.TUTORIAL_HEADED !== "true" });
  const context = await browser.newContext({ baseURL: e2eRuntimeConfig.webUrl, storageState: TEST_USERS.owner.storageStatePath,
    viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce",
    recordVideo: { dir: runDirectory, size: { width: 1440, height: 900 } } });
  await installCursor(context);
  if (!plan.showTutorialControls) await context.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "[data-tutorial-control] { visibility: hidden !important; }";
      document.head.appendChild(style);
    }, { once: true });
  });
  // Prevent requests to live external systems from the browser. Server-side
  // provider calls must separately be disabled or pointed to the local simulator.
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const businessWrite = url.pathname.startsWith("/admin/") && !["GET", "HEAD", "OPTIONS"].includes(route.request().method());
    if (local && !(plan.mode === "walkthrough" && businessWrite)) await route.continue();
    else await route.abort("blockedbyclient");
  });
  const sourceCommit = (await new Response(Bun.spawn(["git", "rev-parse", "HEAD"], { stdout: "pipe" }).stdout).text()).trim();
  const manifest: RecordingManifest = { version: 1, tutorialId: plan.id, runId, sourceCommit, recordedAt: new Date().toISOString(), complete: false,
    planHash: createHash("sha256").update(planText).digest("hex"), scenes: [] };
  let succeeded = false;
  try {
    for (const scene of plan.scenes) {
      const videoStart = performance.now();
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      try {
        const first = scene.actions[0];
        let actions = scene.actions;
        if (first?.kind === "goto") {
          await perform(page, first, values);
          await page.locator("main").last().getByRole("heading").first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(500);
          actions = scene.actions.slice(1);
        }
        const leadInSec = (performance.now() - videoStart) / 1000;
        const start = performance.now();
        for (const action of actions) await perform(page, action, values);
        const actionDurationSec = (performance.now() - start) / 1000;
        await page.waitForTimeout(1_000);
        const video = page.video();
        await page.close();
        if (!video) throw new Error("Playwright did not create a scene video");
        manifest.scenes.push({ id: scene.id, title: scene.title, rawVideo: await video.path(), leadInSec, actionDurationSec });
      } catch (error) {
        await page.screenshot({ path: resolve(runDirectory, `${scene.id}-failure.png`) }).catch(() => undefined);
        throw error;
      }
    }
    await check(api, fixtures.outcomeChecks, values);
    succeeded = true;
  } finally {
    await context.close();
    await browser.close();
    try {
      for (const action of fixtures.cleanup) {
        const missingCapture = captures.some(key => action.path.includes(`{{${key}}}`) && !values[key]);
        if (missingCapture) continue; // This run never created the resource.
        await check(api, action.verify, values);
        const path = substitute(action.path, values);
        if (!path.startsWith("/admin/") || path.startsWith("//")) throw new Error("Unsafe cleanup path");
        const response = await api.fetch(path, { method: action.method, data: action.data });
        if (!response.ok()) throw new Error(`Cleanup failed (${response.status()}): ${path}`);
      }
    } finally { await api.dispose(); }
    // A failed capture or cleanup must never replace the last successful manifest.
    if (succeeded) {
      manifest.complete = true;
      await writeFile(resolve(runDirectory, "recording.json"), JSON.stringify(manifest, null, 2) + "\n");
      const last = resolve(directory, "artifacts", "last-recording.json");
      await writeFile(`${last}.tmp`, JSON.stringify(manifest, null, 2) + "\n");
      await rename(`${last}.tmp`, last);
      await writeFile(`${attemptPath}.tmp`, JSON.stringify({ runId, complete: true }, null, 2) + "\n");
      await rename(`${attemptPath}.tmp`, attemptPath);
    }
  }
  console.log(`Recorded ${plan.id}: ${runDirectory}. Supply audio and render; this is not a published tutorial.`);
}
