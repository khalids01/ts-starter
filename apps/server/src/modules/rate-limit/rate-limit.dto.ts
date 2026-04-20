import { t } from "elysia";

export const RateLimitGroupSchema = t.Union([
  t.Literal("public"),
  t.Literal("auth"),
  t.Literal("protected"),
  t.Literal("admin"),
  t.Literal("special"),
]);

export const RateLimitGroupConfigDto = t.Object({
  enabled: t.Boolean(),
  windowSeconds: t.Integer({ minimum: 1 }),
  maxRequests: t.Integer({ minimum: 1 }),
});

export const RateLimitConfigDto = t.Object({
  enabled: t.Boolean(),
  groups: t.Object({
    public: RateLimitGroupConfigDto,
    auth: RateLimitGroupConfigDto,
    protected: RateLimitGroupConfigDto,
    admin: RateLimitGroupConfigDto,
    special: RateLimitGroupConfigDto,
  }),
});

export const RateLimitStatsDto = t.Object({
  blockedLastHour: t.Integer(),
  blockedToday: t.Integer(),
});

export const RateLimitOverviewDto = t.Object({
  config: RateLimitConfigDto,
  stats: t.Object({
    public: RateLimitStatsDto,
    auth: RateLimitStatsDto,
    protected: RateLimitStatsDto,
    admin: RateLimitStatsDto,
    special: RateLimitStatsDto,
  }),
  updatedAt: t.Date(),
});

export const UpdateRateLimitDto = RateLimitConfigDto;

export type RateLimitConfigInput = typeof RateLimitConfigDto.static;
export type UpdateRateLimitInput = typeof UpdateRateLimitDto.static;
