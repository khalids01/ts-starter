import { Elysia } from "elysia";
import { Checkout, Webhooks } from "@polar-sh/elysia";
import { env } from "@env/server";

export const polarController = new Elysia({ prefix: "/polar" })
  .get(
    "/checkout",
    Checkout({
      accessToken: env.POLAR_ACCESS_TOKEN || "",
      successUrl: env.POLAR_SUCCESS_URL || "",
      server: env.POLAR_MODE || "sandbox",
    }),
  )
  .post(
    "/webhooks",
    Webhooks({
      webhookSecret: env.POLAR_WEBHOOK_SECRET || "",
      onPayload: async (payload) => {
        try {
          switch (payload.type) {
            case "subscription.created":
            case "subscription.updated":
            case "subscription.active":
              console.log(`${payload.type} for ${payload.data.customerId}`);
              // Note: Better-Auth's Polar plugin already handles some of this,
              // but you can add custom logic here if needed.
              break;
            case "subscription.revoked":
            case "subscription.canceled":
              console.log(`${payload.type} for ${payload.data.customerId}`);
              break;
            default:
              console.log(`Unhandled event type: ${payload.type}`);
          }
        } catch (error) {
          console.error("Error processing webhook:", error);
        }
      },
    }),
    {
      parse: ({ request }) => request.text(),
    },
  );
