import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import path from "path";

loadEnvConfig(path.join(__dirname));

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3099";
const e2ePort = new URL(baseURL).port || "3099";

export default defineConfig({
  testDir: path.join(__dirname, "e2e"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 120_000,
  expect: { timeout: 15_000 },
  globalSetup: path.join(__dirname, "e2e/global-setup.ts"),
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `npm run start -- -p ${e2ePort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          NODE_ENV: "production",
        } as Record<string, string>,
      },
});
