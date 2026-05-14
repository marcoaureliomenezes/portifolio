/**
 * E2E-08 — 404 page renders for unknown routes.
 * T-QA-07
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('404 / NotFound page', () => {
  test('E2E-08: rota inexistente renderiza a página NotFound', async ({ page }) => {
    await page.goto(ROUTES.notFound);

    // NotFound renders an h1 with "404"
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('404');

    // The "Page not found" message is shown
    await expect(page.getByText('Page not found')).toBeVisible();

    // A link back to home is present
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });
});
