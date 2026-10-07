import { readFile, writeFile, mkdir, copyFile, access, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";
import type { RecordingManifest, RecordingPlan } from "./types";

async function exists(file: string) { try { await access(file); return true; } catch { return false; } }
async function run(args: string[]) {
  const process = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(process.stdout).text(), new Response(process.stderr).text(), process.exited]);
  if (code !== 0) throw new Error(`${args[0]} failed: ${stderr.slice(-2000)}`);
  return stdout.trim();
}
async function duration(file: string) {
  const result = Number(await run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]));
  if (!Number.isFinite(result) || result <= 0) throw new Error(`Invalid media duration: ${file}`);
  return result;
}
async function audioFile(directory: string, name: string) {
  for (const extension of ["wav", "mp3", "m4a"]) {
    const file = resolve(directory, "audio", `${name}.${extension}`);
    if (await exists(file)) return file;
  }
  return undefined;
}
function timestamp(seconds: number) {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
export async function renderTutorial(directory: string): Promise<void> {
  const planText = await readFile(resolve(directory, "tutorial.json"), "utf8");
  const plan = JSON.parse(planText) as RecordingPlan;
  const manifestText = await readFile(resolve(directory, "artifacts", "last-recording.json"), "utf8");
  const manifest = JSON.parse(manifestText) as RecordingManifest;
  const attempt = JSON.parse(await readFile(resolve(directory, "artifacts", "last-attempt.json"), "utf8"));
  if (!attempt.complete || attempt.runId !== manifest.runId) throw new Error("The latest recording attempt failed. Record successfully before rendering; an older success is not used silently.");
  const planHash = createHash("sha256").update(planText).digest("hex");
  if (!manifest.complete || manifest.tutorialId !== plan.id || manifest.planHash !== planHash || manifest.scenes.length !== plan.scenes.length) {
    throw new Error("Recording is incomplete or does not match the current storyboard; record again");
  }
  const singleAudio = await audioFile(directory, "narration");
  let cues: Array<{ id: string; start: number; end: number }> = [];
  if (singleAudio) {
    cues = JSON.parse(await readFile(resolve(directory, "audio", "cues.json"), "utf8"));
    const fullDuration = await duration(singleAudio);
    let previousEnd = 0;
    if (cues.length !== plan.scenes.length) throw new Error("Supply one audio cue per scene");
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i]!;
      if (cue.id !== plan.scenes[i]!.id || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start || cue.end > fullDuration + 0.05) {
        throw new Error(`Invalid or overlapping audio cue for scene ${cue.id}`);
      }
      previousEnd = cue.end;
    }
  }
  // Resolve and inspect all input audio before producing any output.
  const inputs = [];
  for (let i = 0; i < plan.scenes.length; i++) {
    const scene = plan.scenes[i]!;
    const recording = manifest.scenes[i]!;
    if (scene.id !== recording.id || !recording.rawVideo.startsWith(resolve(directory, "artifacts") + "/")) throw new Error("Invalid scene recording path");
    const file = singleAudio ?? await audioFile(directory, scene.id);
    if (!file) throw new Error(`Audio missing: audio/${scene.id}.wav (or narration.wav plus cues.json). Supply audio before rendering.`);
    const cue = singleAudio ? cues[i] : undefined;
    const audioDuration = cue ? cue.end - cue.start : await duration(file);
    const rawDuration = await duration(recording.rawVideo);
    if (rawDuration > audioDuration + 0.1) {
      throw new Error(`Scene ${scene.id}: footage ${rawDuration.toFixed(1)}s exceeds audio ${audioDuration.toFixed(1)}s. Shorten the recording actions or provide a longer narrated section; no action is silently cut.`);
    }
    inputs.push({ scene, recording, file, cue, audioDuration });
  }
  const outputDirectory = resolve(directory, "artifacts", manifest.runId, "render");
  await mkdir(outputDirectory, { recursive: true });
  const clips = [];
  let captions = "WEBVTT\n\nNOTE Draft cue timings; review against speech before publication.\n\n";
  let offset = 0;
  for (const input of inputs) {
    const output = resolve(outputDirectory, `${input.scene.id}.mp4`);
    const audioInput = input.cue ? ["-ss", String(input.cue.start), "-t", String(input.audioDuration), "-i", input.file] : ["-i", input.file];
    await run(["ffmpeg", "-y", "-i", input.recording.rawVideo, ...audioInput,
      "-filter_complex", `[0:v]scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2,tpad=stop_mode=clone:stop_duration=${input.audioDuration},trim=duration=${input.audioDuration},setpts=PTS-STARTPTS[v];[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad,atrim=duration=${input.audioDuration},asetpts=PTS-STARTPTS[a]`,
      "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", output]);
    clips.push(output);
    const sentences = input.scene.narration.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [input.scene.narration];
    const totalWords = sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0);
    let localTime = 0;
    for (const sentence of sentences) {
      const length = input.audioDuration * sentence.split(/\s+/).length / totalWords;
      captions += `${timestamp(offset + localTime)} --> ${timestamp(offset + localTime + length)}\n${sentence}\n\n`;
      localTime += length;
    }
    offset += input.audioDuration;
  }
  const list = resolve(outputDirectory, "clips.txt");
  await writeFile(list, clips.map(file => `file '${file.replace(/'/g, "'\\''")}'`).join("\n") + "\n");
  const video = resolve(outputDirectory, "video.mp4");
  await run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", video]);
  const finalDuration = await duration(video);
  if (Math.abs(finalDuration - offset) > 0.5) throw new Error("Rendered video duration does not match the scene timeline");
  const vtt = resolve(outputDirectory, "captions.vtt");
  const suppliedCaptions = resolve(directory, "audio", "captions.vtt");
  if (await exists(suppliedCaptions)) await copyFile(suppliedCaptions, vtt);
  else await writeFile(vtt, captions);
  await run(["ffmpeg", "-y", "-ss", String(Math.min(2, finalDuration / 2)), "-i", video, "-frames:v", "1", "-q:v", "82", resolve(outputDirectory, "poster.webp")]);
  const review = {
    tutorialId: plan.id, runId: manifest.runId, planHash, sourceCommit: manifest.sourceCommit,
    durationSec: finalDuration,
    videoSha256: createHash("sha256").update(await readFile(video)).digest("hex"),
    captionsSha256: createHash("sha256").update(await readFile(vtt)).digest("hex"),
    watchedWithAudio: false, actionsMatchNarration: false, captionsChecked: false,
    fictionalDataOnly: false, approved: false, notes: "Review this exact rendered video; approval is never inferred from capture success.",
  };
  await writeFile(resolve(outputDirectory, "review.json"), JSON.stringify(review, null, 2) + "\n");
  const pointer = resolve(directory, "artifacts", "last-render.json");
  await writeFile(`${pointer}.tmp`, JSON.stringify({ runId: manifest.runId, outputDirectory }, null, 2) + "\n");
  await rename(`${pointer}.tmp`, pointer);
  console.log(`Draft rendered: ${relative(process.cwd(), video)}. Check captions and approve review.json before publication.`);
}
