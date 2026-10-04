import { describe, expect, test } from "bun:test";
import {
  assertBuildBrand,
  brands,
  resolveBrand,
  resolveBrandKey,
} from "./brand.config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

describe("deployment branding", () => {
  test("each key selects its niche and bounded seed source", () => {
    for (const key of ["foodshop", "bestsky", "airshop"] as const) {
      const config = resolveBrand(key);
      expect(config.key).toBe(key);
      expect(config.seed.datasetKey).toBe(key);
      expect(config.seed.dataPath).toBe(
        `packages/db/prisma/seed/data/brands/${key}`,
      );
      expect(config.seed.productImages).toHaveLength(3);
      expect(new Set(config.seed.productImages).size).toBe(3);
    }
    expect(resolveBrand("airshop").niche).toBe("fashion");
    expect(resolveBrand("foodshop").niche).toBe("food");
    expect(resolveBrand("bestsky").niche).toBe("electronics");
  });
  test("bad/missing keys cannot silently select another merchant", () => {
    for (const value of [
      undefined,
      "",
      "unknown",
      "FOODSHOP",
      "__proto__",
      "constructor",
      "../airshop",
    ])
      expect(() => resolveBrandKey(value)).toThrow("BRAND must");
    expect(resolveBrandKey(" airshop ")).toBe("airshop");
  });
  test("build identity refuses mismatched runtime and malformed manifests", () => {
    expect(assertBuildBrand("airshop", "airshop")).toBe("airshop");
    expect(() => assertBuildBrand("foodshop", "airshop")).toThrow("rebuild");
    expect(() => assertBuildBrand(undefined, "airshop")).toThrow("rebuild");
    expect(() => assertBuildBrand("airshop", undefined)).toThrow("BRAND must");
  });
  test("public brand entries do not fabricate unconfirmed facts", () => {
    expect(brands.foodshop.publicOrigin).toBeUndefined();
    for (const config of Object.values(brands))
      expect(config.contact).toEqual({});
    expect(brands.airshop.homepage.heroImage).toBe(
      "/ecommerce/images/shopping-editorial.webp",
    );
  });
  test("configured local asset references exist", () => {
    for (const config of Object.values(brands))
      for (const url of [
        config.iconUrl,
        config.homepage.heroImage,
        config.seo.ogImage,
        ...config.seed.productImages,
      ])
        expect(
          existsSync(
            resolve(
              import.meta.dirname,
              "../../../apps/web/public",
              url.slice(1),
            ),
          ),
        ).toBe(true);
  });
});
