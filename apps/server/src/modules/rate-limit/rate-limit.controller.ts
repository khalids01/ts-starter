import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import {
  RateLimitOverviewDto,
  UpdateRateLimitDto,
} from "./rate-limit.dto";
import { rateLimitService } from "./rate-limit.service";

export const rateLimitController = new Elysia({
  prefix: "/admin/rate-limit",
  detail: {
    tags: ["Admin - Rate Limit"],
  },
}).guard(
  {
    beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
  },
  (app) =>
    app
      .get(
        "/",
        async () => {
          return rateLimitService.getOverview();
        },
        {
          response: RateLimitOverviewDto,
          detail: {
            summary: "Get rate limit settings and basic stats",
          },
        },
      )
      .patch(
        "/",
        async ({ body }) => {
          return rateLimitService.updateConfig(body);
        },
        {
          body: UpdateRateLimitDto,
          response: RateLimitOverviewDto,
          detail: {
            summary: "Update rate limit settings",
          },
        },
      ),
);
