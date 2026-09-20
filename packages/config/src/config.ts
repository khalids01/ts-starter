import { brandConfig } from "./brand.config";
import { e2eRuntimeConfig, getE2eServerEnvDefaults } from "./e2e.config";

export { brandConfig };
export type { BrandConfig } from "./brand.config";
export { e2eRuntimeConfig, getE2eServerEnvDefaults };

export const siteConfig = {
  name: brandConfig.name,
  description: brandConfig.description,
  url: "https://example.com",
};
