/**
 * E2E — T-FE-QUAL-07 — Language persistence via localStorage.
 *
 * AC-FQR-07: Refresh persists the chosen language.
 * Scenario 1: switch pt → en → de, each reload sticks.
 * Scenario 2: clear localStorage, reload, app falls back to navigator.language
 *             (not a hardcoded 'pt' default), i.e., it does not crash and still
 *             renders a supported language.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// Hero tagline strings (heroTagline field) used as per language-switch.spec.ts convention
// portfolio-redesign-v1: the hero tagline is locale-INVARIANT (single approved
// English headline). The locale signal is the experience section heading.
const TAGLINES = {
  pt: 'Experiência Profissional',
  en: 'Professional Experience',
  de: 'Berufserfahrung',
} as const;

test.describe('Language persistence — T-FE-QUAL-07', () => {
  test('PERS-01: switch pt → en persists after reload', async ({ page }) => {
    await page.goto(ROUTES.home);
    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();

    // Switch to English
    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(heroHeading).toContainText(TAGLINES.en);

    // Reload and assert persistence
    await page.reload();
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(TAGLINES.en);
  });

  test('PERS-02: switch pt → en → de persists after reload', async ({ page }) => {
    await page.goto(ROUTES.home);
    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();

    // Switch to English first
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(heroHeading).toContainText(TAGLINES.en);

    // Switch to Deutsch
    await selectTrigger.click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await expect(heroHeading).toContainText(TAGLINES.de);

    // Reload and assert persistence
    await page.reload();
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(TAGLINES.de);
  });

  test('PERS-03: clear localStorage → fallback renders a valid language (no crash)', async ({ page }) => {
    // First establish a persisted language
    await page.goto(ROUTES.home);
    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(heroHeading).toContainText(TAGLINES.en);

    // Clear localStorage (simulates first-visit with no stored preference)
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Assert the app renders one of the three supported taglines (no blank, no crash)
    await expect(heroHeading).toBeVisible();
    const text = await heroHeading.textContent() ?? '';
    const isValidTagline = Object.values(TAGLINES).some((t) => text.includes(t));
    expect(isValidTagline, `Hero heading text "${text}" is not a known tagline`).toBe(true);
  });

  test('PERS-04: localStorage key "lang" is written on language switch', async ({ page }) => {
    await page.goto(ROUTES.home);
    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(heroHeading).toContainText(TAGLINES.en);

    // Verify localStorage was written
    const storedLang = await page.evaluate(() => localStorage.getItem('lang'));
    expect(storedLang).toBe('en');
  });
});
