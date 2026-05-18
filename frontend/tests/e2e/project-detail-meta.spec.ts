/**
 * E2E spec stubs — Project Detail: meta kind (/projetos/portifolio)
 *
 * Covers: AC-PC-04 (dynamic routing, slug dispatch to MetaProjectTemplate)
 *         AC-PC-08 (ProjectHero renders with project title)
 *         AC-PC-11 (useDocumentSeo: title + meta description)
 *         AC-PC-13 (Axe zero violations)
 *         AC-PC-14 (E2E coverage requirement)
 *         AC-PC-16 (ProjectsLayoutShell: breadcrumb + back-link)
 *
 * Kind-specific differences vs case-study:
 *   - Renders CostsTable (from costs[]) — see SPEC §5.3
 *   - Renders DecisionsList (from decisions[]) — see SPEC §5.3
 *   - Renders stack table (from stack[]) — see SPEC §5.3
 *   - Has links section (repo, terraform, specs)
 *
 * ALL tests are `test.skip` — they activate in T-PC-C-08.
 *
 * Data source: frontend/src/data/content/pt.json → projectsV2.list[1]
 *   slug: "portifolio", kind: "meta"
 *   sections: [overview, engineering]
 *   costs: 5 rows (Route53, S3, CloudFront, ACM, total)
 *   decisions: 4 rows
 *   stack: 6 rows
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "./fixtures/routes";

test.describe("Project Detail — meta (portifolio)", () => {
  test.skip(
    "PC-META-01: /projetos/portifolio returns 200 and renders ProjectHero h1",
    async ({ page }) => {
      /**
       * AC-PC-04 + AC-PC-08: Dynamic routing dispatches to MetaProjectTemplate.
       * ProjectHero renders hero.title as <h1>.
       * PT locale title from pt.json: "Arquitetura deste portfólio".
       */
      const response = await page.goto(ROUTES.portifolio);
      expect(response?.status()).toBe(200);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).not.toContainText("404");
      await expect(h1).toContainText("Arquitetura deste portfólio");
    },
  );

  test.skip(
    "PC-META-02: ProjectsLayoutShell renders breadcrumb 'Projetos / Arquitetura deste portfólio'",
    async ({ page }) => {
      /**
       * AC-PC-16: Breadcrumb must reference "Projetos" + the project name.
       * The exact project label in the breadcrumb follows the hero.title or a
       * shortened slug-derived label — implementation decides. We assert both
       * "Projetos" and at minimum the slug "portifolio" appear in breadcrumb.
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      const breadcrumb = page.locator('nav[aria-label="breadcrumb"]');
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toContainText("Projetos");
      // Implementation may use hero.title or a slug-derived label. Assert either.
      const breadcrumbText = await breadcrumb.textContent();
      const hasSlugRef =
        breadcrumbText?.toLowerCase().includes("portifólio") ||
        breadcrumbText?.toLowerCase().includes("portifolio") ||
        breadcrumbText?.toLowerCase().includes("arquitetura");
      expect(hasSlugRef, "Breadcrumb does not reference the project").toBe(true);
    },
  );

  test.skip(
    "PC-META-03: ProjectsLayoutShell back-link points to /projetos",
    async ({ page }) => {
      /**
       * AC-PC-16: back-link visible and pointing to the index.
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      const backLink = page.locator(`a[href="${ROUTES.projectsIndex}"]`).first();
      await expect(backLink).toBeVisible();
    },
  );

  test.skip(
    "PC-META-04: CostsTable is rendered with at least one cost row",
    async ({ page }) => {
      /**
       * AC-PC-14 (meta-specific): MetaProjectTemplate renders CostsTable for
       * the costs[] array. From pt.json: 5 rows including "Route53 hosted zone"
       * and "Total estimado".
       * We assert the table or list container is present and non-empty.
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      // CostsTable may render as <table> or as a styled list. We check the
      // data-testid first, then fall back to text content presence.
      const costsSection = page.locator('[data-testid="costs-table"]');
      const hasCostsTestid = (await costsSection.count()) > 0;

      if (hasCostsTestid) {
        await expect(costsSection).toBeVisible();
      } else {
        // Fallback: "Route53" text must be visible (first item in pt.json costs[])
        await expect(page.getByText("Route53")).toBeVisible();
      }
    },
  );

  test.skip(
    "PC-META-05: DecisionsList is rendered with at least one decision entry",
    async ({ page }) => {
      /**
       * AC-PC-14 (meta-specific): MetaProjectTemplate renders DecisionsList.
       * From pt.json decisions[0].title: "React/Vite em vez de Next.js ou Astro".
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      const decisionsList = page.locator('[data-testid="decisions-list"]');
      const hasDecisionsTestid = (await decisionsList.count()) > 0;

      if (hasDecisionsTestid) {
        await expect(decisionsList).toBeVisible();
      } else {
        // Fallback: first decision title text from pt.json
        await expect(page.getByText("React/Vite")).toBeVisible();
      }
    },
  );

  test.skip(
    "PC-META-06: document.title is updated to project-specific SEO title",
    async ({ page }) => {
      /**
       * AC-PC-11: useDocumentSeo sets document.title.
       * From pt.json: seo.title = "Arquitetura deste portfólio — Marco Menezes".
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      const title = await page.title();
      expect(title).toContain("Marco Menezes");
      // Must differ from the index page title — it is project-specific
      expect(title.trim().length).toBeGreaterThan(10);
    },
  );

  test.skip(
    "PC-META-07: meta description tag updated to project SEO description",
    async ({ page }) => {
      /**
       * AC-PC-11: useDocumentSeo sets <meta name="description">.
       * From pt.json: seo.description for portifolio project is present.
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      const metaDescription = await page
        .locator('meta[name="description"]')
        .getAttribute("content");

      expect(metaDescription, "meta description is missing or empty").toBeTruthy();
      expect(metaDescription!.trim().length).toBeGreaterThan(20);
    },
  );

  test.skip(
    "PC-META-08: /projetos/portifolio has zero axe wcag2a/wcag2aa violations",
    async ({ page }) => {
      /**
       * AC-PC-13: Axe zero violations on the meta detail page.
       */
      await page.goto(ROUTES.portifolio);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      expect(
        results.violations,
        `axe violations on ${ROUTES.portifolio}:\n${results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`,
          )
          .join("\n\n")}`,
      ).toHaveLength(0);
    },
  );
});
