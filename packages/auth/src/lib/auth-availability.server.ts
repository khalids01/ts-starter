import { APIError, createAuthMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import { getAuthSettings } from "@db/server";

type AuthRequestBody = {
  provider?: string;
  requestSignUp?: boolean;
  name?: string;
};

export function authAvailability(): BetterAuthPlugin {
  return {
    id: "auth-availability",
    hooks: {
      before: [{
        matcher: (context) => context.path === "/sign-in/social" || context.path === "/sign-in/magic-link",
        handler: createAuthMiddleware(async (context) => {
          const body = context.body as AuthRequestBody;
          const isSignUp = body.requestSignUp === true || Boolean(body.name);
          const settings = await getAuthSettings();

          if (body.provider === "github") {
            const enabled = isSignUp ? settings.githubSignUpEnabled : settings.githubSignInEnabled;
            if (!enabled) {
              throw new APIError("FORBIDDEN", {
                message: `GitHub ${isSignUp ? "sign-up" : "sign-in"} is currently disabled`,
              });
            }
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
