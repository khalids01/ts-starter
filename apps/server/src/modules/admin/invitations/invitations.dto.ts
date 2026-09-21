import { t } from "elysia";

export const InvitationStatusFilterDto = t.Union([
  t.Literal("accepted"),
  t.Literal("pending"),
]);

export const AdminInvitationQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  status: t.Optional(InvitationStatusFilterDto),
  dateFrom: t.Optional(t.String({ format: "date" })),
  dateTo: t.Optional(t.String({ format: "date" })),
});

export type AdminInvitationQuery = typeof AdminInvitationQueryDto.static;
