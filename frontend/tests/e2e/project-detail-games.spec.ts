/**
 * E2E spec stubs — Project Detail: games kind (/projetos/tauan-games)
 *
 * Covers: AC-PC-04 (dynamic routing + unknown slug → NotFound with URL preserved)
 *         AC-PC-08 (ProjectHero renders)
 *         AC-PC-12 (GameCard renders with target=_blank rel=noopener noreferrer)
 *         AC-PC-13 (Axe zero violations)
 *         AC-PC-14 (E2E coverage requirement)
 *         AC-PC-16 (ProjectsLayoutShell: breadcrumb + back-link)
 *
 * ALL tests are `test.skip` — they activate in T-PC-C-08.
 *
 * Data source: frontend/src/data/content/pt.json → projectsV2.list[2]
 *   slug: "tauan-games", kind: "games"
 *   items: [
 *     { slug: "aero-fighters", title: "Aero Fighters", engine: "Three.js",
 *       playUrl: "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/" },
 *     { slug: "tauan-trex", title: "tauan-trex", engine: "Phaser",
 *       playUrl: "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/" }
 *   ]
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "./fixtures/routes";

// Game items derived from pt.json projectsV2.list[where slug=tauan-games].items
const GAME_ITEMS = [
  {
    slug: "aero-fighters",
    title: "Aero Fighters",
    engine: "Three.js",
    playUrl: "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/",
  },
  {
    slug: "tauan-trex",
    title: "tauan-trex",
    engine: "Phaser",
    playUrl: "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/",
  },
] as const;

test.describe("Project Detail — games (tauan-games)", () => {
  test.skip(
    "PC-GAMES-01: /projetos/tauan-games returns 200 and renders ProjectHero h1",
    async ({ page }) => {
      /**
       * AC-PC-04 + AC-PC-08: Dynamic routing dispatches to GamesProjectTemplate.
       * ProjectHero renders hero.title as <h1>.
       * PT locale title from pt.json: "tauan-games".
       */
      const response = await page.goto(ROUTES.tauanGames);
      expect(response?.status()).toBe(200);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).not.toContainText("404");
      await expect(h1).toContainText("tauan-games");
    },
  );

  test.skip(
    "PC-GAMES-02: games grid renders 2 GameCards in order (aero-fighters, tauan-trex)",
    async ({ page }) => {
      /**
       * AC-PC-12 + AC-PC-14: GamesProjectTemplate renders a GameCard for each
       * item in items[]. From pt.json: 2 items, order is aero-fighters, tauan-trex.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      // GameCards are identified by data-testid or by their playUrl href
      const gameCards = page.locator('[data-testid="game-card"]');
      const hasTestid = (await gameCards.count()) > 0;

      if (hasTestid) {
        await expect(gameCards).toHaveCount(2);
      } else {
        // Fallback: assert both play links are present
        for (const game of GAME_ITEMS) {
          const link = page.locator(`a[href="${game.playUrl}"]`);
          await expect(link).toBeVisible();
        }
      }
    },
  );

  test.skip(
    "PC-GAMES-03: each GameCard playUrl link has target=_blank",
    async ({ page }) => {
      /**
       * AC-PC-12: GameCard renders <a href={playUrl} target="_blank" rel="noopener noreferrer">.
       * This test checks target=_blank for each game's playUrl.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      for (const game of GAME_ITEMS) {
        const link = page.locator(`a[href="${game.playUrl}"]`);
        await expect(link, `GameCard link for ${game.slug} not found`).toBeVisible();
        await expect(
          link,
          `GameCard link for ${game.slug} missing target=_blank`,
        ).toHaveAttribute("target", "_blank");
      }
    },
  );

  test.skip(
    "PC-GAMES-04: each GameCard playUrl link has rel=noopener noreferrer",
    async ({ page }) => {
      /**
       * AC-PC-12: rel must contain BOTH "noopener" AND "noreferrer".
       * This is the security contract for external game links.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      for (const game of GAME_ITEMS) {
        const link = page.locator(`a[href="${game.playUrl}"]`);
        const rel = await link.getAttribute("rel");
        expect(
          rel,
          `GameCard link for ${game.slug} missing noopener in rel="${rel}"`,
        ).toContain("noopener");
        expect(
          rel,
          `GameCard link for ${game.slug} missing noreferrer in rel="${rel}"`,
        ).toContain("noreferrer");
      }
    },
  );

  test.skip(
    "PC-GAMES-05: unknown slug /projetos/does-not-exist renders NotFound and preserves URL",
    async ({ page }) => {
      /**
       * AC-PC-04: ProjectDetailPage renders <NotFound /> inline for unknown slugs.
       * The URL must be preserved (not redirected to /) so the user can debug.
       * "URL preserved" = page.url() ends with /projetos/does-not-exist.
       */
      await page.goto(ROUTES.projectsNotFound);
      await page.waitForLoadState("networkidle");

      // URL must not have changed to / or /projetos
      expect(page.url()).toContain("/projetos/does-not-exist");

      // NotFound component renders h1 with "404" or equivalent error text
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      // Accept either "404" or a "not found" message per NotFound component design
      const h1Text = await h1.textContent();
      const isNotFound =
        h1Text?.includes("404") ||
        h1Text?.toLowerCase().includes("not found") ||
        h1Text?.toLowerCase().includes("não encontrad");
      expect(isNotFound, `h1 text "${h1Text}" does not indicate NotFound`).toBe(true);
    },
  );

  test.skip(
    "PC-GAMES-06: ProjectsLayoutShell back-link visible on /projetos/tauan-games",
    async ({ page }) => {
      /**
       * AC-PC-16: back-link to /projetos is present on detail pages.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      const backLink = page.locator(`a[href="${ROUTES.projectsIndex}"]`).first();
      await expect(backLink).toBeVisible();
    },
  );

  test.skip(
    "PC-GAMES-07: /projetos/tauan-games has zero axe wcag2a/wcag2aa violations",
    async ({ page }) => {
      /**
       * AC-PC-13: Axe zero violations on the games detail page.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      expect(
        results.violations,
        `axe violations on ${ROUTES.tauanGames}:\n${results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`,
          )
          .join("\n\n")}`,
      ).toHaveLength(0);
    },
  );
});
