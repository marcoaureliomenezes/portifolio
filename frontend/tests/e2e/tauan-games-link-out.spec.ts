/**
 * E2E spec stubs — tauan-games external link-out (GameCard playUrl)
 *
 * Covers: AC-PC-12 (GameCard external link: target=_blank, rel=noopener noreferrer)
 *         AC-PC-14 (E2E coverage requirement for tauan-games-link-out.spec.ts)
 *
 * SPEC §4 Non-goals: no iframe, no games:sync Makefile, no Cache-Control Terraform.
 * The only assertion is: clicking a GameCard opens a new tab to the correct playUrl.
 *
 * ALL tests are `test.skip` — they activate in T-PC-C-08.
 *
 * Data source: frontend/src/data/content/pt.json → projectsV2.list[2].items[0]
 *   slug: "aero-fighters"
 *   playUrl: "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/"
 *   repo: "https://github.com/marcoaureliomenezes/tauan-games"
 */
import { test, expect } from "@playwright/test";
import { ROUTES } from "./fixtures/routes";

// Exact playUrl from pt.json — do not change without updating pt.json too (AC-PC-07)
const AERO_FIGHTERS_PLAY_URL =
  "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/";

test.describe("tauan-games GameCard link-out", () => {
  test.skip(
    "PC-LINKOUT-01: clicking aero-fighters GameCard opens new tab to playUrl",
    async ({ page, context }) => {
      /**
       * AC-PC-12: Clicking the GameCard CTA (play button or card link) opens
       * the playUrl in a new browser tab.
       *
       * Strategy: listen for 'page' event on context before clicking.
       * The new page URL must match AERO_FIGHTERS_PLAY_URL.
       *
       * Note on "opener rel": the rel attribute is on the <a> element in the DOM,
       * not on the new page object. We check rel on the link before clicking.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      // Locate the aero-fighters play link
      const playLink = page.locator(`a[href="${AERO_FIGHTERS_PLAY_URL}"]`);
      await expect(playLink, "aero-fighters play link not found").toBeVisible();

      // Assert rel before clicking (AC-PC-12 security contract)
      const rel = await playLink.getAttribute("rel");
      expect(rel, `rel="${rel}" missing noopener`).toContain("noopener");
      expect(rel, `rel="${rel}" missing noreferrer`).toContain("noreferrer");

      // Assert target=_blank (link will open new tab)
      await expect(playLink).toHaveAttribute("target", "_blank");

      // Open new tab by listening on context for the new page
      const [newPage] = await Promise.all([
        context.waitForEvent("page"),
        playLink.click(),
      ]);

      // The new tab URL must be the game's playUrl
      await newPage.waitForLoadState("domcontentloaded");
      expect(newPage.url()).toBe(AERO_FIGHTERS_PLAY_URL);
    },
  );

  test.skip(
    "PC-LINKOUT-02: rel=noopener noreferrer is present on the aero-fighters link (DOM check)",
    async ({ page }) => {
      /**
       * AC-PC-12: Focused DOM-level assertion without triggering navigation.
       * Verifies the rendered <a> has the correct security attributes.
       * This test is a narrower complement to PC-LINKOUT-01.
       */
      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      const playLink = page.locator(`a[href="${AERO_FIGHTERS_PLAY_URL}"]`);
      await expect(playLink).toBeVisible();

      // Full attribute value: must be exactly "noopener noreferrer" or a superset
      const rel = await playLink.getAttribute("rel");
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
      await expect(playLink).toHaveAttribute("target", "_blank");
    },
  );

  test.skip(
    "PC-LINKOUT-03: tauan-trex GameCard also has correct security attributes",
    async ({ page }) => {
      /**
       * AC-PC-12: All GameCards must have target=_blank + rel=noopener noreferrer.
       * Explicitly assert the second game item (tauan-trex) as well.
       *
       * playUrl from pt.json projectsV2.list[2].items[1]:
       *   "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/"
       */
      const TAUAN_TREX_PLAY_URL =
        "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/";

      await page.goto(ROUTES.tauanGames);
      await page.waitForLoadState("networkidle");

      const playLink = page.locator(`a[href="${TAUAN_TREX_PLAY_URL}"]`);
      await expect(playLink, "tauan-trex play link not found").toBeVisible();

      await expect(playLink).toHaveAttribute("target", "_blank");

      const rel = await playLink.getAttribute("rel");
      expect(rel, `rel="${rel}" missing noopener`).toContain("noopener");
      expect(rel, `rel="${rel}" missing noreferrer`).toContain("noreferrer");
    },
  );
});
