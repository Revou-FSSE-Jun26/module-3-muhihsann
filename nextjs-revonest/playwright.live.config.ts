import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for running the E2E suite against the LIVE deployment.
 *
 *   npm run test:e2e:live
 *
 * Unlike playwright.config.ts (local app + mock API), this hits the real
 * Vercel site and the real Flask API, so it:
 *  - starts no local servers,
 *  - runs tests one at a time (they share real data),
 *  - allows extra time, because the Render backend sleeps when idle,
 *  - wakes the backend up once before any test runs (global-setup.ts).
 *
 * Tests clean up the products, categories, and orders they create.
 * Registration necessarily leaves one test account per run.
 *
 * Override the targets with LIVE_BASE_URL / LIVE_API_URL if needed.
 */
const LIVE_BASE_URL = process.env.LIVE_BASE_URL ?? "https://revonest.vercel.app";

export default defineConfig({
  testDir: "./e2e-live",
  globalSetup: "./e2e-live/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  // One retry absorbs a rare network blip on the free-tier backend.
  retries: 1,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  outputDir: "./test-results-live",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report-live", open: "never" }],
  ],
  use: {
    baseURL: LIVE_BASE_URL,
    navigationTimeout: 90_000,
    actionTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      // Shown as a badge on every test in the HTML report.
      name: new URL(LIVE_BASE_URL).host,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
