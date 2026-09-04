import { Elysia } from "elysia";
import { auth } from "@auth/server";
import prisma, { getAuthSettings } from "@db/server";
import { env } from "@env/server";
import {
  CheckEmailDto,
  MagicLinkLoginDto,
  MagicLinkSignupDto,
} from "./auth.dto";

function resolveCallbackURL(callbackURL?: string) {
  if (!callbackURL) {
    return env.CORS_ORIGIN;
  }

  try {
    const baseUrl = new URL(env.CORS_ORIGIN);
    const parsedUrl = new URL(callbackURL, env.CORS_ORIGIN);

    if (parsedUrl.origin !== baseUrl.origin) {
      return env.CORS_ORIGIN;
    }

    return parsedUrl.toString();
  } catch {
    return env.CORS_ORIGIN;
  }
}

export const authController = new Elysia({ prefix: "/auth" })
  .get("/settings", async () => {
    const settings = await getAuthSettings();
    return {
      passwordSignInEnabled: settings.passwordSignInEnabled,
      passwordSignUpEnabled: settings.passwordSignUpEnabled,
      magicLinkSignInEnabled: settings.magicLinkSignInEnabled,
      magicLinkSignUpEnabled: settings.magicLinkSignUpEnabled,
      githubSignInEnabled: settings.githubSignInEnabled,
      githubSignUpEnabled: settings.githubSignUpEnabled,
      googleSignInEnabled: settings.googleSignInEnabled,
      googleSignUpEnabled: settings.googleSignUpEnabled,
      discordSignInEnabled: settings.discordSignInEnabled,
      discordSignUpEnabled: settings.discordSignUpEnabled,
    };
  })
  .post(
    "/check-email",
    async ({ body }) => {
      const email = body.email.trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          accounts: { select: { providerId: true } },
          authMethods: { select: { method: true } },
        },
      });
      return {
        exists: !!user,
        authenticationMethods: user
          ? Array.from(new Set([
              ...user.accounts.map((account) => account.providerId),
              ...user.authMethods.map((method) => method.method),
            ]))
          : [],
      };
    },
    {
      body: CheckEmailDto,
    },
  )
  .post(
    "/magic-link/login",
    async ({ body, request, set }) => {
      const email = body.email.trim().toLowerCase();
      const settings = await getAuthSettings();
      if (!settings.magicLinkSignInEnabled) {
        set.status = 403;
        return { message: "Magic Link sign-in is currently disabled" };
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        set.status = 400;
        return { message: "User not found" };
      }
      await auth.api.signInMagicLink({
        body: {
          email,
          callbackURL: resolveCallbackURL(body.callbackURL),
        },
        headers: request.headers,
      });
      return { success: true };
    },
    {
      body: MagicLinkLoginDto,
    },
  )
  .post(
    "/magic-link/signup",
    async ({ body, request, set }) => {
      const email = body.email.trim().toLowerCase();
      const settings = await getAuthSettings();
      if (!settings.magicLinkSignUpEnabled) {
        set.status = 403;
        return { message: "Magic Link sign-up is currently disabled" };
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        set.status = 400;
        return { message: "User already exists" };
      }
      await auth.api.signInMagicLink({
        body: {
          email,
          name: body.name,
          callbackURL: resolveCallbackURL(body.callbackURL),
        },
        headers: request.headers,
      });
      return { success: true };
    },
    {
      body: MagicLinkSignupDto,
    },
  );
