/**
 * MetaProjectTemplate.test.tsx — T-PC-B-03
 *
 * Unit tests for MetaProjectTemplate:
 *  - SEO hook sets document.title and meta description
 *  - Renders hero title + tagline
 *  - Renders stack rows in a table
 *  - Renders cost rows in a table
 *  - Renders architectural decisions
 *  - Renders external links (repo, terraform, specs) as proper anchors
 *  - shadcn Card primitives rendered
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MetaProjectTemplate } from "./MetaProjectTemplate";
import type { MetaProject, ContentData } from "@/types/content";
import { LanguageContext } from "@/contexts/LanguageContext";

afterEach(() => {
  cleanup();
  document.title = "";
  document
    .querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')
    .forEach((el) => el.remove());
});

const mockProject: MetaProject = {
  slug: "portifolio",
  kind: "meta",
  hero: {
    title: "Portfolio Architecture",
    tagline: "How this site is built, hosted, and maintained.",
  },
  card: {
    cover: "/assets/projects/portifolio/cover.webp",
    summary: "The portfolio itself, documented.",
    tech: ["React", "TypeScript", "Terraform"],
  },
  seo: {
    title: "Portfolio Architecture — Marco Menezes",
    description: "Stack, costs and decisions for marco-menezes.com.",
  },
  sections: [
    { id: "overview", title: "Overview", body: "This is the portfolio." },
  ],
  stack: [
    { layer: "Frontend", tech: "React + TypeScript" },
    { layer: "Infra", tech: "Terraform + AWS" },
  ],
  costs: [
    { service: "CloudFront", monthly_usd: 0.5 },
    { service: "S3", monthly_usd: 0.1 },
  ],
  decisions: [
    {
      title: "SPA over SSR",
      rationale: "Low traffic; simpler deployment.",
      spec: "https://github.com/marcoaureliomenezes/portifolio/tree/main/specs",
    },
  ],
  links: {
    repo: "https://github.com/marcoaureliomenezes/portifolio",
    terraform: "https://github.com/marcoaureliomenezes/portifolio/tree/main/terraform",
    specs: "https://github.com/marcoaureliomenezes/portifolio/tree/main/specs",
  },
};

const enContent = {
  archPage: {
    techStackTitle: "Stack in English",
    monthlyCostsTitle: "Costs in English",
    tableHeaderLayer: "Layer EN",
    tableHeaderTechnology: "Technology EN",
    archDecisionsTitle: "Decisions in English",
    linksTitle: "Links EN",
    linkGithubRepo: "Repository EN",
    linkTerraform: "Terraform EN",
    linkSpecs: "Specs EN",
  },
} as unknown as ContentData;

function renderTemplate(project = mockProject) {
  return render(
    <LanguageContext.Provider
      value={{ language: "en", setLanguage: () => undefined, content: enContent, isLoading: false }}
    >
      <MemoryRouter>
        <MetaProjectTemplate project={project} />
      </MemoryRouter>
    </LanguageContext.Provider>,
  );
}

describe("MetaProjectTemplate", () => {
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

  it("renders stack rows", () => {
    renderTemplate();
    for (const row of mockProject.stack) {
      expect(screen.getByText(row.layer)).toBeInTheDocument();
      expect(screen.getByText(row.tech)).toBeInTheDocument();
    }
  });

  it("renders cost rows with USD values", () => {
    renderTemplate();
    for (const row of mockProject.costs) {
      expect(screen.getByText(row.service)).toBeInTheDocument();
    }
    // Check USD formatting — at least one dollar sign is present
    expect(screen.getAllByText(/\$/)[0]).toBeInTheDocument();
  });

  it("renders architectural decisions", () => {
    renderTemplate();
    for (const d of mockProject.decisions) {
      expect(screen.getByText(d.title)).toBeInTheDocument();
      expect(screen.getByText(d.rationale)).toBeInTheDocument();
    }
  });

  it("renders links section with repo, terraform, and specs links", () => {
    renderTemplate();
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain(mockProject.links.repo);
    expect(hrefs).toContain(mockProject.links.terraform);
    expect(hrefs).toContain(mockProject.links.specs);
  });

  it("all external links have target=_blank and rel=noopener noreferrer", () => {
    renderTemplate();
    const externalLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("target") === "_blank");
    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders at least one Card primitive", () => {
    const { container } = renderTemplate();
    const cards = container.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders tech badges from card.tech", () => {
    renderTemplate();
    for (const tech of mockProject.card.tech) {
      // Use getAllByText because some tech names (e.g. "Terraform") can appear
      // both in the hero badge strip and in the links section label.
      const matches = screen.getAllByText(tech);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it("renders no <main>: SiteLayout owns it", () => {
    const { container } = renderTemplate();
    expect(container.querySelector("main")).toBeNull();
  });

  it("renders the en archPage labels", () => {
    const { container } = renderTemplate();
    for (const text of ["Stack in English", "Costs in English", "Decisions in English", "Links EN", "Repository EN", "Specs EN"]) {
      expect(container.textContent).toContain(text);
    }
  });
});
