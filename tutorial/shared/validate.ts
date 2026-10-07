import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { AllPermissions } from "../../packages/rbac/src/permissions";
import type { RecordingPlan } from "./types";

const root = resolve(import.meta.dir, "..");
const catalog = JSON.parse(await readFile(resolve(root, "catalog.json"), "utf8"));
const seen = new Set<string>();
let focused = 0;
for (const entry of catalog) {
  if (!entry.id || seen.has(entry.id)) throw new Error(`Duplicate/missing tutorial ID: ${entry.id}`);
  seen.add(entry.id);
  if (!/^(\d{2})-[a-z0-9-]+$/.test(entry.folder)) throw new Error(`Invalid folder: ${entry.folder}`);
  for (const permission of entry.requiredPermissions) if (!(AllPermissions as readonly string[]).includes(permission)) throw new Error(`Unknown permission: ${permission}`);
  if (!entry.routes.every((route: string) => route.startsWith("/admin/"))) throw new Error(`Invalid admin route: ${entry.id}`);
  if (entry.status === "published" && !entry.media) throw new Error(`Published tutorial has no media: ${entry.id}`);
  if (entry.id === "product-to-completed-order") continue;
  const directory = resolve(root, entry.folder);
  for (const file of ["narration.txt", "storyboard.md", "tutorial.json", "record.ts", "render.ts", "fixtures.example.json", "media.example.json", "recording-checklist.md", "README.md", "audio/README.md", "audio/cues.example.json"]) await access(resolve(directory, file));
  const plan = JSON.parse(await readFile(resolve(directory, "tutorial.json"), "utf8")) as RecordingPlan;
  if (plan.id !== entry.id || !plan.scenes.length) throw new Error(`Invalid plan: ${entry.id}`);
  const narration = await readFile(resolve(directory, "narration.txt"), "utf8");
  if (narration !== plan.scenes.map(scene => scene.narration).join("\n\n") + "\n") throw new Error(`Narration drift: ${entry.id}`);
  if (entry.steps.join("\n\n") !== narration.trim()) throw new Error(`Written guide drift: ${entry.id}`);
  const sceneIds = new Set<string>();
  for (const scene of plan.scenes) {
    if (sceneIds.has(scene.id) || !scene.narration || !scene.actions.length || scene.actions[0]?.kind !== "goto") throw new Error(`Invalid scene: ${entry.id}/${scene.id}`);
    sceneIds.add(scene.id);
    for (const action of scene.actions) {
      if (action.kind === "goto" && !action.path.startsWith("/admin/")) throw new Error(`Unsafe scene path: ${entry.id}`);
    }
  }
  focused++;
}
console.log(`Tutorial content consistent: ${focused} focused packages and ${catalog.length - focused} retained workflow.`);
