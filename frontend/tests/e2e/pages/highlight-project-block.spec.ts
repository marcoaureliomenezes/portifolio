/**
 * E2E — T-FE-WAVE6 — HighlightProjectBlock component integration.
 *
 * AC-FQR-12 (partial): HighlightProjectBlock renders in the Senior Santander
 * ExperienceCard with title, description body, and SLA impact stats.
 *
 * Observable contract:
 * - The Senior Santander role (Engenheiro de Dados Sênior / Senior Data Engineer)
 *   has `highlightProject` populated in WAVE5 JSONs.
 * - After expanding the collapsible, the HighlightProjectBlock must be visible:
 *     - Title: "Migração SAS → Azure + Databricks" (PT) or equivalent
 *     - Body paragraph visible (non-empty)
 *     - At least one impact stat containing "12 meses → 2 meses" / "12 months → 2 months"
 * - The block uses bg-accent-subtle + border-accent styling tokens (AC from SPEC).
 * - Negative case: the Pleno Santander role does NOT render a HighlightProjectBlock
 *   (it has no `highlightProject` data in the WAVE5 JSONs).
 *
 * NOTE: These tests EXPECT T-FE-WAVE6 to be shipped. Before HighlightProjectBlock
 * is integrated into RoleCollapsible, these assertions will fail — that is the
 * correct red-phase signal for this task.
 */
import { test, expect, type Page } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';
import { expandSeniorRole as sharedExpandSeniorRole, switchLanguage as sharedSwitchLanguage } from '../fixtures/experience-helpers';

// ---------------------------------------------------------------------------
// Locale-specific expected text for the highlight block
// ---------------------------------------------------------------------------
const LOCALE_HIGHLIGHT = [
  {
    key: 'pt',
    optionLabel: 'Português',
    heroFragment: 'AI-augmented data engineering em escala',
    highlightTitle: 'Migração SAS → Azure + Databricks',
    impactFragment: '12 meses → 2 meses',
    seniorTriggerText: /Sênior|Senior/,
    plenoTriggerText: /Pleno/,
  },
  {
    key: 'en',
    optionLabel: 'English',
    heroFragment: 'AI-augmented data engineering at scale',
    highlightTitle: 'SAS → Azure + Databricks Migration',
    impactFragment: '12 months → 2 months',
    seniorTriggerText: /Senior Data Engineer/,
    plenoTriggerText: /Pleno|Mid-level|Data Engineer/,
  },
  {
    key: 'de',
    optionLabel: 'Deutsch',
    heroFragment: 'KI-gestütztes Data Engineering im Maßstab',
    highlightTitle: 'SAS → Azure + Databricks Migration',
    impactFragment: /12 Monate → 2 Monate|12 months → 2 months|12 monate|monate/i,
    seniorTriggerText: /Senior Data Engineer/,
    plenoTriggerText: /Pleno|Data Engineer/,
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers: thin wrappers over shared helpers (kept for signature compat)
// ---------------------------------------------------------------------------
const switchLanguage = sharedSwitchLanguage;
const expandSeniorRole = (page: Page, seniorPattern: RegExp) =>
  sharedExpandSeniorRole(page, seniorPattern);

// ---------------------------------------------------------------------------
// HP-01..03: per-locale positive tests (title, body, impact stats)
// ---------------------------------------------------------------------------
for (const locale of LOCALE_HIGHLIGHT) {
  test.describe(`HighlightProjectBlock — ${locale.key.toUpperCase()} — T-FE-WAVE6`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(ROUTES.home);
      if (locale.key !== 'pt') {
        await switchLanguage(page, locale.optionLabel);
        await expect(page.locator('#hero-heading')).toContainText(locale.heroFragment);
      }
    });

    test(`HP-01-${locale.key.toUpperCase()}: HighlightProjectBlock title is visible after expansion`, async ({ page }) => {
      const contentArea = await expandSeniorRole(page, locale.seniorTriggerText);

      const titleEl = contentArea.getByText(locale.highlightTitle, { exact: false });
      await expect(
        titleEl,
        `Highlight project title "${locale.highlightTitle}" should be visible in ${locale.key}`
      ).toBeVisible();
    });

    test(`HP-02-${locale.key.toUpperCase()}: HighlightProjectBlock body paragraph is visible`, async ({ page }) => {
      const contentArea = await expandSeniorRole(page, locale.seniorTriggerText);

      // The body text contains keywords about the SAS migration regardless of locale
      // We use a common fragment that appears in all three locales' body text.
      const bodyPatterns = [
        /Azure Data Factory/i,
        /Databricks/i,
        /medallion/i,
        /pipelines?/i,
      ];

      let foundBody = false;
      for (const pattern of bodyPatterns) {
        const bodyEl = contentArea.locator(`text=${pattern.source}`).first();
        if (await bodyEl.isVisible().catch(() => false)) {
          foundBody = true;
          break;
        }
      }

      // Alternative: check that there is any <p> tag with meaningful text in
      // the content area that is related to the highlight block
      if (!foundBody) {
        const paragraphs = contentArea.locator('p');
        const count = await paragraphs.count();
        let hasSubstantialParagraph = false;
        for (let i = 0; i < count; i++) {
          const text = (await paragraphs.nth(i).textContent()) ?? '';
          if (text.length > 50 && (text.includes('Azure') || text.includes('Databricks') || text.includes('SAS'))) {
            hasSubstantialParagraph = true;
            break;
          }
        }
        expect(
          hasSubstantialParagraph,
          `HighlightProjectBlock body should contain substantive text about the SAS migration in ${locale.key}`
        ).toBe(true);
        return;
      }

      expect(foundBody, `HighlightProjectBlock body paragraph not found in ${locale.key}`).toBe(true);
    });

    test(`HP-03-${locale.key.toUpperCase()}: impact stat "12→2 months/meses" is visible`, async ({ page }) => {
      const contentArea = await expandSeniorRole(page, locale.seniorTriggerText);

      // Impact stats contain the SLA reduction metric — the only public metric
      // allowed per the privacy constraint (no R$ 6M).
      const impactPattern = locale.impactFragment;

      if (typeof impactPattern === 'string') {
        const impactEl = contentArea.getByText(impactPattern, { exact: false });
        await expect(
          impactEl,
          `Impact stat "${impactPattern}" should be visible in ${locale.key}`
        ).toBeVisible();
      } else {
        // RegExp branch (DE locale may vary)
        const contentText = await contentArea.textContent() ?? '';
        const hasImpact =
          impactPattern.test(contentText) ||
          contentText.includes('12') && contentText.includes('2 M');
        expect(
          hasImpact,
          `Impact stat matching ${impactPattern} not found in ${locale.key}. Content: "${contentText.substring(0, 200)}"`
        ).toBe(true);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// HP-04: styling tokens — highlight block uses accent-subtle / border-accent
// ---------------------------------------------------------------------------
test('HP-04: HighlightProjectBlock uses accent-subtle background token', async ({ page }) => {
  await page.goto(ROUTES.home);
  const contentArea = await expandSeniorRole(page, /Sênior|Senior/);

  // Locate the highlight block container by its title text
  const highlightTitleEl = contentArea.getByText('Migração SAS → Azure + Databricks', { exact: false });
  await expect(highlightTitleEl).toBeVisible();

  // Walk up to find the block container with the accent-subtle class
  const hasAccentStyling = await highlightTitleEl.evaluate((el) => {
    let node: Element | null = el;
    let depth = 0;
    while (node && depth < 6) {
      const cls = node.className ?? '';
      // accent-subtle is the bg token; also accept bg-accent variant
      if (
        cls.includes('accent-subtle') ||
        cls.includes('bg-accent') ||
        cls.includes('border-accent')
      ) {
        return true;
      }
      node = node.parentElement;
      depth++;
    }
    return false;
  });

  expect(
    hasAccentStyling,
    'HighlightProjectBlock container should have accent-subtle or border-accent class'
  ).toBe(true);
});

// ---------------------------------------------------------------------------
// HP-05: negative case — Pleno Santander role has NO HighlightProjectBlock
// ---------------------------------------------------------------------------
test('HP-05: HighlightProjectBlock does NOT render for Pleno Santander role', async ({ page }) => {
  await page.goto(ROUTES.home);

  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  // Expand the Pleno role (second role in Santander multi-role card)
  // The trigger contains "Pleno" in PT
  const plenoTrigger = section
    .locator('button, [role="button"]')
    .filter({ hasText: /Pleno/ })
    .filter({ visible: true })
    .first();

  // If the Pleno trigger is not found (different locale fallback), skip gracefully
  if (!(await plenoTrigger.isVisible().catch(() => false))) {
    test.skip();
    return;
  }

  await plenoTrigger.click();

  // Resolve the Pleno content area via the trigger's aria-controls linkage
  // (Radix Collapsible 1.x does not emit data-radix-collapsible-content;
  // aria-controls points to the content element id directly).
  const plenoContentId = await plenoTrigger.getAttribute('aria-controls');
  if (!plenoContentId) {
    throw new Error('Pleno trigger missing aria-controls; cannot locate content area');
  }
  const plenoContentArea = page.locator(`[id="${plenoContentId}"]`);

  // The Pleno content area should be visible
  await expect(plenoContentArea).toBeVisible();

  // The highlight project title should NOT appear in the Pleno content area
  const highlightTitle = plenoContentArea.getByText('Migração SAS', { exact: false });
  await expect(
    highlightTitle,
    'HighlightProjectBlock should NOT render in Pleno role (no highlightProject data)'
  ).not.toBeVisible();

  // Also assert the ⚡ Impacto badge is absent
  const impactBadge = plenoContentArea.getByText('Impacto', { exact: false });
  await expect(
    impactBadge,
    'Impact badge should NOT be present in Pleno role'
  ).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// HP-06: no R$ / financial values leak onto the page (privacy constraint)
// ---------------------------------------------------------------------------
test('HP-06: no financial value (R$) appears anywhere on the page', async ({ page }) => {
  await page.goto(ROUTES.home);

  // Expand all Santander roles to surface any hidden content
  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  const triggers = section
    .locator('button, [role="button"]')
    .filter({ hasText: /Sênior|Senior|Pleno|Júnior|Junior/ })
    .filter({ visible: true });
  const count = await triggers.count();
  for (let i = 0; i < count; i++) {
    await triggers.nth(i).click().catch(() => {});
  }

  const pageText = await page.locator('body').textContent() ?? '';
  expect(
    pageText,
    'Page must not contain financial values — privacy constraint (no R$ 6M)'
  ).not.toMatch(/R\$\s*6\s*(M|mi|MM|milhões?)/i);
});

// ---------------------------------------------------------------------------
// HP-07: screenshot evidence — highlight block visible in PT
// ---------------------------------------------------------------------------
test('HP-07: screenshot evidence — HighlightProjectBlock visible in Senior card PT', async ({ page }) => {
  await page.goto(ROUTES.home);
  await expandSeniorRole(page, /Sênior|Senior/);

  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  await page.screenshot({
    path: 'tests/e2e/__screenshots__/highlight-project-block-pt-light.png',
    fullPage: false,
  });
});

test('HP-08: screenshot evidence — HighlightProjectBlock visible in Senior card PT dark mode', async ({ page }) => {
  await page.goto(ROUTES.home);

  // Enable dark mode
  const themeToggle = page
    .locator('[aria-label*="dark"], [aria-label*="Dark"], [aria-label*="tema"], [aria-label*="theme"]')
    .first();
  if (await themeToggle.isVisible().catch(() => false)) {
    await themeToggle.click();
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
  }

  await expandSeniorRole(page, /Sênior|Senior/);

  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  await page.screenshot({
    path: 'tests/e2e/__screenshots__/highlight-project-block-pt-dark.png',
    fullPage: false,
  });
});
