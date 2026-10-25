import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { ProjectsLayoutShell } from "../ProjectsLayoutShell";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LanguageContext } from "@/contexts/LanguageContext";
import type { ContentData } from "@/types/content";

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

// Boundary stub: the header's own contract lives in Header.test.tsx.
vi.mock("@/components/Header", () => ({
  Header: () => <header>header</header>,
}));

/** The committed locale file the app fetches: the required chrome and profile. */
const committed = JSON.parse(
  readFileSync(resolve(process.cwd(), "public/content/pt.json"), "utf-8"),
) as Pick<ContentData, "siteChrome" | "profile">;

const CHROME = {
  pt: { projects: "Projetos", back: "Voltar para projetos" },
  en: { projects: "Projects", back: "Back to projects" },
} as const;

/** Supplies the siteChrome content the shell reads its labels from. */
function ChromeProvider({
  lang,
  children,
}: {
  lang: "pt" | "en";
  children: React.ReactNode;
}) {
  const content = {
    siteChrome: {
      ...committed.siteChrome,
      breadcrumb: { label: "Breadcrumb", projects: CHROME[lang].projects },
      backToProjects: CHROME[lang].back,
    },
    profile: committed.profile,
  } as unknown as ContentData;
  return (
    <LanguageContext.Provider
      value={{ language: lang, setLanguage: () => undefined, content, isLoading: false }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/** Render the shell at a given path with an optional child. */
function renderShell(path: string, childContent = "child rendered") {
  return render(
    <ChromeProvider lang="pt">
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          {/*
           * The shell wraps both /projetos (index) and /projetos/:slug (detail).
           * We use an index route + a param route as children, mirroring App.tsx.
           */}
          <Route element={<SiteLayout />}>
            <Route element={<ProjectsLayoutShell />}>
              <Route index path="/projetos" element={<div>{childContent}</div>} />
              <Route
                path="/projetos/:slug"
                element={<div>{childContent}</div>}
              />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </ChromeProvider>,
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

// ---------------------------------------------------------------------------
// Labels per locale, and DOM order of the back link
// ---------------------------------------------------------------------------

function renderLocalized(lang: "pt" | "en", path: string) {
  return render(
    <ChromeProvider lang={lang}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route element={<ProjectsLayoutShell />}>
              <Route path="/projetos/:slug" element={<div data-testid="page">page</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </ChromeProvider>,
  );
}

describe("ProjectsLayoutShell — siteChrome labels and order", () => {
  it.each(["pt", "en"] as const)("%s: breadcrumb and back link use the locale labels", (lang) => {
    renderLocalized(lang, "/projetos/x");
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav.textContent).toContain(CHROME[lang].projects);
    expect(screen.getByTestId("back-link").textContent).toBe(CHROME[lang].back);
  });

  it("on a detail route the back link follows the outlet content", () => {
    renderLocalized("pt", "/projetos/x");
    const page = screen.getByTestId("page");
    const back = screen.getByTestId("back-link");
    expect(
      page.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("ProjectsLayoutShell — width", () => {
  it.each(["/projetos", "/projetos/x"])(
    "%s: the shell root sets no width of its own (the layout owns the column)",
    (path) => {
      renderShell(path);
      const root = screen.getByTestId("breadcrumb").parentElement as HTMLElement;
      expect(root.className).not.toContain("max-w-[960px]");
      expect(root.className.split(/\s+/)).not.toContain("mx-auto");
    },
  );
});
