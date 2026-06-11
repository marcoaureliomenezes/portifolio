/**
 * E2E-02 — Language switch pt → en changes visible text.
 * E2E-03 — Language switch en → de changes visible text.
 * E2E-04 — Fallback: de with missing key falls back to en (not pt).
 * T-QA-05
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Language switch', () => {
  // Hero heading now shows `heroTagline` (T-FE-WAVE5). Localized strings:
  //   pt: "AI-augmented data engineering em escala"
  //   en: "AI-augmented data engineering at scale"
  //   de: "KI-gestütztes Data Engineering im Maßstab"
  // chromium defaults navigator.language to en-US — seed pt so the pt→en
  // scenario actually starts from Portuguese (T-FE-QUAL-07 resolution order).
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('lang', 'pt'));
  });

  test('E2E-02: trocar pt → en muda o texto do hero', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Experiência Profissional');

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();

    await expect(heroHeading).toContainText('Professional Experience');
  });

  test('E2E-03: trocar en → de muda o texto do hero', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(heroHeading).toContainText('Professional Experience');

    await selectTrigger.click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await expect(heroHeading).toContainText('Berufserfahrung');
  });

  test('E2E-04: fallback de → en para chave inexistente (não pt)', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#experiencia h2');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'Deutsch' }).click();

    await expect(heroHeading).toContainText('Berufserfahrung');
    await expect(heroHeading).not.toContainText('Experiência Profissional');
    await expect(heroHeading).not.toContainText('Professional Experience');
  });
});
