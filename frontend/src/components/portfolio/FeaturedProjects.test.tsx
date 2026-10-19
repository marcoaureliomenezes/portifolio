/**
 * FeaturedProjects.test.tsx — T-RD-04 (AC-RD-01)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeaturedProjects } from "./FeaturedProjects";
import type { ContentData, Project } from "@/types/content";

function makeProject(slug: string, kind: Project["kind"] = "library"): Project {
  const base = {
    slug,
    hero: { title: slug, tagline: `${slug} tagline` },
    card: { summary: `${slug} summary`, tech: ["A", "B", "C"] },
    seo: { title: slug, description: slug },
  };
  if (kind === "library") {
    return {
      ...base,
      kind,
      sections: [{ id: "what", title: "What", body: "x" }],
      pypi: { package: slug, version: "1.0.0", installCommand: `pip install ${slug}` },
      links: { repo: "https://github.com/x/y", pypi: "https://pypi.org/project/x/" },
    };
  }
  return {
    ...base,
    kind: "meta",
    sections: [{ id: "overview", title: "O", body: "x" }],
    stack: [{ layer: "L", tech: "T" }],
    costs: [],
    decisions: [{ title: "d", rationale: "r", spec: "s" }],
    links: { repo: "https://r", terraform: "https://t", specs: "https://s" },
  };
}

const content = {
  featuredProjectsTitle: "Featured Projects",
  seeAllProjects: "See all projects",
  projectsV2: {
    index: { title: "Projects", description: "d" },
    list: [
      makeProject("dadaia-workspace"),
      makeProject("portifolio", "meta"),
      makeProject("tauan-games", "meta"),
      makeProject("rand-engine"),
    ],
  },
} as unknown as ContentData;

describe("FeaturedProjects", () => {
  it("renders the 3 curated cards in order (rand-engine, dadaia-workspace, portifolio)", () => {
    render(
      <MemoryRouter>
        <FeaturedProjects content={content} />
      </MemoryRouter>,
    );
    const cards = screen.getAllByTestId("project-card");
    expect(cards).toHaveLength(3);
    const hrefs = cards.map((c) => c.getAttribute("href"));
    expect(hrefs).toEqual([
      "/projetos/rand-engine",
      "/projetos/dadaia-workspace",
      "/projetos/portifolio",
    ]);
  });

  it("renders the i18n heading and the see-all link to /projetos", () => {
    render(
      <MemoryRouter>
        <FeaturedProjects content={content} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Featured Projects" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("see-all-projects").getAttribute("href")).toBe(
      "/projetos",
    );
  });

  it("renders nothing when projectsV2 is absent", () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedProjects content={{} as ContentData} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
