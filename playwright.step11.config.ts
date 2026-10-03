import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  workers: 1,
  retries: 0,
  webServer: undefined,
  outputDir: "tests/artifacts/step11/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/artifacts/step11/report", open: "never" }],
    ["json", { outputFile: "tests/artifacts/step11/results.json" }],
  ],
  projects: base.projects!.map((project) =>
    project.name === "chromium"
      ? {
          ...project,
          testIgnore: [
            /\.critical\.spec\.ts/,
            /responsive\.spec\.ts/,
            /persona\.spec\.ts/,
            /\/lifecycle\.spec\.ts$/,
            /\/auth\.spec\.ts$/,
            /\/security\.spec\.ts$/,
          ],
        }
      : ["firefox", "webkit"].includes(project.name!)
        ? {
            ...project,
            testMatch: [
              /.*\.critical\.spec\.ts/,
              /v3-lifecycle\.spec\.ts/,
              /v3-public\.spec\.ts/,
            ],
          }
        : project,
  ),
});
