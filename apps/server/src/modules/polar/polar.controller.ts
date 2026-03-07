import { Elysia } from "elysia";
import { Checkout, Webhooks } from "@polar-sh/elysia";
import { env } from "@env/server";
import prisma from "@db";

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
            case "order.created": {
              const order = payload.data as any;
              const userId = (order.customerMetadata?.userId ||
                order.customer?.externalId) as string;

              if (userId) {
                await (prisma as any).order.upsert({
                  where: { polarOrderId: order.id },
                  update: {
                    status: order.status,
                    amount: order.amount,
                  },
                  create: {
                    polarOrderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    status: order.status,
                    userId,
                  },
                });
                console.log(`Order ${order.id} saved for user ${userId}`);
              }
              break;
            }
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
