import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright starts the Next.js production server and drives the real
 * Chromium that ships pre-installed in this environment.
 */
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // The npm @playwright/test version may not match the browser build
        // pre-installed in this environment, so point at it explicitly rather
        // than downloading. Override with CHROMIUM_PATH when running elsewhere.
        launchOptions: {
          executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
        },
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/optimize`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
