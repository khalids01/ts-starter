import { afterEach, describe, expect, it, mock } from "bun:test";

const sessionFindManyMock = mock(async () => []);

mock.module("@db", () => ({
  default: {
    session: {
      findMany: sessionFindManyMock,
    },
  },
}));

mock.module("@email", () => ({
  sendEmail: mock(async () => undefined),
  invitationTemplate: mock(async () => "<p>Invitation</p>"),
}));

mock.module("@env/server", () => ({
  env: {
    CORS_ORIGIN: "http://localhost:3000",
  },
}));

mock.module("@config", () => ({
  siteConfig: {
    name: "TS Starter",
  },
}));

afterEach(() => {
  sessionFindManyMock.mockReset();
});

describe("UsersService", () => {
  it("does not select session tokens for admin session lists", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.getUserSessions("user-1");

    expect(sessionFindManyMock).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: {
        id: true,
        expiresAt: true,
        createdAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });
});
