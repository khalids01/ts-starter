import prisma from "@db";
import { notificationsService } from "../notifications/notifications.service";

export const feedbackService = {
    async submitFeedback(userId: string, message: string, severity: string) {
        const feedback = await prisma.feedback.create({
            data: {
                userId,
                message,
                severity,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Get all admins and owners
        const admins = await prisma.user.findMany({
            where: {
                role: {
                    in: ["ADMIN", "OWNER"],
                },
            },
            select: { id: true },
        });

        // Create notifications for them
        for (const admin of admins) {
            await notificationsService.create(
                admin.id,
                "New Feedback Received",
                `New ${severity} severity feedback from ${feedback.user.name}: ${message.substring(0, 50)}...`,
                "/admin/feedback"
            );
        }

        return feedback;
    },

    async getAllFeedback() {
        return prisma.feedback.findMany({
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
        });
    },

    async updateFeedbackStatus(id: string, status: string) {
        return prisma.feedback.update({
            where: { id },
            data: { status },
        });
    },
};
