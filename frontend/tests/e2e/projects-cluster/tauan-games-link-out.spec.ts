/**
 * E2E stubs — tauan-games external link-out safety attributes
 *
 * AC-PC-12: GameCard anchors have target=_blank + rel="noopener noreferrer"; no iframe.
 *
 * Tests:
 *   PC-E2E-25: play links have target=_blank and rel containing "noopener noreferrer"
 *   PC-E2E-26: no iframe element present anywhere on /projetos/tauan-games
 *
 * NOTE: These tests do NOT navigate to the external playUrl (GitHub Pages).
 * External link availability is deferred to portfolio-external-link-monitor-v1.
 * We only assert the anchor attributes — no HTTP request to github.io is made.
 *
 * Activated in: T-PC-C-08
 * Implementation contract: C-08 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('tauan-games link-out safety', () => {
  test.skip('PC-E2E-25: game play links have target=_blank and rel=noopener noreferrer', async ({ page }) => {
    // Given: /projetos/tauan-games loaded
    await page.goto(ROUTES.tauanGames);
    await page.waitForLoadState('networkidle');

    // Then: each play link has correct target and rel attributes
    // Links point to https://marcoaureliomenezes.github.io/tauan-games/...
    const playLinks = page.locator('a[href*="tauan-games"]');
    const count = await playLinks.count();

    // Must have at least 2 (one per game)
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const link = playLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test.skip('PC-E2E-26: no iframe element present on tauan-games detail page', async ({ page }) => {
    // Given: /projetos/tauan-games loaded
    await page.goto(ROUTES.tauanGames);
    await page.waitForLoadState('networkidle');

    // Then: no iframe in DOM (AC-PC-12 non-goal: no embedded game)
    const iframes = page.locator('iframe');
    await expect(iframes).toHaveCount(0);
  });
});
