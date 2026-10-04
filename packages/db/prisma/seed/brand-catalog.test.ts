import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { assertBrandSeedTarget } from "./brand-catalog";
import { foodshopProducts } from "./data/brands/foodshop";
const env = {
  BRAND: "foodshop",
  DATABASE_URL: "postgresql://localhost:5432/ecommerce",
  BRAND_SEED_DATABASE: "ecommerce",
  NODE_ENV: "development",
};
describe("brand demo catalog safeguards", () => {
  test("only the explicitly acknowledged local FoodShop target is accepted", () => {
    expect(assertBrandSeedTarget(env).target).toBe("localhost:5432/ecommerce");
    for (const override of [
      { DATABASE_URL: "postgresql://remote.test/ecommerce" },
      { NODE_ENV: "production" },
      { E2E_MODE: "true" },
      { BRAND_SEED_DATABASE: "other" },
      { BRAND: "constructor" },
      { BRAND: "bestsky" },
      {
        DATABASE_URL: "postgresql://localhost/production",
        BRAND_SEED_DATABASE: "production",
      },
    ])
      expect(() => assertBrandSeedTarget({ ...env, ...override })).toThrow();
  });
  test("ten unique food products use existing imagery and never gadget warranties", () => {
    expect(foodshopProducts).toHaveLength(10);
    expect(new Set(foodshopProducts.map((product) => product.key)).size).toBe(
      10,
    );
    for (const product of foodshopProducts) {
      expect(["fresh_food", "packaged_food"]).toContain(product.kind);
      expect(
        existsSync(
          resolve(
            import.meta.dir,
            `../../../../apps/web/public/brands/foodshop/products/${product.image}.webp`,
          ),
        ),
      ).toBe(true);
      expect(Number(product.price)).toBeGreaterThan(0);
    }
  });
});
