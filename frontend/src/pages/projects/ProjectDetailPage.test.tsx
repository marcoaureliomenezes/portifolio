/**
 * ProjectDetailPage.test.tsx — T-PC-B-04
 *
 * Unit tests for ProjectDetailPage:
 *  - case "case-study" dispatches to CaseStudyTemplate
 *  - case "meta" dispatches to MetaProjectTemplate
 *  - case "games" dispatches to GamesProjectTemplate
 *  - unknown slug renders NotFound inline (preserves URL — no redirect)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock the three templates so tests are isolated from their rendering logic
vi.mock("./CaseStudyTemplate", () => ({
  CaseStudyTemplate: ({ project }: { project: { slug: string } }) => (
    <div data-testid="case-study-template">{project.slug}</div>
  ),
}));

vi.mock("./MetaProjectTemplate", () => ({
  MetaProjectTemplate: ({ project }: { project: { slug: string } }) => (
    <div data-testid="meta-project-template">{project.slug}</div>
  ),
}));

vi.mock("./GamesProjectTemplate", () => ({
  GamesProjectTemplate: ({ project }: { project: { slug: string } }) => (
    <div data-testid="games-project-template">{project.slug}</div>
  ),
}));

// Mock useContent to return controlled data — avoids depending on JSON files
vi.mock("@/hooks/useContent", () => ({
  useContent: () => ({
    content: {
      notFoundMessage: "Page not found",
      returnHome: "Return home",
      projectsV2: {
        index: { title: "Projects", description: "All projects" },
        list: [
          {
            slug: "dadaia-workspace",
            kind: "case-study",
            hero: { title: "dadaia-workspace", tagline: "SDD ecosystem" },
            card: { summary: "SDD", tech: ["Python"] },
            seo: { title: "dadaia-workspace SEO", description: "desc" },
            sections: [],
            cta: { github: "https://github.com/marcoaureliomenezes/dadaia-workspace" },
          },
          {
            slug: "portifolio",
            kind: "meta",
            hero: { title: "Portfolio", tagline: "How this is built" },
            card: { summary: "Portfolio", tech: ["React"] },
            seo: { title: "Portfolio SEO", description: "desc" },
            sections: [],
            stack: [],
            costs: [],
            decisions: [],
            links: { repo: "", terraform: "", specs: "" },
          },
          {
            slug: "tauan-games",
            kind: "games",
            hero: { title: "tauan-games", tagline: "Games" },
            card: { summary: "Games", tech: ["Three.js"] },
            seo: { title: "tauan-games SEO", description: "desc" },
            items: [],
          },
        ],
      },
    },
    language: "pt",
    setLanguage: () => {},
    label: (k: string) => k,
  }),
  getProjectBySlug: (content: { projectsV2?: { list: Array<{ slug: string }> } }, slug: string) => {
    return content.projectsV2?.list.find((p) => p.slug === slug);
  },
}));

import { ProjectDetailPage } from "./ProjectDetailPage";

afterEach(() => {
  cleanup();
});

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projetos/:slug" element={<ProjectDetailPage />} />
        <Route path="*" element={<div data-testid="fallback">fallback</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProjectDetailPage", () => {
  it("dispatches to CaseStudyTemplate for kind=case-study", () => {
    renderAtPath("/projetos/dadaia-workspace");
    expect(screen.getByTestId("case-study-template")).toBeInTheDocument();
    expect(screen.queryByTestId("meta-project-template")).toBeNull();
    expect(screen.queryByTestId("games-project-template")).toBeNull();
  });

  it("dispatches to MetaProjectTemplate for kind=meta", () => {
    renderAtPath("/projetos/portifolio");
    expect(screen.getByTestId("meta-project-template")).toBeInTheDocument();
    expect(screen.queryByTestId("case-study-template")).toBeNull();
    expect(screen.queryByTestId("games-project-template")).toBeNull();
  });

  it("dispatches to GamesProjectTemplate for kind=games", () => {
    renderAtPath("/projetos/tauan-games");
    expect(screen.getByTestId("games-project-template")).toBeInTheDocument();
    expect(screen.queryByTestId("case-study-template")).toBeNull();
    expect(screen.queryByTestId("meta-project-template")).toBeNull();
  });

  it("renders NotFound inline for unknown slug (preserves URL — no redirect)", () => {
    renderAtPath("/projetos/slug-inexistente");
    // Should render NotFound content, NOT any template
    expect(screen.queryByTestId("case-study-template")).toBeNull();
    expect(screen.queryByTestId("meta-project-template")).toBeNull();
    expect(screen.queryByTestId("games-project-template")).toBeNull();
    // Should NOT have navigated to the catch-all fallback route
    expect(screen.queryByTestId("fallback")).toBeNull();
    // NotFound message should appear (from mocked content)
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
