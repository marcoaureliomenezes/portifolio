/**
 * ProjectCard.test.tsx — T-PC-C-02 (partial: ProjectCard only)
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders the project title
 *  2. Renders the summary text
 *  3. Wraps content in a React Router <Link> pointing to /projetos/:slug
 *  4. Has focus-visible:ring-2 (via data-testid ring class or keyboard ring element)
 *  5. Renders a gradient placeholder when no coverImage is set (T-PC-C-06 replaces)
 *  6. Accessible: card link has discernible accessible name
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectCard } from "../ProjectCard";
import type { Project } from "@/types/content";

// Minimal case-study project fixture — no cover image (T-PC-C-06 will add covers)
const mockCaseStudy: Project = {
  slug: "dadaia-workspace",
  kind: "case-study",
  hero: { title: "dadaia-workspace", tagline: "AI-augmented SDD ecosystem" },
  card: {
    summary: "An orchestration ecosystem for AI-powered software delivery.",
    tech: ["Python", "Docker", "Traefik"],
  },
  seo: { title: "dadaia-workspace SEO", description: "desc" },
  sections: [],
  cta: { github: "https://github.com/marcoaureliomenezes/dadaia-workspace" },
};

// Meta project fixture
const mockMeta: Project = {
  slug: "portifolio",
  kind: "meta",
  hero: { title: "Portfólio", tagline: "This very site" },
  card: {
    summary: "Engineering portfolio built with React + Vite.",
    tech: ["React", "TypeScript", "Tailwind"],
  },
  seo: { title: "Portfólio SEO", description: "desc" },
  sections: [],
  stack: [],
  costs: [],
  decisions: [],
  links: { repo: "#", terraform: "#", specs: "#" },
};

function renderCard(project: Project) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>,
  );
}

describe("ProjectCard — rendering", () => {
  it("renders the project hero title", () => {
    renderCard(mockCaseStudy);
    expect(screen.getByText("dadaia-workspace")).toBeTruthy();
  });

  it("renders the card summary text", () => {
    renderCard(mockCaseStudy);
    expect(
      screen.getByText(
        "An orchestration ecosystem for AI-powered software delivery.",
      ),
    ).toBeTruthy();
  });

  it("wraps content in a link pointing to /projetos/:slug", () => {
    renderCard(mockCaseStudy);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/projetos/dadaia-workspace");
  });

  it("renders gradient placeholder when no cover image (T-PC-C-06 replaces)", () => {
    const { container } = renderCard(mockCaseStudy);
    // The placeholder element should carry a class indicating it's a gradient
    const placeholder = container.querySelector("[data-testid='card-cover-placeholder']");
    expect(placeholder).toBeTruthy();
  });

  it("card link has discernible accessible name (a11y)", () => {
    renderCard(mockCaseStudy);
    // The link must have an accessible name — either from aria-label or text content
    const link = screen.getByRole("link");
    const name =
      link.getAttribute("aria-label") ?? link.textContent?.trim() ?? "";
    expect(name.length).toBeGreaterThan(0);
  });

  it("works for meta kind project", () => {
    renderCard(mockMeta);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/projetos/portifolio");
    expect(screen.getByText("Portfólio")).toBeTruthy();
  });
});

describe("ProjectCard — no stat chip", () => {
  it("renders no project-card-stat even when the data carries a stat", () => {
    const withStat = {
      ...mockCaseStudy,
      card: { ...mockCaseStudy.card, stat: "5 agent roles" },
    } as unknown as Project;
    const { container } = renderCard(withStat);
    expect(container.querySelector("[data-testid='project-card-stat']")).toBeNull();
    expect(screen.queryByText("5 agent roles")).toBeNull();
  });
});

const cut = {
  webm: "/m/a.webm",
  mp4: "/m/a.mp4",
  poster: "/m/a-poster.webp",
  width: 1280,
  height: 720,
};

const mockLibrary = {
  slug: "rand-engine",
  kind: "library",
  hero: {
    title: "rand-engine",
    tagline: "Synthetic data",
    media: { type: "video", alt: "rand-engine demo", desktop: cut, phone: cut },
  },
  card: {
    summary: "Generate realistic data fast.",
    tech: ["Python", "Spark", "Pandas"],
    cover: "/covers/ignored.webp",
  },
  seo: { title: "t", description: "d" },
  sections: [],
  pypi: { package: "rand-engine", version: "0.8.0", installCommand: "pip install rand-engine" },
  links: { repo: "https://x.test", pypi: "https://y.test" },
} as unknown as Project;

describe("ProjectCard — four elements", () => {
  it("renders the video poster as one still img with size and alt", () => {
    const { container } = renderCard(mockLibrary);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(1);
    const img = imgs[0];
    expect(img.getAttribute("src")).toBe("/m/a-poster.webp");
    expect(img.getAttribute("width")).toBe("1280");
    expect(img.getAttribute("height")).toBe("720");
    expect(img.getAttribute("alt")).toBe("rand-engine demo");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  it("falls back to card.cover with width, height and alt when there is no video", () => {
    const meta = {
      ...mockMeta,
      card: { ...mockMeta.card, cover: "/covers/p.webp" },
    } as unknown as Project;
    const { container } = renderCard(meta);
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/covers/p.webp");
    expect(img?.getAttribute("width")).toBe("1280");
    expect(img?.getAttribute("height")).toBe("720");
    expect(img?.getAttribute("alt")).toBe("Portfólio");
  });

  it("shows name, one line and PyPI version for a library item", () => {
    renderCard(mockLibrary);
    expect(screen.getByTestId("project-card-title").textContent).toBe("rand-engine");
    expect(screen.getByText("Generate realistic data fast.")).toBeTruthy();
    expect(screen.getByText("PyPI 0.8.0")).toBeTruthy();
  });

  it("shows no PyPI line for a non-library item", () => {
    renderCard(mockCaseStudy);
    expect(screen.queryByText(/^PyPI /)).toBeNull();
  });

  it("renders no kind chip, tech badges, install hint or video", () => {
    const { container } = renderCard(mockLibrary);
    expect(container.querySelector("[data-testid='project-card-kind']")).toBeNull();
    expect(container.querySelector("[data-testid='project-card-tech']")).toBeNull();
    expect(container.querySelector("[data-testid='project-card-install']")).toBeNull();
    expect(screen.queryByText("Python")).toBeNull();
    expect(screen.queryByText(/pip install/)).toBeNull();
    expect(container.querySelector("video")).toBeNull();
  });
});
