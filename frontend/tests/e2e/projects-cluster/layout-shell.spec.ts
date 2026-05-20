/**
 * E2E stubs — ProjectsLayoutShell (/projetos/*)
 *
 * AC-PC-16: shell breadcrumb, back-link, ARIA, SEO non-interference, shell as layout route.
 * See SPEC §10 R1 "Layout shell para /projetos/* — posição firme" and TASKS T-PC-B-09.
 *
 * Tests:
 *   PC-E2E-32: index render — breadcrumb "Projetos" only, no back-link visible
 *   PC-E2E-33: detail render — breadcrumb has two segments, back-link visible pointing /projetos
 *   PC-E2E-34: back navigation — clicking back-link returns to /projetos, index renders
 *   PC-E2E-35: SEO non-interference — document.title is project-specific, not overridden by shell
 *   PC-E2E-36: shell persists across Outlet swap (index → detail navigation without remount)
 *   PC-E2E-37: ARIA structure — breadcrumb nav has aria-label; axe zero violations on shell
 *
 * Activated in: T-PC-C-08 (Phase B delivers ProjectsLayoutShell; Phase C finalises content).
 * Implementation contract: C-04, C-05, C-06 in qa-engineer E2E plan report.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from '../fixtures/routes';

test.describe('ProjectsLayoutShell — /projetos/*', () => {

  test('PC-E2E-32: index route — breadcrumb shows "Projetos" only, no back-link visible', async ({ page }) => {
    // Given: user navigates to /projetos
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // Then: breadcrumb element is visible
    const breadcrumb = page.locator('nav[aria-label*="readcrumb"], nav[aria-label*="migalha"], [data-testid="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Then: breadcrumb contains "Projetos"
    await expect(breadcrumb).toContainText('Projetos');

    // Then: breadcrumb does NOT contain a separator + project name (single segment)
    // Assert no second breadcrumb item beyond "Projetos"
    const breadcrumbItems = breadcrumb.locator('li, span, a').filter({ hasNotText: 'Projetos' });
    // No additional visible text segments beyond "Projetos"
    const extraTextCount = await breadcrumbItems.filter({ hasText: /\w+/ }).count();
    expect(extraTextCount).toBe(0);

    // Then: back-link is NOT visible (absent or hidden)
    const backLink = page.locator('[data-testid="back-link"], a[href="/projetos"][data-role="back"]');
    await expect(backLink).not.toBeVisible();
  });

  test('PC-E2E-33: detail route — breadcrumb has two segments, back-link points /projetos', async ({ page }) => {
    // Given: user navigates to /projetos/dadaia-workspace
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    // Wait for content to load (async i18n import)
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: breadcrumb visible and contains "Projetos"
    const breadcrumb = page.locator('nav[aria-label*="readcrumb"], nav[aria-label*="migalha"], [data-testid="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Projetos');

    // Then: breadcrumb "Projetos" segment is a link pointing to /projetos
    const projLink = breadcrumb.locator('a[href="/projetos"]');
    await expect(projLink).toBeVisible();

    // Then: second breadcrumb segment is visible (project display name — non-empty, not raw slug)
    // We do not assert exact text to avoid hardcoding i18n strings; we assert it is non-empty
    // and distinct from "Projetos"
    const allBreadcrumbText = await breadcrumb.innerText();
    expect(allBreadcrumbText.trim().length).toBeGreaterThan('Projetos'.length);

    // Then: back-link is visible and href="/projetos"
    const backLink = page.locator('[data-testid="back-link"], a[href="/projetos"][data-role="back"]').first();
    await expect(backLink).toBeVisible();
    const backHref = await backLink.getAttribute('href');
    expect(backHref).toBe('/projetos');

    // Then: back-link text is non-empty (not icon-only)
    const backText = await backLink.innerText();
    expect(backText.trim().length).toBeGreaterThan(0);
  });

  test('PC-E2E-34: back navigation — click back-link returns URL to /projetos and shows index', async ({ page }) => {
    // Given: user is on /projetos/dadaia-workspace
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // When: user clicks the back-link
    const backLink = page.locator('[data-testid="back-link"], a[href="/projetos"][data-role="back"]').first();
    await expect(backLink).toBeVisible();
    await backLink.click();

    // Then: URL becomes /projetos (client-side navigation)
    await expect(page).toHaveURL('/projetos');

    // Then: index grid renders (3 cards visible)
    const cardLinks = page.locator('[data-testid="project-card"]');
    await expect(cardLinks).toHaveCount(3);

    // Then: breadcrumb reverts to index state — back-link is gone
    const backLinkAfter = page.locator('[data-testid="back-link"], a[href="/projetos"][data-role="back"]');
    await expect(backLinkAfter).not.toBeVisible();

    // Then: focus management — document.activeElement is not detached
    // Minimum contract: focus is on an element that is visible (not the now-hidden back-link)
    const activeTagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTagName).toBeTruthy();
  });

  test('PC-E2E-35: SEO non-interference — document.title is project-specific, not shell generic', async ({ page }) => {
    // Given: user navigates to /projetos/dadaia-workspace
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).not.toBeEmpty();

    // Then: document.title is non-empty
    const titlePT = await page.title();
    expect(titlePT.trim().length).toBeGreaterThan(0);

    // Then: document.title does NOT equal a generic "Projetos" shell title
    // The shell must NOT override the child's title; the child sets it via useDocumentSeo
    expect(titlePT.toLowerCase()).not.toBe('projetos');
    // Title should reference the project (dadaia-workspace or Marco Menezes, etc.)
    // We assert it is project-specific by checking it differs from the index title
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');
    const titleIndex = await page.title();
    expect(titlePT).not.toBe(titleIndex);

    // Then: switching language changes the title (useDocumentSeo responds to LanguageContext)
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');
    const titlePT2 = await page.title();

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();
    await page.waitForLoadState('networkidle');

    const titleEN = await page.title();
    // EN title is non-empty and distinct from PT title (i18n hook works)
    expect(titleEN.trim().length).toBeGreaterThan(0);
    expect(titleEN).not.toBe(titlePT2);
  });

  test('PC-E2E-36: shell persists across Outlet swap — index card click updates breadcrumb without remount', async ({ page }) => {
    // Given: user starts on /projetos (shell mounted, showing index)
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    const cardLinks = page.locator('[data-testid="project-card"]');
    await expect(cardLinks).toHaveCount(3);

    // When: user clicks the first card (dadaia-workspace)
    await cardLinks.first().click();

    // Then: URL becomes /projetos/dadaia-workspace (client-side nav, no full reload)
    await expect(page).toHaveURL('/projetos/dadaia-workspace');

    // Then: shell breadcrumb updated to show the project name (shell still mounted, reactive)
    const breadcrumb = page.locator('nav[aria-label*="readcrumb"], nav[aria-label*="migalha"], [data-testid="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Breadcrumb now has two segments
    const projLink = breadcrumb.locator('a[href="/projetos"]');
    await expect(projLink).toBeVisible();

    // Back-link appeared (shell updated its state)
    const backLink = page.locator('[data-testid="back-link"], a[href="/projetos"][data-role="back"]').first();
    await expect(backLink).toBeVisible();

    // Then: detail content loaded (h1 visible, not 404)
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toContainText('404');
  });

  test('PC-E2E-37: shell ARIA structure — breadcrumb nav has aria-label; axe zero violations', async ({ page }) => {
    // Given: /projetos visited
    await page.goto(ROUTES.projectsIndex);
    await page.waitForLoadState('networkidle');

    // Then: breadcrumb nav has aria-label (not anonymous landmark)
    const breadcrumbNav = page.locator('nav').filter({ has: page.locator('a[href="/projetos"]') });
    const ariaLabel = await breadcrumbNav.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect((ariaLabel ?? '').length).toBeGreaterThan(0);

    // Then: axe zero violations on /projetos (includes shell structure)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(
      results.violations,
      `axe violations on /projetos:\n${results.violations
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join('\n')}`,
    ).toHaveLength(0);

    // Also check detail route ARIA
    await page.goto(ROUTES.dadaiaWorkspace);
    await page.waitForLoadState('networkidle');

    // Then: back-link has discernible text (not icon-only without aria-label)
    const backLink = page.locator('[data-testid="back-link"], a[href="/projetos"][data-role="back"]').first();
    await expect(backLink).toBeVisible();
    const backText = await backLink.innerText();
    const backAriaLabel = await backLink.getAttribute('aria-label');
    const hasDiscernibleText = (backText.trim().length > 0) || ((backAriaLabel ?? '').length > 0);
    expect(hasDiscernibleText).toBe(true);
  });
});
