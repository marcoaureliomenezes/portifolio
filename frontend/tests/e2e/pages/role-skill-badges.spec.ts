/**
 * E2E — T-FE-WAVE6 — RoleSkillBadges component integration.
 *
 * AC-FQR-12 (partial): RoleSkillBadges renders in ExperienceCard with
 * category-color styling.
 *
 * Observable contract:
 * - Loading `/` and navigating to the experience section surfaces the
 *   Santander Senior role card (multi-role company, expanded via collapsible).
 * - After expansion, skill badges render (count >= 5 minimum; data has 15).
 * - Badges carry category-color Tailwind classes sourced from
 *   `frontend/src/lib/skillCategoryColors.ts`.
 * - Badge count is consistent across pt / en / de (skills are locale-invariant
 *   in the current WAVE5 JSON data).
 * - Badges are non-focusable — they are presentational spans/labels, not
 *   interactive controls.
 *
 * NOTE: These tests EXPECT T-FE-WAVE6 to be shipped. Before RoleSkillBadges
 * is integrated into ExperienceCard, the badge assertions will fail — that is
 * the correct red-phase signal for this task.
 */
import { test, expect, type Page } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// ---------------------------------------------------------------------------
// Constants derived directly from WAVE5 data (locale-invariant skills)
// ---------------------------------------------------------------------------

/** Minimum badge count. Data has 15; we guard against off-by-one regressions. */
const MIN_BADGE_COUNT = 5;

/**
 * Expected Tailwind class fragments mapped to categories from skillCategoryColors.ts.
 * We check that at least one badge matches each of the rich categories present in
 * the Senior Santander role.
 *
 * cloud      → bg-blue-100 / dark:bg-blue-950
 * language   → bg-emerald-100 / dark:bg-emerald-950
 * database   → bg-purple-100 / dark:bg-purple-950
 * ai-tooling → bg-accent-subtle (CSS variable class, not a raw Tailwind color)
 * default    → bg-muted
 *
 * We test class-fragment presence on the badge element via evaluate().
 */
const CATEGORY_CLASS_FRAGMENTS: Record<string, string[]> = {
  cloud: ['bg-blue-'],
  language: ['bg-emerald-'],
  database: ['bg-purple-'],
  // ai-tooling uses design-token class; check for "accent-subtle" text in class
  'ai-tooling': ['accent-subtle', 'bg-accent'],
};

/** Skills that must classify as each category (per skillCategoryColors.ts matchers). */
const SKILL_CATEGORY_SAMPLES: Record<string, string> = {
  cloud: 'Azure Data Factory',  // matches /azure/i → cloud
  language: 'Python',           // matches /python/i → language
  database: 'SQL',              // matches /sql/i → database
  'ai-tooling': 'Claude Code',  // matches /claude/i → ai-tooling
};

// ---------------------------------------------------------------------------
// Helper: switch language via the combobox selector
// ---------------------------------------------------------------------------
async function switchLanguage(page: Page, optionLabel: string): Promise<void> {
  const selectTrigger = page.locator('[role="combobox"]').first();
  await selectTrigger.click();
  await page.getByRole('option', { name: optionLabel }).click();
}

// ---------------------------------------------------------------------------
// Helper: expand the Senior Santander collapsible and return the content area
// ---------------------------------------------------------------------------
async function expandSeniorRole(page: Page): Promise<void> {
  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  // The Senior trigger text differs by locale only in PT (Engenheiro de Dados Sênior)
  // In EN and DE the title is "Senior Data Engineer". We locate by partial text.
  const seniorTrigger = page
    .locator('button, [role="button"]')
    .filter({ hasText: /Senior|Sênior/ })
    .first();
  await expect(seniorTrigger).toBeVisible();

  // Only click if not already open
  const contentArea = page.locator('[data-radix-collapsible-content]').first();
  const isOpen = await contentArea.isVisible().catch(() => false);
  if (!isOpen) {
    await seniorTrigger.click();
  }

  await expect(contentArea).toBeVisible();
}

// ---------------------------------------------------------------------------
// BADGE-01: badges render with count >= MIN_BADGE_COUNT (default PT locale)
// ---------------------------------------------------------------------------
test('BADGE-01: RoleSkillBadges renders >= 5 badges in Senior Santander card (PT)', async ({ page }) => {
  await page.goto(ROUTES.home);
  await expandSeniorRole(page);

  // Skill badges are expected inside the expanded collapsible content area.
  // The RoleSkillBadges component renders spans/badges with data-skill or
  // inside a flex-wrap container. We locate by the Badge variant classes
  // or by a data-testid if implemented, falling back to text matching known skills.
  const contentArea = page.locator('[data-radix-collapsible-content]').first();

  // Locate all elements that contain known skill text inside the content area.
  // RoleSkillBadges renders each skill as its own element.
  // We look for the element carrying "Claude Code" text as proof of render.
  const claudeBadge = contentArea.getByText('Claude Code', { exact: true });
  await expect(claudeBadge).toBeVisible();

  const pythonBadge = contentArea.getByText('Python', { exact: true });
  await expect(pythonBadge).toBeVisible();

  const sqlBadge = contentArea.getByText('SQL', { exact: true });
  await expect(sqlBadge).toBeVisible();

  const databricksBadge = contentArea.getByText('Databricks', { exact: true });
  await expect(databricksBadge).toBeVisible();

  const devBadge = contentArea.getByText('Devin', { exact: true });
  await expect(devBadge).toBeVisible();

  // Count total skill badge elements using the skills from the WAVE5 JSON.
  // Skills are rendered as individual text nodes. We count how many of the
  // 15 known skills appear as distinct elements in the content area.
  const SENIOR_SKILLS = [
    'Data Architecture', 'Python', 'SQL', 'Scala', 'Linux',
    'Databricks', 'Apache Spark', 'Azure Data Factory', 'AWS',
    'Claude Code', 'GitHub Copilot', 'Devin', 'Windsurf',
    'Spec-Driven Development', 'TDD com AI',
  ];

  let visibleCount = 0;
  for (const skill of SENIOR_SKILLS) {
    const el = contentArea.getByText(skill, { exact: true });
    if (await el.isVisible().catch(() => false)) {
      visibleCount++;
    }
  }

  expect(
    visibleCount,
    `Expected at least ${MIN_BADGE_COUNT} skill badges visible, found ${visibleCount}`
  ).toBeGreaterThanOrEqual(MIN_BADGE_COUNT);
});

// ---------------------------------------------------------------------------
// BADGE-02: badges carry category-color classes (cloud, language, database, ai-tooling)
// ---------------------------------------------------------------------------
test('BADGE-02: skill badges carry category-color classes per skillCategoryColors', async ({ page }) => {
  await page.goto(ROUTES.home);
  await expandSeniorRole(page);

  const contentArea = page.locator('[data-radix-collapsible-content]').first();

  for (const [category, skillText] of Object.entries(SKILL_CATEGORY_SAMPLES)) {
    const badgeEl = contentArea.getByText(skillText, { exact: true }).first();
    await expect(badgeEl).toBeVisible();

    // Read the element's own className (or closest ancestor with color class)
    const className = await badgeEl.evaluate((el) => {
      // Walk up to find the element that carries the background class
      let node: Element | null = el;
      while (node) {
        if (
          node.className &&
          (node.className.includes('bg-') || node.className.includes('accent'))
        ) {
          return node.className;
        }
        node = node.parentElement;
      }
      return '';
    });

    const expectedFragments = CATEGORY_CLASS_FRAGMENTS[category];
    const hasExpectedClass = expectedFragments.some((fragment) =>
      className.includes(fragment)
    );

    expect(
      hasExpectedClass,
      `${category} badge ("${skillText}") should have one of ${JSON.stringify(expectedFragments)} in class="${className}"`
    ).toBe(true);
  }
});

// ---------------------------------------------------------------------------
// BADGE-03: badge count is consistent across pt / en / de
// ---------------------------------------------------------------------------
const LOCALE_SWITCH_MAP = [
  { key: 'pt', optionLabel: 'Português', heroFragment: 'AI-augmented data engineering em escala' },
  { key: 'en', optionLabel: 'English', heroFragment: 'AI-augmented data engineering at scale' },
  { key: 'de', optionLabel: 'Deutsch', heroFragment: 'KI-gestütztes Data Engineering im Maßstab' },
] as const;

const SENIOR_SKILLS_SAMPLE = [
  'Python', 'SQL', 'Databricks', 'Claude Code', 'Devin',
];

for (const locale of LOCALE_SWITCH_MAP) {
  test(`BADGE-03-${locale.key.toUpperCase()}: skill badge count consistent in ${locale.key} locale`, async ({ page }) => {
    await page.goto(ROUTES.home);

    if (locale.key !== 'pt') {
      await switchLanguage(page, locale.optionLabel);
      await expect(page.locator('#hero-heading')).toContainText(locale.heroFragment);
    }

    await expandSeniorRole(page);

    const contentArea = page.locator('[data-radix-collapsible-content]').first();

    // Skills are locale-invariant identifiers — all 5 sample skills must appear
    for (const skill of SENIOR_SKILLS_SAMPLE) {
      const badge = contentArea.getByText(skill, { exact: true });
      await expect(
        badge,
        `Skill "${skill}" should be visible in ${locale.key} locale`
      ).toBeVisible();
    }
  });
}

// ---------------------------------------------------------------------------
// BADGE-04: skill badges are NOT focusable (presentational, not interactive)
// ---------------------------------------------------------------------------
test('BADGE-04: skill badges are not keyboard-focusable', async ({ page }) => {
  await page.goto(ROUTES.home);
  await expandSeniorRole(page);

  const contentArea = page.locator('[data-radix-collapsible-content]').first();
  const claudeBadge = contentArea.getByText('Claude Code', { exact: true }).first();
  await expect(claudeBadge).toBeVisible();

  // Check that the badge element (or its direct container) does not have
  // tabindex="0" or role="button"/"link" which would make it focusable.
  const isFocusable = await claudeBadge.evaluate((el) => {
    // Walk up to the nearest element that could be a badge container
    let node: Element | null = el;
    let depth = 0;
    while (node && depth < 4) {
      const tag = node.tagName.toLowerCase();
      const tabindex = node.getAttribute('tabindex');
      const role = node.getAttribute('role');
      // Interactive elements that would be focusable
      if (tag === 'button' || tag === 'a' || tag === 'input') return true;
      if (tabindex !== null && tabindex !== '-1') return true;
      if (role === 'button' || role === 'link') return true;
      node = node.parentElement;
      depth++;
    }
    return false;
  });

  expect(
    isFocusable,
    'Skill badges should NOT be keyboard-focusable (they are presentational)'
  ).toBe(false);
});

// ---------------------------------------------------------------------------
// BADGE-05: screenshot evidence — Senior Santander card in PT + dark mode
// ---------------------------------------------------------------------------
test('BADGE-05: screenshot evidence — Senior card PT default', async ({ page }) => {
  await page.goto(ROUTES.home);
  await expandSeniorRole(page);

  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  await page.screenshot({
    path: 'tests/e2e/__screenshots__/role-skill-badges-pt-light.png',
    fullPage: false,
  });
});

test('BADGE-06: screenshot evidence — Senior card PT dark mode', async ({ page }) => {
  await page.goto(ROUTES.home);

  // Enable dark mode via the theme toggle
  const themeToggle = page.locator('[aria-label*="dark"], [aria-label*="Dark"], [aria-label*="tema"], [aria-label*="theme"]').first();
  if (await themeToggle.isVisible().catch(() => false)) {
    await themeToggle.click();
  } else {
    // Fallback: force dark class via evaluate
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
  }

  await expandSeniorRole(page);

  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  await page.screenshot({
    path: 'tests/e2e/__screenshots__/role-skill-badges-pt-dark.png',
    fullPage: false,
  });
});
