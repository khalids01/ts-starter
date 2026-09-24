import { Elysia, t } from "elysia";
import { courierWebhookService, CourierWebhookError } from "./webhook.service";

export const courierWebhookController = new Elysia({
  prefix: "/courier/webhooks",
  detail: { tags: ["Courier Webhooks"] },
}).post(
  "/:connectionPublicId",
  async ({ params: { connectionPublicId }, request, set }) => {
    try {
      return await courierWebhookService.process(
        connectionPublicId,
        request.headers.get("authorization"),
        await request.text(),
      );
    } catch (error) {
      const status = error instanceof CourierWebhookError ? error.status : 500;
      set.status = status;
      return { received: false };
    }
  },
  {
    parse: "none",
    params: t.Object({ connectionPublicId: t.String({ minLength: 1, maxLength: 128 }) }),
  },
);
