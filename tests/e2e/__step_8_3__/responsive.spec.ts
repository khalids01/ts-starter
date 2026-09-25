import { expect, test } from "@playwright/test";

for (const route of [
  "/admin/catalog",
  "/admin/products",
  "/admin/inventory",
  "/admin/shipping",
  "/admin/discounts",
  "/admin/store-settings",
  "/admin/orders",
  "/admin/customers",
  "/admin/couriers",
  "/admin/couriers/connections",
  "/admin/couriers/delivery-options",
  "/admin/couriers/assignment-rules",
  "/admin/couriers/shipments",
  "/admin/couriers/returns",
  "/admin/couriers/cod-payouts",
]) {
  test(`${route} keeps primary content within the viewport`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
