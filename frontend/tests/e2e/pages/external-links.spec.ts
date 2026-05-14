/**
 * E2E-09 — External links audit: all https:// links have target=_blank + rel=noopener,
 *           and none point to bare LinkedIn/GitHub root domains.
 * T-QA-08
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

const PAGES_TO_AUDIT = [
  ROUTES.home,
  ROUTES.dadaiaWorkspace,
  ROUTES.tauanGames,
  ROUTES.portifolio,
];

// Root-domain hrefs that are NEVER acceptable (must include a real path/profile)
const FORBIDDEN_EXACT_HREFS = [
  'https://linkedin.com',
  'https://www.linkedin.com',
  'https://github.com',
  'https://www.github.com',
];

for (const route of PAGES_TO_AUDIT) {
  test.describe(`External links audit — ${route}`, () => {
    test(`E2E-09: nenhum link externo raiz (linkedin/github) e todos com target=_blank rel=noopener em ${route}`, async ({ page }) => {
      await page.goto(route);

      const externalLinks = page.locator('a[href^="https://"]');
      const count = await externalLinks.count();

      // If no external links, test passes (nothing to audit)
      if (count === 0) return;

      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const href = await link.getAttribute('href');

        // href must not be a bare root domain (no path or with only trailing slash)
        for (const forbidden of FORBIDDEN_EXACT_HREFS) {
          expect(href, `Found forbidden bare URL: ${href}`).not.toBe(forbidden);
          expect(href, `Found forbidden bare URL: ${href}`).not.toBe(forbidden + '/');
        }

        // Must have target=_blank
        await expect(link, `Link ${href} missing target=_blank`).toHaveAttribute('target', '_blank');

        // rel must contain noopener
        const rel = await link.getAttribute('rel');
        expect(rel, `Link ${href} missing noopener in rel="${rel}"`).toContain('noopener');
      }
    });
  });
}
