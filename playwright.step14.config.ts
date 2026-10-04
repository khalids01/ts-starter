import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base, workers: 1, retries: 0, webServer: undefined,
  use: { ...base.use, baseURL: 'http://localhost:3001' },
  outputDir: 'tests/artifacts/step14/test-results',
  reporter: [['list'], ['json', { outputFile: 'tests/artifacts/step14/results.json' }]],
  projects: base.projects!.filter(p => p.name === 'chromium').map(p => ({ ...p, dependencies: [], testMatch: /v3-simulator(?:-recovery)?\.spec\.ts/ })),
});
