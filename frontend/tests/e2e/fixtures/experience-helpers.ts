/**
 * Shared helpers for `#experiencia` section tests.
 *
 * Why this exists:
 *   `ExperienceSection.tsx` renders the same content TWICE — once inside a
 *   desktop Card (`hidden md:block`) and once inside a MobileCollapsibleSection
 *   (`md:hidden`). The mobile variant is itself a closed Collapsible that must
 *   be expanded before any role trigger is visible.
 *
 *   Naïve `page.locator('button').filter({ hasText: /Senior/ }).first()` calls
 *   pick the first DOM match regardless of CSS visibility — on mobile viewports
 *   the visible Senior trigger sits AFTER the (hidden) desktop one in DOM order,
 *   so `.first()` selects a `display:none` element and `toBeVisible()` times out.
 *
 *   Helpers below filter by `visible: true` and auto-expand the mobile section,
 *   so specs work identically on desktop and mobile projects.
 */
import { expect, type Locator, type Page } from '@playwright/test';

/** Matches the "Senior Data Engineer" role title across PT, EN, DE. */
export const SENIOR_ROLE_PATTERN = /Engenheiro de Dados Sênior|Senior Data Engineer/;

/** Matches the experience section title across PT, EN, DE. */
const SECTION_TITLE_PATTERN = /Experiência Profissional|Professional Experience|Berufserfahrung/;

/**
 * Expand the Senior Santander role collapsible regardless of viewport.
 * Returns the visible content area Locator for further assertions.
 */
export async function expandSeniorRole(
  page: Page,
  seniorPattern: RegExp = SENIOR_ROLE_PATTERN,
): Promise<Locator> {
  const section = page.locator('#experiencia');
  await section.scrollIntoViewIfNeeded();

  // portfolio-redesign-v1: the section renders ONCE for all viewports and its
  // heading button (Disclosure) is open by default. Only click it when it is
  // actually collapsed — clicking unconditionally would CLOSE the section and
  // hide every role trigger (the pre-redesign desktop had no section button).
  const sectionTrigger = section
    .locator('button')
    .filter({ hasText: SECTION_TITLE_PATTERN })
    .filter({ visible: true })
    .first();
  if ((await sectionTrigger.count()) > 0) {
    const sectionExpanded = await sectionTrigger.getAttribute('aria-expanded');
    if (sectionExpanded === 'false') {
      await sectionTrigger.click().catch(() => {});
    }
  }

  const seniorTrigger = section
    .locator('button, [role="button"]')
    .filter({ hasText: seniorPattern })
    .filter({ visible: true })
    .first();
  await expect(seniorTrigger).toBeVisible();

  // Open the collapsible if it's not already open. CollapsibleTrigger exposes
  // aria-expanded on itself, so we read it directly.
  const expanded = await seniorTrigger.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await seniorTrigger.click();
  }

  // Radix CollapsibleTrigger sets aria-controls to the content area's id;
  // use that linkage instead of searching for a [data-radix-*] attribute
  // (Radix Collapsible 1.x emits only data-state on the content, not a
  // type-specific data-* attribute).
  const contentId = await seniorTrigger.getAttribute('aria-controls');
  if (!contentId) {
    throw new Error(`Senior role trigger missing aria-controls; cannot locate content area`);
  }
  // ID contains characters (colons) invalid in CSS selectors; use the
  // attribute selector form which accepts any value literally.
  const contentArea = page.locator(`[id="${contentId}"]`);
  await expect(contentArea).toBeVisible();
  return contentArea;
}

/** Switch language via the combobox in the header. */
export async function switchLanguage(page: Page, optionLabel: string): Promise<void> {
  const combobox = page.locator('[role="combobox"]').first();
  await combobox.click();
  await page.getByRole('option', { name: optionLabel }).click();
}
