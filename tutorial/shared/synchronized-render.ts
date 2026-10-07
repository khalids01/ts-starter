import type { ProductionPlan } from "./production-plan";
import type { RecordingPlan } from "./types";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { sha, load, run, duration, producerHash } from "./media";

export async function renderSections(directory: string, production: ProductionPlan, plan: RecordingPlan, planHash: string) {
  if (process.env.TUTORIAL_RENDER_APPROVED !== "true") throw new Error("Rendering requires TUTORIAL_RENDER_APPROVED=true after authorization");
  const capturePointer = resolve(directory, "artifacts", "last-synchronized-capture.json");
  const attempt = await load<{ complete: boolean; runId: string }>(resolve(directory, "artifacts", "last-synchronized-attempt.json"));
  const last = await load<{ runId: string }>(capturePointer);
  if (!attempt?.complete || attempt.runId !== last?.runId) throw new Error("Latest capture failed or incomplete; do not render an older attempt");
  const renderAttempt = resolve(directory, "artifacts", "last-synchronized-render-attempt.json");
  await writeFile(renderAttempt, JSON.stringify({ complete: false, runId: last.runId }) + "\n");
  const capture = await load<{ productionCodeHash: string; complete: boolean; runId: string; output: string; planHash: string; sourceCommit: string; records: Array<{ id: string; image: string; imageSha256: string; audio: string; audioSha256: string; audioDurationSec: number }> }>(capturePointer);
  if (!capture?.complete || capture.planHash !== planHash || capture.records.length !== production.segments.length || capture.sourceCommit !== await run(["git", "rev-parse", "HEAD"]) || capture.productionCodeHash !== await producerHash()) throw new Error("Capture missing or outdated");
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
    const caption = segment.text.replace(/(.{1,64})(?:\s+|$)/g, "$1\n").trim();
    captions += `${segment.id}\n${stamp(offset)} --> ${stamp(offset + record.audioDurationSec)}\n${caption}\n\n`;
    timeline.push({ id: segment.id, text: segment.text, target: segment.target, scene: segment.scene, evidence: segment.evidence, startSec: offset, speechEndSec: offset + record.audioDurationSec, endSec: offset + encodedDuration, highlightHeldForEntireSpeech: true });
    offset += encodedDuration;
    clips.push(clip);
  }
  const list = resolve(output, "clips.txt");
  await writeFile(list, clips.map(path => `file '${path.replaceAll("\'", "\'\\\'\'")}'`).join("\n") + "\n");
  const video = resolve(output, "video.mp4");
  await run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", video]);
  const finalDuration = await duration(video);
  if (Math.abs(finalDuration - offset) > 0.15) throw new Error("Final timeline drift");
  // Compare both ends of every held scene against its accepted capture.
  // This runs only during a separately authorized render, never during prepare.
  const quality = [];
  for (let i = 0; i < timeline.length; i++) {
    const section = timeline[i]!, record = capture.records[i]!;
    for (const [edge, sample] of [["start", section.startSec + 0.1], ["end", section.endSec - 0.15]] as const) {
      const stats = resolve(output, `${record.id}-${edge}-ssim.txt`);
      await run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", String(Math.max(section.startSec, sample)), "-i", video, "-i", record.image, "-filter_complex", `[0:v]setpts=PTS-STARTPTS[v];[1:v]format=yuv420p,setpts=PTS-STARTPTS[p];[v][p]ssim=stats_file=${stats}`, "-frames:v", "1", "-f", "null", "-"]);
      const similarity = Number((await readFile(stats, "utf8")).match(/All:([\d.]+)/)?.[1]);
      if (!Number.isFinite(similarity) || similarity < 0.98) throw new Error(`Rendered frame does not match spotlight: ${record.id}/${edge}`);
      quality.push({ id: record.id, edge, sampleSec: sample, similarity });
    }
  }
  await writeFile(resolve(output, "frame-quality.json"), JSON.stringify(quality, null, 2) + "\n");
  await writeFile(resolve(output, "captions.vtt"), captions);
  await writeFile(resolve(output, "timeline.json"), JSON.stringify(timeline, null, 2) + "\n");
  await run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "2", "-i", video, "-frames:v", "1", resolve(output, "poster.webp")]);
  const currentPlan = await readFile(resolve(directory, "tutorial.json"), "utf8");
  await writeFile(resolve(output, "review.json"), JSON.stringify({ tutorialId: plan.id, runId: capture.runId, sourceCommit: capture.sourceCommit, planHash: sha(currentPlan), productionPlanHash: planHash, productionCodeHash: capture.productionCodeHash, durationSec: finalDuration, videoSha256: sha(await readFile(video)), captionsSha256: sha(captions), sceneBoundaryFramesChecked: true, watchedWithAudio: false, actionsMatchNarration: false, captionsChecked: false, fictionalDataOnly: true, approved: false, notes: "Production-build UI frames held for each exact speech section; inspect timeline.json. No loading frames or navigation transitions are included. Full playback review still required." }, null, 2) + "\n");
  const pointer = resolve(directory, "artifacts", "last-render.json");
  await writeFile(`${pointer}.tmp`, JSON.stringify({ runId: capture.runId, outputDirectory: output }, null, 2) + "\n");
  await rename(`${pointer}.tmp`, pointer);
  await writeFile(renderAttempt, JSON.stringify({ complete: true, runId: capture.runId }) + "\n");
  console.log(`Rendered synchronized tutorial: ${video} (${finalDuration}s)`);
}
