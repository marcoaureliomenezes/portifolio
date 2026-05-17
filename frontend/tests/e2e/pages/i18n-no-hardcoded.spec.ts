/**
 * E2E — T-FE-QUAL-06: i18n debt — no hardcoded UI strings in section headings.
 *
 * Asserts that the five key section headings rendered via `useContent()` change
 * visibly when the locale is switched between pt / en / de, and that no heading
 * is "stuck" in a single locale regardless of the selected language.
 *
 * Sections covered (via their aria-labelledby heading IDs):
 *   #hero-heading          — heroTagline
 *   #habilidades-heading   — skillsTitle
 *   #experiencia-heading   — experienceTitle
 *   #educacao-heading      — educationTitle
 *   #certificacoes-heading — certificationsTitle
 *
 * Technique: snapshot text in each locale, assert per-locale distinctness.
 */

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// ---------------------------------------------------------------------------
// Known localized values extracted from src/data/content/*.json
// ---------------------------------------------------------------------------
const LOCALE_STRINGS = {
  pt: {
    heroTagline:           'AI-augmented data engineering em escala',
    skillsTitle:           'Habilidades',
    experienceTitle:       'Experiência Profissional',
    educationTitle:        'Educação',
    certificationsTitle:   'Certificações',
  },
  en: {
    heroTagline:           'AI-augmented data engineering at scale',
    skillsTitle:           'Skills',
    experienceTitle:       'Professional Experience',
    educationTitle:        'Education',
    certificationsTitle:   'Certifications',
  },
  de: {
    heroTagline:           'KI-gestütztes Data Engineering im Maßstab',
    skillsTitle:           'Fähigkeiten',
    experienceTitle:       'Berufserfahrung',
    educationTitle:        'Ausbildung',
    certificationsTitle:   'Zertifizierungen',
  },
} as const;

type Locale = keyof typeof LOCALE_STRINGS;

/** Click the language-selector combobox and pick the target language option. */
async function switchLocale(page: import('@playwright/test').Page, label: string) {
  const combobox = page.locator('[role="combobox"]').first();
  await combobox.click();
  await page.getByRole('option', { name: label }).click();
}

const LOCALE_OPTION_LABELS: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  de: 'Deutsch',
};

// ---------------------------------------------------------------------------
// Helper — gather all heading texts in the current page state
// ---------------------------------------------------------------------------
async function captureHeadings(page: import('@playwright/test').Page) {
  return {
    heroTagline:         await page.locator('#hero-heading').innerText(),
    skillsTitle:         await page.locator('#habilidades-heading').innerText(),
    experienceTitle:     await page.locator('#experiencia-heading').innerText(),
    educationTitle:      await page.locator('#educacao-heading').innerText(),
    certificationsTitle: await page.locator('#certificacoes-heading').innerText(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('i18n — section headings change with locale (T-FE-QUAL-06)', () => {

  /**
   * Scenario 1 — Default locale (pt) renders Portuguese headings.
   * This verifies the baseline before any switch.
   */
  test('S1: default locale (pt) shows Portuguese section headings', async ({ page }) => {
    await page.goto(ROUTES.home);

    await expect(page.locator('#hero-heading')).toBeVisible();

    const texts = await captureHeadings(page);

    expect(texts.heroTagline).toContain(LOCALE_STRINGS.pt.heroTagline);
    expect(texts.skillsTitle).toContain(LOCALE_STRINGS.pt.skillsTitle);
    expect(texts.experienceTitle).toContain(LOCALE_STRINGS.pt.experienceTitle);
    expect(texts.educationTitle).toContain(LOCALE_STRINGS.pt.educationTitle);
    expect(texts.certificationsTitle).toContain(LOCALE_STRINGS.pt.certificationsTitle);
  });

  /**
   * Scenario 2 — Switching to English re-renders all five headings in EN.
   * No heading remains in PT after the switch.
   */
  test('S2: switch pt → en re-renders all section headings in English', async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    await switchLocale(page, LOCALE_OPTION_LABELS.en);

    const texts = await captureHeadings(page);

    expect(texts.heroTagline).toContain(LOCALE_STRINGS.en.heroTagline);
    expect(texts.skillsTitle).toContain(LOCALE_STRINGS.en.skillsTitle);
    expect(texts.experienceTitle).toContain(LOCALE_STRINGS.en.experienceTitle);
    expect(texts.educationTitle).toContain(LOCALE_STRINGS.en.educationTitle);
    expect(texts.certificationsTitle).toContain(LOCALE_STRINGS.en.certificationsTitle);

    // No heading is stuck in PT
    expect(texts.heroTagline).not.toContain(LOCALE_STRINGS.pt.heroTagline);
    expect(texts.skillsTitle).not.toContain(LOCALE_STRINGS.pt.skillsTitle);
    expect(texts.educationTitle).not.toContain(LOCALE_STRINGS.pt.educationTitle);
  });

  /**
   * Scenario 3 — Switching to Deutsch re-renders all five headings in DE.
   * No heading remains in PT or EN after the switch.
   */
  test('S3: switch pt → de re-renders all section headings in German', async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    await switchLocale(page, LOCALE_OPTION_LABELS.de);

    const texts = await captureHeadings(page);

    expect(texts.heroTagline).toContain(LOCALE_STRINGS.de.heroTagline);
    expect(texts.skillsTitle).toContain(LOCALE_STRINGS.de.skillsTitle);
    expect(texts.experienceTitle).toContain(LOCALE_STRINGS.de.experienceTitle);
    expect(texts.educationTitle).toContain(LOCALE_STRINGS.de.educationTitle);
    expect(texts.certificationsTitle).toContain(LOCALE_STRINGS.de.certificationsTitle);

    // No heading is stuck in PT
    expect(texts.heroTagline).not.toContain(LOCALE_STRINGS.pt.heroTagline);
    expect(texts.educationTitle).not.toContain(LOCALE_STRINGS.pt.educationTitle);
    expect(texts.certificationsTitle).not.toContain(LOCALE_STRINGS.pt.certificationsTitle);
  });

  /**
   * Scenario 4 — All three locale snapshots are mutually distinct for each
   * heading. This is the distinctness invariant: if the implementation ever
   * falls back to PT for a heading it shouldn't, the comparison catches it.
   */
  test('S4: locale snapshots are mutually distinct across all three locales', async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    // PT snapshot (default)
    const ptTexts = await captureHeadings(page);

    // EN snapshot
    await switchLocale(page, LOCALE_OPTION_LABELS.en);
    const enTexts = await captureHeadings(page);

    // DE snapshot
    await switchLocale(page, LOCALE_OPTION_LABELS.de);
    const deTexts = await captureHeadings(page);

    const fields = ['heroTagline', 'skillsTitle', 'experienceTitle', 'educationTitle', 'certificationsTitle'] as const;

    for (const field of fields) {
      // Each locale differs from the other two
      expect(ptTexts[field]).not.toEqual(enTexts[field]);
      expect(ptTexts[field]).not.toEqual(deTexts[field]);
      expect(enTexts[field]).not.toEqual(deTexts[field]);
    }
  });

  /**
   * Scenario 5 — Round-trip: switch en → de → pt restores original PT strings.
   * Confirms the locale provider doesn't cache a wrong value on the third switch.
   */
  test('S5: round-trip en → de → pt restores Portuguese headings', async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    await switchLocale(page, LOCALE_OPTION_LABELS.en);
    await switchLocale(page, LOCALE_OPTION_LABELS.de);
    await switchLocale(page, LOCALE_OPTION_LABELS.pt);

    const texts = await captureHeadings(page);

    expect(texts.heroTagline).toContain(LOCALE_STRINGS.pt.heroTagline);
    expect(texts.educationTitle).toContain(LOCALE_STRINGS.pt.educationTitle);
    expect(texts.certificationsTitle).toContain(LOCALE_STRINGS.pt.certificationsTitle);
  });
});
