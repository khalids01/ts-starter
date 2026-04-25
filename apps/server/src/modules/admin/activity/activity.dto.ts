import { t } from "elysia";

export const ActivitySeverityDto = t.Union([
  t.Literal("info"),
  t.Literal("warning"),
  t.Literal("error"),
]);

export const ActivityQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, default: 20 })),
  type: t.Optional(t.String({ minLength: 1 })),
  severity: t.Optional(ActivitySeverityDto),
});

export type ActivitySeverity = typeof ActivitySeverityDto.static;
export type ActivityQuery = typeof ActivityQueryDto.static;
