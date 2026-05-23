import { defineConfig, devices } from '@playwright/test';

// Smoke gate: 9 files that verify the site loads and core UX works.
// Used in CI on every push. Full suite runs in ci-weekly.yml.
const SMOKE_SPECS = [
  'tests/e2e/pages/health.spec.ts',
  'tests/e2e/pages/home.spec.ts',
  'tests/e2e/pages/not-found.spec.ts',
  'tests/e2e/pages/deep-link.spec.ts',
  'tests/e2e/pages/post-strict-flip-smoke.spec.ts',
  'tests/e2e/pages/project-tabs.spec.ts',
  'tests/e2e/pages/cv-download-routing.spec.ts',
  'tests/e2e/pages/layout.spec.ts',
  'tests/e2e/pages/responsive.spec.ts',
];

const isCI = !!process.env.CI;
const isSmoke = !!process.env.E2E_SMOKE;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: isSmoke ? SMOKE_SPECS : ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 4 : undefined,
  reporter: [['html'], ['list']],
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    // Pin locale so LanguageProvider deterministically picks PT as the default.
    locale: 'pt-BR',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // CI: Chromium only — personal portfolio, no browser-support SLA.
  // Local / weekly: full 5-browser matrix.
  projects: isCI ? [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ] : [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    // CI: dist/ is downloaded from the build artifact before Playwright runs —
    //     just start the preview server, no rebuild.
    // Local: start Vite dev server (or reuse if already running).
    command: isCI
      ? 'npm run preview -- --port 8080 --host'
      : 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
