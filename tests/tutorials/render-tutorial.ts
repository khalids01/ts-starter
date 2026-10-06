import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Muxes the Playwright WebM recording with the pre-recorded narration and writes
 * the final H.264/AAC tutorial plus its poster.
 *
 * Subtitles are intentionally not burned in; the narration is clear and
 * `captions.vtt` stays alongside the video as a sidecar track.
 *
 * Usage:
 *   bun tests/tutorials/render-tutorial.ts [path/to/recording.webm]
 *
 * Without an argument it uses the raw video from the last
 * `tutorial:record` run (tests/artifacts/tutorials/product-to-order/last-recording.json).
 */
const repoRoot = resolve(import.meta.dir, "../..");
const tutorialDir = resolve(repoRoot, "docs/tutorials/01-product-to-completed-order");
const artifactDir = resolve(repoRoot, "tests/artifacts/tutorials/product-to-order");
const manifestPath = resolve(artifactDir, "last-recording.json");
const outputName = "tutorial-product-to-completed-order.mp4";

const posterSec = Number(process.env.TUTORIAL_POSTER_SEC ?? 30);
const rawVideoArg = process.argv[2];

async function resolveRawVideo(): Promise<string> {
  if (rawVideoArg) return resolve(rawVideoArg);
  if (!existsSync(manifestPath)) {
    throw new Error(
      `No recording manifest at ${manifestPath}. Record first or pass the WebM path as an argument.`,
    );
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    rawVideo?: string;
  };
  if (!manifest.rawVideo || !existsSync(manifest.rawVideo)) {
    throw new Error(
      `Recording manifest does not point to an existing file: ${manifest.rawVideo}`,
    );
  }
  return manifest.rawVideo;
}

async function run(args: string[], label: string): Promise<void> {
  const proc = Bun.spawn(args, { cwd: tutorialDir, stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`${label} failed with exit code ${code}`);
}

async function probeDuration(file: string): Promise<number> {
  const proc = Bun.spawn(
    [
      "ffprobe",
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      file,
    ],
    { cwd: tutorialDir, stdout: "pipe", stderr: "pipe" },
  );
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return Number.parseFloat(text.trim());
}

const videoFilter =
  "[0:v]scale=1440:900:force_original_aspect_ratio=decrease," +
  "pad=1440:900:(ow-iw)/2:(oh-ih)/2," +
  "tpad=stop_mode=clone:stop_duration=10[v]";

const rawVideo = await resolveRawVideo();
console.log(`Rendering ${rawVideo} -> ${outputName}`);

await run(
  [
    "ffmpeg",
    "-y",
    "-i",
    rawVideo,
    "-i",
    "audio_normalized.mp3",
    "-filter_complex",
    videoFilter,
    "-map",
    "[v]",
    "-map",
    "1:a",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    "-shortest",
    outputName,
  ],
  "ffmpeg render",
);

await run(
  [
    "ffmpeg",
    "-y",
    "-ss",
    String(posterSec),
    "-i",
    outputName,
    "-frames:v",
    "1",
    "-vf",
    "scale=1440:900",
    "-q:v",
    "82",
    "poster.webp",
  ],
  "ffmpeg poster",
);

const [videoDuration, audioDuration] = await Promise.all([
  probeDuration(outputName),
  probeDuration("audio_normalized.mp3"),
]);
console.log(
  `Output: ${videoDuration.toFixed(2)}s video, ${audioDuration.toFixed(2)}s narration`,
);
if (Math.abs(videoDuration - audioDuration) > 1) {
  console.warn("Warning: output length differs from the narration by more than 1s.");
}
console.log("Tutorial rendered.");
