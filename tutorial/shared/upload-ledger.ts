import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

// Generates tutorial/upload-ledger.json from the per-tutorial artifacts.
// Source of truth stays the render/upload receipts; this file is derived, never hand-edited.
const root = resolve(import.meta.dir, "..");
type Entry = {
  id: string;
  folder: string;
  title: string;
  status: "uploaded" | "rendered" | "pending-production" | "invalid-render";
  runId?: string;
  videoId?: string;
  url?: string;
  visibility?: string;
  processing?: string;
  verifiedAt?: string;
  renderDir?: string;
  videoPath?: string;
  videoSha256?: string;
  durationSec?: number;
  reviewApproved?: boolean;
  watchedWithAudio?: boolean;
  guideStatus?: string;
  captureComplete?: boolean;
  issues?: string[];
  lastUploadAttempt?: { at: string; state: string; reason?: string };
};
const catalog = JSON.parse(
  await readFile(resolve(root, "catalog.json"), "utf8")
) as Array<{ id: string; folder: string; title: string; status: string }>;
const entries: Entry[] = [];

async function read<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

for (const item of catalog) {
  const directory = resolve(root, item.folder);
  const pointer = await read<{ runId: string; outputDirectory: string }>(
    resolve(directory, "artifacts", "last-render.json")
  );
  if (!pointer) {
    const capture = await read<{ complete: boolean }>(resolve(directory, "artifacts", "last-synchronized-attempt.json"));
    entries.push({
      id: item.id,
      folder: item.folder,
      title: item.title,
      status: "pending-production",
      captureComplete: capture?.complete ?? false,
      guideStatus: item.status,
    });
    continue;
  }
  const local = resolve(pointer.outputDirectory, "youtube");
  if (!resolve(pointer.outputDirectory).startsWith(resolve(directory, "artifacts") + "/")) throw new Error(`Unsafe render pointer: ${item.id}`);
  const videoPath = resolve(pointer.outputDirectory, "video.mp4");
  const review = await read<{ videoSha256: string; durationSec: number; approved: boolean; watchedWithAudio: boolean; runId: string; tutorialId: string; planHash: string; productionPlanHash?: string }>(resolve(pointer.outputDirectory, "review.json"));
  const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");
  let videoSha256: string | undefined;
  try { videoSha256 = hash(await readFile(videoPath)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const issues: string[] = [];
  if (!videoSha256 || !review || videoSha256 !== review.videoSha256 || review.runId !== pointer.runId || review.tutorialId !== item.id) issues.push("Missing or mismatched video/render receipt");
  if (review && review.planHash !== hash(await readFile(resolve(directory, "tutorial.json")))) issues.push("Canonical plan changed since rendering");
  if (review?.productionPlanHash && review.productionPlanHash !== hash(await readFile(resolve(directory, "production.json")))) issues.push("Production plan changed since rendering");
  const renderAttempt = await read<{ complete: boolean; runId: string }>(resolve(directory, "artifacts", "last-synchronized-render-attempt.json"));
  if (renderAttempt && (!renderAttempt.complete || renderAttempt.runId !== pointer.runId)) issues.push("Latest render attempt incomplete or different");
  const lastUploadAttempt = await read<{ at: string; state: string; reason?: string }>(resolve(local, "last-attempt.json"));
  const details = { videoPath, videoSha256, durationSec: review?.durationSec, reviewApproved: review?.approved ?? false, watchedWithAudio: review?.watchedWithAudio ?? false, guideStatus: item.status, issues, lastUploadAttempt: lastUploadAttempt ?? undefined };
  if (item.status === "published" && !review?.approved) issues.push("Guide published; local review approval flag is incomplete (check historical acceptance)");
  const result = await read<{ hash?: string; video?: { id?: string }; watchUrl?: string }>(
    resolve(local, "result.json")
  );
  const verification = await read<{
    checkedAt?: string;
    video?: {
      id?: string;
      status?: { privacyStatus?: string };
      processingDetails?: { processingStatus?: string };
    };
  }>(resolve(local, "verification.json"));
  if (result?.video?.id && result.hash === videoSha256) {
    entries.push({
      id: item.id,
      folder: item.folder,
      title: item.title,
      status: "uploaded",
      runId: pointer.runId,
      videoId: result.video.id,
      url:
        result.watchUrl ?? `https://www.youtube.com/watch?v=${result.video.id}`,
      visibility: verification?.video?.id === result.video.id ? verification?.video?.status?.privacyStatus : undefined,
      processing: verification?.video?.id === result.video.id ? verification?.video?.processingDetails?.processingStatus : undefined,
      verifiedAt: verification?.video?.id === result.video.id ? verification.checkedAt : undefined,
      renderDir: pointer.outputDirectory,
      ...details,
    });
  } else {
    entries.push({
      id: item.id,
      folder: item.folder,
      title: item.title,
      status: issues.length ? "invalid-render" : "rendered",
      runId: pointer.runId,
      renderDir: pointer.outputDirectory,
      ...details,
    });
  }
}

const ledger = {
  version: 2,
  generatedAt: new Date().toISOString(),
  evidence: "Local video hashes and saved YouTube receipts; no live YouTube query",
  uploader: "tutorial/shared/youtube-upload.ts",
  summary01to20: {
    rendered: entries.filter(entry => /^([01]\d|20)-/.test(entry.folder) && !entry.folder.startsWith("00-") && entry.videoSha256).length,
    uploaded: entries.filter(entry => /^([01]\d|20)-/.test(entry.folder) && entry.status === "uploaded").length,
    pendingUpload: entries.filter(entry => /^([01]\d|20)-/.test(entry.folder) && entry.status === "rendered").length,
    guidePublished: entries.filter(entry => /^([01]\d|20)-/.test(entry.folder) && entry.guideStatus === "published").length,
  },
  pendingUploadIds: entries.filter(entry => entry.status === "rendered" && !entry.folder.startsWith("00-")).map(entry => entry.id),
  entries,
};
await writeFile(
  resolve(root, "upload-ledger.json"),
  JSON.stringify(ledger, null, 2) + "\n"
);
const counts = entries.reduce<Record<string, number>>(
  (acc, entry) => ({ ...acc, [entry.status]: (acc[entry.status] ?? 0) + 1 }),
  {}
);
console.log(`upload-ledger.json written: ${JSON.stringify(counts)}`);
for (const entry of entries)
  if (entry.status !== "pending-production")
    console.log(
      `  ${entry.id.padEnd(32)} ${entry.status.padEnd(10)} ${
        entry.videoId ?? entry.runId
      }`
    );
