import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Boots the production build and drives the dashboard.
 * The backend need not be running — the UI degrades to its built-in sample
 * dataset, which keeps E2E fully self-contained and deterministic in CI.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Use the dev server so E2E is independent of the `output: standalone`
    // production bundle (which `next start` cannot serve directly).
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
