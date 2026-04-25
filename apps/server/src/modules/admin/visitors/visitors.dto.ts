import { t } from "elysia";

export const VisitorsSegmentDto = t.Union([
  t.Literal("humans"),
  t.Literal("bots"),
  t.Literal("all"),
]);

export const VisitorsTypeDto = t.Union([
  t.Literal("all"),
  t.Literal("new"),
  t.Literal("returning"),
]);

export const VisitorsOverviewQueryDto = t.Object({
  dateFrom: t.Optional(t.String({ format: "date" })),
  dateTo: t.Optional(t.String({ format: "date" })),
  segment: t.Optional(VisitorsSegmentDto),
  type: t.Optional(VisitorsTypeDto),
});

export const VisitorsListQueryDto = t.Object({
  dateFrom: t.Optional(t.String({ format: "date" })),
  dateTo: t.Optional(t.String({ format: "date" })),
  segment: t.Optional(VisitorsSegmentDto),
  type: t.Optional(VisitorsTypeDto),
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, default: 20 })),
});

export type VisitorsOverviewQuery = typeof VisitorsOverviewQueryDto.static;
export type VisitorsListQuery = typeof VisitorsListQueryDto.static;
