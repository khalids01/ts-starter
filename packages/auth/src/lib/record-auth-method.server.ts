import type { BetterAuthPlugin } from "better-auth";
import { recordUserAuthMethod, type AuthMethod } from "@db/server";

function resolveAuthMethod(context: { path?: string; params?: { id?: string } }): AuthMethod | null {
  if (context.path === "/callback/:id" && context.params?.id === "github") {
    return "github";
  }

  return context.path === "/magic-link/verify" ? "magic-link" : null;
}

export function recordAuthMethodOnSession(): BetterAuthPlugin {
  return {
    id: "record-auth-method-on-session",
    init() {
      return {
        options: {
          databaseHooks: {
            session: {
              create: {
                after: async (session, context) => {
                  const method = resolveAuthMethod(context ?? {});
                  if (method && session.userId) {
                    await recordUserAuthMethod(session.userId, method);
                  }
                },
              },
            },
          },
        },
      };
    },
  };
}
