import { t } from "elysia";

export const NotificationSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  title: t.String(),
  message: t.String(),
  read: t.Boolean(),
  url: t.Nullable(t.String()),
  createdAt: t.Date(),
});

export const NotificationMessageSchema = t.Object({
  action: t.Union([
    t.Literal("mark-read"),
    t.Literal("mark-all-read"),
    t.Literal("refresh"),
  ]),
  id: t.Optional(t.String()),
});

export const NotificationListSchema = t.Array(NotificationSchema);
