import { expect, test } from "@playwright/test";

test("@critical storefront and authenticated admin shell load without runtime errors", async ({ page }) => {
  test.setTimeout(90_000);

  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toBeVisible();
  await expect(page).toHaveURL(/\/shop/);

  const adminPage = await page.context().newPage();
  adminPage.on("pageerror", (error) => runtimeErrors.push(error.message));
  await adminPage.goto("/admin/overview", { waitUntil: "domcontentloaded" });
  await expect(adminPage.locator("body")).toBeVisible();
  await expect(adminPage).toHaveURL(/\/admin\/overview/);
  expect(runtimeErrors).toEqual([]);
});
