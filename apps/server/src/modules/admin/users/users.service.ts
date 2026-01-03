import prisma from "@ts-starter/db";
import type { Role } from "@ts-starter/db";
import { sendEmail } from "../../../email/nodemailer";
import { invitationTemplate } from "../../../email/templates/invitation";
import { env } from "@ts-starter/env/server";

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
            include: {
                invitations: true,
            }
        });
    }

    async updateUser(id: string, data: { name?: string; role?: Role }) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async banUser(id: string, reason?: string) {
        return prisma.user.update({
            where: { id },
            data: { banned: true, banReason: reason },
        });
    }

    async unbanUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: { banned: false, banReason: null },
        });
    }

    async archiveUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: { archived: true },
        });
    }

    async restoreUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: { archived: false },
        });
    }

    async deleteUserPermanent(id: string) {
        // Delete related records first if necessary, or let Cascade handle it
        return prisma.user.delete({
            where: { id },
        });
    }

    async inviteUser(email: string, role: Role = "USER", inviterId: string) {
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
        const inviteUrl = `${env.BETTER_AUTH_URL}/accept-invitation?id=${invitation.id}`;
        await sendEmail(
            email,
            `You're invited to join the team`,
            invitationTemplate(inviteUrl, inviterName)
        );

        return invitation;
    }
}

export const usersService = new UsersService();
