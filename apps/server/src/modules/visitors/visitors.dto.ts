import { t } from "elysia";

export const VisitorTrackBodyDto = t.Object({
  path: t.String({ minLength: 1, maxLength: 500 }),
  referrer: t.Optional(t.String({ maxLength: 500 })),
  activityType: t.Optional(
    t.Union([
      t.Literal("pageview"),
      t.Literal("heartbeat"),
      t.Literal("activity"),
    ]),
  ),
});

export type VisitorTrackBody = typeof VisitorTrackBodyDto.static;
