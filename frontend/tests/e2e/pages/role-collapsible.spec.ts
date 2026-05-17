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

test.describe('RoleCollapsible smoke — T-FE-QUAL-08', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
    // Ensure the experience section is in view
    await page.locator('#experiencia').scrollIntoViewIfNeeded();
  });

  test('ROLE-01: experience section is present and contains collapsible triggers', async ({ page }) => {
    const section = page.locator('#experiencia');
    await expect(section).toBeVisible();

    // Desktop view: the Card wrapper is visible; CollapsibleTrigger buttons exist
    const triggers = page.locator('[data-radix-collection-item], [data-state]').filter({ hasText: '' });

    // At minimum, there is at least one CollapsibleTrigger — check for role title text
    // Senior Data Engineer is the first role in the Santander experience
    const seniorTrigger = page.locator('button, [role="button"]').filter({ hasText: 'Senior Data Engineer' }).first();
    await expect(seniorTrigger).toBeVisible();
  });

  test('ROLE-02: clicking a collapsed role reveals content', async ({ page }) => {
    // Find the Senior Data Engineer collapsible trigger
    const seniorTrigger = page.locator('button, [role="button"]').filter({ hasText: 'Senior Data Engineer' }).first();
    await expect(seniorTrigger).toBeVisible();

    // Collapsible starts closed (defaultOpen = false)
    // The CollapsibleContent is hidden when closed; click to open
    await seniorTrigger.click();

    // After clicking, responsibilities content should be visible
    // "Responsibilities:" / "Responsabilidades:" depending on language — use a more
    // robust selector: look for the responsibility list items inside the card
    const contentArea = page.locator('[data-radix-collapsible-content]').first();
    await expect(contentArea).toBeVisible();
  });

  test('ROLE-03: clicking an open role collapses it again', async ({ page }) => {
    const seniorTrigger = page.locator('button, [role="button"]').filter({ hasText: 'Senior Data Engineer' }).first();
    await expect(seniorTrigger).toBeVisible();

    // Open
    await seniorTrigger.click();
    const contentArea = page.locator('[data-radix-collapsible-content]').first();
    await expect(contentArea).toBeVisible();

    // Close
    await seniorTrigger.click();
    // Radix sets data-state="closed" and hides content; the element may still be in DOM
    // but not visible. We check it's no longer visible OR data-state is closed.
    await expect(contentArea).not.toBeVisible();
  });

  test('ROLE-04: page renders without JS errors from RoleCollapsible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.locator('#experiencia').scrollIntoViewIfNeeded();

    // Click a trigger to exercise the expand path
    const seniorTrigger = page.locator('button, [role="button"]').filter({ hasText: 'Senior Data Engineer' }).first();
    if (await seniorTrigger.isVisible()) {
      await seniorTrigger.click();
    }

    // No console errors from this component
    const componentErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('ResizeObserver')
    );
    expect(componentErrors, `Console errors: ${componentErrors.join(', ')}`).toHaveLength(0);
  });
});
