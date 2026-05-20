/**
 * E2E stubs — Case Study detail page (/projetos/dadaia-workspace)
 *
 * AC-PC-04: dynamic routing dispatches to correct template
 * AC-PC-11: useDocumentSeo sets document.title (no react-helmet-async)
 * AC-PC-16: shell breadcrumb and back-link present
 *
 * Tests:
 *   PC-E2E-06: /projetos/dadaia-workspace renders CaseStudy template with h1 and sections
 *   PC-E2E-22: document.title is project-specific SEO title (not generic)
 *   PC-E2E-10: diagram picture element present with dark-mode source and non-empty alt
 *
 * Activated in: T-PC-C-08
 * Implementation contract: C-04, C-06, C-13 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Detail page — dadaia-workspace (kind: case-study)', () => {
  test('PC-E2E-06: renders CaseStudy template with visible h1 and no 404', async ({ page }) => {
    // Given: user navigates to dadaia-workspace detail
    const response = await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');

    // Then: HTTP 200 (SPA shell)
    expect(response?.status()).toBe(200);

    // Then: h1 visible and not "404"
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // Then: at least one project section rendered (CaseStudy has sections[])
    const sections = page.locator('[data-testid="project-section"]');
    await expect(sections).toHaveCount({ min: 1 });

    // Then: GitHub CTA link present (CaseStudyProject.cta.github)
    const githubLink = page.locator('a[href*="github.com"]').first();
    await expect(githubLink).toBeVisible();
  });

  test('PC-E2E-22: document.title is project-specific SEO title', async ({ page }) => {
    // Given: user navigates to dadaia-workspace
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: title is non-empty and project-specific (not generic "Projetos")
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
    expect(title.toLowerCase()).not.toBe('projetos');
  });

  test('PC-E2E-10: diagram picture element with dark source and non-empty alt (dadaia-workspace)', async ({ page }) => {
    // Given: /projetos/dadaia-workspace (has diagram field)
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');

    // Then: <picture> element present
    const picture = page.locator('picture').first();
    await expect(picture).toBeVisible();

    // Then: contains a <source> for dark mode
    const darkSource = picture.locator('source[media*="prefers-color-scheme: dark"]');
    await expect(darkSource).toHaveCount({ min: 1 });

    // Then: <img> inside picture has non-empty alt
    const img = picture.locator('img');
    await expect(img).toBeVisible();
    const alt = await img.getAttribute('alt');
    expect((alt ?? '').trim().length).toBeGreaterThan(0);
  });

  test('PC-E2E-09: unknown slug renders NotFound without URL change', async ({ page }) => {
    // Given: user navigates to an invalid slug
    await page.goto('/projetos/slug-inexistente');
    await page.waitForLoadState('networkidle');

    // Then: URL remains unchanged (no redirect to / or /404)
    await expect(page).toHaveURL('/projetos/slug-inexistente');

    // Then: a NotFound UI is visible (h1 or body contains "not found" / "não encontrado" / 404)
    const body = page.locator('body');
    const bodyText = (await body.innerText()).toLowerCase();
    const isNotFound = bodyText.includes('404') || bodyText.includes('não encontrada') || bodyText.includes('not found');
    expect(isNotFound).toBe(true);
  });
});
