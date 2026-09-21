import { defineConfig, devices } from "@playwright/test";
import { TEST_USERS } from "./tests/users-config";

const baseURL = process.env.E2E_WEB_URL ?? "http://localhost:3001";
const authState = (key: keyof typeof TEST_USERS) => TEST_USERS[key].storageStatePath;
const managedWebServer = process.env.E2E_MANAGED_SERVER === "true"
  ? {
      command: "bun run build && bun start",
      url: `${baseURL}/signup`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe" as const,
      stderr: "pipe" as const,
      gracefulShutdown: {
        signal: "SIGTERM" as const,
        timeout: 5_000,
      },
    }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/artifacts/test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/artifacts/playwright-report", open: "never" }],
    ["json", { outputFile: "tests/artifacts/playwright-report/results.json" }],
  ],
  webServer: managedWebServer,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      workers: 1,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testMatch: /__step_8_3__\/.*\.spec\.ts/,
      testIgnore: [/\.critical\.spec\.ts/, /responsive\.spec\.ts/, /persona\.spec\.ts/],
      use: { ...devices["Desktop Chrome"], storageState: authState("owner") },
    },
    {
      name: "firefox",
      dependencies: ["setup"],
      testMatch: /.*\.critical\.spec\.ts/,
      use: { ...devices["Desktop Firefox"], storageState: authState("owner") },
    },
    {
      name: "webkit",
      dependencies: ["setup"],
      testMatch: /.*\.critical\.spec\.ts/,
      use: { ...devices["Desktop Safari"], storageState: authState("owner") },
    },
    {
      name: "mobile",
      dependencies: ["setup"],
      testMatch: /__step_8_3__\/responsive\.spec\.ts/,
      use: { ...devices["iPhone 13"], storageState: authState("owner") },
    },
    {
      name: "tablet",
      dependencies: ["setup"],
      testMatch: /__step_8_3__\/responsive\.spec\.ts/,
      use: { ...devices["iPad (gen 7)"], storageState: authState("owner") },
    },
    ...(["owner", "admin", "commerceManager", "commerceViewer", "user"] as const).map(
      (key) => ({
        name: `persona-${key}`,
        dependencies: ["setup"],
        testMatch: /__step_8_3__\/persona\.spec\.ts/,
        use: { ...devices["Desktop Chrome"], storageState: authState(key) },
      }),
    ),
  ],
});
