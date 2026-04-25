import { afterEach, describe, expect, it, mock } from "bun:test";
import { Prisma } from "../../../packages/db/prisma/generated/client";

type Identity = {
  id: string;
  visitorId: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  firstUserId: string | null;
  lastUserId: string | null;
};

type Session = {
  id: string;
  visitorIdentityId: string;
  userId: string | null;
  isBot: boolean;
  startedAt: Date;
  lastSeenAt: Date;
  endedAt: Date;
  entryPath: string;
  lastPath: string;
  referrer: string | null;
  deviceType: string | null;
  country: string | null;
  ipHash: string | null;
  eventCount: number;
};

let identityStore: Identity[] = [];
let sessionStore: Session[] = [];

const dbMock = {
  visitorIdentity: {
    findUnique: mock(async ({ where: { visitorId } }: any) => {
      return identityStore.find((item) => item.visitorId === visitorId) ?? null;
    }),
    create: mock(async ({ data }: any) => {
      const created: Identity = {
        id: `identity-${identityStore.length + 1}`,
        visitorId: data.visitorId,
        firstSeenAt: data.firstSeenAt,
        lastSeenAt: data.lastSeenAt,
        firstUserId: data.firstUserId ?? null,
        lastUserId: data.lastUserId ?? null,
      };
      identityStore.push(created);
      return created;
    }),
    update: mock(async ({ where: { id }, data }: any) => {
      const index = identityStore.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("identity not found");

      const current = identityStore[index]!;
      const next = {
        ...current,
        ...data,
      };
      identityStore[index] = next;
      return next;
    }),
    deleteMany: mock(async () => ({ count: 0 })),
  },
  visitorSession: {
    findFirst: mock(async ({ where }: any) => {
      const gte = where.lastSeenAt.gte as Date;
      const candidates = sessionStore
        .filter(
          (item) =>
            item.visitorIdentityId === where.visitorIdentityId &&
            item.isBot === where.isBot &&
            item.lastSeenAt >= gte,
        )
        .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());

      return candidates[0] ?? null;
    }),
    create: mock(async ({ data }: any) => {
      const created: Session = {
        id: `session-${sessionStore.length + 1}`,
        visitorIdentityId: data.visitorIdentityId,
        userId: data.userId ?? null,
        isBot: data.isBot,
        startedAt: data.startedAt,
        lastSeenAt: data.lastSeenAt,
        endedAt: data.endedAt,
        entryPath: data.entryPath,
        lastPath: data.lastPath,
        referrer: data.referrer ?? null,
        deviceType: data.deviceType ?? null,
        country: data.country ?? null,
        ipHash: data.ipHash ?? null,
        eventCount: data.eventCount,
      };
      sessionStore.push(created);
      return created;
    }),
    update: mock(async ({ where: { id }, data }: any) => {
      const index = sessionStore.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("session not found");

      const current = sessionStore[index]!;
      const next = {
        ...current,
        ...data,
        eventCount:
          data.eventCount?.increment !== undefined
            ? current.eventCount + data.eventCount.increment
            : current.eventCount,
      };
      sessionStore[index] = next;
      return next;
    }),
  },
  $queryRaw: mock(async () => []),
};

const sessionMock = mock(async () => ({
  user: {
    id: "user-1",
  },
}));

const connectRedisMock = mock(async () => null);

mock.module("@db", () => ({
  default: dbMock,
  Prisma,
}));

mock.module("@redis", () => ({
  connectRedis: connectRedisMock,
}));

mock.module("@/modules/auth/auth.service", () => ({
  auth: {
    api: {
      getSession: sessionMock,
    },
  },
}));

function restoreDbImplementations() {
  dbMock.visitorIdentity.findUnique.mockImplementation(
    async ({ where: { visitorId } }: any) => {
      return identityStore.find((item) => item.visitorId === visitorId) ?? null;
    },
  );

  dbMock.visitorIdentity.create.mockImplementation(async ({ data }: any) => {
    const created: Identity = {
      id: `identity-${identityStore.length + 1}`,
      visitorId: data.visitorId,
      firstSeenAt: data.firstSeenAt,
      lastSeenAt: data.lastSeenAt,
      firstUserId: data.firstUserId ?? null,
      lastUserId: data.lastUserId ?? null,
    };
    identityStore.push(created);
    return created;
  });

  dbMock.visitorIdentity.update.mockImplementation(
    async ({ where: { id }, data }: any) => {
      const index = identityStore.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("identity not found");

      const current = identityStore[index]!;
      const next = {
        ...current,
        ...data,
      };
      identityStore[index] = next;
      return next;
    },
  );

  dbMock.visitorIdentity.deleteMany.mockImplementation(async () => ({ count: 0 }));

  dbMock.visitorSession.findFirst.mockImplementation(async ({ where }: any) => {
    const gte = where.lastSeenAt.gte as Date;
    const candidates = sessionStore
      .filter(
        (item) =>
          item.visitorIdentityId === where.visitorIdentityId &&
          item.isBot === where.isBot &&
          item.lastSeenAt >= gte,
      )
      .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());

    return candidates[0] ?? null;
  });

  dbMock.visitorSession.create.mockImplementation(async ({ data }: any) => {
    const created: Session = {
      id: `session-${sessionStore.length + 1}`,
      visitorIdentityId: data.visitorIdentityId,
      userId: data.userId ?? null,
      isBot: data.isBot,
      startedAt: data.startedAt,
      lastSeenAt: data.lastSeenAt,
      endedAt: data.endedAt,
      entryPath: data.entryPath,
      lastPath: data.lastPath,
      referrer: data.referrer ?? null,
      deviceType: data.deviceType ?? null,
      country: data.country ?? null,
      ipHash: data.ipHash ?? null,
      eventCount: data.eventCount,
    };
    sessionStore.push(created);
    return created;
  });

  dbMock.visitorSession.update.mockImplementation(
    async ({ where: { id }, data }: any) => {
      const index = sessionStore.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("session not found");

      const current = sessionStore[index]!;
      const next = {
        ...current,
        ...data,
        eventCount:
          data.eventCount?.increment !== undefined
            ? current.eventCount + data.eventCount.increment
            : current.eventCount,
      };
      sessionStore[index] = next;
      return next;
    },
  );
}

afterEach(() => {
  identityStore = [];
  sessionStore = [];

  dbMock.visitorIdentity.findUnique.mockReset();
  dbMock.visitorIdentity.create.mockReset();
  dbMock.visitorIdentity.update.mockReset();
  dbMock.visitorIdentity.deleteMany.mockReset();
  dbMock.visitorSession.findFirst.mockReset();
  dbMock.visitorSession.create.mockReset();
  dbMock.visitorSession.update.mockReset();
  dbMock.$queryRaw.mockReset();
  sessionMock.mockReset();
  sessionMock.mockResolvedValue({ user: { id: "user-1" } });
  connectRedisMock.mockReset();
  connectRedisMock.mockResolvedValue(null);
  restoreDbImplementations();
});

describe("VisitorsService.trackVisit", () => {
  it("reuses active session within 5 minutes instead of creating a new one", async () => {
    const { visitorsService } = await import(
      "../src/modules/visitors/visitors.service"
    );

    const setCookieMock = mock(() => undefined);

    const request = new Request("http://localhost:3000/analytics/visitors/track", {
      headers: {
        cookie: "visitor_id=visitor-abc-1234567890",
        "user-agent": "Mozilla/5.0",
      },
    });

    await visitorsService.trackVisit({
      request,
      body: {
        path: "/pricing",
        activityType: "pageview",
      },
      setCookie: setCookieMock,
    });

    await visitorsService.trackVisit({
      request,
      body: {
        path: "/dashboard",
        activityType: "activity",
      },
      setCookie: setCookieMock,
    });

    expect(dbMock.visitorIdentity.create).toHaveBeenCalledTimes(1);
    expect(dbMock.visitorSession.create).toHaveBeenCalledTimes(1);
    expect(dbMock.visitorSession.update).toHaveBeenCalledTimes(1);
    expect(sessionStore[0]?.lastPath).toBe("/dashboard");
    expect(sessionStore[0]?.eventCount).toBe(2);
  });

  it("marks bot user-agents as bot sessions", async () => {
    const { visitorsService } = await import(
      "../src/modules/visitors/visitors.service"
    );

    const setCookieMock = mock(() => undefined);

    const request = new Request("http://localhost:3000/analytics/visitors/track", {
      headers: {
        cookie: "visitor_id=visitor-bot-1234567890",
        "user-agent": "Googlebot/2.1",
      },
    });

    await visitorsService.trackVisit({
      request,
      body: {
        path: "/",
        activityType: "pageview",
      },
      setCookie: setCookieMock,
    });

    expect(dbMock.visitorSession.create).toHaveBeenCalledTimes(1);
    expect(sessionStore[0]?.isBot).toBe(true);
  });
});
