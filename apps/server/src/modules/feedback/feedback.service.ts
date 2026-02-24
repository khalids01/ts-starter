import prisma from "@db";

export const feedbackService = {
    async submitFeedback(userId: string, message: string, severity: string) {
        return prisma.feedback.create({
            data: {
                userId,
                message,
                severity,
            },
        });
    },
};
