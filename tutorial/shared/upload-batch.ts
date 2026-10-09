import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Uploads rendered tutorials not yet uploaded, up to --max, stopping cleanly when the
// channel daily upload limit is hit. Resume-safe: each upload reuses its own receipt.
const args = process.argv.slice(2);
if (args.some(arg => arg !== "--upload" && !/^--max=\d+$/.test(arg) && !/^--visibility=(private|unlisted|public)$/.test(arg))) throw new Error("Usage: upload-batch.ts [--max=6] [--visibility=unlisted] [--upload]");
const max = Number(args.find((arg) => arg.startsWith("--max="))?.split("=")[1] ?? "6");
const visibility = args.find((arg) => arg.startsWith("--visibility="))?.split("=")[1] ?? "unlisted";
if (!Number.isInteger(max) || max < 1) throw new Error("Usage: upload-batch.ts [--max=6] [--visibility=unlisted]");
const root = resolve(import.meta.dir, "..");
const catalog = JSON.parse(await readFile(resolve(root, "catalog.json"), "utf8")) as Array<{ id: string; folder: string }>;

const run = async (cmd: string[]) => {
  const child = Bun.spawn(cmd, { cwd: resolve(root, ".."), stdout: "pipe", stderr: "pipe", env: process.env });
  const [out, err, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  return { out: out + err, exit };
};

let uploaded = 0, blocked = 0;
const refresh = async () => {
  const result = await run(["bun", "tutorial/shared/upload-ledger.ts"]);
  if (result.exit) throw new Error("Cannot refresh upload ledger; inspect local receipts");
};
await refresh();
const ledger = JSON.parse(await readFile(resolve(root, "upload-ledger.json"), "utf8")) as { entries: Array<{ id: string; status: string }> };
for (const item of catalog) {
  if (item.folder.startsWith("00-") || ledger.entries.find(entry => entry.id === item.id)?.status !== "rendered") continue;
  if (uploaded >= max) break;
  const directory = resolve(root, item.folder);
  let hasRender = true;
  try { await readFile(resolve(directory, "artifacts", "last-render.json"), "utf8"); } catch { hasRender = false; }
  if (!hasRender) continue;
  const pointer = JSON.parse(await readFile(resolve(directory, "artifacts", "last-render.json"), "utf8"));
  if (!args.includes("--upload")) { console.log(`Pending review upload: ${item.id}`); uploaded++; continue; }
  const { out, exit } = await run(["bun", "--env-file=apps/server/.env", "tutorial/shared/youtube-upload.ts", item.id, `--visibility=${visibility}`, "--upload"]);
  const line = out.trim().split("\n").filter(Boolean).slice(-2).join(" | ");
  console.log(`${item.id}: ${line}`);
  const reason = out.match(/\((uploadLimitExceeded|quotaExceeded|dailyLimitExceeded|rateLimitExceeded|userRateLimitExceeded)\)/)?.[1];
  if (exit !== 0) await writeFile(resolve(pointer.outputDirectory, "youtube", "last-attempt.json"), JSON.stringify({ at: new Date().toISOString(), state: reason ? "blocked-limit" : "failed", reason: reason ?? "unknown" }, null, 2) + "\n");
  await refresh();
  if (reason) { blocked++; process.exitCode = 1; console.log(`YouTube limit reached (${reason}); stopping. Re-run later to resume. No reset time assumed.`); break; }
  if (exit !== 0) { process.exitCode = 1; console.log(`Upload failed for ${item.id} (exit ${exit}); stopping for inspection.`); break; }
  uploaded++;
}
console.log(`Batch finished: ${args.includes("--upload") ? "uploaded" : "previewed"} ${uploaded}, blocked ${blocked}.`);
