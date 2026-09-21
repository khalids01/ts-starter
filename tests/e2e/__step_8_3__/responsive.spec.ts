import { expect, test } from "@playwright/test";

for (const route of ["/admin/catalog", "/admin/products", "/admin/inventory", "/admin/orders", "/admin/customers"]) {
  test(`${route} keeps primary content within the viewport`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
