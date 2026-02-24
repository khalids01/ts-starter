import { t } from "elysia";

export const SubmitFeedbackDto = t.Object({
    message: t.String({ minLength: 10, maxLength: 2000 }),
    severity: t.Union([t.Literal("low"), t.Literal("medium"), t.Literal("high")]),
});
