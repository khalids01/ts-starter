import { polarClient } from "@polar-sh/better-auth";
import { magicLinkClient } from "better-auth/client/plugins";
import { env } from "@env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    magicLinkClient(),
    ...(env.VITE_ENABLE_POLAR ? [polarClient()] : [])
  ],
});
