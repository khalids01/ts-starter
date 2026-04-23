import { t } from "elysia";

export const InvitationStatusFilterDto = t.Union([
  t.Literal("accepted"),
  t.Literal("pending"),
]);

export const AdminInvitationQueryDto = t.Object({
  page: t.Optional(t.Numeric({ default: 1 })),
  limit: t.Optional(t.Numeric({ default: 10 })),
  search: t.Optional(t.String()),
  status: t.Optional(InvitationStatusFilterDto),
  dateFrom: t.Optional(t.String({ format: "date" })),
  dateTo: t.Optional(t.String({ format: "date" })),
});

export type AdminInvitationQuery = typeof AdminInvitationQueryDto.static;

