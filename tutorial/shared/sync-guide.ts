import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { publishTutorial } from "./publish";

// Synchronize receipt-backed uploads without inventing playback approval.
const root = resolve(import.meta.dir, "..");
const refresh = Bun.spawn(["bun", resolve(root, "shared/upload-ledger.ts")], { stdout: "ignore", stderr: "inherit" });
if (await refresh.exited !== 0) throw new Error("Cannot validate upload receipts");
const ledger = JSON.parse(await readFile(resolve(root, "upload-ledger.json"), "utf8")) as {
  entries: Array<{ id: string; folder: string; status: string; videoId?: string; renderDir?: string }>;
};
const catalogPath = resolve(root, "catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as Array<{ id: string; status: string; media?: { provider?: string; videoId?: string } }>;
for (const entry of ledger.entries) {
  if (entry.status !== "uploaded" || !entry.videoId || !entry.renderDir) continue;
  const directory = resolve(root, entry.folder);
  await writeFile(resolve(directory, "media.local.json"), JSON.stringify({ provider: "youtube", videoId: entry.videoId }, null, 2) + "\n");
  const current = catalog.find(item => item.id === entry.id);
  if (current?.status === "published" && current.media?.provider === "youtube" && current.media.videoId === entry.videoId) {
    console.log(`${entry.id}: Guide already matches ${entry.videoId}`);
    continue;
  }
  const review = JSON.parse(await readFile(resolve(entry.renderDir, "review.json"), "utf8"));
  if (!["watchedWithAudio", "actionsMatchNarration", "captionsChecked", "fictionalDataOnly", "approved"].every(field => review[field] === true)) {
    console.log(`${entry.id}: linked locally to ${entry.videoId}; Guide awaits playback approval`);
    continue;
  }
  process.env.TUTORIAL_PUBLISH_APPROVED = "true";
  await publishTutorial(directory, catalogPath);
}
const finalRefresh = Bun.spawn(["bun", resolve(root, "shared/upload-ledger.ts")], { stdout: "ignore", stderr: "inherit" });
if (await finalRefresh.exited !== 0) throw new Error("Cannot refresh Guide publication status");
