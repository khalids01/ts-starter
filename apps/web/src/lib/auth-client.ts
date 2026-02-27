import { polarClient } from "@polar-sh/better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { env } from "@env/web";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [magicLinkClient(), polarClient()],
  advanced: {
    useCheckSession: true,
  },
});
