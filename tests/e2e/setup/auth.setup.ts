import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { e2eRuntimeConfig } from "../../../packages/config/src/e2e.config";
import { provisionE2eUsers, resetE2eUsers } from "../../setup/provision-users";
import { TEST_USERS, type TestUser } from "../../users-config";
const managerPermissions = [
  "admin.access", "admin.catalog.read", "admin.catalog.manage", "admin.products.read",
  "admin.products.manage", "admin.inventory.read", "admin.inventory.manage", "admin.orders.read",
  "admin.orders.manage", "admin.orders.fulfill", "admin.orders.cancel", "admin.orders.refund",
  "admin.shipping.read", "admin.shipping.manage", "admin.discounts.read", "admin.discounts.manage",
  "admin.store_settings.read", "admin.store_settings.manage", "admin.customers.read",
  "admin.customers.manage", "admin.images.read", "admin.images.manage",
].sort();
const viewerPermissions = [
  "admin.access", "admin.catalog.read", "admin.products.read", "admin.inventory.read",
  "admin.orders.read", "admin.shipping.read", "admin.discounts.read", "admin.store_settings.read",
  "admin.customers.read", "admin.images.read",
].sort();

async function signup(page: import("@playwright/test").Page, user: TestUser) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password").fill(user.password);
  const signupResponse = page.waitForResponse((response) =>
    response.url().includes("/api/auth/sign-up/email") && response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Create account with password" }).click();
  const response = await signupResponse;
  const responseBody = await response.text();
  const responseCode = (() => {
    try {
      return (JSON.parse(responseBody) as { code?: string }).code;
    } catch {
      return undefined;
    }
  })();
  const alreadyExists = response.status() === 422 && responseCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";
  expect(
    response.ok() || alreadyExists,
    `Password signup failed (${response.status()}): ${responseBody}`,
  ).toBeTruthy();
  if (response.ok()) {
    await expect(page.getByText("Account created. Check your email to verify it.")).toBeVisible();
  }
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("@auth creates the public E2E identities through the real password signup UI", async ({ page }) => {
  await resetE2eUsers();
  for (const user of Object.values(TEST_USERS)) {
    await signup(page, user);
  }
});

test("@auth provisions verified roles, signs in, and saves each persona state", async ({ browser, page }) => {
  await provisionE2eUsers();
  await mkdir("tests/e2e/.auth", { recursive: true });

  for (const user of Object.values(TEST_USERS)) {
    const context = await browser.newContext();
    const loginPage = await context.newPage();
    await loginPage.goto("/login");
    await loginPage.getByLabel("Email").fill(user.email);
    await loginPage.getByLabel("Password").fill(user.password);
    const loginResponse = loginPage.waitForResponse((response) =>
      response.url().includes("/api/auth/sign-in/email") && response.request().method() === "POST"
    );
    await loginPage.getByRole("button", { name: "Sign in with password" }).click();
    const response = await loginResponse;
    expect(
      response.ok(),
      `Password login failed for ${user.key} with HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(loginPage).toHaveURL(/\/dashboard/, { timeout: 20_000 });

    const session = await loginPage.request.get(`${e2eRuntimeConfig.serverUrl}/session/context`);
    expect(session.ok()).toBeTruthy();
    const body = (await session.json()) as {
      user?: { email?: string };
      primaryRoleSlug?: string;
      permissions?: string[];
    };
    expect(body.user?.email).toBe(user.email);
    expect(body.primaryRoleSlug).toBe(user.roleSlug);
    if (user.key === "commerceManager") {
      expect([...(body.permissions ?? [])].sort()).toEqual(managerPermissions);
    }
    if (user.key === "commerceViewer") {
      expect([...(body.permissions ?? [])].sort()).toEqual(viewerPermissions);
    }
    if (user.key === "user") {
      expect(body.permissions ?? []).not.toContain("admin.access");
    }
    await context.storageState({ path: user.storageStatePath });
    await context.close();
  }
  await page.close();
});
