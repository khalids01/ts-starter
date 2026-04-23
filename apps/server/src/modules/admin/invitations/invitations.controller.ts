import { Elysia } from "elysia";
import { rolesGuard } from "../../../guards/roles.guard";
import { adminInvitationsService } from "./invitations.service";
import { AdminInvitationQueryDto } from "./invitations.dto";

export const adminInvitationsController = new Elysia({
  prefix: "/admin/invitations",
  detail: {
    tags: ["Admin - Invitations"],
  },
}).guard(
  {
    beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
  },
  (app) =>
    app.get(
      "/",
      async ({ query }) => {
        return adminInvitationsService.listInvitations(query);
      },
      {
        query: AdminInvitationQueryDto,
        detail: {
          summary: "List invitations grouped by invited email",
        },
      },
    ),
);
