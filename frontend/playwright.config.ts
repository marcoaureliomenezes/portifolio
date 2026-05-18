import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['list']],
  // LanguageProvider returns null until the initial pt.json dynamic import
  // resolves, so the first paint can lag in CI workers running Vite cold.
  // 5s default expect timeout was tripping toContainText/getByRole in beforeEach.
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    // Pin browser locale to pt-BR so LanguageProvider.resolveInitialLanguage()
    // deterministically picks PT as the default (Playwright Chromium ships with
    // navigator.language=en-US, which loaded en.json and broke specs that
    // assumed PT default — e.g. ai-emphasis-content's heroTagline mismatch).
    // Specs that test language switching keep working: switchLocale calls are
    // explicit and idempotent.
    locale: 'pt-BR',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    // CI uses the production build (fast, deterministic). Local dev reuses the
    // running Vite dev server (or starts one) for HMR convenience.
    command: process.env.CI
      ? 'npm run build && npm run preview -- --port 8080 --host'
      : 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
