import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { magicLink } from "better-auth/plugins";
import prisma from "@db";
import { env } from "@env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail, magicLinkTemplate } from "@email";

import { polarClient } from "./lib/payments";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 1 month
    },
  },
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
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
            createCustomerOnSignUp: true,
            use: [
              checkout({
                products: [
                  {
                    productId: env.POLAR_PRO_MONTHLY_ID!,
                    slug: "pro_monthly",
                  },
                  {
                    productId: env.POLAR_PRO_YEARLY_ID!,
                    slug: "pro_yearly",
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
        ]
      : []),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to TS Starter",
          html: magicLinkTemplate(url),
        });
      },
    }),
  ],
});
