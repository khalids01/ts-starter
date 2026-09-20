import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { provisionE2eUsers } from "../../setup/provision-users";
import { TEST_USERS, type TestUser } from "../../users-config";

const mailpitUrl = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:8025";
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
  await page.getByRole("button", { name: "Create account with password" }).click();
  await expect(page.getByText("Account created. Check your email to verify it.")).toBeVisible();
}

async function assertMailpitReceivedTestEmail(email: string) {
  const response = await fetch(`${mailpitUrl}/api/v1/messages`);
  expect(response.ok).toBeTruthy();
  const payload = (await response.json()) as { messages?: Array<{ To?: Array<{ Address?: string }> }> };
  expect(payload.messages?.some((message) => message.To?.some((recipient) => recipient.Address === email))).toBeTruthy();
}

test.describe.configure({ mode: "serial" });

test("@auth creates the public E2E identities through the real password signup UI", async ({ page }) => {
  for (const user of Object.values(TEST_USERS)) {
    await signup(page, user);
    await assertMailpitReceivedTestEmail(user.email);
  }
});

test("@auth rejects password login while the account remains unverified", async ({ page }) => {
  const user = TEST_USERS.owner;
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in with password" }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("status")).not.toContainText("Email verified");
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
    await loginPage.getByRole("button", { name: "Sign in with password" }).click();
    await expect(loginPage).toHaveURL(/\/dashboard/);

    const session = await loginPage.request.get("/session/context");
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
