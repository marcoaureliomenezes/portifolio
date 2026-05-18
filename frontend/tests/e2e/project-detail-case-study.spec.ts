/**
 * E2E spec stubs — Project Detail: case-study kind (/projetos/dadaia-workspace)
 *
 * Covers: AC-PC-04 (dynamic routing, slug dispatch)
 *         AC-PC-08 (ProjectHero renders with project title)
 *         AC-PC-11 (useDocumentSeo: title + meta description)
 *         AC-PC-13 (Axe zero violations)
 *         AC-PC-14 (E2E coverage requirement)
 *         AC-PC-16 (ProjectsLayoutShell: breadcrumb + back-link)
 *
 * ALL tests are `test.skip` — they activate in T-PC-C-08.
 *
 * Data source: frontend/src/data/content/pt.json → projectsV2.list[0]
 *   slug: "dadaia-workspace", kind: "case-study"
 *   sections: [what, why, how, status]
 *   cta.github: "https://github.com/marcoaureliomenezes/dadaia-workspace"
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "./fixtures/routes";

test.describe("Project Detail — case-study (dadaia-workspace)", () => {
  test.skip(
    "PC-CS-01: /projetos/dadaia-workspace returns 200 and renders ProjectHero h1",
    async ({ page }) => {
      /**
       * AC-PC-04 + AC-PC-08: Dynamic routing dispatches to CaseStudyTemplate.
       * ProjectHero renders the project hero.title as <h1>.
       * PT locale title from pt.json: "dadaia-workspace".
       */
      const response = await page.goto(ROUTES.dadaiaWorkspace);
      expect(response?.status()).toBe(200);

      // h1 must NOT contain "404" (confirming routing dispatch worked)
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).not.toContainText("404");
      // ProjectHero title from pt.json projectsV2.list[0].hero.title
      await expect(h1).toContainText("dadaia-workspace");
    },
  );

  test.skip(
    "PC-CS-02: ProjectsLayoutShell renders breadcrumb 'Projetos / Dadaia Workspace'",
    async ({ page }) => {
      /**
       * AC-PC-16: ProjectsLayoutShell wraps /projetos/:slug routes and renders
       * a breadcrumb. On /projetos/dadaia-workspace the breadcrumb must show
       * "Projetos / Dadaia Workspace" (or i18n equivalent for PT locale).
       */
      await page.goto(ROUTES.dadaiaWorkspace);
      await page.waitForLoadState("networkidle");

      // Breadcrumb nav — rendered by ProjectsLayoutShell
      const breadcrumb = page.locator('nav[aria-label="breadcrumb"]');
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toContainText("Projetos");
      await expect(breadcrumb).toContainText("Dadaia Workspace");
    },
  );

  test.skip(
    "PC-CS-03: ProjectsLayoutShell back-link is visible and points to /projetos",
    async ({ page }) => {
      /**
       * AC-PC-16: On detail pages, ProjectsLayoutShell renders a back-link
       * pointing to /projetos. This link is not present on the index page.
       */
      await page.goto(ROUTES.dadaiaWorkspace);
      await page.waitForLoadState("networkidle");

      const backLink = page.locator(`a[href="${ROUTES.projectsIndex}"]`).first();
      await expect(backLink).toBeVisible();
    },
  );

  test.skip(
    "PC-CS-04: case-study sections render as h2 in expected order",
    async ({ page }) => {
      /**
       * AC-PC-08 + SPEC §5.2: CaseStudyProject has sections[].
       * From pt.json: sections are [what, why, how, status].
       * Each section.title must appear as an <h2> inside the page.
       * Order is defined by the JSON array order.
       */
      await page.goto(ROUTES.dadaiaWorkspace);
      await page.waitForLoadState("networkidle");

      // Sections from pt.json projectsV2.list[0].sections[].title
      const expectedSectionTitles = ["O que é", "Por que existe", "Como funciona", "Status atual"];

      const headings = page.locator("h2");
      const headingTexts = await headings.allTextContents();

      for (const title of expectedSectionTitles) {
        expect(
          headingTexts.some((t) => t.includes(title)),
          `Section heading "${title}" not found in page h2 elements`,
        ).toBe(true);
      }
    },
  );

  test.skip(
    "PC-CS-05: document.title is updated to project-specific SEO title",
    async ({ page }) => {
      /**
       * AC-PC-11: useDocumentSeo sets document.title per project.
       * From pt.json: seo.title = "dadaia-workspace — Marco Menezes".
       */
      await page.goto(ROUTES.dadaiaWorkspace);
      await page.waitForLoadState("networkidle");

      const title = await page.title();
      expect(title).toContain("dadaia-workspace");
      expect(title).toContain("Marco Menezes");
    },
  );

  test.skip(
    "PC-CS-06: meta description tag is updated to project-specific SEO description",
    async ({ page }) => {
      /**
       * AC-PC-11: useDocumentSeo sets <meta name="description"> per project.
       * From pt.json: seo.description confirms the content is project-specific.
       */
      await page.goto(ROUTES.dadaiaWorkspace);
      await page.waitForLoadState("networkidle");

      const metaDescription = await page
        .locator('meta[name="description"]')
        .getAttribute("content");

      expect(metaDescription, "meta description is missing or empty").toBeTruthy();
      // Description must be project-specific — not the site-level default
      expect(metaDescription!.trim().length).toBeGreaterThan(20);
    },
  );

  test.skip(
    "PC-CS-07: /projetos/dadaia-workspace has zero axe wcag2a/wcag2aa violations",
    async ({ page }) => {
      /**
       * AC-PC-13: Axe zero violations on the case-study detail page.
       */
      await page.goto(ROUTES.dadaiaWorkspace);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      expect(
        results.violations,
        `axe violations on ${ROUTES.dadaiaWorkspace}:\n${results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`,
          )
          .join("\n\n")}`,
      ).toHaveLength(0);
    },
  );
});
