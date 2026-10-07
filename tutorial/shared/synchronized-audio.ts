import type { ProductionPlan } from "./production-plan";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { sha, load, duration, sectionAudioPath } from "./media";

export async function generateSectionAudio(directory: string, production: ProductionPlan) {
  if (process.env.TUTORIAL_AUDIO_APPROVED !== "true") throw new Error("Audio generation requires TUTORIAL_AUDIO_APPROVED=true after authorization");
  const cache = resolve(directory, "artifacts", "synchronized-audio");
  await mkdir(cache, { recursive: true });
  const audioPath = (segment: ProductionPlan["segments"][number]) => sectionAudioPath(directory, segment);
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
    await writeFile(`${path}.tmp`, wav);
    await rename(`${path}.tmp`, path);
    await writeFile(receiptPath, JSON.stringify({ ...receipt, wavSha256: sha(wav), durationSec: await duration(path) }, null, 2) + "\n");
  }

}
