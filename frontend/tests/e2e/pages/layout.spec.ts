/**
 * Layout E2E — mobile/desktop layout correctness.
 *
 * These tests catch regressions that unit tests cannot observe:
 *   - Header height on mobile (must not be a 240px LinkedIn-style banner)
 *   - Absence of avatar inside the mobile header
 *   - Hamburger button presence on mobile
 *   - Body content centered on desktop (not left-flush)
 *   - No visible sidebar on mobile (AppSidebar is hidden md:flex)
 *   - Main element width matches viewport on mobile
 *   - Hero heading is visible and below the header
 *   - No overlap between header and hero section
 *   - Section DOM order: #experiencia above #educacao
 *   - Certifications section renders without horizontal overflow
 *
 * Viewport conventions used in this file:
 *   mobile  : 390×844  (iPhone 14 logical pixels)
 *   desktop : 1280×800 (generic laptop)
 *
 * Run with:
 *   E2E_BASE_URL=http://localhost:8000 npx playwright test tests/e2e/pages/layout.spec.ts --reporter=list
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:8080';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

// ---------------------------------------------------------------------------
// Test 1 — Mobile header is slim (≤ 80 px), no avatar, hamburger visible
// ---------------------------------------------------------------------------
test('T-LAY-01: mobile header height ≤ 80 px, no avatar, hamburger present', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: MOBILE });
  const page = await ctx.newPage();

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');

  // Header must exist
  const header = page.locator('header');
  await expect(header).toBeVisible();

  // Height assertion — must not be a LinkedIn-style banner
  const headerBox = await header.boundingBox();
  expect(headerBox, 'header bounding box should not be null').not.toBeNull();
  expect(
    headerBox!.height,
    `Header height ${headerBox!.height}px exceeds 80 px on mobile`,
  ).toBeLessThanOrEqual(80);

  // No avatar image inside the header on mobile
  // The mobile layout shows only "MA" monogram; avatar lives in the desktop layout.
  const avatarInsideHeader = header.locator('img[alt*="Foto de"], img[alt*="foto"], img[alt*="profile"], img[alt*="Marco"]');
  const avatarCount = await avatarInsideHeader.count();
  expect(
    avatarCount,
    'Avatar image must not appear inside the header on mobile',
  ).toBe(0);

  // Hamburger button is visible — NavAnchors renders aria-label="Menu"
  const hamburger = page.locator('button[aria-label="Menu"]');
  await expect(hamburger).toBeVisible();

  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 2 — Desktop main content is horizontally centered (not left-flush)
// ---------------------------------------------------------------------------
test('T-LAY-02: desktop main content container is horizontally centered', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');

  // Check centering by measuring the hero section card — it has max-w-3xl and is visually centered.
  // The outer container div may be full-width (Tailwind container at xl = 1280px) but inner
  // sections constrain their own width.  A well-centred hero card on a 1280px viewport should
  // start at least 150 px from the left edge.
  const heroSection = page.locator('section[aria-labelledby="hero-heading"]');
  await expect(heroSection).toBeVisible();

  const box = await heroSection.boundingBox();
  expect(box, 'hero section bounding box should not be null').not.toBeNull();
  expect(
    box!.x,
    `Hero section left edge (${box!.x}px) should be > 150 px on a 1280px viewport — content appears left-flush`,
  ).toBeGreaterThan(150);

  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 3 — No sidebar visible on mobile; <main> fills the viewport width
// ---------------------------------------------------------------------------
test('T-LAY-03: no sidebar visible on mobile, main element fills viewport width', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: MOBILE });
  const page = await ctx.newPage();

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');

  // AppSidebar uses `hidden md:flex` — must not be visible at 390 px
  // It has role="complementary" via the shadcn Sidebar primitive; also check by class.
  const sidebar = page.locator('[data-sidebar="sidebar"], aside[class*="sidebar"], nav[aria-label="primary"]');
  const visibleSidebarCount = await sidebar.filter({ has: page.locator(':visible') }).count();

  // Instead of checking visibility (which can be tricky with CSS display:none),
  // assert the computed display is none or the element is not in the viewport.
  const sidebarVisible = await page.evaluate(() => {
    const el = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement | null;
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
  expect(sidebarVisible, 'Sidebar must be hidden (display:none) on mobile viewport').toBe(false);

  // <main> width should fill the viewport (within 20 px tolerance)
  const main = page.locator('main#main-content');
  await expect(main).toBeVisible();
  const mainBox = await main.boundingBox();
  expect(mainBox, 'main bounding box should not be null').not.toBeNull();
  expect(
    Math.abs(mainBox!.width - MOBILE.width),
    `main width (${mainBox!.width}px) deviates from viewport width (${MOBILE.width}px) by more than 20 px`,
  ).toBeLessThanOrEqual(20);

  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 4 — Hero heading visible on mobile, positioned below the header
// ---------------------------------------------------------------------------
test('T-LAY-04: hero heading visible on mobile, top > 60 px (below the fixed header)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: MOBILE });
  const page = await ctx.newPage();

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');

  const heroHeading = page.locator('#hero-heading');
  await expect(heroHeading).toBeVisible();

  // getBoundingClientRect().top should be below the 64 px mobile header
  // (Portfolio adds pt-16 = 64 px top padding; the H1 sits inside the section).
  const heroTop = await heroHeading.evaluate((el) => {
    return el.getBoundingClientRect().top;
  });
  expect(
    heroTop,
    `#hero-heading top (${heroTop}px) is not below the fixed header (expected > 60 px)`,
  ).toBeGreaterThan(60);

  // No overlap: header bottom must be above the hero section top
  const headerBox = await page.locator('header').boundingBox();
  expect(headerBox, 'header bounding box must not be null').not.toBeNull();

  const heroSectionTop = await page.locator('section[aria-labelledby="hero-heading"]').evaluate((el) => {
    return el.getBoundingClientRect().top;
  });

  expect(
    heroSectionTop,
    `Hero section top (${heroSectionTop}px) overlaps the header bottom (${headerBox!.height}px)`,
  ).toBeGreaterThanOrEqual(headerBox!.height);

  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 5 — Section DOM order: #experiencia renders above #educacao on desktop
// ---------------------------------------------------------------------------
test('T-LAY-05: #experiencia renders above #educacao in DOM order (desktop)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');

  // Use DOM comparison — compareDocumentPosition is authoritative regardless
  // of opacity animations that may delay visual rendering.
  const order = await page.evaluate(() => {
    const exp = document.getElementById('experiencia');
    const edu = document.getElementById('educacao');
    if (!exp || !edu) return null;
    // Returns true if experiencia precedes educacao in the DOM
    return !!(exp.compareDocumentPosition(edu) & Node.DOCUMENT_POSITION_FOLLOWING);
  });

  expect(order, '#experiencia and #educacao not found in DOM').not.toBeNull();
  expect(
    order,
    '#experiencia must appear before #educacao in the DOM',
  ).toBe(true);

  await ctx.close();
});

// ---------------------------------------------------------------------------
// Test 6 — Certifications section renders without horizontal overflow on mobile
// ---------------------------------------------------------------------------
test('T-LAY-06: #certificacoes visible on mobile, no child overflows viewport width', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: MOBILE });
  const page = await ctx.newPage();

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');

  // Scroll the certifications section into view
  const certSection = page.locator('#certificacoes');
  await certSection.scrollIntoViewIfNeeded();

  // The section must be visible (MobileCollapsibleSection renders it)
  await expect(certSection).toBeVisible();

  // No child element should overflow the viewport horizontally
  const overflowingCount = await page.evaluate((viewportWidth) => {
    const section = document.getElementById('certificacoes');
    if (!section) return -1;
    const all = section.querySelectorAll('*');
    let count = 0;
    for (const el of all) {
      const box = el.getBoundingClientRect();
      // An element that starts before 0 or ends after viewport width is overflowing
      if (box.right > viewportWidth + 1) {
        count++;
      }
    }
    return count;
  }, MOBILE.width);

  expect(
    overflowingCount,
    `#certificacoes has ${overflowingCount} children overflowing the ${MOBILE.width}px viewport`,
  ).toBe(0);

  await ctx.close();
});
