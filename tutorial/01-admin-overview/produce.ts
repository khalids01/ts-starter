import { chromium, request } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { assertTestEnvironment } from "../../tests/setup/assert-test-environment";
import { TEST_USERS } from "../../tests/users-config";
import { highlight, cursorHover, installCursor } from "../shared/cursor";

type Target = { role?: "heading" | "link" | "button" | "dialog"; name?: string; css?: string };
type Segment = { id: string; scene: string; text: string; groups: string[]; dialog?: boolean; target: Target };
const directory = import.meta.dir;
const productionText = await readFile(resolve(directory, "production.json"), "utf8");
const production = JSON.parse(productionText) as { profileId: string; segments: Segment[] };
const mode = process.argv[2];
if (!["audio", "capture", "render"].includes(mode ?? "")) throw new Error("Usage: bun tutorial/01-admin-overview/produce.ts audio|capture|render");
const planHash = createHash("sha256").update(productionText).digest("hex");
const cache = resolve(directory, "artifacts", "synchronized-audio");
await mkdir(cache, { recursive: true });
const sha = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const audioPath = (s: Segment) => resolve(cache, `${s.id}-${sha(s.text).slice(0, 16)}.wav`);
async function load<T>(path: string): Promise<T | null> {
  try { return JSON.parse(await readFile(path, "utf8")) as T; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
async function run(args: string[]) {
  const child = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
  const [out, error, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  if (exit) throw new Error(`${args[0]} failed: ${error.slice(-1500)}`);
  return out.trim();
}
async function duration(path: string) {
  const value = Number(await run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path]));
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid media duration: ${path}`);
  return value;
}
if (mode === "audio") {
  const base = new URL(process.env.VOICEBOX_URL ?? "http://127.0.0.1:17493");
  if (!['http:', 'https:'].includes(base.protocol)) throw new Error("Invalid Voicebox origin");
  async function api<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(new URL(path, base), { method: body ? "POST" : "GET", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(body ? 120000 : 30000) });
    if (!response.ok) throw new Error(`Voicebox HTTP ${response.status}`);
    return response.json() as Promise<T>;
  }
  const profile = await api<{ preset_engine: string; preset_voice_id: string }>(`/profiles/${production.profileId}`);
  if (profile.preset_engine !== "kokoro" || profile.preset_voice_id !== "af_heart") throw new Error("Heart Kokoro profile required");
  for (const segment of production.segments) {
    const body = { profile_id: production.profileId, text: segment.text, language: "en", engine: "kokoro", model_size: null, personality: false, normalize: true, effects_chain: [], max_chunk_chars: 800, crossfade_ms: 50 };
    const path = audioPath(segment);
    const receiptPath = `${path}.json`;
    const hash = sha(JSON.stringify(body));
    let receipt = await load<{ hash: string; id: string; wavSha256?: string }>(receiptPath);
    if (receipt && receipt.hash !== hash) throw new Error(`Audio settings mismatch: ${segment.id}`);
    if (receipt?.wavSha256) {
      if (sha(await readFile(path)) !== receipt.wavSha256) throw new Error("Cached WAV changed");
      console.log(`Keep audio section ${segment.id}`); continue;
    }
    if (!receipt) {
      console.log(`Generate Heart section ${segment.id}: ${segment.text}`);
      const job = await api<{ id: string }>("/generate", body);
      if (!job.id) throw new Error("No generation ID; inspect Voicebox history before retrying");
      receipt = { hash, id: job.id };
      await writeFile(receiptPath, JSON.stringify(receipt), { flag: "wx" });
    }
    const deadline = Date.now() + 30 * 60 * 1000;
    while (true) {
      const job = await api<{ status: string }>(`/history/${encodeURIComponent(receipt.id)}`);
      if (job.status === "completed") break;
      if (["failed", "cancelled", "canceled", "error"].includes(job.status)) throw new Error(`Voicebox generation ${job.status}`);
      if (Date.now() > deadline) throw new Error("Generation pending; rerun to resume");
      await new Promise(done => setTimeout(done, 2000));
    }
    const response = await fetch(new URL(`/audio/${encodeURIComponent(receipt.id)}`, base), { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error("WAV download failed");
    const wav = Buffer.from(await response.arrayBuffer());
    if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") throw new Error("Expected WAV");
    await writeFile(path, wav, { flag: "wx" });
    await writeFile(receiptPath, JSON.stringify({ ...receipt, wavSha256: sha(wav), durationSec: await duration(path) }, null, 2) + "\n");
  }
}
const capturePointer = resolve(directory, "artifacts", "last-synchronized-capture.json");
if (mode === "capture") {
  const environment = assertTestEnvironment();
  if (environment.isRemote || process.env.TUTORIAL_RECORD_APPROVED !== "true" || process.env.COURIER_WORKERS_ENABLED !== "false" || process.env.ENABLE_POLAR !== "false") throw new Error("Approved isolated recording environment with disabled integrations required");
  const api = await request.newContext({ baseURL: "http://localhost:3000", storageState: TEST_USERS.owner.storageStatePath });
  try {
    const response = await api.get("/session/context");
    if (!response.ok()) throw new Error("Owner session unavailable");
    const session = await response.json();
    if (session.primaryRoleSlug !== "platform.owner" || session.user?.email !== TEST_USERS.owner.email) throw new Error("Fictional owner session required");
  } finally { await api.dispose(); }
  const buildManifest = await readFile(resolve(directory, "../../apps/web/dist/brand.json"), "utf8");
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-synchronized`;
  const output = resolve(directory, "artifacts", runId);
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: TEST_USERS.owner.storageStatePath, viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
  await installCursor(context);
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    const safe = ["localhost", "127.0.0.1"].includes(url.hostname) && ["GET", "HEAD", "OPTIONS"].includes(route.request().method());
    if (safe) await route.continue(); else await route.abort("blockedbyclient");
  });
  const records: Array<{ id: string; image: string; imageSha256: string; audio: string; audioSha256: string; audioDurationSec: number }> = [];
  try {
    for (const segment of production.segments) {
      const page = await context.newPage();
      await page.addInitScript(groups => localStorage.setItem("admin-sidebar-groups", JSON.stringify(groups)), segment.groups);
      await page.goto("http://localhost:3001/admin/overview", { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "Overview", exact: true }).waitFor();
      if (await page.locator('script[src*="/@vite/"], script[src*="@react-refresh"]').count()) throw new Error("Development server detected; use production build");
      await page.evaluate(() => document.fonts.ready);
      const styles = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(link => ({ url: link.href, ready: Boolean(link.sheet) })));
      if (!styles.length || styles.some(style => !style.ready || !style.url.includes("/assets/"))) throw new Error("Built CSS not fully loaded");
      if (segment.dialog) await page.getByRole("button", { name: "Open tutorials for this page", exact: true }).click();
      const target = segment.target.css ? page.locator(segment.target.css) : page.getByRole(segment.target.role!, { name: segment.target.name, exact: true });
      await target.waitFor();
      if (await target.count() !== 1) throw new Error(`Ambiguous target: ${segment.id}`);
      await target.scrollIntoViewIfNeeded();
      await cursorHover(page, target);
      await highlight(page, target);
      // Freeze CSS transitions/animations and wait for settled layout before capturing a real UI frame.
      await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
      await page.waitForTimeout(300);
      const image = resolve(output, `${segment.id}.png`);
      await page.screenshot({ path: image, animations: "disabled" });
      records.push({ id: segment.id, image, imageSha256: sha(await readFile(image)), audio: audioPath(segment), audioSha256: sha(await readFile(audioPath(segment))), audioDurationSec: await duration(audioPath(segment)) });
      await page.close();
      console.log(`Captured fully styled section ${segment.id}`);
    }
  } finally { await context.close(); await browser.close(); }
  const capture = { complete: true, runId, output, planHash, sourceCommit: await run(["git", "rev-parse", "HEAD"]), productionBuildManifestSha256: sha(buildManifest), records };
  await writeFile(resolve(output, "capture.json"), JSON.stringify(capture, null, 2) + "\n");
  await writeFile(`${capturePointer}.tmp`, JSON.stringify(capture, null, 2) + "\n");
  await rename(`${capturePointer}.tmp`, capturePointer);
}
if (mode === "render") {
  const capture = await load<{ complete: boolean; runId: string; output: string; planHash: string; sourceCommit: string; records: Array<{ id: string; image: string; imageSha256: string; audio: string; audioSha256: string; audioDurationSec: number }> }>(capturePointer);
  if (!capture?.complete || capture.planHash !== planHash || capture.records.length !== production.segments.length) throw new Error("Capture missing or outdated");
  const output = resolve(capture.output, "render");
  await mkdir(output, { recursive: true });
  const clips: string[] = [];
  let captions = "WEBVTT\n\n", offset = 0;
  const timeline = [];
  const stamp = (s: number) => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
  for (let i = 0; i < capture.records.length; i++) {
    const record = capture.records[i]!, segment = production.segments[i]!;
    if (record.id !== segment.id || sha(await readFile(record.image)) !== record.imageSha256 || sha(await readFile(record.audio)) !== record.audioSha256) throw new Error("Capture input changed");
    const length = Math.ceil((record.audioDurationSec + 0.2) * 30) / 30;
    const clip = resolve(output, `${record.id}.mp4`);
    await run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-loop", "1", "-framerate", "30", "-i", record.image, "-i", record.audio, "-filter_complex", `[0:v]format=yuv420p[v];[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad,atrim=duration=${length}[a]`, "-map", "[v]", "-map", "[a]", "-t", String(length), "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", clip]);
    const encodedDuration = await duration(clip);
    captions += `${segment.id}\n${stamp(offset)} --> ${stamp(offset + record.audioDurationSec)}\n${segment.text}\n\n`;
    timeline.push({ id: segment.id, text: segment.text, target: segment.target, startSec: offset, speechEndSec: offset + record.audioDurationSec, endSec: offset + encodedDuration, highlightHeldForEntireSpeech: true });
    offset += encodedDuration;
    clips.push(clip);
  }
  const list = resolve(output, "clips.txt");
  await writeFile(list, clips.map(path => `file '${path}'`).join("\n") + "\n");
  const video = resolve(output, "video.mp4");
  await run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", video]);
  const finalDuration = await duration(video);
  if (Math.abs(finalDuration - offset) > 0.15) throw new Error("Final timeline drift");
  await writeFile(resolve(output, "captions.vtt"), captions);
  await writeFile(resolve(output, "timeline.json"), JSON.stringify(timeline, null, 2) + "\n");
  await run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "2", "-i", video, "-frames:v", "1", resolve(output, "poster.webp")]);
  const currentPlan = await readFile(resolve(directory, "tutorial.json"), "utf8");
  await writeFile(resolve(output, "review.json"), JSON.stringify({ tutorialId: "admin-overview", runId: capture.runId, sourceCommit: capture.sourceCommit, planHash: sha(currentPlan), durationSec: finalDuration, videoSha256: sha(await readFile(video)), captionsSha256: sha(captions), watchedWithAudio: false, actionsMatchNarration: false, captionsChecked: false, fictionalDataOnly: true, approved: false, notes: "Production-build UI frames held for each exact speech section; inspect timeline.json. No loading frames or navigation transitions are included. Full playback review still required." }, null, 2) + "\n");
  const pointer = resolve(directory, "artifacts", "last-render.json");
  await writeFile(`${pointer}.tmp`, JSON.stringify({ runId: capture.runId, outputDirectory: output }, null, 2) + "\n");
  await rename(`${pointer}.tmp`, pointer);
  console.log(`Rendered synchronized tutorial: ${video} (${finalDuration}s)`);
}
