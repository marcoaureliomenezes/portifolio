/**
 * E2E — T-FE-QUAL-09 — EmailModal dark mode fix.
 *
 * AC-FQR-09: EmailModal respects design tokens; no hardcoded bg-white / bg-gray-50
 * visible in dark mode.
 *
 * Evidence: screenshots captured for operator review (visual closure).
 * Assertion: the modal root (DialogContent) does NOT carry a literal `bg-white`
 * class when the document root has class `dark`.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// Helper: open the EmailModal by clicking the email button in the header
async function openEmailModal(page: import('@playwright/test').Page) {
  // The ContactStrip renders an email trigger; the EmailModal is opened from it.
  // The trigger is a Button or anchor with aria-label or text containing "Email"/"E-mail".
  const emailTrigger = page
    .locator('header button, header a')
    .filter({ hasText: /e-?mail/i })
    .first();
  await expect(emailTrigger).toBeVisible();
  await emailTrigger.click();

  // Wait for the dialog to open
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(dialog).toBeVisible();
  return dialog;
}

// Helper: activate dark mode via the ThemeToggle (role="switch")
async function setDarkMode(page: import('@playwright/test').Page) {
  const themeToggle = page.locator('[role="switch"]').first();
  await expect(themeToggle).toBeVisible();

  // Only click if not already dark
  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  if (!isDark) {
    await themeToggle.click();
    // Wait for class propagation
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('dark')
    );
  }
}

// Helper: activate light mode
async function setLightMode(page: import('@playwright/test').Page) {
  const themeToggle = page.locator('[role="switch"]').first();
  await expect(themeToggle).toBeVisible();

  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  if (isDark) {
    await themeToggle.click();
    await page.waitForFunction(() =>
      !document.documentElement.classList.contains('dark')
    );
  }
}

test.describe('EmailModal dark mode — T-FE-QUAL-09', () => {
  test('DARK-01: dark mode — modal opens and does not have literal bg-white on root', async ({ page }) => {
    await page.goto(ROUTES.home);
    await setDarkMode(page);

    const dialog = await openEmailModal(page);

    // Assert: no `bg-white` or `bg-gray-50` class on the dialog content root
    // These are the hardcoded classes that break dark mode per the task description.
    const dialogClassList = await dialog.getAttribute('class') ?? '';
    expect(dialogClassList, 'Dialog root should not use literal bg-white in dark mode').not.toContain('bg-white');

    // Also check for bg-gray-50 inline-usage in the email display div
    // by querying the whole dialog subtree
    const hardcodedBgElement = dialog.locator('.bg-gray-50, .bg-white').first();
    const hardcodedCount = await hardcodedBgElement.count();
    // NOTE: this assertion will FAIL until T-FE-QUAL-09 is implemented — that is expected.
    // The spec documents the gap; the test becomes green once FE ships the token fix.
    expect(hardcodedCount, 'No bg-gray-50 or bg-white literals should exist in the modal after the fix').toBe(0);
  });

  test('DARK-02: dark mode — modal screenshot (evidence artifact)', async ({ page }) => {
    await page.goto(ROUTES.home);
    await setDarkMode(page);

    const dialog = await openEmailModal(page);
    await expect(dialog).toBeVisible();

    // Capture screenshot as evidence — stored in Playwright's snapshot dir
    await expect(dialog).toHaveScreenshot('email-modal-dark.png', {
      // Allow generous threshold for first-run baseline creation
      threshold: 0.3,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('DARK-03: light mode — modal screenshot (evidence artifact)', async ({ page }) => {
    await page.goto(ROUTES.home);
    await setLightMode(page);

    const dialog = await openEmailModal(page);
    await expect(dialog).toBeVisible();

    await expect(dialog).toHaveScreenshot('email-modal-light.png', {
      threshold: 0.3,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('DARK-04: modal closes when navigating away (no stale dialog)', async ({ page }) => {
    await page.goto(ROUTES.home);
    const dialog = await openEmailModal(page);
    await expect(dialog).toBeVisible();

    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
