/**
 * E2E — T-FE-QUAL-10: CV PDF download routing — single-PDF decision.
 *
 * Contract under test (operator decision 2026-05-17):
 *   A SINGLE PDF at /cv.pdf serves ALL locales.
 *   The Download CV <a href="/cv.pdf" download> element must:
 *     - Resolve to href="/cv.pdf" regardless of the active locale.
 *     - Remain href="/cv.pdf" after a locale round-trip (en → pt).
 *   The old locale-keyed routing (/cv-pt.pdf, /cv-en.pdf, /cv-de.pdf) and the
 *   404-fallback scenarios are SUPERSEDED by this decision and are not tested.
 *
 * CTA labels (from src/data/content/*.json heroCTAs.downloadCv):
 *   pt: "Baixar CV"
 *   en: "Download CV"
 *   de: "Lebenslauf herunterladen"
 *
 * Why href-inspection rather than waitForRequest:
 *   The <a download> element downloads in-browser; Playwright intercepts the
 *   download event rather than a resource fetch. Inspecting the resolved href
 *   directly on the anchor is the correct observable assertion.
 */

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPECTED_CV_HREF = '/cv.pdf';

const DOWNLOAD_CTA_LABELS = {
  pt: 'Baixar CV',
  en: 'Download CV',
  de: 'Lebenslauf herunterladen',
} as const;

const LOCALE_OPTION_LABELS = {
  pt: 'Português',
  en: 'English',
  de: 'Deutsch',
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Switch the language selector to the given option label. */
async function switchLocale(page: import('@playwright/test').Page, optionLabel: string) {
  const combobox = page.locator('[role="combobox"]').first();
  await combobox.click();
  await page.getByRole('option', { name: optionLabel }).click();
}

/**
 * Wait for the Download CV anchor to be visible, then return its href attribute.
 */
async function getDownloadCvHref(
  page: import('@playwright/test').Page,
  ctaLabel: string
): Promise<string> {
  const downloadCta = page.getByRole('link', { name: ctaLabel });
  await expect(downloadCta).toBeVisible();
  const href = await downloadCta.getAttribute('href');
  return href ?? '';
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('CV download routing — single /cv.pdf for all locales (T-FE-QUAL-10)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
    // Switch explicitly to PT so tests are locale-deterministic regardless of
    // what navigator.language the Playwright browser reports (Chromium defaults to
    // en-US, which would make the app load EN content instead of PT).
    await switchLocale(page, LOCALE_OPTION_LABELS.pt);
    await expect(page.locator('#hero-heading')).toBeVisible();
  });

  /**
   * Scenario 1 — PT locale: Download CV href is /cv.pdf.
   */
  test('S1: PT locale — Download CV href is /cv.pdf', async ({ page }) => {
    const href = await getDownloadCvHref(page, DOWNLOAD_CTA_LABELS.pt);
    expect(href).toBe(EXPECTED_CV_HREF);
  });

  /**
   * Scenario 2 — EN locale: Download CV href is /cv.pdf.
   */
  test('S2: EN locale — Download CV href is /cv.pdf', async ({ page }) => {
    await switchLocale(page, LOCALE_OPTION_LABELS.en);
    const href = await getDownloadCvHref(page, DOWNLOAD_CTA_LABELS.en);
    expect(href).toBe(EXPECTED_CV_HREF);
  });

  /**
   * Scenario 3 — DE locale: Download CV href is /cv.pdf.
   */
  test('S3: DE locale — Download CV href is /cv.pdf', async ({ page }) => {
    await switchLocale(page, LOCALE_OPTION_LABELS.de);
    const href = await getDownloadCvHref(page, DOWNLOAD_CTA_LABELS.de);
    expect(href).toBe(EXPECTED_CV_HREF);
  });

  /**
   * Scenario 4 — Locale round-trip (en → pt): href must remain /cv.pdf.
   * Confirms the href is not incorrectly cached or re-keyed after a switch.
   */
  test('S4: locale round-trip en → pt — href stays /cv.pdf', async ({ page }) => {
    await switchLocale(page, LOCALE_OPTION_LABELS.en);
    await switchLocale(page, LOCALE_OPTION_LABELS.pt);
    const href = await getDownloadCvHref(page, DOWNLOAD_CTA_LABELS.pt);
    expect(href).toBe(EXPECTED_CV_HREF);
  });
});
