/**
 * ProjectHero.test.tsx — T-PC-C-02
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders h1 with hero.title
 *  2. Renders hero.tagline
 *  3. Renders tech badges from card.tech
 *  4. Renders gradient placeholder when cover is absent
 *  5. Renders cover image when card.cover is set
 *  6. Cover area has aspect-video class (CLS = 0)
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectHero } from "../ProjectHero";
import type { Project } from "@/types/content";

const mockCaseStudy: Project = {
  slug: "dadaia-workspace",
  kind: "case-study",
  hero: { title: "dadaia-workspace", tagline: "AI-augmented SDD ecosystem" },
  card: {
    summary: "An orchestration ecosystem.",
    tech: ["Python", "Docker", "Traefik"],
  },
  seo: { title: "dadaia-workspace SEO", description: "desc" },
  sections: [],
  cta: { github: "https://github.com/example" },
};

const mockWithCover: Project = {
  ...mockCaseStudy,
  card: { ...mockCaseStudy.card, cover: "/assets/cover.png" },
};

describe("ProjectHero — rendering", () => {
  it("renders h1 with hero.title", () => {
    render(<ProjectHero project={mockCaseStudy} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("dadaia-workspace");
  });

  it("renders hero.tagline", () => {
    render(<ProjectHero project={mockCaseStudy} />);
    expect(screen.getByText("AI-augmented SDD ecosystem")).toBeTruthy();
  });

  it("renders tech badges", () => {
    render(<ProjectHero project={mockCaseStudy} />);
    expect(screen.getByText("Python")).toBeTruthy();
    expect(screen.getByText("Docker")).toBeTruthy();
    expect(screen.getByText("Traefik")).toBeTruthy();
  });

  it("renders gradient placeholder when no cover", () => {
    const { container } = render(<ProjectHero project={mockCaseStudy} />);
    const placeholder = container.querySelector("[data-testid='hero-cover-placeholder']");
    expect(placeholder).toBeTruthy();
  });

  it("renders cover image when card.cover is set", () => {
    const { container } = render(<ProjectHero project={mockWithCover} />);
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("/assets/cover.png");
  });

  it("cover area has aspect-video for CLS=0", () => {
    const { container } = render(<ProjectHero project={mockCaseStudy} />);
    const placeholder = container.querySelector("[data-testid='hero-cover-placeholder']");
    expect(placeholder?.className).toContain("aspect-video");
  });
});

describe("ProjectHero — un-boxed", () => {
  const tokens = (el: Element) => el.className.toString().split(/\s+/);

  it("has no wrapper carrying rounded + border, a shadow or a gradient outside the cover block and the tech pills", () => {
    const { container } = render(<ProjectHero project={mockCaseStudy} />);
    const outside = [...container.querySelectorAll("*")].filter(
      (el) => !el.closest("[data-testid='hero-cover-placeholder'], [aria-label='Technologies']"),
    );
    const boxed = outside.filter((el) => {
      const t = tokens(el);
      return t.some((c) => /^rounded/.test(c)) && t.some((c) => /^border(-|$)/.test(c));
    });
    expect(boxed).toHaveLength(0);
    expect(outside.filter((el) => tokens(el).some((c) => /(^|:)shadow/.test(c)))).toHaveLength(0);
    expect(outside.filter((el) => tokens(el).some((c) => /gradient|^from-|^to-/.test(c)))).toHaveLength(0);
  });

  it("h1 uses the title / title-sm type steps", () => {
    render(<ProjectHero project={mockCaseStudy} />);
    const t = screen.getByRole("heading", { level: 1 }).className.split(/\s+/);
    expect(t).toContain("text-title-sm");
    expect(t).toContain("md:text-title");
    expect(t).not.toContain("md:text-4xl");
  });
});
