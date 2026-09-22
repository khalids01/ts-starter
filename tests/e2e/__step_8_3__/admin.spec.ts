import { expect, test } from "@playwright/test";

const routes = [
  "/admin/catalog",
  "/admin/products",
  "/admin/inventory",
  "/admin/shipping",
  "/admin/discounts",
  "/admin/store-settings",
  "/admin/customers",
  "/admin/orders",
];

test("owner can load every ecommerce admin route without console or request failures", async ({ page }) => {
  test.setTimeout(90_000);

  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 500) failures.push(`${response.status()} ${response.url()}`);
  });

  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}$`));
      await expect(page.locator("body")).toBeVisible();
    });
  }

  expect(failures).toEqual([]);
});
