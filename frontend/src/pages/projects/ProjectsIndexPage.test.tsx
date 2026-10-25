/**
 * ProjectsIndexPage.test.tsx — T-PC-C-03
 *
 * TDD: written before the page exists.
 * Tests:
 *  1. Renders page heading with index title from content
 *  2. Renders exactly 3 project cards (one per project in the fixed list)
 *  3. Cards appear in fixed order: dadaia-workspace, portifolio, tauan-games
 *  4. Each card links to the correct /projetos/:slug route
 *  5. Cards are wrapped in a grid container (grid class present)
 *  6. Page content is within a <main> landmark
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProjectsIndexPage } from "./ProjectsIndexPage";
import { ProjectsLayoutShell } from "@/components/projects/ProjectsLayoutShell";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LanguageContext } from "@/contexts/LanguageContext";
import type { ContentData, Project } from "@/types/content";

// Boundary stub: the header's own contract lives in Header.test.tsx.
vi.mock("@/components/Header", () => ({
  Header: () => <header>header</header>,
}));

const mockProjects: Project[] = [
  {
    slug: "dadaia-workspace",
    kind: "case-study",
    hero: { title: "dadaia-workspace", tagline: "SDD ecosystem" },
    card: { summary: "An AI-augmented SDD orchestration ecosystem.", tech: ["Python"] },
    seo: { title: "dadaia-workspace", description: "desc" },
    sections: [],
    cta: { github: "https://github.com/marcoaureliomenezes" },
  },
  {
    slug: "portifolio",
    kind: "meta",
    hero: { title: "Portfólio", tagline: "This site" },
    card: { summary: "Engineering portfolio built with React.", tech: ["React"] },
    seo: { title: "Portfólio", description: "desc" },
    sections: [],
    stack: [],
    costs: [],
    decisions: [],
    links: { repo: "#", terraform: "#", specs: "#" },
  },
  {
    slug: "tauan-games",
    kind: "games",
    hero: { title: "Tauan Games", tagline: "Games with my son" },
    card: { summary: "Games built with my son Tauan.", tech: ["Phaser.js"] },
    seo: { title: "Tauan Games", description: "desc" },
    items: [],
  },
];

/** The committed locale file the app fetches: the required chrome and profile. */
const committed = JSON.parse(
  readFileSync(resolve(process.cwd(), "public/content/pt.json"), "utf-8"),
) as Pick<ContentData, "siteChrome" | "profile">;

vi.mock("@/hooks/useContent", () => ({
  useContent: () => ({
    content: {
      siteChrome: committed.siteChrome,
      profile: committed.profile,
      projectsV2: {
        index: { title: "Projetos", description: "Galeria de projetos." },
        list: mockProjects,
      },
    },
    isLoading: false,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsIndexPage />
    </MemoryRouter>,
  );
}

/** The layout route mirror: SiteLayout owns the <main>, the shell owns the breadcrumb. */
function renderInLayout() {
  const content = {
    siteChrome: {
      ...committed.siteChrome,
      breadcrumb: { label: "Breadcrumb", projects: "Projetos" },
      backToProjects: "Voltar para projetos",
    },
    profile: committed.profile,
  } as unknown as ContentData;
  return render(
    <LanguageContext.Provider
      value={{ language: "pt", setLanguage: () => undefined, content, isLoading: false }}
    >
      <MemoryRouter initialEntries={["/projetos"]}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route element={<ProjectsLayoutShell />}>
              <Route path="/projetos" element={<ProjectsIndexPage />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </LanguageContext.Provider>,
  );
}

describe("ProjectsIndexPage — rendering", () => {
  it("renders the page heading from content.projectsV2.index.title", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Projetos",
    );
  });

  it("renders exactly 3 project cards (links)", () => {
    renderPage();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("cards appear in fixed order: dadaia-workspace, portifolio, tauan-games", () => {
    renderPage();
    const links = screen.getAllByRole("link");
    expect(links[0]!.getAttribute("href")).toBe("/projetos/dadaia-workspace");
    expect(links[1]!.getAttribute("href")).toBe("/projetos/portifolio");
    expect(links[2]!.getAttribute("href")).toBe("/projetos/tauan-games");
  });

  it("grid container is present (layout constraint for CLS = 0)", () => {
    const { container } = renderPage();
    // Verify at least one grid element with expected classes exists
    const grid = container.querySelector("[data-testid='projects-grid']");
    expect(grid).toBeTruthy();
  });

  it("page content is within a <main> landmark", () => {
    renderInLayout();
    expect(screen.getByRole("main")).toBeTruthy();
  });
});

describe("ProjectsIndexPage — shell owns the landmark", () => {
  it("renders no <main> of its own", () => {
    const { container } = renderPage();
    expect(container.querySelector("main")).toBeNull();
  });
});
