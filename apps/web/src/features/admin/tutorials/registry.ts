import catalog from "../../../../../../tutorial/catalog.json";
import type { Permission } from "@rbac";
import type { ClientSession } from "@auth/client";
import { sessionHasPermission } from "@/features/user/lib/session-permissions";

export type Tutorial = {
  id: string;
  folder: string;
  title: string;
  description: string;
  category: string;
  routes: string[];
  requiredPermissions: Permission[];
  prerequisites: string[];
  steps: string[];
  status: "prepared" | "review" | "published";
  media: null | { videoUrl: string; posterUrl: string; captionsUrl: string; durationSec: number; reviewedCommit: string };
};
export const tutorials = catalog as Tutorial[];

export function availableTutorials(session: ClientSession | null | undefined) {
  if (!session) return [];
  return tutorials.filter(tutorial => session.primaryRoleSlug === "platform.owner" || tutorial.requiredPermissions.every(permission => sessionHasPermission(session.permissions ?? [], permission)));
}
export function tutorialsForPage(pathname: string, session: ClientSession | null | undefined) {
  return availableTutorials(session).filter(tutorial => tutorial.routes.some(route => pathname === route || pathname.startsWith(`${route}/`)));
}
export function hasPublishedVideo(tutorial: Tutorial) {
  return tutorial.status === "published" && tutorial.media !== null && [tutorial.media.videoUrl, tutorial.media.posterUrl, tutorial.media.captionsUrl].every(value => {
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  });
}
