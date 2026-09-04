import { APIError, createAuthMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import { getAuthSettings } from "@db/server";

type AuthRequestBody = {
  provider?: string;
  requestSignUp?: boolean;
  name?: string;
};

const guardedPaths = new Set([
  "/sign-in/social",
  "/link-social",
  "/sign-in/magic-link",
  "/sign-in/email",
  "/sign-up/email",
]);

const socialProviderSettings = {
  github: {
    label: "GitHub",
    signIn: "githubSignInEnabled",
    signUp: "githubSignUpEnabled",
  },
  google: {
    label: "Google",
    signIn: "googleSignInEnabled",
    signUp: "googleSignUpEnabled",
  },
  discord: {
    label: "Discord",
    signIn: "discordSignInEnabled",
    signUp: "discordSignUpEnabled",
  },
} as const;

export function authAvailability(): BetterAuthPlugin {
  return {
    id: "auth-availability",
    hooks: {
      before: [{
        matcher: (context) => Boolean(context.path && guardedPaths.has(context.path)),
        handler: createAuthMiddleware(async (context) => {
          const body = context.body as AuthRequestBody;
          const isSignUp = context.path === "/sign-up/email" || body.requestSignUp === true || Boolean(body.name);
          const settings = await getAuthSettings();

          const provider = body.provider as keyof typeof socialProviderSettings;
          const providerSettings = socialProviderSettings[provider];

          if (providerSettings) {
            const settingKey = isSignUp ? providerSettings.signUp : providerSettings.signIn;
            const enabled = settings[settingKey];
            if (!enabled) {
              throw new APIError("FORBIDDEN", {
                message: `${providerSettings.label} ${isSignUp ? "sign-up" : "sign-in"} is currently disabled`,
              });
            }
          }

          if (context.path === "/sign-in/email" && !settings.passwordSignInEnabled) {
            throw new APIError("FORBIDDEN", {
              message: "Password sign-in is currently disabled",
            });
          }

          if (context.path === "/sign-up/email" && !settings.passwordSignUpEnabled) {
            throw new APIError("FORBIDDEN", {
              message: "Password sign-up is currently disabled",
            });
          }

          if (context.path === "/sign-in/magic-link") {
            const enabled = isSignUp ? settings.magicLinkSignUpEnabled : settings.magicLinkSignInEnabled;
            if (!enabled) {
              throw new APIError("FORBIDDEN", {
                message: `Magic Link ${isSignUp ? "sign-up" : "sign-in"} is currently disabled`,
              });
            }
          }
        }),
      }],
    },
  };
}
