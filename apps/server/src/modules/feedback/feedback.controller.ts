import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import { feedbackService } from "./feedback.service";
import {
    SubmitFeedbackDto,
    UpdateFeedbackStatusDto,
    FeedbackQueryDto,
} from "./feedback.dto";
import { authGuard } from "@/guards/auth.guard";

export const feedbackController = new Elysia({
    prefix: "/feedback",
    detail: { tags: ["Feedback"] },
})
    .use(authGuard)
    .post(
        "/",
        async (ctx) => {
            const { body, userId } = ctx as typeof ctx & { userId?: string };
            const feedback = await feedbackService.submitFeedback(
                userId!,
                body.message,
                body.severity
            );
            return { success: true, feedback };
        },
        {
            beforeHandle: rolesGuard(["USER"]),
            body: SubmitFeedbackDto,
            detail: { summary: "Submit feedback or bug report" },
        }
    )
    .get(
        "/all",
        async ({ query }) => {
            return await feedbackService.getAllFeedback(query);
        },
        {
            beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
            query: FeedbackQueryDto,
            detail: { summary: "Get all feedback (Admin only)" },
        }
    )
    .patch(
        "/:id/status",
        async ({ params: { id }, body }) => {
            const feedback = await feedbackService.updateFeedbackStatus(id, body.status);
            return { success: true, feedback };
        },
        {
            beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
            body: UpdateFeedbackStatusDto,
            detail: { summary: "Update feedback status (Admin only)" },
        }
    );
