import { afterEach, describe, expect, it, mock } from "bun:test";
import { Prisma } from "../../../packages/db/prisma/generated/client";

const feedbackFindManyMock = mock(async (): Promise<any> => []);
const feedbackCountMock = mock(async () => 0);
const feedbackCreateMock = mock(async () => ({
  id: "feedback-1",
  user: { name: "User" },
}));
const feedbackUpdateMock = mock(async () => null);
const userFindManyMock = mock(async (): Promise<any> => []);

mock.module("@db", () => ({
  default: {
    feedback: {
      findMany: feedbackFindManyMock,
      count: feedbackCountMock,
      create: feedbackCreateMock,
      update: feedbackUpdateMock,
    },
    user: {
      findMany: userFindManyMock,
    },
  },
  Prisma,
}));

mock.module("../src/modules/notifications/notifications.service", () => ({
  notificationsService: {
    create: mock(async () => undefined),
  },
}));

afterEach(() => {
  feedbackFindManyMock.mockReset();
  feedbackCountMock.mockReset();
  feedbackCreateMock.mockReset();
  feedbackUpdateMock.mockReset();
  userFindManyMock.mockReset();
});

describe("feedbackService", () => {
  it("returns paginated feedback with metadata", async () => {
    feedbackFindManyMock.mockResolvedValueOnce([
      {
        id: "feedback-1",
        message: "Test feedback",
        severity: "high",
        status: "open",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        user: {
          name: "User One",
          email: "user@example.com",
          image: null,
        },
      },
    ]);
    feedbackCountMock.mockResolvedValueOnce(25);

    const { feedbackService } = await import("../src/modules/feedback/feedback.service");
    const result = await feedbackService.getAllFeedback({ page: 2, limit: 10 });

    expect(feedbackFindManyMock).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: 10,
      take: 10,
    });
    expect(result).toMatchObject({
      total: 25,
      pages: 3,
      page: 2,
      limit: 10,
    });
  });

  it("bounds feedback page size", async () => {
    feedbackCountMock.mockResolvedValueOnce(1);
    feedbackFindManyMock.mockResolvedValueOnce([]);

    const { feedbackService } = await import("../src/modules/feedback/feedback.service");
    const result = await feedbackService.getAllFeedback({ page: -1, limit: 1000 });

    expect(feedbackFindManyMock).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: 0,
      take: 100,
    });
    expect(result).toMatchObject({
      total: 1,
      pages: 1,
      page: 1,
      limit: 100,
    });
  });
});
