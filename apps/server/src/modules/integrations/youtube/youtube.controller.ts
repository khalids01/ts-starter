import { Elysia, t } from "elysia";
import { env } from "@env/server";
import { Roles } from "@rbac";
import { authGuard, requireAuthSession } from "../../../guards/auth.guard";
import { youtubeCallback, youtubeConnect, youtubeDisconnect, youtubeStatus } from "./youtube.service";

export const youtubeController = new Elysia({ prefix: "/integrations/youtube" })
  .use(authGuard)
  .onBeforeHandle(({ session, set, path }) => {
    set.headers["cache-control"] = "no-store";
    set.headers["referrer-policy"] = "no-referrer";
    if (!session) { set.status = 401; return { error: "Authentication required" }; }
    if (session.primaryRoleSlug !== Roles.PlatformOwner) { set.status = 403; return { error: "Owner access required" }; }
    if (env.YOUTUBE_ENABLED !== "true" && path !== "/integrations/youtube/status") { set.status = 503; return { error: "YouTube integration is disabled" }; }
  })
  .get("/status", () => youtubeStatus())
  .post("/connect", ({ session }) => {
    const current = requireAuthSession(session);
    return youtubeConnect(current.user.id, current.session.id);
  })
  .get("/callback", async ({ session, query, redirect }) => {
    const current = requireAuthSession(session);
    let outcome = "connected";
    try { await youtubeCallback(current.user.id, current.session.id, query.state ?? "", query.code); }
    catch { outcome = "error"; }
    const destination = new URL("/admin/tutorials", env.CORS_ORIGIN);
    destination.searchParams.set("youtube", outcome);
    return redirect(destination.href, 303);
  }, { query: t.Object({ state: t.Optional(t.String({ maxLength: 128 })), code: t.Optional(t.String({ maxLength: 4096 })), error: t.Optional(t.String()) }, { additionalProperties: true }) })
  .post("/disconnect", async () => { await youtubeDisconnect(); return { disconnected: true }; });
