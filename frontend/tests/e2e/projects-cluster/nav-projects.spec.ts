/**
 * E2E — the one header's nav reaches /projetos
 *
 *   PC-E2E-17: desktop header has Resume and Projects links, active state, Projects navigates
 *   PC-E2E-19: phone header shows the same links in a visible row, no menu button
 *   PC-E2E-20: the header Projects link navigates to /projetos
 */
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

const projectsName: string = JSON.parse(
  readFileSync('public/content/pt.json', 'utf8'),
).siteChrome.nav.projects;

test.describe('Navigation to /projetos from the header', () => {
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

  test('PC-E2E-20: header Projects link navigates to /projetos', async ({ page }) => {
    await page.goto(ROUTES.home);
    await page.waitForLoadState('networkidle');

    await page.getByRole('banner').getByRole('link', { name: projectsName }).click();

    await expect(page).toHaveURL('/projetos');
  });
});
