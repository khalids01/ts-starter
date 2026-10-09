import { createHash } from "node:crypto";
import { mkdir, open, readFile, realpath, writeFile, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";

const [id, ...flags] = process.argv.slice(2);
const upload = flags.includes("--upload");
const privacy = flags.find(flag => flag.startsWith("--visibility="))?.split("=")[1] ?? "private";
if (!id || !["private", "unlisted", "public"].includes(privacy) || flags.some(flag => flag !== "--upload" && !/^--visibility=(private|unlisted|public)$/.test(flag))) throw new Error("Usage: bun --env-file=apps/server/.env tutorial/shared/youtube-upload.ts <id> --visibility=unlisted [--upload]");
const root = resolve(import.meta.dir, "..");
const catalog = JSON.parse(await readFile(resolve(root, "catalog.json"), "utf8")) as Array<{ id: string; folder: string; title: string; description: string }>;
const entry = catalog.find(item => item.id === id);
if (!entry) throw new Error("Unknown tutorial ID");
const directory = resolve(root, entry.folder);
const pointer = JSON.parse(await readFile(resolve(directory, "artifacts", "last-render.json"), "utf8")) as { runId: string; outputDirectory: string };
const output = await realpath(pointer.outputDirectory);
if (!output.startsWith(await realpath(resolve(directory, "artifacts")) + sep)) throw new Error("Render path must stay inside tutorial artifacts");
const video = await readFile(resolve(output, "video.mp4"));
const hash = createHash("sha256").update(video).digest("hex");
const review = JSON.parse(await readFile(resolve(output, "review.json"), "utf8")) as { tutorialId: string; runId: string; videoSha256: string };
if (review.videoSha256 !== hash || review.tutorialId !== id || review.runId !== pointer.runId) throw new Error("Video differs from its render receipt");
const metadata = { snippet: { title: entry.title, description: `${entry.description}\n\nNarration: Heart (Kokoro).`, categoryId: "28", defaultLanguage: "en", defaultAudioLanguage: "en" }, status: { privacyStatus: privacy, selfDeclaredMadeForKids: false, embeddable: true } };
const local = resolve(output, "youtube");
await mkdir(local, { recursive: true });
await writeFile(resolve(local, "upload-plan.json"), JSON.stringify({ tutorialId: id, videoSha256: hash, bytes: video.length, metadata }, null, 2) + "\n");
if (!upload) { console.log(`Prepared ${entry.title}: ${privacy}, ${video.length} bytes. No upload started.`); process.exit(0); }
const lockPath = resolve(local, "upload.lock");
const lock = await open(lockPath, "wx").catch(() => { throw new Error("Upload lock exists. Check for an active upload before removing it."); });
const { disconnectRedis } = await import("../../packages/redis/src/index.server");
try {
  const { getYoutubeUploadAccess } = await import("../../apps/server/src/modules/integrations/youtube/youtube.service");
  const auth = await getYoutubeUploadAccess();
  console.log(`Upload target: ${auth.channelTitle} (${auth.channelId}); visibility: ${privacy}`);
  const headers = { Authorization: `Bearer ${auth.accessToken}` };
  const resultPath = resolve(local, "result.json");
  const sessionPath = resolve(local, "session.json");
  type Video = { id: string; snippet?: { channelId?: string }; status?: { privacyStatus?: string; uploadStatus?: string }; processingDetails?: { processingStatus?: string } };
  type Session = { hash: string; privacy: string; channelId: string; url: string };
  async function load<T>(path: string): Promise<T | null> {
    try { return JSON.parse(await readFile(path, "utf8")) as T; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  async function checked(response: Response): Promise<Video> {
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { errors?: { reason?: string }[] } } | null;
      const reason = body?.error?.errors?.[0]?.reason;
      throw new Error(`YouTube HTTP ${response.status}${reason && /^[a-zA-Z0-9_-]+$/.test(reason) ? ` (${reason})` : ""}; session receipt retained`);
    }
    const result = await response.json() as Video;
    if (!result.id || !/^[\w-]{11}$/.test(result.id)) throw new Error("No valid YouTube video ID returned; check channel before retrying");
    return result;
  }
  let uploaded: Video | null = null;
  const existing = await load<{ hash: string; privacy: string; channelId: string; video: Video }>(resultPath);
  if (existing) {
    if (existing.hash !== hash || existing.privacy !== privacy || existing.channelId !== auth.channelId) throw new Error("Existing upload receipt differs; refusing another upload");
    uploaded = existing.video;
    console.log("Existing upload found; checking it without creating another video.");
  } else {
    let session = await load<Session>(sessionPath);
    if (session && (session.hash !== hash || session.privacy !== privacy || session.channelId !== auth.channelId)) throw new Error("Existing session differs from this upload; review it first");
    let offset = 0;
    if (!session) {
      const response = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status&notifySubscribers=false", { method: "POST", headers: { ...headers, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": String(video.length) }, body: JSON.stringify(metadata), signal: AbortSignal.timeout(30000), redirect: "manual" });
      if (!response.ok) await checked(response);
      const url = response.headers.get("location");
      if (!url) throw new Error("No upload session URL received; inspect channel before retrying");
      session = { hash, privacy, channelId: auth.channelId, url };
      const parsed = new URL(url);
      if (parsed.origin !== "https://www.googleapis.com" || !parsed.pathname.startsWith("/upload/youtube/v3/videos")) throw new Error("Unexpected upload session origin");
      await writeFile(sessionPath, JSON.stringify(session, null, 2) + "\n", { mode: 0o600, flag: "wx" });
    } else {
      const url = new URL(session.url);
      if (url.origin !== "https://www.googleapis.com" || !url.pathname.startsWith("/upload/youtube/v3/videos")) throw new Error("Invalid saved upload session");
      const response = await fetch(session.url, { method: "PUT", headers: { ...headers, "Content-Length": "0", "Content-Range": `bytes */${video.length}` }, body: "", signal: AbortSignal.timeout(30000), redirect: "manual" });
      if (response.status === 308) {
        const range = response.headers.get("range");
        const match = range?.match(/^bytes=0-(\d+)$/);
        if (range && !match) throw new Error("Invalid resumable range");
        offset = match ? Number(match[1]) + 1 : 0;
      } else uploaded = await checked(response);
    }
    if (!uploaded) {
      if (offset < 0 || offset >= video.length) throw new Error("Invalid upload offset");
      const response = await fetch(session.url, { method: "PUT", headers: { ...headers, "Content-Type": "video/mp4", "Content-Length": String(video.length - offset), "Content-Range": `bytes ${offset}-${video.length - 1}/${video.length}` }, body: video.subarray(offset), signal: AbortSignal.timeout(120000), redirect: "manual" });
      uploaded = await checked(response);
    }
    await writeFile(resultPath, JSON.stringify({ hash, privacy, channelId: auth.channelId, video: uploaded, watchUrl: `https://www.youtube.com/watch?v=${uploaded.id}` }, null, 2) + "\n", { mode: 0o600 });
  }
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status,processingDetails&id=${uploaded.id}`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Upload receipt saved, but verification failed (${response.status})`);
  const verification = await response.json() as { items?: Video[] };
  const actual = verification.items?.[0];
  if (!actual || actual.snippet?.channelId !== auth.channelId) throw new Error("Upload verification returned an unexpected channel or missing video");
  await writeFile(resolve(local, "verification.json"), JSON.stringify({ checkedAt: new Date().toISOString(), video: actual }, null, 2) + "\n");
  console.log(`Uploaded: https://www.youtube.com/watch?v=${uploaded.id}`);
  console.log(`Actual visibility: ${actual.status?.privacyStatus}; processing: ${actual.processingDetails?.processingStatus ?? actual.status?.uploadStatus}`);
  if (actual.status?.privacyStatus !== privacy) console.log("YouTube returned different visibility. Check API project restrictions and YouTube Studio.");
  await writeFile(resolve(local, "last-attempt.json"), JSON.stringify({ at: new Date().toISOString(), state: "uploaded" }, null, 2) + "\n");
} catch (error) {
  const reason = error instanceof Error ? error.message.match(/\((uploadLimitExceeded|quotaExceeded|dailyLimitExceeded|rateLimitExceeded|userRateLimitExceeded)\)/)?.[1] : undefined;
  await writeFile(resolve(local, "last-attempt.json"), JSON.stringify({ at: new Date().toISOString(), state: reason ? "blocked-limit" : "failed", reason: reason ?? "unknown" }, null, 2) + "\n");
  throw error;
} finally {
  await disconnectRedis();
  await lock.close();
  await unlink(lockPath);
  const refresh = Bun.spawn(["bun", resolve(import.meta.dir, "upload-ledger.ts")], { stdout: "ignore", stderr: "inherit" });
  if (await refresh.exited !== 0) console.error("Upload ledger refresh failed; rerun tutorial:uploads:status.");
}
