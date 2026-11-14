import { test, expect } from '@playwright/test';

// Every script request is aborted (dev entry or built bundle) so the class on
// <html> can only come from the inline script in index.html: first paint.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'script' ? route.abort() : route.continue(),
  );
});

test.describe('theme first paint', () => {
  test.use({ colorScheme: 'light' });

  test('empty storage and OS light paints dark', async ({ page }) => {
    await page.goto('/');
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);
  });

  test('stored light paints light', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(false);
  });
});
