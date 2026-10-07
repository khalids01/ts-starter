import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";
import { env } from "@env/server";
import { connectRedis } from "@redis/server";

const scopes = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"];
const connectionKey = "integrations:youtube:connection";
const encryptionKey = Buffer.from(hkdfSync("sha256", env.BETTER_AUTH_SECRET, env.GOOGLE_CLIENT_ID, "youtube-credentials-v1", 32));
export const youtubeRedirectUri = new URL("/integrations/youtube/callback", env.BETTER_AUTH_URL).href;
type Connection = { channelId: string; channelTitle: string; connectedAt: string; connectedBy: string; refreshToken: string };
type Pending = { userId: string; sessionId: string; verifier: string };
const stateKey = (state: string) => `integrations:youtube:state:${createHash("sha256").update(state).digest("hex")}`;

function encrypt(connection: Connection) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(connection), "utf8"), cipher.final()]);
  return JSON.stringify({ iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") });
}
function decrypt(value: string): Connection {
  const data = JSON.parse(value) as { iv: string; tag: string; ciphertext: string };
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(data.iv, "base64"));
  decipher.setAuthTag(Buffer.from(data.tag, "base64"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data.ciphertext, "base64")), decipher.final()]).toString("utf8")) as Connection;
}
export async function youtubeStatus() {
  if (env.YOUTUBE_ENABLED !== "true") return { enabled: false, connection: null };
  const redis = await connectRedis();
  const value = await redis.get(connectionKey);
  if (!value) return { enabled: true, connection: null };
  const { channelId, channelTitle, connectedAt } = decrypt(value);
  return { enabled: true, connection: { channelId, channelTitle, connectedAt } };
}
export async function youtubeConnect(userId: string, sessionId: string) {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const redis = await connectRedis();
  await redis.set(stateKey(state), JSON.stringify({ userId, sessionId, verifier } satisfies Pending), "EX", 600);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: youtubeRedirectUri, response_type: "code", scope: scopes.join(" "), access_type: "offline", prompt: "consent select_account", state, code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256" }).toString();
  return { authorizationUrl: url.href };
}
export async function youtubeCallback(userId: string, sessionId: string, state: string, code?: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state)) throw new Error("Invalid authorization state");
  const redis = await connectRedis();
  const value = await redis.getdel(stateKey(state));
  if (!value) throw new Error("Authorization expired");
  const pending = JSON.parse(value) as Pending;
  if (pending.userId !== userId || pending.sessionId !== sessionId || !code) throw new Error("Authorization rejected");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: youtubeRedirectUri, grant_type: "authorization_code", code, code_verifier: pending.verifier }), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Token exchange failed");
  const token = await response.json() as { access_token?: string; refresh_token?: string; scope?: string };
  if (!token.access_token || !token.refresh_token || !scopes.every(scope => token.scope?.split(" ").includes(scope))) throw new Error("Required authorization missing");
  const channelResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
  if (!channelResponse.ok) throw new Error("Channel lookup failed");
  const channels = await channelResponse.json() as { items?: { id: string; snippet: { title: string } }[] };
  const channel = channels.items?.[0];
  if (channels.items?.length !== 1 || !channel?.id || !channel.snippet?.title || (env.YOUTUBE_CHANNEL_ID && channel.id !== env.YOUTUBE_CHANNEL_ID)) throw new Error("Channel selection rejected");
  await redis.set(connectionKey, encrypt({ channelId: channel.id, channelTitle: channel.snippet.title, connectedAt: new Date().toISOString(), connectedBy: userId, refreshToken: token.refresh_token }));
}
export async function youtubeDisconnect() {
  await (await connectRedis()).del(connectionKey);
}

/** Server/CLI only. Never expose this result in a controller response. */
export async function getYoutubeUploadAccess() {
  if (env.YOUTUBE_ENABLED !== "true") throw new Error("YouTube integration is disabled");
  const value = await (await connectRedis()).get(connectionKey);
  if (!value) throw new Error("Connect your channel through Admin → Guide → Connect YouTube first");
  const connection = decrypt(value);
  if (env.YOUTUBE_CHANNEL_ID && env.YOUTUBE_CHANNEL_ID !== connection.channelId) throw new Error("Connected channel does not match YOUTUBE_CHANNEL_ID; reconnect the intended channel");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: connection.refreshToken }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`YouTube token refresh failed (${response.status}); reconnect the channel`);
  const token = await response.json() as { access_token?: string; scope?: string };
  if (!token.access_token || (token.scope && !scopes.every(scope => token.scope!.split(" ").includes(scope)))) throw new Error("YouTube upload permissions are missing; reconnect the channel");
  const channelResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
  if (!channelResponse.ok) throw new Error(`Could not verify upload channel (${channelResponse.status})`);
  const channels = await channelResponse.json() as { items?: { id: string }[] };
  if (channels.items?.length !== 1 || channels.items[0]?.id !== connection.channelId) throw new Error("Upload token channel differs from the stored connection");
  return { accessToken: token.access_token, channelId: connection.channelId, channelTitle: connection.channelTitle };
}
