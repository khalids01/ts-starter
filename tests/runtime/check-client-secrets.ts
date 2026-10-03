import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(process.env.WEB_BUILD_DIR ?? "apps/web/dist", "client");
const keys = ["DATABASE_URL", "REDIS_URL", "BETTER_AUTH_SECRET", "GITHUB_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET", "DISCORD_CLIENT_SECRET", "POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET", "EMAIL_PASSWORD", "FILE_SERVER_API_KEY", "STEAD_FAST_API_KEY", "STEAD_FAST_SECRET_KEY", "STEAD_FAST_WEBHOOK_TOKEN", "COURIER_CREDENTIAL_ENCRYPTION_KEYS"];
const values = keys.flatMap((key) => {
  const value = process.env[key];
  return value && value.length >= 8 ? [{ key, value }] : [];
});
let scanned = 0;
const found = new Set<string>();
async function scan(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(js|map|html|json|css)$/.test(entry.name)) {
      const content = await Bun.file(path).text();
      scanned++;
      for (const { key, value } of values) if (content.includes(value)) found.add(key);
    }
  }
}
if (!values.length) throw new Error("Supply private test canary values; an empty check is not verification");
await scan(root);
if (!scanned) throw new Error("No client artifacts to inspect");
if (found.size) throw new Error(`Client bundle contains configured private values for: ${[...found].join(", ")}`);
console.log(`Checked ${scanned} client artifacts against ${values.length} configured private values; no matches`);
