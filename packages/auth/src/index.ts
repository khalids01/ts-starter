import { polar, checkout, portal } from "@polar-sh/better-auth";
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
    },
  },
  plugins: [
    ...(env.ENABLE_POLAR
      ? [
          polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            enableCustomerPortal: true,
            use: [
              checkout({
                products: [
                  {
                    productId: "your-product-id",
                    slug: "pro",
                  },
                ],
                successUrl: env.POLAR_SUCCESS_URL!,
                authenticatedUsersOnly: true,
              }),
              portal(),
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
