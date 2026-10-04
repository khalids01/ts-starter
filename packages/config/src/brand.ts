import { resolveBrand } from "./brand.config";
export * from "./brand.config";
// Vite replaces only this public selector in browser/SSR builds. Bun resolves it at runtime in the API.
export const brandConfig = resolveBrand(process.env.BRAND);
export const brandKey = brandConfig.key;
