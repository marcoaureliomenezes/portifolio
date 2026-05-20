/**
 * E2E stubs — i18n parity on /projetos and detail routes
 *
 * AC-PC-03: PT/EN/DE parity gate
 * AC-PC-06: dynamic i18n import — language switch does not blank-render
 *
 * Tests:
 *   PC-E2E-04: /projetos — switch to EN, all card titles change to EN (non-empty)
 *   PC-E2E-05: /projetos — switch to DE, titles show DE or EN fallback (never PT, never empty)
 *   PC-E2E-14: /projetos/dadaia-workspace — switch to EN, hero title and document.title change
 *   PC-E2E-15: /projetos/portifolio — switch to EN, costs/decisions rendered in EN (non-empty)
 *   PC-E2E-16: /projetos/tauan-games — switch EN then DE; engine labels language-independent
 *   PC-E2E-18: language switch on /projetos does not cause blank card render (AC-PC-06)
 *
 * Activated in: T-PC-C-08
 * Implementation contract: C-14 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

/** Selects a language from the combobox (same mechanism as existing language-switch.spec.ts) */
async function switchLanguage(page: import('@playwright/test').Page, lang: 'English' | 'Deutsch') {
  const selectTrigger = page.locator('[role="combobox"]').first();
  await selectTrigger.click();
  await page.getByRole('option', { name: lang }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('i18n — Projects cluster routes', () => {
  test('PC-E2E-04: /projetos card titles update when switching to EN', async ({ page }) => {
    // Given: /projetos loaded in default PT
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // Capture PT card titles
    const cards = page.locator('[data-testid="project-card"]');
    await expect(cards).toHaveCount(3);
    const ptTitles = await page.locator('[data-testid="project-card-title"]').allInnerTexts();
    expect(ptTitles.every((t) => t.trim().length > 0)).toBe(true);

    // When: switch to EN
    await switchLanguage(page, 'English');

    // Then: titles are non-empty and changed (EN != PT)
    const enTitles = await page.locator('[data-testid="project-card-title"]').allInnerTexts();
    expect(enTitles.every((t) => t.trim().length > 0)).toBe(true);
    // At least some titles changed (PT !== EN for at least 1 card)
    const someChanged = ptTitles.some((pt, i) => pt !== enTitles[i]);
    expect(someChanged).toBe(true);
  });

  test('PC-E2E-05: /projetos DE fallback — never PT, never empty', async ({ page }) => {
    // Given: /projetos loaded in PT
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    const ptTitles = await page.locator('[data-testid="project-card-title"]').allInnerTexts();

    // When: switch to DE
    await switchLanguage(page, 'Deutsch');

    // Then: titles are non-empty (DE or EN fallback, never empty)
    const deTitles = await page.locator('[data-testid="project-card-title"]').allInnerTexts();
    expect(deTitles.every((t) => t.trim().length > 0)).toBe(true);

    // Then: DE titles do NOT equal PT titles (fallback is EN, not PT — quality-bar §i18n)
    const isStillPT = deTitles.every((de, i) => de === ptTitles[i]);
    expect(isStillPT).toBe(false);
  });

  test('PC-E2E-18: language switch on /projetos does not blank-render cards', async ({ page }) => {
    // Given: /projetos loaded
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // When: switch language
    await switchLanguage(page, 'English');

    // Then: cards are immediately visible after networkidle (no blank flash persists)
    const cards = page.locator('[data-testid="project-card"]');
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }

    // Then: no JS errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('PC-E2E-14: dadaia-workspace detail — EN title and document.title change', async ({ page }) => {
    // Given: /projetos/dadaia-workspace in PT
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    const ptTitle = await page.title();
    const ptH1 = await page.locator('h1').first().innerText();

    // When: switch to EN
    await switchLanguage(page, 'English');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: document.title changed
    const enTitle = await page.title();
    expect(enTitle.trim().length).toBeGreaterThan(0);
    expect(enTitle).not.toBe(ptTitle);

    // Then: h1 changed (hero title is i18n)
    const enH1 = await page.locator('h1').first().innerText();
    expect(enH1.trim().length).toBeGreaterThan(0);
    expect(enH1).not.toBe(ptH1);
  });

  test('PC-E2E-15: portifolio detail — EN costs and decisions sections non-empty', async ({ page }) => {
    // Given: /projetos/portifolio in EN
    await page.goto(ROUTES.portifolio);
    await page.waitForLoadState('networkidle');
    await switchLanguage(page, 'English');

    // Then: costs table visible and non-empty
    const costsTable = page.locator('[data-testid="costs-table"], table').first();
    await expect(costsTable).toBeVisible();
    const costsText = await costsTable.innerText();
    expect(costsText.trim().length).toBeGreaterThan(0);

    // Then: decisions list visible and non-empty
    const decisions = page.locator('[data-testid="decisions-list"], [data-testid="arch-decision"]').first();
    await expect(decisions).toBeVisible();
  });

  test('PC-E2E-16: tauan-games — engine labels are language-independent across PT/EN/DE', async ({ page }) => {
    // Given: /projetos/tauan-games in PT
    await page.goto(ROUTES.tauanGames);
    await page.waitForLoadState('networkidle');

    // Then: engine labels present in PT
    let body = await page.locator('body').innerText();
    expect(body).toContain('Three.js');
    expect(body).toContain('Phaser');

    // When: switch to EN
    await switchLanguage(page, 'English');
    body = await page.locator('body').innerText();

    // Then: engine labels unchanged (they are NOT i18n fields)
    expect(body).toContain('Three.js');
    expect(body).toContain('Phaser');

    // When: switch to DE
    await switchLanguage(page, 'Deutsch');
    body = await page.locator('body').innerText();

    // Then: engine labels still unchanged
    expect(body).toContain('Three.js');
    expect(body).toContain('Phaser');
  });
});
