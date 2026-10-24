/**
 * E2E — the one header's nav and the Hero CTA reach /projetos
 *
 *   PC-E2E-17: desktop header has Resume and Projects links, active state, Projects navigates
 *   PC-E2E-19: phone header shows the same links in a visible row, no menu button
 *   PC-E2E-20: Hero 3rd CTA "Ver projetos" navigates to /projetos
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Navigation to /projetos from header and hero', () => {
  test('PC-E2E-17: desktop header nav has Resume and Projects links and Projects navigates', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    const headerNav = page.locator('header nav[aria-label="Navegação principal"]');
    await expect(headerNav).toBeVisible();
    await expect(headerNav.locator('a')).toHaveCount(2);

    const resumeLink = headerNav.locator('a[href="/"]');
    const projLink = headerNav.locator('a[href="/projetos"]');
    await expect(resumeLink).toBeVisible();
    await expect(projLink).toBeVisible();
    await expect(resumeLink).toHaveAttribute('aria-current', 'page');
    await expect(projLink).not.toHaveAttribute('aria-current', 'page');
    await expect(page.locator('button[aria-label="Menu"]')).toHaveCount(0);

    await projLink.click();
    await expect(page).toHaveURL('/projetos');
    await expect(projLink).toHaveAttribute('aria-current', 'page');
    await expect(resumeLink).not.toHaveAttribute('aria-current', 'page');

    await expect(page.locator('[data-testid="project-card"]')).toHaveCount(4);
  });

  test('PC-E2E-19: phone header shows a visible nav row with Projects, no menu button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('button[aria-label="Menu"]')).toHaveCount(0);

    const headerNav = page.locator('header nav[aria-label="Navegação principal"]');
    await expect(headerNav).toBeVisible();
    await expect(headerNav.locator('a[href="/"]')).toBeVisible();
    const projLink = headerNav.locator('a[href="/projetos"]');
    await expect(projLink).toBeVisible();

    await projLink.click();
    await expect(page).toHaveURL('/projetos');
    await expect(projLink).toHaveAttribute('aria-current', 'page');
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
