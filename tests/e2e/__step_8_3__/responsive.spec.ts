import { expect, test } from "@playwright/test";

for (const route of [
  "/shop",
  "/cart",
  "/checkout",
  "/track-order",
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
  test(`${route} keeps primary content within the viewport`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
    await expect(
      page.getByText("Something went wrong!", { exact: true }),
    ).toHaveCount(0);
  });
}
