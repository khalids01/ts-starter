import { t } from "elysia";

export const WebhookStatusDto = t.Union([
  t.Literal("processing"),
  t.Literal("processed"),
  t.Literal("failed"),
]);

export const WebhookEventsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  status: t.Optional(WebhookStatusDto),
  eventType: t.Optional(t.String({ minLength: 1 })),
});

export type WebhookStatus = typeof WebhookStatusDto.static;
export type WebhookEventsQuery = typeof WebhookEventsQueryDto.static;

