import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright starts the Next.js production server and drives Chromium.
 *
 * Browser resolution, in order:
 *   1. CHROMIUM_PATH, if set (CI points this at the browser it installed).
 *   2. the sandbox's pre-installed Chromium, when that path exists.
 *   3. otherwise `undefined` → Playwright's own managed browser, so a local
 *      `npx playwright install && npx playwright test` just works.
 */
const PORT = 3100;

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath =
  process.env.CHROMIUM_PATH || (existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined);

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
        launchOptions: { executablePath },
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
