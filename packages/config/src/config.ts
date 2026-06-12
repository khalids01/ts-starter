import { brandConfig } from "./brand.config";

export { brandConfig };
export type { BrandConfig } from "./brand.config";

export const siteConfig = {
  name: brandConfig.name,
  description: brandConfig.description,
  url: "https://example.com",
};
