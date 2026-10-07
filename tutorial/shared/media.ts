import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ProductionSegment } from "./production-plan";

export const sha = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
export const sectionAudioPath = (directory: string, segment: ProductionSegment) =>
  resolve(directory, "artifacts", "synchronized-audio", `${segment.id}-${sha(segment.text).slice(0, 16)}.wav`);

export async function load<T>(path: string): Promise<T | null> {
  try { return JSON.parse(await readFile(path, "utf8")) as T; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function run(args: string[]) {
  const child = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
  const [out, error, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  if (exit) throw new Error(`${args[0]} failed: ${error.slice(-1500)}`);
  return out.trim();
}
export async function duration(path: string) {
  const value = Number(await run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path]));
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid media duration: ${path}`);
  return value;
}

/** Source digest also covers uncommitted changes to shared production mechanics. */
export async function producerHash() {
  const files = ["produce.ts", "media.ts", "production-plan.ts", "synchronized-audio.ts", "synchronized-capture.ts", "synchronized-render.ts", "record.ts", "cursor.ts", "types.ts"];
  const digests = await Promise.all(files.map(async file => `${file}:${sha(await readFile(resolve(import.meta.dir, file)))}`));
  return sha(digests.join("\n"));
}
