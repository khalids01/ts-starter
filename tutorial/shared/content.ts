/** Public guide content shared by the frontend and authoring tools. */
export type TutorialMedia = {
  durationSec: number;
  reviewedCommit: string;
} & (
  | { provider: "youtube"; videoId: string }
  | { provider?: "file"; videoUrl: string; posterUrl: string; captionsUrl: string }
);
export type FlowNode = { id: string; label: string; description?: string; kind?: "step" | "decision" | "success" };
export type FlowDiagram = {
  title: string;
  description?: string;
  rows: FlowNode[][];
  edges: { from: string; to: string; label?: string }[];
};
export function isValidTutorialMedia(value: unknown): value is TutorialMedia {
  if (!value || typeof value !== "object") return false;
  const media = value as Record<string, unknown>;
  if (typeof media.durationSec !== "number" || !Number.isFinite(media.durationSec) || media.durationSec <= 0 || typeof media.reviewedCommit !== "string" || !/^[a-f0-9]{40}$/i.test(media.reviewedCommit)) return false;
  if (media.provider === "youtube") return typeof media.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(media.videoId);
  if (media.provider !== undefined && media.provider !== "file") return false;
  return ["videoUrl", "posterUrl", "captionsUrl"].every(key => {
    try { return typeof media[key] === "string" && new URL(media[key] as string).protocol === "https:"; }
    catch { return false; }
  });
}
export function isValidFlowDiagram(value: unknown): value is FlowDiagram {
  if (!value || typeof value !== "object") return false;
  const diagram = value as FlowDiagram;
  if (typeof diagram.title !== "string" || !diagram.title.trim() || (diagram.description !== undefined && typeof diagram.description !== "string") || !Array.isArray(diagram.rows) || !diagram.rows.length || diagram.rows.length > 8 || !Array.isArray(diagram.edges)) return false;
  const ids = new Set<string>();
  for (const row of diagram.rows) {
    if (!Array.isArray(row) || !row.length || row.length > 3) return false;
    for (const node of row) {
      if (!node || typeof node.id !== "string" || !/^[a-z0-9-]+$/.test(node.id) || ids.has(node.id) || typeof node.label !== "string" || !node.label.trim() || node.label.length > 55 || (node.description !== undefined && (typeof node.description !== "string" || node.description.length > 110)) || (node.kind !== undefined && !["step", "decision", "success"].includes(node.kind))) return false;
      ids.add(node.id);
    }
  }
  return diagram.edges.every(edge => edge && ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to && (edge.label === undefined || typeof edge.label === "string"));
}
