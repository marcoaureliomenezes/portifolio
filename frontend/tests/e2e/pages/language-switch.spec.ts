/**
 * E2E-02 — Language switch pt → en changes visible text.
 * E2E-03 — Language switch en → de changes visible text.
 * E2E-04 — Fallback: de with missing key falls back to en (not pt).
 * T-QA-05
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Language switch', () => {
  // Hero heading now shows `heroTagline` (T-FE-WAVE3). Localized strings:
  //   pt: "Construo pipelines de dados em escala"
  //   en: "I build data pipelines at scale"
  //   de: "Ich baue Datenpipelines im Maßstab"
  test('E2E-02: trocar pt → en muda o texto do hero', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Construo pipelines');

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();

    await expect(heroHeading).toContainText('I build data pipelines');
  });

  test('E2E-03: trocar en → de muda o texto do hero', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(heroHeading).toContainText('I build data pipelines');

    await selectTrigger.click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await expect(heroHeading).toContainText('Ich baue Datenpipelines');
  });

  test('E2E-04: fallback de → en para chave inexistente (não pt)', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'Deutsch' }).click();

    await expect(heroHeading).toContainText('Ich baue Datenpipelines');
    await expect(heroHeading).not.toContainText('Construo');
    await expect(heroHeading).not.toContainText('I build');
  });
});
