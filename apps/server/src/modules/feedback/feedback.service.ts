import prisma from "@db";
import { notificationsService } from "../notifications/notifications.service";
import type { FeedbackQuery } from "./feedback.dto";

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

    async getAllFeedback(query: FeedbackQuery = {}) {
        const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
        const requestedPage = Math.max(query.page ?? 1, 1);

        const [items, total] = await Promise.all([
            prisma.feedback.findMany({
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
                skip: (requestedPage - 1) * limit,
                take: limit,
            }),
            prisma.feedback.count(),
        ]);

        const pages = Math.max(1, Math.ceil(total / limit));
        const page = Math.min(requestedPage, pages);

        return {
            items,
            total,
            pages,
            page,
            limit,
        };
    },

    async updateFeedbackStatus(id: string, status: string) {
        return prisma.feedback.update({
            where: { id },
            data: { status },
        });
    },
};
