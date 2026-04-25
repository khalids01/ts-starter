import { t } from "elysia";

export const SubmitFeedbackDto = t.Object({
    message: t.String({ minLength: 10, maxLength: 2000 }),
    severity: t.Union([t.Literal("low"), t.Literal("medium"), t.Literal("high")]),
});

export const UpdateFeedbackStatusDto = t.Object({
    status: t.Union([t.Literal("open"), t.Literal("in-progress"), t.Literal("closed")]),
});

export const FeedbackQueryDto = t.Object({
    page: t.Optional(t.Numeric({ default: 1 })),
    limit: t.Optional(t.Numeric({ default: 20 })),
});

export type FeedbackQuery = typeof FeedbackQueryDto.static;
