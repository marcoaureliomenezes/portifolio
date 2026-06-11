/**
 * DiagramCard.test.tsx — T-PC2-R2-05
 *
 * Tests the shared architecture-diagram card:
 *  - returns null when the project has no diagram
 *  - renders the i18n fallback heading ("Arquitetura") outside a provider
 *  - passes light + dark variants through to DiagramAsset
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiagramCard } from "../DiagramCard";
import type { CaseStudyProject } from "@/types/content";

const baseProject: CaseStudyProject = {
  slug: "demo",
  kind: "case-study",
  hero: { title: "Demo", tagline: "Demo tagline" },
  card: { summary: "Demo summary", tech: ["A", "B", "C"] },
  seo: { title: "Demo", description: "Demo" },
  sections: [{ id: "what", title: "What", body: "Body" }],
  cta: { github: "https://github.com/example/demo" },
};

describe("DiagramCard", () => {
  it("renders nothing when the project has no diagram", () => {
    const { container } = render(<DiagramCard project={baseProject} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the heading (PT fallback without provider) and the diagram", () => {
    render(
      <DiagramCard
        project={{
          ...baseProject,
          diagram: "/d/arch-light.svg",
          diagramAlt: "Demo architecture",
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Arquitetura",
    );
    expect(screen.getByRole("img").getAttribute("src")).toBe("/d/arch-light.svg");
  });

  it("passes the dark variant through (theme-aware pair)", () => {
    render(
      <DiagramCard
        project={{
          ...baseProject,
          diagram: "/d/arch-light.svg",
          diagramDark: "/d/arch-dark.svg",
          diagramAlt: "Demo architecture",
        }}
      />,
    );
    expect(screen.getByTestId("diagram-light")).toBeTruthy();
    expect(screen.getByTestId("diagram-dark").getAttribute("src")).toBe(
      "/d/arch-dark.svg",
    );
  });
});
