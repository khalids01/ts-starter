import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describeProductionPlan, validateProductionPlan, type ProductionPlan } from "./production-plan";
import type { RecordingPlan } from "./types";

// Authoring-only synchronization. No media, browser, API or database calls.
const root = resolve(import.meta.dir, "..");
const catalog = JSON.parse(await readFile(resolve(root, "catalog.json"), "utf8")) as Array<{ folder: string }>;
for (const entry of catalog.filter(entry => Number(entry.folder.slice(0, 2)) >= 2)) {
  const directory = resolve(root, entry.folder);
  const production = JSON.parse(await readFile(resolve(directory, "production.json"), "utf8")) as ProductionPlan;
  const plan = JSON.parse(await readFile(resolve(directory, "tutorial.json"), "utf8")) as RecordingPlan;
  for (const scene of plan.scenes) {
    scene.actions = production.segments.filter(segment => segment.scene === scene.id)
      .flatMap(segment => [...segment.actions, { kind: "show" as const, target: segment.target }]);
  }
  validateProductionPlan(production, plan);
  await writeFile(resolve(directory, "tutorial.json"), JSON.stringify(plan, null, 2) + "\n");
  await writeFile(resolve(directory, "production.md"), describeProductionPlan(production, plan));
  await writeFile(resolve(directory, "storyboard.md"), `# ${plan.title}\n\nThe active, sentence-aligned storyboard is [production.md](./production.md), generated from [production.json](./production.json).\n\nScene narration remains canonical in tutorial.json and narration.txt. The scene action lists mirror the synchronized plan for reference; produce.ts is the generation entry point.\n\nRefresh static storyboards after editing a production plan with \`bun run tutorial:storyboards\` from the project root. This command creates no media and does not access running services.\n`);
}
console.log("Refreshed static storyboards and scene action references for tutorials 02–43. No media generated.");
