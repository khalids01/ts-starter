import { Elysia, t } from "elysia";
import { auth } from "@auth";
import { notificationsService } from "./notifications.service";

export const notificationsController = new Elysia({
  prefix: "/notifications",
  detail: { tags: ["Notifications"] },
})
  // Require authenticated session for all routes
  .guard(
    {
      beforeHandle: async (ctx: any) => {
        const session = await auth.api.getSession({
          headers: ctx.request.headers,
        });
        if (!session) {
          ctx.set.status = 401;
          return { message: "Unauthorized" };
        }
        ctx.userId = session.user.id;
      },
    },
    (app) =>
      app
        .get(
          "/",
          async (ctx: any) => {
            return notificationsService.getForUser(ctx.userId);
          },
          {
            detail: { summary: "Get notifications for the current user" },
          },
        )
        .post(
          "/:id/read",
          async (ctx: any) => {
            return notificationsService.markAsRead(ctx.params.id, ctx.userId);
          },
          {
            detail: { summary: "Mark a single notification as read" },
          },
        )
        .post(
          "/read-all",
          async (ctx: any) => {
            return notificationsService.markAllAsRead(ctx.userId);
          },
          {
            detail: { summary: "Mark all notifications as read" },
          },
        ),
  );
