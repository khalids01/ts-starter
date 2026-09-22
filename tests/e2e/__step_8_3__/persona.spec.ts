import { expect, test } from "@playwright/test";
import { e2eRuntimeConfig } from "../../../packages/config/src/e2e.config";
import { TEST_USERS, type TestUserKey } from "../../users-config";

const expectedPermissions: Partial<Record<TestUserKey, string[]>> = {
  commerceManager: ["admin.access", "admin.products.manage", "admin.orders.refund"],
  commerceViewer: ["admin.access", "admin.products.read", "admin.orders.read"],
  user: [],
};

test("persona session and server-side mutation denial match its role", async ({ page }, testInfo) => {
  const key = testInfo.project.name.replace("persona-", "") as TestUserKey;
  const expected = TEST_USERS[key];
  expect(expected).toBeDefined();

  const sessionResponse = await page.request.get(`${e2eRuntimeConfig.serverUrl}/session/context`);
  expect(sessionResponse.ok()).toBeTruthy();
  const session = await sessionResponse.json() as {
    user?: { email?: string };
    primaryRoleSlug?: string;
    permissions?: string[];
  };
  expect(session.user?.email).toBe(expected.email);
  expect(session.primaryRoleSlug).toBe(expected.roleSlug);
  for (const permission of expectedPermissions[key] ?? []) {
    expect(session.permissions ?? []).toContain(permission);
  }

  if (key === "commerceViewer" || key === "user") {
    const mutation = await page.request.post(`${e2eRuntimeConfig.serverUrl}/admin/products`, {
      data: { categoryId: "forbidden", name: "Forbidden product" },
    });
    expect([401, 403]).toContain(mutation.status());
  }

  if (key === "commerceManager") {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/products$/);
    await page.goto("/admin/roles");
    await expect(page).not.toHaveURL(/\/admin\/roles$/);
  }

  if (key === "commerceViewer") {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByRole("link", { name: /new product/i })).toHaveCount(0);
  }

  if (key === "admin") {
    await page.goto("/admin/roles");
    await expect(page).not.toHaveURL(/\/admin\/roles$/);
  }

  if (key === "owner") {
    await page.goto("/admin/roles");
    await expect(page).toHaveURL(/\/admin\/roles$/);
  }

  if (key === "user") {
    await page.goto("/admin/products");
    await expect(page).not.toHaveURL(/\/admin\/products$/);
  }
});
