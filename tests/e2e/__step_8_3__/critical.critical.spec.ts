import { expect, test } from "@playwright/test";

test("@critical storefront and authenticated admin shell load without runtime errors", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/shop");
  await expect(page.locator("body")).toBeVisible();
  await expect(page).toHaveURL(/\/shop/);

  const adminPage = await page.context().newPage();
  adminPage.on("pageerror", (error) => runtimeErrors.push(error.message));
  await adminPage.goto("/admin/overview");
  await expect(adminPage.locator("body")).toBeVisible();
  await expect(adminPage).toHaveURL(/\/admin\/overview/);
  expect(runtimeErrors).toEqual([]);
});
