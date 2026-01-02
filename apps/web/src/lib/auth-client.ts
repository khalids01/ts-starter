import { polarClient } from "@polar-sh/better-auth";
import { env } from "@ts-starter/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [...(env.VITE_ENABLE_POLAR ? [polarClient()] : [])],
});
