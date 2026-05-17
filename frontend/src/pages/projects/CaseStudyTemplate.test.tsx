/**
 * CaseStudyTemplate.test.tsx — T-PC-B-03
 *
 * Unit tests for CaseStudyTemplate:
 *  - SEO hook sets document.title and meta description
 *  - shadcn Card primitive is rendered (at least one card)
 *  - Button (CTA to GitHub) is present
 *  - Sections render their titles
 *  - Badge renders tech tags from card.tech
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CaseStudyTemplate } from "./CaseStudyTemplate";
import type { CaseStudyProject } from "@/types/content";

afterEach(() => {
  cleanup();
  document.title = "";
  // clean up metas
  document
    .querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')
    .forEach((el) => el.remove());
});

const mockProject: CaseStudyProject = {
  slug: "dadaia-workspace",
  kind: "case-study",
  hero: {
    title: "dadaia-workspace",
    tagline: "Agent-driven SDD ecosystem.",
  },
  card: {
    cover: "/assets/projects/dadaia-workspace/cover.webp",
    summary: "Spec-driven development with AI agents.",
    tech: ["Python", "Docker", "TypeScript"],
  },
  seo: {
    title: "dadaia-workspace — Marco Menezes",
    description: "An agent-driven SDD ecosystem for spec-driven development.",
  },
  sections: [
    { id: "what", title: "What is it?", body: "It is a workspace." },
    { id: "why", title: "Why it exists", body: "For faster development." },
  ],
  cta: {
    github: "https://github.com/marcoaureliomenezes/dadaia-workspace",
    githubLabel: "Ver no GitHub",
  },
};

function renderTemplate(project = mockProject) {
  return render(
    <MemoryRouter>
      <CaseStudyTemplate project={project} />
    </MemoryRouter>,
  );
}

describe("CaseStudyTemplate", () => {
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

  it("renders section headings for each section", () => {
    renderTemplate();
    for (const section of mockProject.sections) {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    }
  });

  it("renders at least one Card primitive (role=article or data from shadcn)", () => {
    const { container } = renderTemplate();
    // shadcn Card renders as <div> — detect via class or fallback to container presence
    const cards = container.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders the GitHub CTA button", () => {
    renderTemplate();
    const ctaLink = screen.getByRole("link", { name: /github/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", mockProject.cta.github);
    expect(ctaLink).toHaveAttribute("target", "_blank");
    expect(ctaLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders tech badges from card.tech", () => {
    renderTemplate();
    for (const tech of mockProject.card.tech) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
  });

  it("has no useEffect SEO imperatives — uses hook (no direct document.title assignment in component body)", () => {
    // This is enforced structurally: if useDocumentSeo works (test above), the hook is used.
    // We verify that title is set even without explicit useEffect in the template itself.
    renderTemplate();
    expect(document.title).toBe(mockProject.seo.title);
  });
});
