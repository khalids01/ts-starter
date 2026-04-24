import prisma from "@db";
import type { Role } from "@db";
import { sendEmail, invitationTemplate } from "@email";
import { env } from "@env/server";
import { siteConfig } from "@config";

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

function assertAssignableAdminRole(role?: Role) {
  if (role === "OWNER") {
    throw new Error("Owner role cannot be assigned from user management");
  }
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
    const { page = 1, limit = 10, search, role, banned, archived } = query;
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

  async updateUser(id: string, data: { name?: string; role?: Role }) {
    assertAssignableAdminRole(data.role);

    return prisma.user.update({
      where: { id },
      data,
      select: adminUserSelect,
    });
  }

  async banUser(id: string, reason?: string) {
    return prisma.user.update({
      where: { id },
      data: { banned: true, banReason: reason },
      select: adminUserSelect,
    });
  }

  async unbanUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { banned: false, banReason: null },
      select: adminUserSelect,
    });
  }

  async archiveUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { archived: true },
      select: adminUserSelect,
    });
  }

  async restoreUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { archived: false },
      select: adminUserSelect,
    });
  }

  async deleteUserPermanent(id: string) {
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
