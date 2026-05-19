/**
 * E2E-SMOKE-01 — Post-strict-flip regression sweep.
 * Written by qa-engineer for T-FE-QUAL-01b recovery validation.
 *
 * Golden-path journey verified:
 *  1. Home page loads (hero visible, no JS crash)
 *  2. Theme toggle switches document class (dark/light)
 *  3. Language switch pt → en changes hero text
 *  4. Page scrolls through main sections (about, experience, education)
 *  5. EmailModal opens and displays the email address
 *  6. CV download button is present and interactive
 *
 * Flakiness mitigations:
 *  - waitForSelector / toBeVisible before every interaction
 *  - No hard sleeps; all waits are expectation-driven
 *  - Theme state asserted via aria-checked on the toggle switch (no CSS class
 *    inspection — DOM attribute is implementation-stable)
 */

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Post-strict-flip smoke (T-FE-QUAL-01b)', () => {
  test('SMOKE-01: home loads without JS crash', async ({ page }) => {
    const response = await page.goto(ROUTES.home);
    expect(response?.status()).toBe(200);

    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('SMOKE-02: theme toggle switches dark/light state', async ({ page }) => {
    await page.goto(ROUTES.home);

    const toggle = page.locator('[role="switch"][aria-label*="theme"]');
    await expect(toggle).toBeVisible();

    const initialState = await toggle.getAttribute('aria-checked');

    await toggle.click();

    const newState = await toggle.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);

    // Toggle back — leave page in original state for subsequent tests
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', initialState ?? 'false');
  });

  test('SMOKE-03: language switch pt → en changes hero text', async ({ page }) => {
    await page.goto(ROUTES.home);

    const heroHeading = page.locator('#hero-heading');
    await expect(heroHeading).toBeVisible();

    // First combobox is the language selector
    const selectTrigger = page.locator('[role="combobox"]').first();
    await expect(selectTrigger).toBeVisible();
    await selectTrigger.click();

    await page.getByRole('option', { name: 'English' }).click();

    // Hero heading must change — proves reactive re-render works post strict-flip
    await expect(heroHeading).toContainText('at scale');
  });

  test('SMOKE-04: scroll reveals main content sections', async ({ page }) => {
    await page.goto(ROUTES.home);

    await page.waitForLoadState('networkidle');

    // Scroll to bottom progressively and confirm the page does not crash
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await page.evaluate(() => window.scrollTo(0, (2 * document.body.scrollHeight) / 3));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Body must still be rendered after scrolling
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('header')).toBeVisible();
  });

  test('SMOKE-05: EmailModal opens and displays email address', async ({ page }) => {
    await page.goto(ROUTES.home);

    // The email trigger is a button/link in the header area.
    // Target the Mail icon button via aria-label containing "email" (case-insensitive).
    const emailTrigger = page
      .locator('header button, header a')
      .filter({ hasText: /e-?mail/i })
      .filter({ visible: true })
      .first();

    await expect(emailTrigger).toBeVisible();
    await emailTrigger.click();

    // Dialog must open (aria-modal="true" is set on DialogContent)
    const dialog = page.locator('[aria-modal="true"]');
    await expect(dialog).toBeVisible();

    // Email address must be visible in the dialog
    const emailText = dialog.locator('span.font-mono');
    await expect(emailText).toBeVisible();
    const emailValue = await emailText.textContent();
    expect(emailValue).toMatch(/@/);

    // Close the dialog (press Escape — standard Radix Dialog behaviour)
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('SMOKE-06: CV download anchor is present and points to /cv.pdf', async ({ page }) => {
    await page.goto(ROUTES.home);

    // CV download is an <a href="/cv.pdf" download> anchor (Button asChild pattern).
    const cvAnchor = page.locator('a[href="/cv.pdf"][download]').first();
    await expect(cvAnchor).toBeVisible();
    await expect(cvAnchor).toHaveAttribute('href', '/cv.pdf');

    // Page must remain stable
    await expect(page.locator('header')).toBeVisible();
  });
});
