import { polar, checkout, portal } from "@polar-sh/better-auth";
import { magicLink } from "better-auth/plugins";
import prisma from "@db";
import { env } from "@env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { polarClient } from "./lib/payments";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
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
    }
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
        const { magicLinkTemplate } = await import("./email/templates/magic-link");
        const nodemailer = await import("nodemailer");

        const transporter = nodemailer.createTransport({
          host: env.SMTP_HOST || "localhost",
          port: Number(env.SMTP_PORT) || 587,
          secure: env.SMTP_SECURE === "true",
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: env.SMTP_FROM || '"TS Starter" <hello@example.com>',
          to: email,
          subject: "Sign in to TS Starter",
          html: magicLinkTemplate(url),
        });
      },
    }),
  ],
});
