import { Elysia } from "elysia";
import { VisitorTrackBodyDto } from "./visitors.dto";
import { visitorsService } from "./visitors.service";

export const visitorsController = new Elysia({
  prefix: "/analytics/visitors",
  detail: {
    tags: ["Visitors"],
  },
}).post(
  "/track",
  async ({ request, body, set }) => {
    const result = await visitorsService.trackVisit({
      request,
      body,
      setCookie: (value) => {
        set.headers["set-cookie"] = value;
      },
    });

    if (!result.ok && result.rateLimited) {
      set.status = 429;
      return {
        ok: false,
        message: "Too many tracking requests",
      };
    }

    return {
      ok: true,
    };
  },
  {
    body: VisitorTrackBodyDto,
    detail: {
      summary: "Track visitor activity",
    },
  },
);
