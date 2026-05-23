/**
 * E2E — T-FE-QUAL-08 — RoleCollapsible dead-props cleanup smoke.
 *
 * Goal: regression detector for the dead-props refactor.
 * We test the observable contract (expand / collapse / content visible), not
 * the internal prop shape. If a refactor breaks the rendering, these fail.
 *
 * The ExperienceSection (`#experiencia`) contains RoleCollapsible components
 * for the Santander multi-role experience (3 roles, all collapsible on desktop).
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';
import { SENIOR_ROLE_PATTERN, expandSeniorRole } from '../fixtures/experience-helpers';

test.describe('RoleCollapsible smoke — T-FE-QUAL-08', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.locator('#experiencia').scrollIntoViewIfNeeded();
  });

  test('ROLE-01: experience section is present and contains collapsible triggers', async ({ page }) => {
    const section = page.locator('#experiencia');
    await expect(section).toBeVisible();

    const seniorTrigger = section
      .locator('button, [role="button"]')
      .filter({ hasText: SENIOR_ROLE_PATTERN })
      .filter({ visible: true })
      .first();
    await expect(seniorTrigger).toBeVisible();
  });

  test('ROLE-02: clicking a collapsed role reveals content', async ({ page }) => {
    const contentArea = await expandSeniorRole(page);
    await expect(contentArea).toBeVisible();
  });

  test('ROLE-03: clicking an open role collapses it again', async ({ page }) => {
    const contentArea = await expandSeniorRole(page);
    await expect(contentArea).toBeVisible();

    const section = page.locator('#experiencia');
    const seniorTrigger = section
      .locator('button, [role="button"]')
      .filter({ hasText: SENIOR_ROLE_PATTERN })
      .filter({ visible: true })
      .first();
    await seniorTrigger.click();
    await expect(contentArea).not.toBeVisible();
  });

  test('ROLE-04: page renders without JS errors from RoleCollapsible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await expandSeniorRole(page);

    const componentErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('ResizeObserver')
    );
    expect(componentErrors, `Console errors: ${componentErrors.join(', ')}`).toHaveLength(0);
  });
});
