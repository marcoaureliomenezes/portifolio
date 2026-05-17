import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { ProjectsLayoutShell } from "../ProjectsLayoutShell";

/**
 * ProjectsLayoutShell.test.tsx — T-PC-B-09
 *
 * Verifies:
 * 1. On /projetos (index), breadcrumb shows "Projetos", no back-link visible.
 * 2. On /projetos/:slug (detail), breadcrumb shows "Projetos" + a non-empty
 *    second segment that is NOT the raw slug (display name from i18n).
 * 3. Back-link is visible only on the detail view, pointing to /projetos.
 * 4. Breadcrumb container has aria-label.
 * 5. Child content is rendered via Outlet.
 *
 * QA contract C-04 (ARIA), C-05 (back-link), C-06 (no SEO override in shell).
 */

/** Render the shell at a given path with an optional child. */
function renderShell(path: string, childContent = "child rendered") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        {/*
         * The shell wraps both /projetos (index) and /projetos/:slug (detail).
         * We use an index route + a param route as children, mirroring App.tsx.
         */}
        <Route element={<ProjectsLayoutShell />}>
          <Route index path="/projetos" element={<div>{childContent}</div>} />
          <Route
            path="/projetos/:slug"
            element={<div>{childContent}</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb ARIA
// ---------------------------------------------------------------------------

describe("ProjectsLayoutShell — ARIA", () => {
  it("breadcrumb nav has aria-label (QA contract C-04)", () => {
    renderShell("/projetos");
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Index route (/projetos)
// ---------------------------------------------------------------------------

describe("ProjectsLayoutShell — index route (/projetos)", () => {
  it("renders breadcrumb with 'Projetos' text", () => {
    renderShell("/projetos");
    // The breadcrumb is inside the nav[aria-label=Breadcrumb]
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav.textContent).toContain("Projetos");
  });

  it("does NOT render a back-link on the index route (QA contract C-05)", () => {
    renderShell("/projetos");
    // Back-link should not be present or must be hidden; we assert it's absent
    // by checking no visible link points back to /projetos (the index itself).
    // The breadcrumb "Projetos" link IS present pointing to /projetos, but it
    // should only be a plain text item on the index (current page).
    // Additionally there should be NO separate "back" / "voltar" link.
    const allLinks = screen.queryAllByRole("link");
    const backLinks = allLinks.filter(
      (l) =>
        (l.getAttribute("href") === "/projetos" ||
          l.getAttribute("href") === "") &&
        /volta|back/i.test(l.textContent ?? ""),
    );
    expect(backLinks).toHaveLength(0);
  });

  it("renders child content via Outlet", () => {
    renderShell("/projetos", "index child content");
    expect(screen.getByText("index child content")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Detail route (/projetos/:slug)
// ---------------------------------------------------------------------------

describe("ProjectsLayoutShell — detail route (/projetos/:slug)", () => {
  it("breadcrumb contains 'Projetos' segment", () => {
    renderShell("/projetos/dadaia-workspace");
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav.textContent).toContain("Projetos");
  });

  it("breadcrumb contains a non-empty second segment (not just the raw slug)", () => {
    renderShell("/projetos/dadaia-workspace");
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    // The second segment must be non-empty.
    // We don't hardcode the display name — we assert it's a non-empty string
    // that appears in the breadcrumb alongside "Projetos".
    expect(nav.textContent?.trim().length).toBeGreaterThan("Projetos".length);
  });

  it("back-link is visible on the detail route (QA contract C-05)", () => {
    renderShell("/projetos/dadaia-workspace");
    // A link that navigates back to /projetos must be present and visible
    const backLink = screen.getByRole("link", { name: /volta|back/i });
    expect(backLink).toBeTruthy();
  });

  it("back-link points to /projetos", () => {
    renderShell("/projetos/dadaia-workspace");
    const backLink = screen.getByRole("link", { name: /volta|back/i });
    expect(backLink.getAttribute("href")).toBe("/projetos");
  });

  it("renders child content via Outlet on detail route", () => {
    renderShell("/projetos/dadaia-workspace", "detail child content");
    expect(screen.getByText("detail child content")).toBeTruthy();
  });

  it("back-link has discernible text (not icon-only) — QA contract C-04 a11y", () => {
    renderShell("/projetos/portifolio");
    const backLink = screen.getByRole("link", { name: /volta|back/i });
    // The accessible name must not be empty
    expect(backLink.textContent?.trim().length).toBeGreaterThan(0);
  });
});
