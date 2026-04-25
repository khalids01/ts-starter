import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import {
  VisitorsListQueryDto,
  VisitorsOverviewQueryDto,
} from "./visitors.dto";
import { adminVisitorsService } from "./visitors.service";

export const adminVisitorsController = new Elysia({
  prefix: "/admin/visitors",
  detail: {
    tags: ["Admin - Visitors"],
  },
}).guard(
  {
    beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
  },
  (app) =>
    app
      .get(
        "/overview",
        ({ query }) => {
          return adminVisitorsService.getOverview(query);
        },
        {
          query: VisitorsOverviewQueryDto,
          detail: {
            summary: "Get visitors overview stats and time series",
          },
        },
      )
      .get(
        "/list",
        ({ query }) => {
          return adminVisitorsService.listVisitors(query);
        },
        {
          query: VisitorsListQueryDto,
          detail: {
            summary: "Get paginated visitors list",
          },
        },
      ),
);
