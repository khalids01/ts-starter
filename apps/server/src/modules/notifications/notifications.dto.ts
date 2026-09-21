import { t } from "elysia";

export const NotificationSchema = t.Object({
  id: t.String({ maxLength: 128 }),
  userId: t.String({ maxLength: 128 }),
  title: t.String({ maxLength: 200 }),
  message: t.String({ maxLength: 2000 }),
  read: t.Boolean(),
  url: t.Nullable(t.String({ maxLength: 2048 })),
  createdAt: t.Date(),
});

export const NotificationMessageSchema = t.Object({
  action: t.Union([
    t.Literal("mark-read"),
    t.Literal("mark-all-read"),
    t.Literal("refresh"),
  ]),
  id: t.Optional(t.String({ maxLength: 128 })),
});

export const NotificationListSchema = t.Array(NotificationSchema);
