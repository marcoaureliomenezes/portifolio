/**
 * E2E-15 — Deep link to /projetos/dadaia-workspace renders correctly.
 *           Validates that the SPA client-side routing handles direct navigation
 *           to a sub-route (simulates CloudFront SPA fallback behaviour locally).
 * T-QA-10
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Deep link / SPA fallback', () => {
  test('E2E-15: navegação direta para /projetos/dadaia-workspace renderiza a página', async ({ page }) => {
    // Navigate directly to the route — no prior navigation
    await page.goto(ROUTES.dadaiaWorkspace);

    // Page must load (200 — the SPA shell always returns 200 from the dev server)
    // and render an h1 (not a blank screen or hard error)
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Must NOT show a white-screen crash (body should have content)
    await expect(page.locator('body')).not.toBeEmpty();

    // Title attribute on the page should be set (basic SEO)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
