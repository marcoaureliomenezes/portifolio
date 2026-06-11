/**
 * E2E stubs — Accessibility checks for /projetos/* routes
 *
 * AC-PC-13: Axe zero violations on /projetos + 3 detail pages
 * AC-PC-15: No sensitive AWS strings visible in page content
 *
 * Tests:
 *   PC-E2E-27: /projetos — axe zero violations; keyboard Tab reaches all cards
 *   PC-E2E-28: /projetos/dadaia-workspace — axe zero violations; diagram alt non-empty
 *   PC-E2E-29: /projetos/portifolio — axe zero violations; costs table has th elements
 *   PC-E2E-30: /projetos/tauan-games — axe zero violations; game links have discernible text
 *   PC-E2E-31: no AWS-sensitive strings in page text on any /projetos route
 *
 * Activated in: T-PC-C-08
 * Implementation contract: C-03, C-15 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from '../fixtures/routes';

// AWS-sensitive strings that must never appear in page text (AC-PC-15)
const FORBIDDEN_STRINGS = [
  'E25KHOW8T4PLO3',
  'Z08547081HT88IACPHZET',
  'stage-portifolio-marco',
  '016098071081', // AWS account ID as isolated digits
] as const;

test.describe('Accessibility — Projects cluster routes', () => {
  test('PC-E2E-27: /projetos — axe zero violations and keyboard tab navigation', async ({ page }) => {
    // Given: /projetos loaded
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // Then: axe zero violations on wcag2a + wcag2aa
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations on /projetos:\n${results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.html).join(' | ')}`)
        .join('\n\n')}`,
    ).toHaveLength(0);

    // Then: keyboard Tab can reach project cards (AC-PC-08 focus-visible:ring-2)
    // Tab through the page and confirm a project card becomes focused
    let cardFocused = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const testId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      if (testId === 'project-card') {
        cardFocused = true;
        break;
      }
    }
    expect(cardFocused).toBe(true);
  });

  test('PC-E2E-28: /projetos/dadaia-workspace — axe zero violations', async ({ page }) => {
    // Given: case-study detail loaded
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: axe zero violations
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations on /projetos/dadaia-workspace:\n${results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join('\n')}`,
    ).toHaveLength(0);

    // Then: diagram img has non-empty alt
    const diagramImg = page.locator('figure img').first();
    const alt = await diagramImg.getAttribute('alt');
    expect((alt ?? '').trim().length).toBeGreaterThan(0);
  });

  test('PC-E2E-29: /projetos/portifolio — axe zero violations; costs table has th', async ({ page }) => {
    // Given: meta detail loaded
    await page.goto(ROUTES.portifolio);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: axe zero violations
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations on /projetos/portifolio:\n${results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join('\n')}`,
    ).toHaveLength(0);

    // Then: costs table has <th> elements for screen-reader column headers
    const thCount = await page.locator('[data-testid="costs-table"] th, table th').count();
    expect(thCount).toBeGreaterThan(0);
  });

  test('PC-E2E-30: /projetos/tauan-games — axe zero violations; game links discernible text', async ({ page }) => {
    // Given: games detail loaded
    await page.goto(ROUTES.tauanGames);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: axe zero violations
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations on /projetos/tauan-games:\n${results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join('\n')}`,
    ).toHaveLength(0);

    // Then: each game play link has discernible text or aria-label
    const playLinks = page.locator('a[href*="tauan-games"]');
    const count = await playLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const link = playLinks.nth(i);
      const innerText = await link.innerText();
      const ariaLabel = await link.getAttribute('aria-label');
      const hasText = (innerText.trim().length > 0) || ((ariaLabel ?? '').length > 0);
      expect(hasText, `Game link ${i} has no discernible text`).toBe(true);
    }
  });

  test('PC-E2E-31: no AWS-sensitive strings in page text on /projetos/* routes', async ({ page }) => {
    // AC-PC-15: redaction policy verification in the browser layer
    const routesToCheck = [
      ROUTES.projectsIndex,
      ROUTES.dadaiaWorkspace,
      ROUTES.portifolio,
      ROUTES.tauanGames,
    ];

    for (const route of routesToCheck) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const bodyHtml = await page.content();
      for (const forbidden of FORBIDDEN_STRINGS) {
        expect(
          bodyHtml,
          `Found sensitive string "${forbidden}" in page content at ${route}`,
        ).not.toContain(forbidden);
      }
    }
  });
});
