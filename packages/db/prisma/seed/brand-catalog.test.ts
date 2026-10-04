import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { assertBrandSeedTarget } from "./brand-catalog";
import { foodshopProducts } from "./data/brands/foodshop";
const env = {
  BRAND: "foodshop",
  DATABASE_URL: "postgresql://localhost:5432/ecommerce",
  NODE_ENV: "development",
};
describe("brand demo catalog safeguards", () => {
  test("DATABASE_URL identifies the local FoodShop target without an extra selector", () => {
    expect(assertBrandSeedTarget(env).target).toBe("localhost:5432/ecommerce");
    expect(assertBrandSeedTarget({ ...env, DATABASE_URL: "postgresql://127.0.0.1:5432/foodshop_dev" }).target).toBe("127.0.0.1:5432/foodshop_dev");
    for (const override of [
      { DATABASE_URL: "postgresql://remote.test/ecommerce" },
      { NODE_ENV: "production" },
      { E2E_MODE: "true" },
      { DATABASE_URL: "" },
      { DATABASE_URL: "postgresql://localhost/" },
      { DATABASE_URL: "https://localhost/ecommerce" },
      { BRAND: "constructor" },
      { BRAND: "bestsky" },
      {
        DATABASE_URL: "postgresql://localhost/production",
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
