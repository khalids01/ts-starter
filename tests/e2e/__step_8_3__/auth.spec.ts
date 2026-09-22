import { expect, request, test } from "@playwright/test";
import { e2eRuntimeConfig } from "../../../packages/config/src/e2e.config";
import { TEST_USERS } from "../../users-config";

test("invalid password responses do not reveal whether an account exists", async () => {
  const anonymous = await request.newContext({ baseURL: e2eRuntimeConfig.serverUrl });
  const known = await anonymous.post("/api/auth/sign-in/email", {
    data: { email: TEST_USERS.user.email, password: "DefinitelyWrong!2026" },
  });
  const unknown = await anonymous.post("/api/auth/sign-in/email", {
    data: { email: "missing@northstar.example.test", password: "DefinitelyWrong!2026" },
  });
  expect(known.status()).toBe(unknown.status());
  expect(known.status()).toBe(401);
  const bodies = [await known.text(), await unknown.text()];
  for (const body of bodies) {
    expect(body.toLowerCase()).not.toContain("user not found");
    expect(body.toLowerCase()).not.toContain("account does not exist");
  }
  await anonymous.dispose();
});

test("logout revokes the active browser session", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: e2eRuntimeConfig.webUrl,
    storageState: TEST_USERS.user.storageStatePath,
  });
  const page = await context.newPage();
  expect((await page.request.get(`${e2eRuntimeConfig.serverUrl}/session/context`)).ok()).toBeTruthy();
  const response = await page.request.post(`${e2eRuntimeConfig.serverUrl}/api/auth/sign-out`);
  expect(response.ok()).toBeTruthy();
  const loggedOutSession = await page.request.get(`${e2eRuntimeConfig.serverUrl}/session/context`);
  expect(loggedOutSession.ok()).toBeTruthy();
  expect((await loggedOutSession.json() as { user: unknown }).user).toBeNull();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await context.close();
});

test("missing or invalid sessions cannot access protected admin routes", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: e2eRuntimeConfig.webUrl });
  await context.addCookies([{
    name: "better-auth.session_token",
    value: "expired-e2e-session",
    domain: "localhost",
    path: "/",
    expires: Math.floor(Date.now() / 1000) - 60,
  }]);
  const page = await context.newPage();
  await page.goto("/admin/products");
  await expect(page).not.toHaveURL(/\/admin\/products$/);
  const mutation = await page.request.post(`${e2eRuntimeConfig.serverUrl}/admin/products`, {
    data: { categoryId: "forbidden", name: "Forbidden product" },
  });
  expect([401, 403]).toContain(mutation.status());
  await context.close();
});
