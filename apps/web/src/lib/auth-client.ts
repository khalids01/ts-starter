import { polarClient } from "@polar-sh/better-auth/client";
import { magicLinkClient, twoFactorClient } from "better-auth/client/plugins";
import type { AuthClientSession } from "@auth/client";
import { env } from "@env/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    magicLinkClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        if (typeof window !== "undefined") {
          window.location.assign("/two-factor");
        }
      },
    }),
    polarClient(),
  ],
  sessionOptions: {
    refetchInterval: 4 * 60,
    refetchOnWindowFocus: true,
    refetchWhenOffline: false,
  },
});

export type { AuthClientSession };
