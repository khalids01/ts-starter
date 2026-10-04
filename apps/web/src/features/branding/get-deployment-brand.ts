import { brandKey } from "@config/brand";
import { env } from "@env/public";
import { createServerFn } from "@tanstack/react-start";

/** Keep API and web identity consistent for every public, customer and admin route. */
export const getDeploymentBrand = createServerFn({ method: "GET" }).handler(async () => {
  const response = await fetch(`${env.VITE_SERVER_URL.replace(/\/$/, "")}/health/live`, {
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok || (await response.json()).brand !== brandKey) {
    throw new Error("Web/API BRAND mismatch; configure and rebuild both apps for the same store");
  }
  return { brand: brandKey };
});
