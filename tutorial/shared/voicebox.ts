import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";

// Preparation is the default. Only --generate sends narration to Voicebox.
const [tutorialId, ...flags] = process.argv.slice(2);
if (!tutorialId || flags.some(flag => flag !== "--generate")) {
  throw new Error("Usage: bun tutorial/shared/voicebox.ts <tutorial-id> [--generate]");
}
const generate = flags.includes("--generate");
const root = resolve(import.meta.dir, "..");
const catalog = JSON.parse(await readFile(resolve(root, "catalog.json"), "utf8")) as Array<{ id: string; folder: string }>;
const entry = catalog.find(item => item.id === tutorialId);
if (!entry || tutorialId === "product-to-completed-order") throw new Error("Choose a focused tutorial from tutorial:list");
const directory = resolve(root, entry.folder);
const plan = JSON.parse(await readFile(resolve(directory, "tutorial.json"), "utf8")) as { scenes: Array<{ id: string; narration: string }> };
const paragraphs = (await readFile(resolve(directory, "narration.txt"), "utf8")).trim().split(/\r?\n\s*\r?\n/);
if (paragraphs.length !== plan.scenes.length || plan.scenes.some((scene, i) => scene.narration !== paragraphs[i] || !/^\d{2}$/.test(scene.id))) {
  throw new Error("Scene narration must match narration.txt exactly, with two-digit scene IDs");
}
const profileId = process.env.VOICEBOX_PROFILE_ID ?? "32138317-6b28-46d7-b611-66365ca94587";
const base = new URL(process.env.VOICEBOX_URL ?? "http://127.0.0.1:17493");
if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.pathname !== "/" || base.search || base.hash) throw new Error("VOICEBOX_URL must be an HTTP(S) origin");
const artifacts = resolve(directory, "artifacts", "voicebox");
await mkdir(artifacts, { recursive: true });
async function exists(path: string) { try { await access(path); return true; } catch { return false; } }
async function jsonRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(new URL(path, base), {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(body === undefined ? 30000 : 120000),
  });
  if (!response.ok) throw new Error(`Voicebox ${path}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
type Generation = { id: string; status: string; engine?: string; duration?: number | null; error?: string | null };
if (generate) {
  const profile = await jsonRequest<{ name: string; voice_type: string; preset_engine: string; preset_voice_id: string }>(`/profiles/${encodeURIComponent(profileId)}`);
  if (profile.voice_type !== "preset" || profile.preset_engine !== "kokoro" || profile.preset_voice_id !== "af_heart") throw new Error("Selected profile is not the Heart Kokoro preset");
  if (await exists(resolve(directory, "audio", "narration.wav")) || await exists(resolve(directory, "audio", "narration.mp3")) || await exists(resolve(directory, "audio", "narration.m4a"))) throw new Error("Existing full narration takes precedence in the renderer; resolve it before generating scene clips");
}
for (const scene of plan.scenes) {
  const payload = { profile_id: profileId, text: scene.narration, language: "en", engine: "kokoro", model_size: null, personality: false, max_chunk_chars: 800, crossfade_ms: 50, normalize: true, effects_chain: [] };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  await writeFile(resolve(artifacts, `${scene.id}.request.json`), JSON.stringify(payload, null, 2) + "\n");
  if (!generate) { console.log(`Prepared ${entry.folder}/audio/${scene.id}.wav (${scene.narration.length} characters)`); continue; }
  const receiptPath = resolve(artifacts, `${scene.id}.generation.json`);
  const outputPath = resolve(directory, "audio", `${scene.id}.wav`);
  if (await exists(outputPath)) {
    const resultPath = resolve(artifacts, `${scene.id}.result.json`);
    if (!await exists(resultPath)) throw new Error(`Audio already exists without a matching result receipt: ${outputPath}`);
    const result = JSON.parse(await readFile(resultPath, "utf8")) as { hash: string; wavSha256: string };
    const wavHash = createHash("sha256").update(await readFile(outputPath)).digest("hex");
    if (result.hash !== hash || result.wavSha256 !== wavHash) throw new Error(`Existing audio/settings mismatch for scene ${scene.id}; review before replacing`);
    console.log(`Keeping completed audio/${scene.id}.wav`);
    continue;
  }
  for (const extension of ["mp3", "m4a"]) if (await exists(resolve(directory, "audio", `${scene.id}.${extension}`))) throw new Error(`Existing audio for scene ${scene.id}; review it before generating`);
  let receipt: { hash: string; id: string };
  if (await exists(receiptPath)) {
    receipt = JSON.parse(await readFile(receiptPath, "utf8"));
    if (receipt.hash !== hash) throw new Error(`Scene ${scene.id} narration/settings changed. Review its old generation receipt before retrying.`);
    console.log(`Resuming scene ${scene.id}: ${receipt.id}`);
  } else {
    console.log(`Generating scene ${scene.id} with Heart/Kokoro`);
    // Never automatically retry this POST: an interrupted response may still create a job on the Mac.
    const job = await jsonRequest<Generation>("/generate", payload);
    if (!job.id) throw new Error("Voicebox did not return a generation ID; inspect its history before retrying");
    receipt = { hash, id: job.id };
    await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + "\n", { flag: "wx" });
  }
  const deadline = Date.now() + 30 * 60 * 1000;
  let job: Generation;
  while (true) {
    job = await jsonRequest<Generation>(`/history/${encodeURIComponent(receipt.id)}`);
    if (job.status === "completed") break;
    if (["failed", "cancelled", "canceled", "error"].includes(job.status)) throw new Error(`Scene ${scene.id} generation ${job.status}; inspect Voicebox history`);
    if (Date.now() > deadline) throw new Error(`Scene ${scene.id} still pending. Receipt saved; rerun to resume.`);
    await new Promise(done => setTimeout(done, 2000));
  }
  const response = await fetch(new URL(`/audio/${encodeURIComponent(receipt.id)}`, base), { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Audio download failed: HTTP ${response.status}`);
  const wav = Buffer.from(await response.arrayBuffer());
  if (wav.length < 44 || wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") throw new Error("Voicebox audio is not a RIFF WAV file; nothing saved");
  await mkdir(resolve(directory, "audio"), { recursive: true });
  await writeFile(`${outputPath}.part`, wav, { flag: "wx" });
  await rename(`${outputPath}.part`, outputPath);
  await writeFile(resolve(artifacts, `${scene.id}.result.json`), JSON.stringify({ ...receipt, engine: job.engine, durationSec: job.duration, wavSha256: createHash("sha256").update(wav).digest("hex") }, null, 2) + "\n");
  console.log(`Saved audio/${scene.id}.wav (${job.duration ?? "unknown"} seconds). Listen before accepting.`);
}
console.log(generate ? "Generation finished. Review pronunciation and scene pacing before rendering." : "Preparation finished; no speech generated. Add --generate to create the WAV clips.");
