import { afterEach, describe, expect, it, mock } from "bun:test";
import { Prisma } from "../../../packages/db/prisma/generated/client";

const queryRawMock = mock(async (): Promise<any> => []);

mock.module("@db", () => ({
  default: {
    $queryRaw: queryRawMock,
  },
  Prisma,
}));

afterEach(() => {
  queryRawMock.mockReset();
});

describe("AdminVisitorsService", () => {
  it("maps logged-in visitor identity fields (name/email) in list response", async () => {
    queryRawMock
      .mockResolvedValueOnce([{ total: 1 }])
      .mockResolvedValueOnce([
        {
          visitorId: "visitor-1",
          firstSeenAt: new Date("2026-04-20T10:00:00.000Z"),
          lastSeenAt: new Date("2026-04-25T12:00:00.000Z"),
          lastSeenInRange: new Date("2026-04-25T12:00:00.000Z"),
          visitsCount: 3,
          lastPath: "/pricing",
          isLoggedIn: true,
          userName: "Owner User",
          userEmail: "owner@example.com",
          deviceType: "desktop",
          country: "BD",
          isBot: false,
        },
      ]);

    const { adminVisitorsService } = await import(
      "../src/modules/admin/visitors/visitors.service"
    );

    const result = await adminVisitorsService.listVisitors({
      page: 1,
      limit: 20,
      segment: "humans",
      type: "all",
      dateFrom: "2026-04-01",
      dateTo: "2026-04-25",
    });

    expect(queryRawMock).toHaveBeenCalledTimes(2);
    expect(result.items[0]).toMatchObject({
      visitorId: "visitor-1",
      isLoggedIn: true,
      userName: "Owner User",
      userEmail: "owner@example.com",
    });
  });

  it("returns null user identity fields for anonymous visitors", async () => {
    queryRawMock
      .mockResolvedValueOnce([{ total: 1 }])
      .mockResolvedValueOnce([
        {
          visitorId: "visitor-2",
          firstSeenAt: new Date("2026-04-25T10:00:00.000Z"),
          lastSeenAt: new Date("2026-04-25T10:10:00.000Z"),
          lastSeenInRange: new Date("2026-04-25T10:10:00.000Z"),
          visitsCount: 1,
          lastPath: "/",
          isLoggedIn: false,
          userName: null,
          userEmail: null,
          deviceType: "mobile",
          country: null,
          isBot: false,
        },
      ]);

    const { adminVisitorsService } = await import(
      "../src/modules/admin/visitors/visitors.service"
    );

    const result = await adminVisitorsService.listVisitors({
      page: 1,
      limit: 20,
      segment: "humans",
      type: "all",
      dateFrom: "2026-04-01",
      dateTo: "2026-04-25",
    });

    expect(queryRawMock).toHaveBeenCalledTimes(2);
    expect(result.items[0]).toMatchObject({
      visitorId: "visitor-2",
      isLoggedIn: false,
      userName: null,
      userEmail: null,
    });
  });
});
