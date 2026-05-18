/**
 * E2E spec stubs — Projects Index Page (/projetos)
 *
 * Covers: AC-PC-08 (index grid, 3 cards, fixed order, a11y links)
 *         AC-PC-13 (Axe zero violations; CLS note via Lighthouse)
 *         AC-PC-14 (E2E coverage requirement)
 *
 * ALL tests are `test.skip` — they activate in T-PC-C-08 once Phase C
 * components are wired and confirmed by the frontend-engineer.
 *
 * CLS note: CLS = 0 is validated via Lighthouse (LHCI config in T-PC-C-08),
 * not natively via Playwright. The assertion here is structural only (cards
 * have deterministic DOM order). If Playwright gains PerformanceObserver
 * support in a future version, add a `page.evaluate` CLS check here.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "./fixtures/routes";

test.describe("Projects Index — /projetos", () => {
  test.skip(
    "PC-INDEX-01: /projetos returns 200 and renders h1 containing index title",
    async ({ page }) => {
      /**
       * AC-PC-08: Rota /projetos renderiza ProjectsIndexPage.
       * The <h1> must contain the i18n index title ("Projetos" in PT locale).
       */
      const response = await page.goto(ROUTES.projectsIndex);
      expect(response?.status()).toBe(200);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      // The PT locale title is "Projetos" (from projectsV2.index.title in pt.json).
      // EN = "Projects", DE = "Projekte". We assert the PT default here.
      await expect(h1).toContainText("Projetos");
    },
  );

  test.skip(
    "PC-INDEX-02: renders exactly 3 project cards in fixed DOM order",
    async ({ page }) => {
      /**
       * AC-PC-08: 3 cards in order dadaia-workspace → portifolio → tauan-games.
       * Cards must be <a> elements (not <div role="button">), linking to their
       * respective /projetos/<slug> routes (AC-PC-08, FE §Q7 a11y).
       */
      await page.goto(ROUTES.projectsIndex);
      await page.waitForLoadState("networkidle");

      // ProjectCard renders as a <Link> wrapping the card — expect 3 <a> links
      // pointing to the 3 project detail routes in fixed order.
      const cards = page.locator('[data-testid="project-card"]');
      await expect(cards).toHaveCount(3);

      // DOM order: index 0 = dadaia-workspace, 1 = portifolio, 2 = tauan-games
      await expect(cards.nth(0)).toHaveAttribute(
        "href",
        ROUTES.dadaiaWorkspace,
      );
      await expect(cards.nth(1)).toHaveAttribute("href", ROUTES.portifolio);
      await expect(cards.nth(2)).toHaveAttribute("href", ROUTES.tauanGames);
    },
  );

  test.skip(
    "PC-INDEX-03: each project card has an accessible name",
    async ({ page }) => {
      /**
       * AC-PC-08: Cards are <Link> with focus-visible:ring-2 (a11y).
       * Each must have a non-empty accessible name so screen readers
       * can distinguish them.
       */
      await page.goto(ROUTES.projectsIndex);
      await page.waitForLoadState("networkidle");

      const cards = page.locator('[data-testid="project-card"]');
      await expect(cards).toHaveCount(3);

      for (let i = 0; i < 3; i++) {
        const name = await cards.nth(i).getAttribute("aria-label");
        // Either aria-label is set, or the card contains visible text that
        // serves as the accessible name. We assert the link is reachable via
        // role query as a fallback.
        if (!name) {
          // If aria-label absent, card title text must be present inside the link
          const cardText = await cards.nth(i).textContent();
          expect(cardText?.trim().length, "Card has no accessible text").toBeGreaterThan(0);
        } else {
          expect(name.trim().length, "Card aria-label is empty").toBeGreaterThan(0);
        }
      }
    },
  );

  test.skip(
    "PC-INDEX-04: each project card links to its /projetos/<slug> route",
    async ({ page }) => {
      /**
       * AC-PC-08: Clicking a card navigates to /projetos/<slug>.
       * Tests link intent (href) rather than full navigation to keep
       * the test scoped to the index page.
       */
      await page.goto(ROUTES.projectsIndex);
      await page.waitForLoadState("networkidle");

      const expectedHrefs = [
        ROUTES.dadaiaWorkspace,
        ROUTES.portifolio,
        ROUTES.tauanGames,
      ];

      for (const href of expectedHrefs) {
        const link = page.locator(`a[href="${href}"]`);
        await expect(link).toBeVisible();
      }
    },
  );

  test.skip(
    "PC-INDEX-05: /projetos has zero axe wcag2a/wcag2aa violations",
    async ({ page }) => {
      /**
       * AC-PC-13: Axe zero violations on /projetos.
       * Same pattern as E2E-13 on the home page.
       */
      await page.goto(ROUTES.projectsIndex);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      expect(
        results.violations,
        `axe violations on /projetos:\n${results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`,
          )
          .join("\n\n")}`,
      ).toHaveLength(0);
    },
  );

  test.skip(
    "PC-INDEX-06: document.title updated to index SEO title on /projetos",
    async ({ page }) => {
      /**
       * AC-PC-11: useDocumentSeo sets document.title on the index page.
       * The PT locale seo.title from projectsV2.index is expected.
       * Exact value depends on implementation; we assert non-empty and
       * not the Vite default "Vite + React + TS".
       */
      await page.goto(ROUTES.projectsIndex);
      await page.waitForLoadState("networkidle");

      const title = await page.title();
      expect(title.trim().length, "document.title is empty").toBeGreaterThan(0);
      expect(title).not.toBe("Vite + React + TS");
    },
  );
});
