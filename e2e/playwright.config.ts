import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for Community Hub web admin
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30 * 1000,
  expect: { timeout: 5000 },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Run before all tests
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'cd ../web-admin && npm run dev',
        url: process.env.BASE_URL || 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 60 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
