/**
 * E2E stubs — Header CTA and Hero CTA navigation to /projetos
 *
 * AC-PC-05: headerNavRoutes replaces navRoutes; header has nav link "Projetos"
 * AC-PC-09: HeaderDesktop + HeaderMobile + Hero 3rd CTA all navigate to /projetos
 *
 * Tests:
 *   PC-E2E-17: desktop header nav link "Projetos" navigates to /projetos
 *   PC-E2E-19: mobile header sheet exposes "Projetos" link and it navigates
 *   PC-E2E-20: Hero 3rd CTA "Ver projetos" navigates to /projetos
 *
 * Activated in: T-PC-C-08 (after T-PC-C-04 Header CTA and T-PC-C-05 Hero CTA are delivered)
 * Implementation contract: C-10, C-11, C-12 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Navigation to /projetos from header and hero', () => {
  test('PC-E2E-17: desktop header nav link "Projetos" navigates to /projetos', async ({ page }) => {
    // Given: home page at desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    // Then: nav link "Projetos" visible in header (AC-PC-09 + AC-PC-05)
    // The nav must have aria-label="Navegação principal" or equivalent
    const headerNav = page.locator('header nav[aria-label*="avega"], header nav[aria-label*="rincipal"]');
    await expect(headerNav).toBeVisible();

    const projLink = headerNav.locator('a[href="/projetos"]');
    await expect(projLink).toBeVisible();

    // When: user clicks the header nav link
    await projLink.click();

    // Then: URL becomes /projetos
    await expect(page).toHaveURL('/projetos');

    // Then: index page with 3 cards rendered
    const cards = page.locator('[data-testid="project-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('PC-E2E-19: mobile header contains "Projetos" nav link and it navigates', async ({ page }) => {
    // Given: home page at mobile viewport
    // Note: mobile header uses inline nav links (no dialog/sheet — T-PC-C-04 deviation note).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    // Then: mobile header nav exposes an inline "Projetos" link (aria-label="Navegação principal")
    const mobileHeaderNav = page.locator('.block.md\\:hidden nav[aria-label*="avega"]');
    await expect(mobileHeaderNav).toBeVisible();

    const projLink = mobileHeaderNav.locator('a[href="/projetos"]');
    await expect(projLink).toBeVisible();

    // When: user clicks the Projetos link
    await projLink.click();

    // Then: URL becomes /projetos
    await expect(page).toHaveURL('/projetos');
  });

  test('PC-E2E-20: Hero 3rd CTA "Ver projetos" navigates to /projetos', async ({ page }) => {
    // Given: home page
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    // Then: Hero section has a 3rd CTA with text matching i18n key projects.cta.seeProjects
    // Default PT locale: "Ver projetos"
    // We search by text pattern rather than hardcoded string to be i18n-resilient
    const heroCTA = page.locator('#hero-heading').locator('..').locator('a[href="/projetos"], button + a[href="/projetos"]');
    // Alternative: look for the CTA by its data-testid
    const heroCTAByTestId = page.locator('[data-testid="hero-cta-projects"]');
    const heroCTAByText = page.getByRole('link', { name: /ver projetos|see projects|projekte/i });

    // Try test-id first, fall back to text match
    const ctaEl = await heroCTAByTestId.count() > 0 ? heroCTAByTestId : heroCTAByText;
    await expect(ctaEl.first()).toBeVisible();

    // When: user clicks the Hero CTA
    await ctaEl.first().click();

    // Then: URL becomes /projetos
    await expect(page).toHaveURL('/projetos');
  });
});
