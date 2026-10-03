import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
import { assertTestEnvironment } from "./tests/setup/assert-test-environment";

const target = assertTestEnvironment();
if (target.isRemote || process.env.STEAD_FAST_BASE_URL !== "http://localhost:3903") {
  throw new Error("Step 12 requires the isolated local test environment");
}

export default defineConfig({
  ...base,
  workers: 1,
  retries: 0,
  webServer: undefined,
  outputDir: "tests/artifacts/step12/test-results",
  reporter: [["list"], ["json", { outputFile: "tests/artifacts/step12/results.json" }]],
  projects: base.projects!.filter((project) => project.name === "chromium").map((project) => ({
    ...project,
    dependencies: [],
    testMatch: [/\/security\.spec\.ts$/, /v3-rbac\.spec\.ts$/, /v3-security\.spec\.ts$/],
  })),
});
