import { Elysia } from "elysia";
import { Checkout, Webhooks } from "@polar-sh/elysia";
import { env } from "@env/server";
import prisma from "@db";
import { PLANS } from "@auth/src/plans";

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
            case "order.created":
            case "order.paid":
            case "order.updated": {
              const order = payload.data as any;
              // Link to user: prioritizes customerMetadata.userId, then customer.externalId
              const userId = (order.customerMetadata?.userId ||
                order.customer?.externalId) as string;

              if (userId) {
                // net_amount is the current Polar field for the total amount
                const amount =
                  order.net_amount ?? order.total_amount ?? order.amount;

                await (prisma as any).order.upsert({
                  where: { polarOrderId: order.id },
                  update: {
                    status: order.status,
                    amount: amount,
                    updatedAt: new Date(),
                  },
                  create: {
                    polarOrderId: order.id,
                    amount: amount,
                    currency: order.currency,
                    status: order.status,
                    userId,
                  },
                });

                // If the order is paid and it's for a known product, immediately upgrade user to pro
                if (order.status === "paid" || order.status === "fulfilled") {
                  const productIds = (Object.values(PLANS) as any[]).map(
                    (p) => p.productId,
                  );
                  // Polar orders can have multiple products, check if any match OUR pro plans
                  const hasProProduct = order.items?.some((item: any) =>
                    productIds.includes(item.product_id),
                  );

                  if (hasProProduct) {
                    const matchedPlan = (Object.values(PLANS) as any[]).find(
                      (p) =>
                        order.items?.some(
                          (item: any) => item.product_id === p.productId,
                        ),
                    );

                    await prisma.user.update({
                      where: { id: userId },
                      data: {
                        plan: matchedPlan?.slug || "pro",
                        subscriptionStatus: "active",
                      },
                    });
                  }
                }

                console.log(
                  `[Polar] Order ${order.id} (${payload.type}) for user ${userId}: ${order.status}`,
                );
              }
              break;
            }
            case "subscription.created":
            case "subscription.updated":
            case "subscription.active":
            case "subscription.revoked":
            case "subscription.canceled": {
              const sub = payload.data as any;
              console.log(
                `[Polar] ${payload.type} for customer ${sub.customerId}`,
              );

              // Update local user record if we have an externalId linking to our userId
              const userId = sub.customer?.externalId;
              if (userId) {
                // Find matching plan slug
                let planSlug = "free";
                const activeStatuses = ["active", "trialing", "trial"];
                if (activeStatuses.includes(sub.status)) {
                  const foundPlan = (Object.values(PLANS) as any[]).find(
                    (p) =>
                      p.productId === sub.productId ||
                      p.productId === sub.product_id,
                  );
                  // The admin panel looks for "pro" to highlight things, but use the specific slug if found
                  planSlug = foundPlan ? foundPlan.slug : "pro";
                }

                await prisma.user.update({
                  where: { id: userId },
                  data: {
                    plan: planSlug,
                    subscriptionStatus: sub.status,
                    subscriptionId: sub.id,
                    nextPaymentDate: sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd)
                      : sub.current_period_end
                        ? new Date(sub.current_period_end)
                        : null,
                  },
                });
                console.log(
                  `[Polar] Updated user ${userId} to plan ${planSlug} (${sub.status})`,
                );
              }
              break;
            }
            default:
              console.log(`[Polar] Unhandled event type: ${payload.type}`);
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
