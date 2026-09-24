import { createServerFn } from "@tanstack/react-start";
import { env } from "@env/public";

import type { PublicAuthSettings } from "./auth-methods";

export const getPublicAuthSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicAuthSettings> => {
    const response = await fetch(`${env.VITE_SERVER_URL}/auth/settings`);

    if (!response.ok) {
      throw new Error(
        `Authentication settings service returned ${response.status}`
      );
    }

    return (await response.json()) as PublicAuthSettings;
  }
);
