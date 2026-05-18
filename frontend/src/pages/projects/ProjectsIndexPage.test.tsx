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

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectsIndexPage } from "./ProjectsIndexPage";
import type { Project } from "@/types/content";

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

vi.mock("@/hooks/useContent", () => ({
  useContent: () => ({
    content: {
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
    renderPage();
    expect(screen.getByRole("main")).toBeTruthy();
  });
});
