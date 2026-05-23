/**
 * E2E-08 — 404 page renders for unknown routes.
 * T-QA-07
 *
 * The message text is locale-driven (notFoundMessage in content JSONs).
 * Default locale resolves PT after the locale pin in playwright.config.ts,
 * so we accept any of the three known translations.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

const NOT_FOUND_MESSAGE = /Página não encontrada|Page not found|Seite nicht gefunden/;

test.describe('404 / NotFound page', () => {
  test('E2E-08: rota inexistente renderiza a página NotFound', async ({ page }) => {
    await page.goto(ROUTES.notFound);

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('404');

    await expect(page.getByText(NOT_FOUND_MESSAGE)).toBeVisible();

    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });
});
