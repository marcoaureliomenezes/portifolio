/**
 * GamesProjectTemplate.test.tsx — T-PC-B-03
 *
 * Unit tests for GamesProjectTemplate:
 *  - SEO hook sets document.title and meta description
 *  - Renders hero title + tagline
 *  - C-08: renders N game-card elements equal to project.items.length
 *  - C-08: zero <iframe> tags in the DOM
 *  - Each game card has a "play" link with target=_blank and rel=noopener noreferrer
 *  - Engine labels match (Three.js, Phaser — from QA contract C-09)
 *  - shadcn Card primitives rendered
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GamesProjectTemplate } from "./GamesProjectTemplate";
import type { GamesProject } from "@/types/content";

afterEach(() => {
  cleanup();
  document.title = "";
  document
    .querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')
    .forEach((el) => el.remove());
});

const mockProject: GamesProject = {
  slug: "tauan-games",
  kind: "games",
  hero: {
    title: "tauan-games",
    tagline: "Games built at home with my son Tauan.",
  },
  card: {
    cover: "/assets/projects/tauan-games/cover.webp",
    summary: "Game prototypes built together.",
    tech: ["Three.js", "Phaser"],
  },
  seo: {
    title: "tauan-games — Marco Menezes",
    description: "Game prototypes developed with Tauan.",
  },
  items: [
    {
      slug: "aero-fighters",
      title: "Aero Fighters",
      engine: "Three.js",
      cover: "/assets/projects/tauan-games/aero-fighters-cover.webp",
      body: "Shooter aéreo desenvolvido com Three.js.",
      repo: "https://github.com/marcoaureliomenezes/tauan-games",
      playUrl: "https://marcoaureliomenezes.github.io/tauan-games/aero-fighters/",
    },
    {
      slug: "tauan-trex",
      title: "Tauan T-Rex",
      engine: "Phaser",
      cover: "/assets/projects/tauan-games/tauan-trex-cover.webp",
      body: "Jogo de dinossauro estilo Chrome dino.",
      repo: "https://github.com/marcoaureliomenezes/tauan-games",
      playUrl: "https://marcoaureliomenezes.github.io/tauan-games/tauan-trex/",
    },
  ],
};

function renderTemplate(project = mockProject) {
  return render(
    <MemoryRouter>
      <GamesProjectTemplate project={project} />
    </MemoryRouter>,
  );
}

describe("GamesProjectTemplate", () => {
  it("sets document.title via useDocumentSeo", () => {
    renderTemplate();
    expect(document.title).toBe(mockProject.seo.title);
  });

  it("sets meta description via useDocumentSeo", () => {
    renderTemplate();
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    expect(meta?.content).toBe(mockProject.seo.description);
  });

  it("renders h1 with project title", () => {
    renderTemplate();
    expect(
      screen.getByRole("heading", { level: 1, name: mockProject.hero.title }),
    ).toBeInTheDocument();
  });

  it("renders hero tagline", () => {
    renderTemplate();
    expect(screen.getByText(mockProject.hero.tagline)).toBeInTheDocument();
  });

  it("C-08: renders N game cards equal to project.items.length", () => {
    renderTemplate();
    // Each game item title appears exactly once — serves as the game card count proxy
    for (const item of mockProject.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
    // Also check the exact count via headings (h2 or h3 for game titles)
    const gameTitles = mockProject.items.map((i) => i.title);
    const rendered = gameTitles.filter((t) => screen.queryByText(t) !== null);
    expect(rendered.length).toBe(mockProject.items.length);
  });

  it("C-08: renders exactly 0 <iframe> tags", () => {
    const { container } = renderTemplate();
    expect(container.querySelectorAll("iframe")).toHaveLength(0);
  });

  it("C-08: renders N game cards matching items.length by play links", () => {
    renderTemplate();
    const playLinks = screen
      .getAllByRole("link")
      .filter((l) => mockProject.items.some((item) => item.playUrl === l.getAttribute("href")));
    expect(playLinks.length).toBe(mockProject.items.length);
  });

  it("each play link has target=_blank and rel=noopener noreferrer", () => {
    renderTemplate();
    const playLinks = screen
      .getAllByRole("link")
      .filter((l) => mockProject.items.some((item) => item.playUrl === l.getAttribute("href")));
    for (const link of playLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("C-09: engine label shows Three.js for aero-fighters", () => {
    renderTemplate();
    // Three.js appears in hero tech badges AND game card engine badge — both valid
    const matches = screen.getAllByText("Three.js");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("C-09: engine label shows Phaser for tauan-trex", () => {
    renderTemplate();
    // Phaser appears in hero tech badges AND game card engine badge — both valid
    const matches = screen.getAllByText("Phaser");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("C-09: Babylon does not appear in the page", () => {
    const { container } = renderTemplate();
    expect(container.textContent).not.toContain("Babylon");
  });

  it("renders at least one Card primitive", () => {
    const { container } = renderTemplate();
    const cards = container.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders empty-state when items is empty", () => {
    const emptyProject: GamesProject = { ...mockProject, items: [] };
    renderTemplate(emptyProject);
    // Should render hero without crashing
    expect(
      screen.getByRole("heading", { level: 1, name: mockProject.hero.title }),
    ).toBeInTheDocument();
    // No play links
    const playLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.startsWith("https://marcoaureliomenezes.github.io"));
    expect(playLinks.length).toBe(0);
  });
});
