import prisma from "@db";
import type { Role } from "@db";
import { sendEmail, invitationTemplate } from "@email";
import { env } from "@env/server";
import { siteConfig } from "@config";
import { activityService } from "../activity/activity.service";

const adminUserSelect = {
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

type AdminActor = {
  id?: string;
  role?: Role | string | null;
};

class AdminUserPolicyError extends Error {
  status = 403;
}

function policyError(message: string): never {
  throw new AdminUserPolicyError(message);
}

function assertAssignableAdminRole(role?: Role) {
  if (role === "OWNER") {
    throw new Error("Owner role cannot be assigned from user management");
  }
}

function normalizePagination(page?: number, limit?: number) {
  const normalizedLimit = Math.min(Math.max(limit ?? 10, 1), 100);
  const normalizedPage = Math.max(page ?? 1, 1);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

function actorIsOwner(actor?: AdminActor) {
  return actor?.role === "OWNER";
}

function assertAuthenticatedActor(actor?: AdminActor) {
  if (!actor?.id || !actor.role) {
    policyError("Admin actor is required");
  }
}

async function getAdminTargetUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

async function assertNotLastOwner(targetRole: Role) {
  if (targetRole !== "OWNER") {
    return;
  }

  const ownerCount = await prisma.user.count({
    where: {
      role: "OWNER",
      banned: false,
      archived: false,
    },
  });

  if (ownerCount <= 1) {
    policyError("Cannot disable or delete the last active owner");
  }
}

async function assertCanUpdateUser(args: {
  actor?: AdminActor;
  targetId: string;
  data: { role?: Role };
}) {
  assertAuthenticatedActor(args.actor);
  assertAssignableAdminRole(args.data.role);

  const target = await getAdminTargetUser(args.targetId);

  if (target.role === "OWNER" && !actorIsOwner(args.actor)) {
    policyError("Only owners can update owner accounts");
  }

  if (args.data.role === "ADMIN" && !actorIsOwner(args.actor)) {
    policyError("Only owners can grant admin role");
  }
}

async function assertCanUseDestructiveAction(args: {
  actor?: AdminActor;
  targetId: string;
  action: "ban" | "archive" | "delete";
}) {
  assertAuthenticatedActor(args.actor);

  if (args.actor?.id === args.targetId) {
    policyError(`You cannot ${args.action} your own account`);
  }

  const target = await getAdminTargetUser(args.targetId);

  if ((target.role === "OWNER" || target.role === "ADMIN") && !actorIsOwner(args.actor)) {
    policyError("Only owners can change admin or owner accounts");
  }

  await assertNotLastOwner(target.role);
}

export class UsersService {
  async listUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    banned?: boolean;
    archived?: boolean;
  }) {
    const { search, role, banned, archived } = query;
    const { page, limit } = normalizePagination(query.page, query.limit);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (banned !== undefined) where.banned = banned;
    if (archived !== undefined) where.archived = archived;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: adminUserSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        ...adminUserSelect,
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
  }

  async updateUser(
    id: string,
    data: { name?: string; role?: Role },
    actor?: AdminActor,
  ) {
    await assertCanUpdateUser({
      actor,
      targetId: id,
      data,
    });

    const user = await prisma.user.update({
      where: { id },
      data,
      select: adminUserSelect,
    });

    if (data.role) {
      await activityService.record({
        type: "user.role_updated",
        actorUserId: actor?.id,
        targetUserId: id,
        message: `${user.name} role changed to ${data.role}`,
        metadata: {
          role: data.role,
          email: user.email,
        },
      });
    }

    return user;
  }

  async banUser(id: string, reason?: string, actor?: AdminActor) {
    await assertCanUseDestructiveAction({
      actor,
      targetId: id,
      action: "ban",
    });

    const user = await prisma.user.update({
      where: { id },
      data: { banned: true, banReason: reason },
      select: adminUserSelect,
    });

    await activityService.record({
      type: "user.banned",
      actorUserId: actor?.id,
      targetUserId: id,
      severity: "warning",
      message: `${user.name} was banned`,
      metadata: {
        email: user.email,
        reason: reason ?? null,
      },
    });

    return user;
  }

  async unbanUser(id: string, actor?: AdminActor) {
    const user = await prisma.user.update({
      where: { id },
      data: { banned: false, banReason: null },
      select: adminUserSelect,
    });

    await activityService.record({
      type: "user.unbanned",
      actorUserId: actor?.id,
      targetUserId: id,
      message: `${user.name} was unbanned`,
      metadata: {
        email: user.email,
      },
    });

    return user;
  }

  async archiveUser(id: string, actor?: AdminActor) {
    await assertCanUseDestructiveAction({
      actor,
      targetId: id,
      action: "archive",
    });

    const user = await prisma.user.update({
      where: { id },
      data: { archived: true },
      select: adminUserSelect,
    });

    await activityService.record({
      type: "user.archived",
      actorUserId: actor?.id,
      targetUserId: id,
      severity: "warning",
      message: `${user.name} was archived`,
      metadata: {
        email: user.email,
      },
    });

    return user;
  }

  async restoreUser(id: string, actor?: AdminActor) {
    const user = await prisma.user.update({
      where: { id },
      data: { archived: false },
      select: adminUserSelect,
    });

    await activityService.record({
      type: "user.restored",
      actorUserId: actor?.id,
      targetUserId: id,
      message: `${user.name} was restored`,
      metadata: {
        email: user.email,
      },
    });

    return user;
  }

  async deleteUserPermanent(id: string, actor?: AdminActor) {
    await assertCanUseDestructiveAction({
      actor,
      targetId: id,
      action: "delete",
    });

    // Delete related records first if necessary, or let Cascade handle it
    return prisma.user.delete({
      where: { id },
      select: adminUserSelect,
    });
  }

  async inviteUser(email: string, role: Role = "USER", inviterId: string) {
    assertAssignableAdminRole(role);

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("User already exists");

    // Get inviter info for the email
    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
    const inviterName = inviter?.name || "A team member";

    // Create invitation (expiration 7 days)
    const invitation = await prisma.invitation.create({
      data: {
        id: crypto.randomUUID(),
        email,
        role,
        inviterId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send email
    const inviteUrl = `${env.CORS_ORIGIN}/accept-invitation?id=${invitation.id}`;
    const invitedRole = role === "ADMIN" ? "ADMIN" : "USER";
    await sendEmail({
      to: email,
      subject: `Invitation: Join ${siteConfig.name} as ${invitedRole === "ADMIN" ? "Admin" : "User"}`,
      html: await invitationTemplate({
        inviteUrl,
        inviterName,
        invitedEmail: email,
        invitedRole,
        expiresInDays: 7,
      }),
    });

    await activityService.record({
      type: "user.invited",
      actorUserId: inviterId,
      message: `${email} was invited as ${role}`,
      metadata: {
        email,
        role,
        invitationId: invitation.id,
      },
    });

    return invitation;
  }

  async getUserSessions(id: string) {
    return prisma.session.findMany({
      where: { userId: id },
      select: {
        id: true,
        expiresAt: true,
        createdAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const usersService = new UsersService();
export { AdminUserPolicyError };
