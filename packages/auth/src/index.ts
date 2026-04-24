import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { magicLink } from "better-auth/plugins";
import prisma from "@db";
import { env } from "@env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail, magicLinkTemplate } from "@email";

import { polarClient } from "./lib/payments";
import { polarCustomersForBillingUsers } from "./lib/polar-customers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 1 month
    },
  },
  trustedOrigins: [env.CORS_ORIGIN],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        output: true,
      },
      banned: {
        type: "boolean",
        input: false,
        output: true,
      },
      banReason: {
        type: "string",
        input: false,
        output: true,
      },
      archived: {
        type: "boolean",
        input: false,
        output: true,
      },
      onboardingComplete: {
        type: "boolean",
        input: true,
        output: true,
      },
      polarCustomerId: {
        type: "string",
        input: false,
        output: false,
      },
      subscriptionId: {
        type: "string",
        input: false,
        output: false,
      },
      plan: {
        type: "string",
        input: false,
        output: true,
      },
      subscriptionStatus: {
        type: "string",
        input: false,
        output: true,
      },
    },
  },
  plugins: [
    ...(env.ENABLE_POLAR
      ? [
        polar({
          client: polarClient,
          createCustomerOnSignUp: false,
          use: [
            checkout({
              products: [
                {
                  productId: "c9fe3a9c-1663-48ec-b7c5-75fdc6be91ca",
                  slug: "pro_monthly",
                },
              ],
              successUrl: env.POLAR_SUCCESS_URL!,
              authenticatedUsersOnly: true,
            }),
            portal(),
            webhooks({
              secret: env.POLAR_WEBHOOK_SECRET || "",
              onSubscriptionCreated: async (payload: any) => {
                const { subscription, customer } = payload;
                await prisma.user.update({
                  where: { id: customer.externalId as string },
                  data: {
                    subscriptionId: subscription.id as string,
                    subscriptionStatus: subscription.status as string,
                  },
                });
              },
              onSubscriptionUpdated: async (payload: any) => {
                const { subscription, customer } = payload;
                await prisma.user.update({
                  where: { id: customer.externalId as string },
                  data: {
                    subscriptionStatus: subscription.status as string,
                  },
                });
              },
            }),
          ],
        }),
        polarCustomersForBillingUsers(),
      ]
      : []),
    magicLink({
      rateLimit: {
        window: 60,
        max: 5,
      },
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to TS Starter",
          html: await magicLinkTemplate(url),
        });
      },
    }),
  ],
});
