/**
 * E2E stubs — Games project detail page (/projetos/tauan-games)
 *
 * AC-PC-04: dynamic routing dispatches to GamesProjectTemplate
 * AC-PC-07: corrected items — aero-fighters/Three.js, tauan-trex/Phaser, no babylon slug
 *
 * Tests:
 *   PC-E2E-08: /projetos/tauan-games renders 2 game cards with correct engine labels
 *   PC-E2E-09: "Babylon" text absent; aero-fighters-babylon slug absent
 *
 * Activated in: T-PC-C-08
 * Implementation contract: C-08, C-09 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Detail page — tauan-games (kind: games)', () => {
  test('PC-E2E-08: renders 2 game cards with correct engine labels', async ({ page }) => {
    // Given: user navigates to tauan-games detail
    const response = await page.goto(ROUTES.tauanGames);
    await page.waitForLoadState('networkidle');

    // Then: HTTP 200
    expect(response?.status()).toBe(200);

    // Then: h1 visible, not "404"
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // Then: exactly 2 game cards rendered (AC-PC-07: only aero-fighters and tauan-trex)
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(2);

    // Then: engine labels correct (AC-PC-07 corrective write)
    const pageText = await page.locator('body').innerText();
    expect(pageText).toContain('Three.js');
    expect(pageText).toContain('Phaser');
  });

  test('PC-E2E-09: "Babylon" engine text and aero-fighters-babylon slug absent from page', async ({ page }) => {
    // Given: /projetos/tauan-games
    await page.goto(ROUTES.tauanGames);
    await page.waitForLoadState('networkidle');

    // Then: no "Babylon" text visible anywhere on the page (AC-PC-07)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.toLowerCase()).not.toContain('babylon');

    // Then: no href contains "aero-fighters-babylon"
    const allLinks = page.locator('a[href*="aero-fighters-babylon"]');
    await expect(allLinks).toHaveCount(0);

    // Then: no hidden text contains "Babylon" or "JavaScript" as engine
    const bodyHtml = await page.content();
    expect(bodyHtml).not.toContain('aero-fighters-babylon');
    expect(bodyHtml).not.toMatch(/"engine":\s*"Babylon/);
    expect(bodyHtml).not.toMatch(/"engine":\s*"JavaScript"/);
  });
});
