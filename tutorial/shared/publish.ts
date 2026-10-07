import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { isValidTutorialMedia } from "./content";

export async function publishTutorial(directory: string, catalogPath: string) {
  if (process.env.TUTORIAL_PUBLISH_APPROVED !== "true") throw new Error("Publication requires explicit approval: TUTORIAL_PUBLISH_APPROVED=true");
  const { outputDirectory, runId } = JSON.parse(await readFile(resolve(directory, "artifacts", "last-render.json"), "utf8"));
  if (!outputDirectory.startsWith(resolve(directory, "artifacts") + "/")) throw new Error("Invalid render directory");
  const review = JSON.parse(await readFile(resolve(outputDirectory, "review.json"), "utf8"));
  for (const field of ["watchedWithAudio", "actionsMatchNarration", "captionsChecked", "fictionalDataOnly", "approved"]) {
    if (review[field] !== true) throw new Error(`Complete the review before publishing: ${field}`);
  }
  const hash = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
  if (review.runId !== runId || review.planHash !== hash(await readFile(resolve(directory, "tutorial.json"))) || review.videoSha256 !== hash(await readFile(resolve(outputDirectory, "video.mp4"))) || review.captionsSha256 !== hash(await readFile(resolve(outputDirectory, "captions.vtt")))) {
    throw new Error("Review does not match current storyboard/video/captions. Review the current artifacts again.");
  }
  const input = JSON.parse(await readFile(resolve(directory, "media.local.json"), "utf8"));
  const media = { ...input, durationSec: review.durationSec, reviewedCommit: review.sourceCommit };
  if (!isValidTutorialMedia(media)) throw new Error("Supply a YouTube video ID or HTTPS video/poster/caption URLs and valid review metadata");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const entry = catalog.find((item: { id: string }) => item.id === review.tutorialId);
  if (!entry) throw new Error("Tutorial is missing from catalog");
  entry.status = "published";
  entry.media = media;
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Published catalog entry: ${entry.id}. Deploy the web app to expose it. Media upload is a separate authorized action.`);
}
