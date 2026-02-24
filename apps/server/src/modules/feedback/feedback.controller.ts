import { Elysia } from "elysia";
import { authGuard } from "@/guards/auth.guard";
import { feedbackService } from "./feedback.service";
import { SubmitFeedbackDto } from "./feedback.dto";

export const feedbackController = new Elysia({
    prefix: "/feedback",
    detail: { tags: ["Feedback"] },
})
    .use(authGuard)
    .post(
        "/",
        async ({ body, user }) => {
            const feedback = await feedbackService.submitFeedback(
                user.id,
                body.message,
                body.severity
            );
            return { success: true, feedback };
        },
        {
            body: SubmitFeedbackDto,
            detail: { summary: "Submit feedback or bug report" },
        }
    );
