import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { Prisma } from "../../../packages/db/prisma/generated/client";

const sessionFindManyMock = mock(async () => []);
const userFindManyMock = mock(async () => []);
const userCountMock = mock(async () => 0);
const userFindUniqueMock = mock(async (): Promise<any> => null);
const userUpdateMock = mock(async (): Promise<any> => null);
const userDeleteMock = mock(async (): Promise<any> => null);
const invitationCreateMock = mock(async () => ({ id: "invitation-1" }));
const activityRecordMock = mock(async () => null);

const safeAdminUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  banned: true,
  banReason: true,
  archived: true,
  onboardingComplete: true,
  plan: true,
  subscriptionStatus: true,
};

mock.module("@db", () => ({
  default: {
    user: {
      findMany: userFindManyMock,
      count: userCountMock,
      findUnique: userFindUniqueMock,
      update: userUpdateMock,
      delete: userDeleteMock,
    },
    session: {
      findMany: sessionFindManyMock,
    },
    invitation: {
      create: invitationCreateMock,
    },
  },
  Prisma,
}));

mock.module("../src/modules/admin/activity/activity.service", () => ({
  activityService: {
    record: activityRecordMock,
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

beforeEach(() => {
  userUpdateMock.mockResolvedValue({
    id: "user-1",
    name: "User One",
    email: "user@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    role: "USER",
    banned: false,
    banReason: null,
    archived: false,
    onboardingComplete: false,
    plan: "free",
    subscriptionStatus: null,
  });
  invitationCreateMock.mockResolvedValue({ id: "invitation-1" });
});

afterEach(() => {
  sessionFindManyMock.mockReset();
  userFindManyMock.mockReset();
  userCountMock.mockReset();
  userFindUniqueMock.mockReset();
  userUpdateMock.mockReset();
  userDeleteMock.mockReset();
  invitationCreateMock.mockReset();
  activityRecordMock.mockReset();
});

describe("UsersService", () => {
  it("uses a safe user projection for admin user lists", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.listUsers({ search: "test" });

    expect(userFindManyMock).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "test", mode: "insensitive" } },
          { email: { contains: "test", mode: "insensitive" } },
        ],
      },
      select: safeAdminUserSelect,
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" },
    });
  });

  it("uses a safe user projection for admin user details", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.getUserById("user-1");

    expect(userFindUniqueMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        ...safeAdminUserSelect,
        invitations: {
          select: {
            id: true,
            email: true,
            role: true,
            expiresAt: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  });

  it("uses a safe user projection for admin user mutations", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.updateUser("user-1", { name: "Updated" });
    await usersService.banUser("user-1", "reason");
    await usersService.unbanUser("user-1");
    await usersService.archiveUser("user-1");
    await usersService.restoreUser("user-1");
    await usersService.deleteUserPermanent("user-1");

    expect(userUpdateMock).toHaveBeenNthCalledWith(1, {
      where: { id: "user-1" },
      data: { name: "Updated" },
      select: safeAdminUserSelect,
    });
    expect(userUpdateMock).toHaveBeenNthCalledWith(2, {
      where: { id: "user-1" },
      data: { banned: true, banReason: "reason" },
      select: safeAdminUserSelect,
    });
    expect(userUpdateMock).toHaveBeenNthCalledWith(3, {
      where: { id: "user-1" },
      data: { banned: false, banReason: null },
      select: safeAdminUserSelect,
    });
    expect(userUpdateMock).toHaveBeenNthCalledWith(4, {
      where: { id: "user-1" },
      data: { archived: true },
      select: safeAdminUserSelect,
    });
    expect(userUpdateMock).toHaveBeenNthCalledWith(5, {
      where: { id: "user-1" },
      data: { archived: false },
      select: safeAdminUserSelect,
    });
    expect(userDeleteMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: safeAdminUserSelect,
    });
  });

  it("rejects OWNER role updates from admin user management", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await expect(
      usersService.updateUser("user-1", { role: "OWNER" } as any),
    ).rejects.toThrow("Owner role cannot be assigned from user management");
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects OWNER invitations from admin user management", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await expect(
      usersService.inviteUser("owner@example.com", "OWNER" as any, "admin-1"),
    ).rejects.toThrow("Owner role cannot be assigned from user management");
    expect(userFindUniqueMock).not.toHaveBeenCalled();
  });

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

  it("records role changes with safe metadata", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.updateUser("user-1", { role: "ADMIN" }, "admin-1");

    expect(activityRecordMock).toHaveBeenCalledWith({
      type: "user.role_updated",
      actorUserId: "admin-1",
      targetUserId: "user-1",
      message: "User One role changed to ADMIN",
      metadata: {
        role: "ADMIN",
        email: "user@example.com",
      },
    });
  });

  it("records user invitations after invite email succeeds", async () => {
    userFindUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "admin-1", name: "Admin User" });

    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.inviteUser("new@example.com", "USER", "admin-1");

    expect(activityRecordMock).toHaveBeenCalledWith({
      type: "user.invited",
      actorUserId: "admin-1",
      message: "new@example.com was invited as USER",
      metadata: {
        email: "new@example.com",
        role: "USER",
        invitationId: "invitation-1",
      },
    });
  });

  it("records ban and unban events", async () => {
    const { usersService } = await import(
      "../src/modules/admin/users/users.service"
    );

    await usersService.banUser("user-1", "spam", "admin-1");
    await usersService.unbanUser("user-1", "admin-1");

    expect(activityRecordMock).toHaveBeenNthCalledWith(1, {
      type: "user.banned",
      actorUserId: "admin-1",
      targetUserId: "user-1",
      severity: "warning",
      message: "User One was banned",
      metadata: {
        email: "user@example.com",
        reason: "spam",
      },
    });
    expect(activityRecordMock).toHaveBeenNthCalledWith(2, {
      type: "user.unbanned",
      actorUserId: "admin-1",
      targetUserId: "user-1",
      message: "User One was unbanned",
      metadata: {
        email: "user@example.com",
      },
    });
  });
});
