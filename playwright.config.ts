import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Avoid 20+ concurrent cold Turbopack page compilations on GitHub runners.
  // The game is static-exported in production, but E2E runs a local dev server.
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: {
    ...devices['Desktop Chrome'],
    // CI uses the trusted preinstalled Chrome to avoid flaky CDN downloads.
    ...(process.env.PLAYWRIGHT_USE_SYSTEM_CHROME === '1' ? { channel: 'chrome' as const } : {}),
  } }],
  webServer: [
    {
      command: 'npm run dev',
      url: baseURL,
      cwd: import.meta.dirname,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { NEXT_TELEMETRY_DISABLED: '1' },
    },
    {
      command: 'npm --prefix v2 run dev',
      url: 'http://127.0.0.1:3901/',
      cwd: import.meta.dirname,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
