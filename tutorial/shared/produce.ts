import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sha } from "./media";
import { validateProductionPlan, type ProductionPlan } from "./production-plan";
import type { RecordingPlan } from "./types";

export async function produceTutorial(directory: string, mode: string | undefined) {
  if (!["prepare", "audio", "capture", "render"].includes(mode ?? "")) throw new Error("Usage: produce.ts prepare|audio|capture|render");
  const productionText = await readFile(resolve(directory, "production.json"), "utf8");
  const production = JSON.parse(productionText) as ProductionPlan;
  const plan = JSON.parse(await readFile(resolve(directory, "tutorial.json"), "utf8")) as RecordingPlan;
  validateProductionPlan(production, plan);
  if (mode === "prepare") {
    const variables = Array.from(new Set(JSON.stringify(production).match(/\{\{[a-zA-Z0-9_]+\}\}/g) ?? []));
    console.log(`${plan.id}: ${production.segments.length} synchronized sections; ${plan.mode}; fixture values: ${variables.join(", ") || "none"}. Audio, capture and playback review remain pending.`);
    return; // Offline inspection never imports or invokes generation/capture/render code.
  }
  if (mode === "audio") {
    const { generateSectionAudio } = await import("./synchronized-audio");
    await generateSectionAudio(directory, production);
  } else if (mode === "capture") {
    const { captureSections } = await import("./synchronized-capture");
    await captureSections(directory, production, plan, sha(productionText));
  } else {
    const { renderSections } = await import("./synchronized-render");
    await renderSections(directory, production, plan, sha(productionText));
  }
}
