import { Elysia, t } from "elysia";
import { notificationsService } from "./notifications.service";
import { authGuard } from "@/guards/auth.guard";
import {
  NotificationSchema,
  NotificationMessageSchema,
} from "./notifications.dto";

export const notificationsController = new Elysia({
  prefix: "/notifications",
  detail: { tags: ["Notifications"] },
})
  .use(authGuard)
  .ws("/ws", {
    body: NotificationMessageSchema,
    response: t.Array(NotificationSchema),
    async open(ws) {
      const data = ws.data as { userId?: string };
      if (!data.userId) {
        ws.close();
        return;
      }
      // Send initial notifications on connect
      const list = await notificationsService.getForUser(data.userId);
      ws.send(list);
    },
    async message(ws, message) {
      const data = ws.data as { userId?: string };
      if (!data.userId) return;

      if (message.action === "mark-read" && message.id) {
        await notificationsService.markAsRead(message.id, data.userId);
      } else if (message.action === "mark-all-read") {
        await notificationsService.markAllAsRead(data.userId);
      }

      // Always send back the updated list (including on "refresh")
      const list = await notificationsService.getForUser(data.userId);
      ws.send(list);
    },
  });
