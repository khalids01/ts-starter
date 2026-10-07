import type { Action, FixtureCheck, RecordingPlan, Target } from "./types";

export type ProductionSegment = {
  id: string;
  scene: string;
  text: string;
  actions: Action[];
  target: Target;
  evidence: "controls" | "persisted-result" | "persisted-example";
  frameLabel?: string;
  checks?: FixtureCheck[];
};
export type ProductionPlan = {
  version: 1;
  tutorialId: string;
  profileId: string;
  notes: string[];
  segments: ProductionSegment[];
};

/** Pure authoring validation; never contacts Voicebox, browser, DB or provider. */
export function validateProductionPlan(production: ProductionPlan, plan: RecordingPlan) {
  if (production.version !== 1 || production.tutorialId !== plan.id || production.profileId !== "32138317-6b28-46d7-b611-66365ca94587" || !production.notes?.length || !production.segments?.length) throw new Error(`Invalid synchronized plan: ${plan.id}`);
  const ids = new Set<string>();
  const finishedScenes = new Set<string>();
  let currentScene: string | undefined;
  for (const segment of production.segments) {
    if (!/^\d{2,3}$/.test(segment.id) || ids.has(segment.id) || !segment.text?.trim() || segment.text.split(/\s+/).length > 85 || !Array.isArray(segment.actions)) throw new Error(`Invalid narration section: ${plan.id}/${segment.id}`);
    ids.add(segment.id);
    if (!plan.scenes.some(scene => scene.id === segment.scene)) throw new Error(`Unknown scene: ${plan.id}/${segment.scene}`);
    if (currentScene !== segment.scene) {
      if (currentScene) finishedScenes.add(currentScene);
      if (finishedScenes.has(segment.scene) || segment.actions[0]?.kind !== "goto") throw new Error(`Scenes must be contiguous and start with navigation: ${plan.id}/${segment.scene}`);
      currentScene = segment.scene;
    }
    if (segment.evidence === "persisted-example" && !segment.frameLabel) throw new Error("Prepared example frames need a visible example label");
    validateTarget(segment.target, `${plan.id}/${segment.id}`);
    if (!["controls", "persisted-result", "persisted-example"].includes(segment.evidence)) throw new Error("Declare whether a frame shows controls or a checked result");
    if (segment.evidence !== "controls" && !segment.checks?.length) throw new Error("Result frames require persisted API checks");
    for (const action of segment.actions) {
      if (!["goto", "click", "assert", "fill", "select", "key", "submit", "file"].includes(action.kind)) throw new Error(`Unsupported preparation action: ${plan.id}/${segment.id}`);
      if (action.kind === "file" && (!action.path.startsWith("tutorial/") || action.path.split("/").includes(".."))) throw new Error("File selection requires a tutorial image fixture");
      if (action.kind === "goto" && (!action.path.startsWith("/admin/") || action.path.startsWith("//"))) throw new Error("Only admin navigation is supported");
      if (action.kind === "show" || action.kind === "wait") throw new Error("Use the section target and measured audio duration rather than timed show/wait actions");
      if ("target" in action) validateTarget(action.target, `${plan.id}/${segment.id}/action`);
      if (action.kind === "submit" && plan.mode !== "workflow") throw new Error("Walkthrough plans cannot submit business operations");
    }
  }
  for (const scene of plan.scenes) {
    const sections = production.segments.filter(segment => segment.scene === scene.id);
    const sceneActions = sections.flatMap(segment => [...segment.actions, { kind: "show", target: segment.target }]);
    if (JSON.stringify(scene.actions) !== JSON.stringify(sceneActions)) throw new Error(`Scene action reference drift: ${plan.id}/${scene.id}. Run tutorial:storyboards after reviewing the production plan.`);
    if (!sections.length || sections.map(segment => segment.text).join(" ") !== scene.narration) throw new Error(`Synchronized narration drift: ${plan.id}/${scene.id}`);
  }
}

function validateTarget(target: Target, location: string) {
  if (!target || [target.role, target.field, target.text, target.css].filter(Boolean).length !== 1 || (target.role && !target.name)) throw new Error(`Use exactly one explicit UI target: ${location}`);
}

/** A reviewable storyboard derived from exactly the executable production plan. */
export function describeProductionPlan(production: ProductionPlan, plan: RecordingPlan) {
  let output = `# Synchronized production: ${plan.title}\n\nCapture mode: **${plan.mode}**. Prepared code only; audio, capture and playback review remain pending.\n\n`;
  output += production.notes.map(note => `- ${note}`).join("\n") + "\n\n";
  for (const segment of production.segments) {
    output += `## ${segment.id} · Scene ${segment.scene}\n\n${segment.text}\n\nFocus: \`${JSON.stringify(segment.target)}\`\n\n`;
    if (segment.actions.length) output += "Prepare frame: " + segment.actions.map(action => `\`${JSON.stringify(action)}\``).join("; ") + ".\n\n";
    output += `Evidence: ${segment.evidence}.${segment.frameLabel ? ` Visible label: ${segment.frameLabel}.` : ""}\n\n`;
    if (segment.checks?.length) output += `Required API checks: \`${JSON.stringify(segment.checks)}\`\n\n`;
  }
  return output;
}
