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
  "/admin/couriers",
  "/admin/couriers/connections",
  "/admin/couriers/delivery-options",
  "/admin/couriers/assignment-rules",
  "/admin/couriers/shipments",
  "/admin/couriers/returns",
  "/admin/couriers/cod-payouts",
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

test("grouped admin navigation works when expanded and collapsed", async ({ page }) => {
  await page.goto("/admin/overview");

  await page.getByRole("button", { name: "Shop" }).click();
  await page.getByRole("link", { name: "Products", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);

  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await page.getByRole("button", { name: "Couriers" }).click();
  await page.getByRole("menuitem", { name: "Connections" }).click();
  await expect(page).toHaveURL(/\/admin\/couriers\/connections$/);
});

test("courier configuration and shipping methods switch between current and archived views", async ({ page }) => {
  for (const route of [
    "/admin/shipping",
    "/admin/couriers/connections",
    "/admin/couriers/delivery-options",
    "/admin/couriers/assignment-rules",
  ]) {
    await test.step(route, async () => {
      await page.goto(route);
      await expect(page.getByRole("tab", { name: "Current" })).toHaveAttribute("data-active");
      await page.getByRole("tab", { name: "Archived" }).click();
      await expect(page.getByRole("tab", { name: "Archived" })).toHaveAttribute("data-active");
    });
  }
});
