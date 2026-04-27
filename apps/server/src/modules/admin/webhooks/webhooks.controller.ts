import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import { WebhookEventsQueryDto } from "./webhooks.dto";
import { adminWebhooksService } from "./webhooks.service";

export const adminWebhooksController = new Elysia({
  prefix: "/admin/webhooks",
  detail: {
    tags: ["Admin - Webhooks"],
  },
}).guard(
  {
    beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
  },
  (app) =>
    app.get(
      "/",
      ({ query }) => {
        return adminWebhooksService.list(query);
      },
      {
        query: WebhookEventsQueryDto,
        detail: {
          summary: "List webhook delivery events",
        },
      },
    ),
);

