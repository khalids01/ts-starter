import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import { ActivityQueryDto } from "./activity.dto";
import { activityService } from "./activity.service";

export const adminActivityController = new Elysia({
  prefix: "/admin/activity",
  detail: {
    tags: ["Admin - Activity"],
  },
}).guard(
  {
    beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
  },
  (app) =>
    app.get(
      "/",
      ({ query }) => {
        return activityService.list(query);
      },
      {
        query: ActivityQueryDto,
        detail: {
          summary: "List admin activity events",
        },
      },
    ),
);
