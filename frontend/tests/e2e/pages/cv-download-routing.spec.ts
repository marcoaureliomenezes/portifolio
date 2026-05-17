/**
 * E2E — T-FE-QUAL-10: CV PDF locale-conditional download routing.
 *
 * Contract under test:
 *   - PT locale  → Download CV button targets /cv-pt.pdf
 *   - EN locale  → Download CV button targets /cv-en.pdf
 *                  If /cv-en.pdf 404s (operator hasn't supplied yet), the user
 *                  MUST still receive a downloadable PDF — fallback to /cv-pt.pdf.
 *   - DE locale  → Download CV button targets /cv-de.pdf
 *                  Same 404-fallback guarantee applies.
 *
 * Technique:
 *   page.route() intercepts every PDF request so the test never needs real PDF
 *   files served. page.waitForRequest() captures the URL the browser resolves to
 *   (after any client-side fallback redirect) before the actual network call.
 *
 * CTA labels (from src/data/content/*.json heroCTAs.downloadCv):
 *   pt: "Baixar CV"
 *   en: "Download CV"
 *   de: "Lebenslauf herunterladen"
 */

import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Expected PDF URL endings per locale. */
const CV_URLS = {
  pt: '/cv-pt.pdf',
  en: '/cv-en.pdf',
  de: '/cv-de.pdf',
  /** Fallback target when locale-specific PDF is unavailable. */
  fallback: '/cv-pt.pdf',
} as const;

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

/**
 * Register Playwright route handlers that:
 *   - Serve a 200 stub for the PT PDF (always present).
 *   - Return 404 for EN/DE PDFs (simulate operator not yet supplying them)
 *     when `simulateMissing` is true.
 *   - Fulfill normally when `simulateMissing` is false (simulate files present).
 */
async function stubPdfRoutes(
  page: import('@playwright/test').Page,
  simulateMissing: boolean
) {
  // PT PDF always available
  await page.route('**/cv-pt.pdf', route =>
    route.fulfill({ status: 200, contentType: 'application/pdf', body: Buffer.from('%PDF-1.4 stub') })
  );

  const missingStatus = simulateMissing ? 404 : 200;

  await page.route('**/cv-en.pdf', route =>
    route.fulfill({
      status: missingStatus,
      contentType: simulateMissing ? 'text/plain' : 'application/pdf',
      body: simulateMissing ? Buffer.from('not found') : Buffer.from('%PDF-1.4 stub'),
    })
  );

  await page.route('**/cv-de.pdf', route =>
    route.fulfill({
      status: missingStatus,
      contentType: simulateMissing ? 'text/plain' : 'application/pdf',
      body: simulateMissing ? Buffer.from('not found') : Buffer.from('%PDF-1.4 stub'),
    })
  );
}

/** Switch the language selector to the given option label. */
async function switchLocale(page: import('@playwright/test').Page, optionLabel: string) {
  const combobox = page.locator('[role="combobox"]').first();
  await combobox.click();
  await page.getByRole('option', { name: optionLabel }).click();
}

/**
 * Click the Download CV button and return the URL of the first PDF request
 * that the page fires. The button's <a download> triggers a navigation or
 * resource fetch; we capture whichever request the browser makes first.
 */
async function clickDownloadAndCaptureUrl(
  page: import('@playwright/test').Page,
  ctaLabel: string
): Promise<string> {
  const requestPromise = page.waitForRequest(req =>
    req.url().endsWith('.pdf')
  );
  // The CTA is an <a download> element — clicking it fires a resource request.
  const downloadCta = page.getByRole('link', { name: ctaLabel });
  await expect(downloadCta).toBeVisible();
  await downloadCta.click();
  const req = await requestPromise;
  return req.url();
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('CV download routing — locale-conditional PDF URL (T-FE-QUAL-10)', () => {

  /**
   * Scenario 1 — PT locale resolves to /cv-pt.pdf.
   * Baseline: the current single-file behavior extended to the locale route.
   */
  test('S1: PT locale — Download CV targets cv-pt.pdf', async ({ page }) => {
    await stubPdfRoutes(page, false);
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    // Default locale is PT — no switch needed
    const url = await clickDownloadAndCaptureUrl(page, DOWNLOAD_CTA_LABELS.pt);
    expect(url).toContain(CV_URLS.pt);
  });

  /**
   * Scenario 2 — EN locale resolves to /cv-en.pdf when file is present.
   */
  test('S2: EN locale (file present) — Download CV targets cv-en.pdf', async ({ page }) => {
    await stubPdfRoutes(page, false);
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    await switchLocale(page, LOCALE_OPTION_LABELS.en);

    const url = await clickDownloadAndCaptureUrl(page, DOWNLOAD_CTA_LABELS.en);
    expect(url).toContain(CV_URLS.en);
  });

  /**
   * Scenario 3 — DE locale resolves to /cv-de.pdf when file is present.
   */
  test('S3: DE locale (file present) — Download CV targets cv-de.pdf', async ({ page }) => {
    await stubPdfRoutes(page, false);
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    await switchLocale(page, LOCALE_OPTION_LABELS.de);

    const url = await clickDownloadAndCaptureUrl(page, DOWNLOAD_CTA_LABELS.de);
    expect(url).toContain(CV_URLS.de);
  });

  /**
   * Scenario 4 — EN locale with 404 falls back to /cv-pt.pdf.
   *
   * The operator hasn't yet supplied cv-en.pdf. The spec requires that the user
   * always ends up with a downloadable PDF — never an error. The FE implementation
   * must detect the 404 and redirect (or set the href) to the PT fallback.
   *
   * Observable assertion: the LAST PDF request the page makes for the download
   * action ends in /cv-pt.pdf (the fallback), not /cv-en.pdf.
   */
  test('S4: EN locale (cv-en.pdf absent) — fallback to cv-pt.pdf', async ({ page }) => {
    // Intercept cv-en.pdf and record every PDF request URL during the download flow.
    const pdfRequests: string[] = [];

    // PT always available
    await page.route('**/cv-pt.pdf', route => {
      pdfRequests.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'application/pdf', body: Buffer.from('%PDF-1.4 stub') });
    });

    // EN returns 404 — simulating missing asset
    await page.route('**/cv-en.pdf', route => {
      pdfRequests.push(route.request().url());
      return route.fulfill({ status: 404, contentType: 'text/plain', body: Buffer.from('not found') });
    });

    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();
    await switchLocale(page, LOCALE_OPTION_LABELS.en);

    const downloadCta = page.getByRole('link', { name: DOWNLOAD_CTA_LABELS.en });
    await expect(downloadCta).toBeVisible();

    // Wait for any PDF request after the click
    const requestPromise = page.waitForRequest(req => req.url().endsWith('.pdf'));
    await downloadCta.click();
    await requestPromise;

    // Give the app a tick to issue the fallback request if it probes first
    await page.waitForTimeout(500);

    // The last PDF URL touched must be the fallback (cv-pt.pdf)
    const lastPdfUrl = pdfRequests[pdfRequests.length - 1];
    expect(lastPdfUrl).toContain(CV_URLS.fallback);
    expect(lastPdfUrl).not.toContain(CV_URLS.en);
  });

  /**
   * Scenario 5 — DE locale with 404 falls back to /cv-pt.pdf.
   * Mirror of S4 for the German locale.
   */
  test('S5: DE locale (cv-de.pdf absent) — fallback to cv-pt.pdf', async ({ page }) => {
    const pdfRequests: string[] = [];

    await page.route('**/cv-pt.pdf', route => {
      pdfRequests.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'application/pdf', body: Buffer.from('%PDF-1.4 stub') });
    });

    await page.route('**/cv-de.pdf', route => {
      pdfRequests.push(route.request().url());
      return route.fulfill({ status: 404, contentType: 'text/plain', body: Buffer.from('not found') });
    });

    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();
    await switchLocale(page, LOCALE_OPTION_LABELS.de);

    const downloadCta = page.getByRole('link', { name: DOWNLOAD_CTA_LABELS.de });
    await expect(downloadCta).toBeVisible();

    const requestPromise = page.waitForRequest(req => req.url().endsWith('.pdf'));
    await downloadCta.click();
    await requestPromise;

    await page.waitForTimeout(500);

    const lastPdfUrl = pdfRequests[pdfRequests.length - 1];
    expect(lastPdfUrl).toContain(CV_URLS.fallback);
    expect(lastPdfUrl).not.toContain(CV_URLS.de);
  });

  /**
   * Scenario 6 — Switching from EN back to PT restores the PT URL.
   * Confirms the locale routing is not cached incorrectly on re-selection.
   */
  test('S6: switch en → pt restores cv-pt.pdf target', async ({ page }) => {
    await stubPdfRoutes(page, false);
    await page.goto(ROUTES.home);
    await expect(page.locator('#hero-heading')).toBeVisible();

    await switchLocale(page, LOCALE_OPTION_LABELS.en);
    await switchLocale(page, LOCALE_OPTION_LABELS.pt);

    const url = await clickDownloadAndCaptureUrl(page, DOWNLOAD_CTA_LABELS.pt);
    expect(url).toContain(CV_URLS.pt);
  });
});
