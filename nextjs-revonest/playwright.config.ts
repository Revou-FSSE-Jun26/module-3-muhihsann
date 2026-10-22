import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the RevOnest E2E suite.
 *
 * Two local servers are started:
 *  1. e2e/mock-server.mjs  — an in-memory mock of the Flask API (port 5055)
 *  2. the Next.js dev server, with NEXT_PUBLIC_API_BASE_URL pointed at the mock
 *
 * Running the app against the mock makes BOTH server-side (SSR) and
 * client-side fetches deterministic, so the suite is offline, repeatable, and
 * never touches real data. The mock resets its state on every run.
 */
const MOCK_PORT = 5055;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `node e2e/mock-server.mjs`,
      url: `http://localhost:${MOCK_PORT}/products`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { MOCK_PORT: String(MOCK_PORT) },
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_BASE_URL: `http://localhost:${MOCK_PORT}`,
      },
    },
  ],
});
