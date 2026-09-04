import { polarClient } from "@polar-sh/better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";
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
    polarClient(),
  ],
  sessionOptions: {
    refetchInterval: 4 * 60,
    refetchOnWindowFocus: true,
    refetchWhenOffline: false,
  },
});

export type { AuthClientSession };
