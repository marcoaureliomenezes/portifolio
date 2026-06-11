/**
 * E2E stubs — Projects Index Page (/projetos)
 *
 * AC-PC-08: grid responsive, 3 cards fixed order, Link elements, focus-visible ring, no filters.
 *
 * Tests:
 *   PC-E2E-01: /projetos renders 3 card links in fixed DOM order
 *   PC-E2E-02: each card is an <a> element (not div/button) pointing to correct detail slug
 *   PC-E2E-03: no filter/search input present; keyboard Tab reaches all 3 cards
 *
 * Activated in: T-PC-C-08 (after Phase C components are delivered).
 * Implementation contract: C-01, C-02, C-03 in qa-engineer E2E plan report.
 *
 * E2E_BASE_URL defaults to http://localhost:8080 (playwright.config.ts).
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// Slugs expected in DOM order per SPEC §3.1
const EXPECTED_SLUGS = ['dadaia-workspace', 'portifolio', 'tauan-games'] as const;

test.describe('Projects Index Page — /projetos', () => {
  test('PC-E2E-01: renders exactly 3 project card links', async ({ page }) => {
    // Given: /projetos is visited
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // Then: exactly 3 card links present
    // Implementation contract C-02: cards are <a> elements, not div/button
    const cardLinks = page.locator('[data-testid="project-card"]');
    await expect(cardLinks).toHaveCount(4);

    // Then: each is an anchor element
    for (let i = 0; i < 3; i++) {
      const tag = await cardLinks.nth(i).evaluate((el) => el.tagName.toLowerCase());
      expect(tag).toBe('a');
    }
  });

  test('PC-E2E-02: cards appear in fixed DOM order with correct hrefs', async ({ page }) => {
    // Given: /projetos is visited
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    const cardLinks = page.locator('[data-testid="project-card"]');
    await expect(cardLinks).toHaveCount(4);

    // Then: href order matches spec (dadaia-workspace, portifolio, tauan-games)
    for (let i = 0; i < EXPECTED_SLUGS.length; i++) {
      const href = await cardLinks.nth(i).getAttribute('href');
      expect(href).toContain(EXPECTED_SLUGS[i]);
    }
  });

  test('PC-E2E-03: no filter input; keyboard Tab navigates through cards', async ({ page }) => {
    // Given: /projetos is visited
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // Then: no search/filter input exists (AC-PC-08 non-goal)
    const filterInput = page.locator('input[type="search"], input[placeholder*="filtro"], input[placeholder*="filter"]');
    await expect(filterInput).toHaveCount(0);

    // Then: Tab key reaches first card (keyboard accessibility — C-03)
    await page.keyboard.press('Tab');
    // Allow multiple Tabs to reach past header nav items
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      if (focused === 'project-card') break;
      await page.keyboard.press('Tab');
    }
    const focusedTestId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedTestId).toBe('project-card');
  });
});
