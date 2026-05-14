/**
 * E2E-13 — Smoke axe accessibility test on home page.
 *           No wcag2a / wcag2aa violations allowed.
 * T-QA-10
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from '../fixtures/routes';

test.describe('Accessibility (axe)', () => {
  test('E2E-13: home page sem violações wcag2a/wcag2aa', async ({ page }) => {
    await page.goto(ROUTES.home);

    // Wait for the app to fully hydrate
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations found:\n${results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`)
        .join('\n\n')}`,
    ).toHaveLength(0);
  });
});
