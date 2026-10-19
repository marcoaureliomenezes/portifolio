/**
 * E2E — Library detail page (/projetos/dadaia-workspace)
 *
 * rc-2 (ADR-PC2-R2-01): dadaia-workspace was retyped case-study → library.
 * This file replaces project-detail-case-study.spec.ts (no case-study
 * projects remain in content).
 *
 * AC-PC-04: dynamic routing dispatches to correct template
 * AC-PC-11: useDocumentSeo sets document.title (no react-helmet-async)
 * AC-PC2-R2-02: library template renders pip snippet, version and PyPI link
 * AC-PC2-R2-04: diagram renders as theme-aware img pair (no <picture>/<source>)
 *
 * Tests:
 *   PC-E2E-06: /projetos/dadaia-workspace renders Library template with h1 and sections
 *   PC-E2E-22: document.title is project-specific SEO title (not generic)
 *   PC-E2E-10: theme-aware diagram imgs present with non-empty alt
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

test.describe('Detail page — dadaia-workspace (kind: library)', () => {
  test('PC-E2E-06: renders Library template with visible h1, sections and install block', async ({ page }) => {
    // Given: user navigates to dadaia-workspace detail
    const response = await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');

    // Then: HTTP 200 (SPA shell)
    expect(response?.status()).toBe(200);

    // Then: h1 visible and not "404"
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');

    // Then: at least one project section rendered (LibraryProject has sections[])
    const sections = page.locator('[data-testid="project-section"]');
    await expect(sections.first()).toBeVisible();

    // Then: install block shows the pip command (AC-PC2-R2-02)
    const install = page.locator('[data-testid="install-command"]');
    await expect(install).toBeVisible();
    await expect(install).toContainText('pip install dadaia-workspace');

    // Then: PyPI and GitHub links present
    await expect(page.locator('a[href*="pypi.org/project/dadaia-workspace"]').first()).toBeVisible();
    await expect(page.locator('a[href*="github.com"]').first()).toBeVisible();
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

  test('PC-E2E-10: theme-aware diagram img pair with non-empty alt (dadaia-workspace)', async ({ page }) => {
    // Given: /projetos/dadaia-workspace (has diagram + diagramDark fields)
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');

    // Then: NO <picture>/<source media=prefers-color-scheme> — variant switching
    // is class-based via html.dark (AC-PC2-R2-04)
    await expect(page.locator('source[media*="prefers-color-scheme"]')).toHaveCount(0);

    // Then: light variant visible by default-dark? Theme default is dark — the
    // dark variant must be the visible one when html has class "dark".
    const lightImg = page.locator('[data-testid="diagram-light"]').first();
    const darkImg = page.locator('[data-testid="diagram-dark"]').first();
    await expect(lightImg).toHaveCount(1);
    await expect(darkImg).toHaveCount(1);

    const htmlIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    if (htmlIsDark) {
      await expect(darkImg).toBeVisible();
      await expect(lightImg).toBeHidden();
    } else {
      await expect(lightImg).toBeVisible();
      await expect(darkImg).toBeHidden();
    }

    // Then: non-empty alt on the visible variant
    const alt = await (htmlIsDark ? darkImg : lightImg).getAttribute('alt');
    expect((alt ?? '').trim().length).toBeGreaterThan(0);
  });

  test('PC-E2E-09: unknown slug renders NotFound without URL change', async ({ page }) => {
    // Given: user navigates to an invalid slug
    await page.goto(ROUTES.projectsNotFound);
    await page.waitForLoadState('networkidle');

    // Then: URL preserved (no redirect)
    expect(page.url()).toContain('/projetos/does-not-exist');

    // Then: NotFound content rendered
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});
