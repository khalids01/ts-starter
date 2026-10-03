import { expect, test } from "@playwright/test";

test("saved products and tracking share the public layout at narrow and wide viewports", async ({
  context,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  for (const viewport of [
    { width: 390, height: 664 },
    { width: 810, height: 1080 },
    { width: 1440, height: 900 },
  ]) {
    for (const [route, title] of [
      ["/saved", "Products you saved"],
      ["/track-order", "Check your delivery status"],
    ] as const) {
      const page = await context.newPage();
      try {
        await page.setViewportSize(viewport);
        page.on("pageerror", (error) => errors.push(error.message));
        const sessionReady = page.waitForResponse(
          (response) =>
            response.url().includes("/api/auth/get-session") &&
            response.status() === 200,
        );
        await page.goto(route, { waitUntil: "networkidle" });
        await (await sessionReady).finished();
        await expect(
          page.getByRole("heading", { name: title, exact: true }),
        ).toBeVisible();
        await expect(page.getByRole("contentinfo")).toBeVisible();
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          ),
        ).toBeLessThanOrEqual(1);
      } finally {
        await page.close();
      }
    }
  }
  expect(errors).toEqual([]);
});
