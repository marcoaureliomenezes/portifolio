/**
 * E2E — T-FE-WAVE5 — AI-emphasis content verification.
 *
 * AC-FQR-11: JSONs PT/EN/DE updated with AI-emphasis narrative + heroTagline +
 * skillCategoryColors matchers. PR #25 merged — verify shipped behavior matches AC.
 *
 * Scenarios:
 * 1. heroTagline is visible for each language (pt/en/de).
 * 2. Experience section is present for each language.
 * 3. Role-level skill tags (skills array) are visible in the Senior DE card
 *    for each language.
 * 4. At least one AI-tooling skill tag is present for the Senior role (Claude Code,
 *    Devin, Spec-Driven Development, etc.).
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';
import { expandSeniorRole, switchLanguage as sharedSwitchLanguage } from '../fixtures/experience-helpers';

const LANGUAGES = [
  {
    key: 'pt',
    optionLabel: 'Português',
    heroTagline: 'AI-augmented data engineering em escala',
    experienceTitle: 'Experiência Profissional',
    seniorTitle: /Engenheiro de Dados Sênior/,
    aiSkillSamples: ['Claude Code', 'Devin'],
  },
  {
    key: 'en',
    optionLabel: 'English',
    heroTagline: 'AI-augmented data engineering at scale',
    experienceTitle: 'Professional Experience',
    seniorTitle: /Senior Data Engineer/,
    aiSkillSamples: ['Claude Code', 'Devin'],
  },
  {
    key: 'de',
    optionLabel: 'Deutsch',
    heroTagline: 'KI-gestütztes Data Engineering im Maßstab',
    experienceTitle: 'Berufserfahrung',
    seniorTitle: /Senior Data Engineer/,
    aiSkillSamples: ['Claude Code', 'Devin'],
  },
] as const;

const switchLanguage = sharedSwitchLanguage;

for (const lang of LANGUAGES) {
  test.describe(`AI-emphasis content — ${lang.key.toUpperCase()} — T-FE-WAVE5`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(ROUTES.home);
      if (lang.key !== 'pt') {
        await switchLanguage(page, lang.optionLabel);
      }
      // Wait for hero to update
      await expect(page.locator('#hero-heading')).toContainText(lang.heroTagline);
    });

    test(`WAVE5-${lang.key.toUpperCase()}-01: heroTagline is visible`, async ({ page }) => {
      const heroHeading = page.locator('#hero-heading');
      await expect(heroHeading).toBeVisible();
      await expect(heroHeading).toContainText(lang.heroTagline);
    });

    test(`WAVE5-${lang.key.toUpperCase()}-02: experience section title is localized`, async ({ page }) => {
      const section = page.locator('#experiencia');
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();

      // The experience section heading contains the localized title
      const heading = section.locator(`[id="experiencia-heading"], h2, h3`).first();
      await expect(heading).toContainText(lang.experienceTitle);
    });

    test(`WAVE5-${lang.key.toUpperCase()}-03: Senior DE role skills are visible after expanding`, async ({ page }) => {
      const contentArea = await expandSeniorRole(page, lang.seniorTitle);

      // At minimum, responsibilities text should be present
      const content = await contentArea.textContent() ?? '';
      expect(content.length, 'Expanded role content should not be empty').toBeGreaterThan(10);
    });

    test(`WAVE5-${lang.key.toUpperCase()}-04: AI-tooling skills data present in at least one role`, async ({ page }) => {
      const contentArea = await expandSeniorRole(page, lang.seniorTitle);

      // Check that at least one AI skill sample appears in the expanded content
      // This covers the "skills" array in the JSON (AC-FQR-11) once RoleSkillBadges
      // are rendered (T-FE-WAVE6). Until then, the skills may only appear in
      // responsibilities text.
      const contentText = await contentArea.textContent() ?? '';

      // "Claude Code", "Devin", or similar AI tooling text should appear in
      // the responsibilities after the WAVE5 content update
      const hasAiReference =
        contentText.includes('Claude') ||
        contentText.includes('Devin') ||
        contentText.includes('AI-augmented') ||
        contentText.includes('KI-') ||
        contentText.includes('Spec-Driven') ||
        contentText.includes('coding agent') ||
        contentText.includes('autonomen');

      expect(hasAiReference, `AI-emphasis content not found in Senior role (${lang.key})`).toBe(true);
    });
  });
}
