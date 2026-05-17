/**
 * E2E stubs — Meta project detail page (/projetos/portifolio)
 *
 * AC-PC-04: dynamic routing dispatches to MetaProjectTemplate
 * AC-PC-11: document.title set by useDocumentSeo
 * AC-PC-10: architecture diagram present
 *
 * Tests:
 *   PC-E2E-07: /projetos/portifolio renders Meta template with costs, decisions visible
 *   PC-E2E-23: document.title is project-specific SEO title
 *   PC-E2E-13: diagram picture with dark source present
 *
 * Activated in: T-PC-C-08
 * Implementation contract: C-04, C-06, C-13 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Detail page — portifolio (kind: meta)', () => {
  test.skip('PC-E2E-07: renders Meta template with h1, costs table, and decisions list', async ({ page }) => {
    // Given: user navigates to portifolio detail
    const response = await page.goto(ROUTES.portifolio);
    await page.waitForLoadState('networkidle');

    // Then: HTTP 200
    expect(response?.status()).toBe(200);

    // Then: h1 visible, not "404"
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // Then: costs table is visible (MetaProject.costs[])
    const costsTable = page.locator('[data-testid="costs-table"], table').first();
    await expect(costsTable).toBeVisible();

    // Then: decisions list visible (MetaProject.decisions[])
    const decisions = page.locator('[data-testid="decisions-list"], [data-testid="arch-decision"]').first();
    await expect(decisions).toBeVisible();

    // Then: stack section visible (MetaProject.stack[])
    const stack = page.locator('[data-testid="stack-section"], [data-testid="stack-row"]').first();
    await expect(stack).toBeVisible();
  });

  test.skip('PC-E2E-23: document.title is project-specific SEO title for portifolio', async ({ page }) => {
    // Given: user navigates to /projetos/portifolio
    await page.goto(ROUTES.portifolio);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: title non-empty and not generic
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
    expect(title.toLowerCase()).not.toBe('projetos');
  });

  test.skip('PC-E2E-13: diagram picture element present for portifolio', async ({ page }) => {
    // Given: /projetos/portifolio (has diagram field per content contract)
    await page.goto(ROUTES.portifolio);
    await page.waitForLoadState('networkidle');

    // Then: <picture> with dark-mode source
    const picture = page.locator('picture').first();
    await expect(picture).toBeVisible();

    const darkSource = picture.locator('source[media*="prefers-color-scheme: dark"]');
    await expect(darkSource).toHaveCount({ min: 1 });

    const img = picture.locator('img');
    const alt = await img.getAttribute('alt');
    expect((alt ?? '').trim().length).toBeGreaterThan(0);
  });

  test.skip('PC-E2E-12: costs table has proper table header elements', async ({ page }) => {
    // Given: /projetos/portifolio
    await page.goto(ROUTES.portifolio);
    await page.waitForLoadState('networkidle');

    // Then: costs table has <th> elements (accessibility requirement)
    const thCells = page.locator('[data-testid="costs-table"] th, table th');
    await expect(thCells).toHaveCount({ min: 1 });
  });
});
