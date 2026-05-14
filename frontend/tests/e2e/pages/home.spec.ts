/**
 * E2E-01 — Home page loads and Hero section is visible.
 * T-QA-05
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Home page', () => {
  test('E2E-01: home carrega e hero section é visível', async ({ page }) => {
    await page.goto(ROUTES.home);

    // Page responds with 200
    const response = await page.goto(ROUTES.home);
    expect(response?.status()).toBe(200);

    // Hero heading (resumeTitle) is visible — HeroSection renders inside Portfolio
    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();

    // Header is rendered
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // No JavaScript errors cause a blank page
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
