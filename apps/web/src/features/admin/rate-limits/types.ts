import type { GroupKey } from "./constants";

export type RateLimitConfig = {
  enabled: boolean;
  groups: Record<
    GroupKey,
    {
      enabled: boolean;
      windowSeconds: number;
      maxRequests: number;
    }
  >;
};

export type RateLimitOverview = {
  config: RateLimitConfig;
  stats: Record<
    GroupKey,
    {
      blockedLastHour: number;
      blockedToday: number;
    }
  >;
  updatedAt: string;
};
