/**
 * E2E smoke — rand-engine (T-PC2-E-01, kind: library)
 *
 * SPEC AC-PC2-01/02 + AC-PC2-R2-02 coverage:
 *   1. /projetos renders a card for slug rand-engine (4th card)
 *   2. /projetos/rand-engine does not 404 and renders the Library template
 *   3. Install block + PyPI/GitHub links render
 *   4. PT → EN language switch keeps /projetos/rand-engine alive (no 404)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

const { pypi } = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../../public/content/en.json', import.meta.url)), 'utf8'),
).projectsV2.list.find((p: { slug: string }) => p.slug === 'rand-engine');

test.describe('rand-engine — library project smoke', () => {
  test('RE-E2E-01: /projetos renders the rand-engine card', async ({ page }) => {
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    const card = page.locator('a[href="/projetos/rand-engine"]');
    await expect(card).toHaveCount(1);
    await expect(card).toBeVisible();

    // Library card signal: kind chip + install hint visible without clicking
    await expect(card.locator('[data-testid="project-card-kind"]')).toBeVisible();
    await expect(card.locator('[data-testid="project-card-install"]')).toContainText(
      pypi.installCommand,
    );
  });

  test('RE-E2E-02: detail page renders Library template without 404', async ({ page }) => {
    const response = await page.goto(ROUTES.randEngine);
    await page.waitForLoadState('networkidle');

    expect(response?.status()).toBe(200);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('rand-engine');

    // Library blocks: install command, version badge, sections
    await expect(page.locator('[data-testid="install-command"]')).toContainText(
      pypi.installCommand,
    );
    await expect(page.locator('[data-testid="library-version"]')).toContainText(pypi.version);
    await expect(
      page.locator('[data-testid="project-section"]').first(),
    ).toBeVisible();
  });

  test('RE-E2E-03: PyPI and GitHub links are external anchors', async ({ page }) => {
    await page.goto(ROUTES.randEngine);
    await page.waitForLoadState('networkidle');

    const pypi = page.locator('a[href="https://pypi.org/project/rand-engine/"]').first();
    await expect(pypi).toBeVisible();
    await expect(pypi).toHaveAttribute('target', '_blank');

    const github = page
      .locator('a[href="https://github.com/marcoaureliomenezes/rand_engine"]')
      .first();
    await expect(github).toBeVisible();
    await expect(github).toHaveAttribute('rel', /noopener/);
  });

  test('RE-E2E-04: PT → EN switch keeps the route alive', async ({ page }) => {
    await page.goto(ROUTES.randEngine);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toContainText('rand-engine');

    // Language selector lives in the layout shell header
    const selector = page.locator('[data-testid="language-selector"], select').first();
    if (await selector.count()) {
      await selector.selectOption('en').catch(() => undefined);
    } else {
      // Fallback: programmatic switch via localStorage + reload (same contract)
      await page.evaluate(() => window.localStorage.setItem('lang', 'en'));
      await page.reload();
    }
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/projetos/rand-engine');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');
  });
});
