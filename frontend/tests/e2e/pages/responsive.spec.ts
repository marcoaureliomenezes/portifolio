/**
 * E2E-10 — Responsividade mobile (375×667): home sem scroll horizontal.
 * E2E-11 — Responsividade desktop (1280×800): home sem scroll horizontal.
 * T-QA-09
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Responsividade', () => {
  test('E2E-10: viewport 375×667 (mobile) — home sem overflow horizontal', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    await page.goto(ROUTES.home);

    // Wait for the page to fully render
    await page.waitForLoadState('networkidle');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow, 'Page has horizontal overflow at 375×667').toBe(false);

    await context.close();
  });

  test('E2E-11: viewport 1280×800 (desktop) — home sem overflow horizontal', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    await page.goto(ROUTES.home);

    await page.waitForLoadState('networkidle');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow, 'Page has horizontal overflow at 1280×800').toBe(false);

    await context.close();
  });
});
