import { brandConfig } from "./brand";
import { e2eRuntimeConfig, getE2eServerEnvDefaults } from "./e2e.config";

export { brandConfig };
export { brandKey, brands, resolveBrand, resolveBrandKey } from "./brand";
export type { BrandConfig } from "./brand";
export { e2eRuntimeConfig, getE2eServerEnvDefaults };

export const siteConfig = {
  name: brandConfig.name,
  description: brandConfig.description,
  url: brandConfig.publicOrigin,
};
