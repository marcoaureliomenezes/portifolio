/**
 * E2E-05 — Aba dadaia-workspace abre + tem conteúdo.
 * E2E-06 — Aba tauan-games abre + tem conteúdo.
 * E2E-07 — Aba arquitetura (portifolio) abre + tem conteúdo.
 * T-QA-06
 *
 * Note: these tests assume T-CONTENT-02/03/04 have delivered concrete page
 * components wired in App.tsx. Until then they will fail — that is expected
 * and intentional (tests define acceptance criteria, not current state).
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Project tab pages', () => {
  test('E2E-05: aba dadaia-workspace abre com h1 visível e sem 404', async ({ page }) => {
    await page.goto(ROUTES.dadaiaWorkspace);

    // h1 must be visible and must NOT contain "404"
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // External links in the page must have target=_blank and rel containing noopener
    const externalLinks = page.locator('a[href^="https://"]');
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('E2E-06: aba tauan-games abre com h1 visível e sem 404', async ({ page }) => {
    await page.goto(ROUTES.tauanGames);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // External links must have safe attributes
    const externalLinks = page.locator('a[href^="https://"]');
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('E2E-07: aba portifolio/arquitetura abre com h1 visível e sem 404', async ({ page }) => {
    await page.goto(ROUTES.portifolio);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // External links must have safe attributes
    const externalLinks = page.locator('a[href^="https://"]');
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });
});
