import { test, expect } from '@playwright/test';

// Smoke stub — validates Playwright config is wired correctly.
// Not a real E2E scenario (does not verify app behaviour).
// Real E2E scenarios start at T-QA-05.
test('home page responds with 200', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});
