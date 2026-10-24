/**
 * E2E — Library detail page (/projetos/dadaia-workspace)
 *
 * rc-2 (ADR-PC2-R2-01): dadaia-workspace was retyped case-study → library.
 * This file replaces project-detail-case-study.spec.ts (no case-study
 * projects remain in content).
 *
 * AC-PC-04: dynamic routing dispatches to correct template
 * AC-PC-11: useDocumentSeo sets document.title (no react-helmet-async)
 * AC-PC2-R2-02: library template renders uvx snippet, version and PyPI link
 * AC-PC2-R2-04: diagram renders as theme-aware img pair (no <picture>/<source>)
 *
 * Tests:
 *   PC-E2E-06: /projetos/dadaia-workspace renders Library template with h1 and sections
 *   PC-E2E-22: document.title is project-specific SEO title (not generic)
 *   PC-E2E-10: scenes (video or light/dark svg pair) follow the How it works heading
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
    await expect(install).toContainText('uvx dadaia-workspace init <dir> --harness <name>');

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

  test('PC-E2E-10: "How it works" is followed by scenes, each a video or a light/dark svg pair (dadaia-workspace)', async ({ page }) => {
    // Given: /projetos/dadaia-workspace (locale pinned to pt-BR by the config)
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');

    // Then: the "How it works" heading is present (libraryPage.howTitle)
    await expect(page.getByRole('heading', { name: /como funciona/i }).first()).toBeVisible();

    // Then: media mounts lazily, so bring every section into view first
    const sections = page.locator('[data-testid="project-section"]');
    const total = await sections.count();
    for (let i = 0; i < total; i++) await sections.nth(i).scrollIntoViewIfNeeded();

    // Then: sections that carry a video or the svg pair are the scenes; there is at least one
    const scenes = sections.filter({
      has: page.locator('video, [data-testid="diagram-light"]'),
    });
    expect(await scenes.count()).toBeGreaterThan(0);

    // Then: every svg scene holds both variants, with a non-empty alt on the light one
    const lights = scenes.locator('[data-testid="diagram-light"]');
    const svgCount = await lights.count();
    for (let i = 0; i < svgCount; i++) {
      expect(((await lights.nth(i).getAttribute('alt')) ?? '').trim().length).toBeGreaterThan(0);
    }
    await expect(scenes.locator('[data-testid="diagram-dark"]')).toHaveCount(svgCount);
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
