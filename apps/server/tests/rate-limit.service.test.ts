import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

type SettingsRecord = {
  id: string;
  enabled: boolean;
  publicEnabled: boolean;
  publicWindowSeconds: number;
  publicMaxRequests: number;
  authEnabled: boolean;
  authWindowSeconds: number;
  authMaxRequests: number;
  protectedEnabled: boolean;
  protectedWindowSeconds: number;
  protectedMaxRequests: number;
  adminEnabled: boolean;
  adminWindowSeconds: number;
  adminMaxRequests: number;
  specialEnabled: boolean;
  specialWindowSeconds: number;
  specialMaxRequests: number;
  updatedAt: Date;
};

const redisState = {
  values: new Map<string, number>(),
  expiry: new Map<string, number>(),
  keys: [] as string[],
};

const fakeRedis = {
  async incr(key: string) {
    redisState.keys.push(key);
    const nextValue = (redisState.values.get(key) ?? 0) + 1;
    redisState.values.set(key, nextValue);
    return nextValue;
  },
  async expire(key: string, seconds: number) {
    redisState.expiry.set(key, Date.now() + seconds * 1000);
    return 1;
  },
  async ttl(key: string) {
    const expiresAt = redisState.expiry.get(key);
    if (!expiresAt) {
      return -1;
    }

    return Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
  },
  async get(key: string) {
    const value = redisState.values.get(key);
    return value === undefined ? null : String(value);
  },
  async mget(keys: string[]) {
    return keys.map((key) => {
      const value = redisState.values.get(key);
      return value === undefined ? null : String(value);
    });
  },
};

let currentSettings: SettingsRecord;
let redisAvailable = true;
let currentSession:
  | {
    user: {
      id: string;
      role: string;
    };
  }
  | null = null;

const findUniqueMock = mock(async () => currentSettings);
const createMock = mock(async ({ data }: { data: SettingsRecord }) => data);
const upsertMock = mock(async ({ update }: { update: Partial<SettingsRecord> }) => {
  currentSettings = {
    ...currentSettings,
    ...update,
    updatedAt: new Date(Date.now()),
  };

  return currentSettings;
});
const getSessionMock = mock(async () => currentSession);
const connectRedisMock = mock(async () => (redisAvailable ? fakeRedis : null));

mock.module("@db", () => ({
  default: {
    rateLimitSettings: {
      findUnique: findUniqueMock,
      create: createMock,
      upsert: upsertMock,
    },
  },
}));

mock.module("@/modules/auth/auth.service", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

mock.module("@redis", () => ({
  connectRedis: connectRedisMock,
}));

function createSettings(overrides: Partial<SettingsRecord> = {}): SettingsRecord {
  return {
    id: "default",
    enabled: true,
    publicEnabled: true,
    publicWindowSeconds: 60,
    publicMaxRequests: 2,
    authEnabled: true,
    authWindowSeconds: 60,
    authMaxRequests: 10,
    protectedEnabled: true,
    protectedWindowSeconds: 60,
    protectedMaxRequests: 2,
    adminEnabled: true,
    adminWindowSeconds: 60,
    adminMaxRequests: 300,
    specialEnabled: true,
    specialWindowSeconds: 60,
    specialMaxRequests: 30,
    updatedAt: new Date("2026-04-15T00:00:00.000Z"),
    ...overrides,
  };
}

function createContext(url: string, headers?: HeadersInit) {
  return {
    request: new Request(url, { headers }),
    set: {
      status: 200,
      headers: {} as Record<string, string>,
    },
    server: {
      requestIP: () => ({
        address: "10.0.0.1",
      }),
    },
  };
}

beforeEach(() => {
  currentSettings = createSettings();
  currentSession = null;
  redisAvailable = true;
  redisState.values.clear();
  redisState.expiry.clear();
  redisState.keys = [];
});

afterEach(async () => {
  const { rateLimitService } = await import("../src/modules/rate-limit/rate-limit.service");
  rateLimitService.invalidateCache();
  findUniqueMock.mockClear();
  createMock.mockClear();
  upsertMock.mockClear();
  getSessionMock.mockClear();
  connectRedisMock.mockClear();
});

describe("rateLimitService", () => {
  it("uses the request IP for anonymous requests and blocks after the limit", async () => {
    const { enforceRateLimit } = await import("../src/modules/rate-limit/rate-limit.service");
    const first = createContext("http://localhost/owner/setup-status", {
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });
    const second = createContext("http://localhost/owner/setup-status", {
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });
    const third = createContext("http://localhost/owner/setup-status", {
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });

    expect(await enforceRateLimit(first as any)).toBeUndefined();
    expect(await enforceRateLimit(second as any)).toBeUndefined();

    const blocked = await enforceRateLimit(third as any);

    expect(blocked).toEqual({
      message: "Too many requests",
      group: "public",
      retryAfterSeconds: 60,
    });
    expect(third.set.status).toBe(429);
    expect(redisState.keys.some((key) => key.includes("ratelimit:public:ip:203.0.113.10"))).toBe(true);
  });

  it("uses the authenticated user id for protected requests", async () => {
    const { enforceRateLimit } = await import("../src/modules/rate-limit/rate-limit.service");
    currentSession = {
      user: {
        id: "user-123",
        role: "USER",
      },
    };

    await enforceRateLimit(createContext("http://localhost/feedback") as any);

    expect(redisState.keys.some((key) => key.includes("ratelimit:protected:user:user-123"))).toBe(true);
  });

  it("resets the fixed window when time moves into the next bucket", async () => {
    const originalNow = Date.now;
    const { enforceRateLimit } = await import("../src/modules/rate-limit/rate-limit.service");

    Date.now = () => 0;
    await enforceRateLimit(createContext("http://localhost/owner/setup-status") as any);
    await enforceRateLimit(createContext("http://localhost/owner/setup-status") as any);

    Date.now = () => 61_000;
    const nextWindow = await enforceRateLimit(createContext("http://localhost/owner/setup-status") as any);

    expect(nextWindow).toBeUndefined();
    Date.now = originalNow;
  });

  it("fails open when redis is unavailable", async () => {
    const { enforceRateLimit } = await import("../src/modules/rate-limit/rate-limit.service");
    redisAvailable = false;

    const result = await enforceRateLimit(createContext("http://localhost/owner/setup-status") as any);

    expect(result).toBeUndefined();
  });

  it("invalidates the cached config after updating settings", async () => {
    const { rateLimitService } = await import("../src/modules/rate-limit/rate-limit.service");

    const first = await rateLimitService.getOverview();
    expect(first.config.groups.public.maxRequests).toBe(2);

    await rateLimitService.updateConfig({
      enabled: true,
      groups: {
        public: { enabled: true, windowSeconds: 60, maxRequests: 5 },
        auth: { enabled: true, windowSeconds: 60, maxRequests: 10 },
        protected: { enabled: true, windowSeconds: 60, maxRequests: 2 },
        admin: { enabled: true, windowSeconds: 60, maxRequests: 300 },
        special: { enabled: true, windowSeconds: 60, maxRequests: 30 },
      },
    });

    const second = await rateLimitService.getOverview();

    expect(second.config.groups.public.maxRequests).toBe(5);
  });
});
