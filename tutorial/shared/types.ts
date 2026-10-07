export type Target = {
  role?: "button" | "tab" | "heading" | "link" | "option" | "menuitem" | "combobox" | "checkbox" | "textbox" | "dialog";
  name?: string;
  text?: string;
  field?: string;
  css?: string;
  dialog?: string;
  row?: string;
  exact?: boolean;
  within?: "main" | "page";
};
export type Action =
  | { kind: "goto"; path: string }
  | { kind: "click" | "show" | "assert"; target: Target }
  | { kind: "file"; target: Target; path: string }
  | { kind: "fill"; target: Target; value: string }
  | { kind: "select"; target: Target; option: string }
  | { kind: "key"; key: string }
  | { kind: "wait"; durationMs: number }
  | { kind: "submit"; target: Target; capture: { key: string; responsePath: string; field: string } };
export type Scene = {
  id: string;
  title: string;
  narration: string;
  actions: Action[];
};
export type RecordingPlan = {
  id: string;
  title: string;
  mode: "walkthrough" | "workflow";
  prerequisites: string[];
  showTutorialControls?: boolean;
  scenes: Scene[];
};
export type FixtureCheck = { path: string; field: string; equals: string | number | boolean; find?: { field: string; equals: string }; property?: string };
export type Fixtures = {
  marker: string;
  values: Record<string, string>;
  ownershipChecks: FixtureCheck[];
  outcomeChecks: FixtureCheck[];
  cleanup: Array<{ method: "DELETE" | "PATCH" | "POST"; path: string; verify: FixtureCheck[]; data?: Record<string, unknown> }>;
};
export type RecordingManifest = {
  version: 1;
  tutorialId: string;
  runId: string;
  sourceCommit: string;
  recordedAt: string;
  complete: boolean;
  planHash: string;
  scenes: Array<{ id: string; title: string; rawVideo: string; leadInSec?: number; actionDurationSec: number }>;
};
