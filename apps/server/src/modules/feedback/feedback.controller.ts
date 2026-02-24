import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import { feedbackService } from "./feedback.service";
import { SubmitFeedbackDto } from "./feedback.dto";
import { authGuard } from "@/guards/auth.guard";

export const feedbackController = new Elysia({
    prefix: "/feedback",
    detail: { tags: ["Feedback"] },
})
    .use(authGuard)
    .post(
        "/",
        async ({ body, userId }) => {
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
        async () => {
            return await feedbackService.getAllFeedback();
        },
        {
            beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
            detail: { summary: "Get all feedback (Admin only)" },
        }
    );
