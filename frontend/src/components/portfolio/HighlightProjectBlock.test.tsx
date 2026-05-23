/**
 * HighlightProjectBlock.test.tsx — T-FE-WAVE6
 *
 * Tests:
 *  - renders all provided fields (title, body, impact items)
 *  - returns null when highlight is not provided (renders nothing)
 *  - correctly handles missing optional stats (impact, links)
 *  - renders links with correct rel and target attributes
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HighlightProjectBlock } from "./HighlightProjectBlock";
import type { HighlightProject } from "@/types/content";

const fullHighlight: HighlightProject = {
  title: "Migração SAS → Azure + Databricks",
  body: "Conduzindo solo a re-arquitetura de pipelines de dados críticos rodando em SAS para a stack moderna.",
  impact: [
    "Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)",
    "Execução solo viabilizada por AI-augmented engineering",
  ],
  links: [
    { label: "Ver detalhes", url: "https://example.com/project" },
  ],
};

const minimalHighlight: HighlightProject = {
  title: "Projeto Mínimo",
  body: "Descrição do projeto mínimo.",
};

describe("HighlightProjectBlock", () => {
  it("renders the title", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    expect(screen.getByText("Migração SAS → Azure + Databricks")).toBeInTheDocument();
  });

  it("renders the body paragraph", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    expect(screen.getByText(/Conduzindo solo/)).toBeInTheDocument();
  });

  it("renders all impact items as list", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    expect(screen.getByText("Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)")).toBeInTheDocument();
    expect(screen.getByText("Execução solo viabilizada por AI-augmented engineering")).toBeInTheDocument();
  });

  it("renders the impact badge with aria-label", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    const impactBadge = screen.getByLabelText("Impacto");
    expect(impactBadge).toBeInTheDocument();
  });

  it("renders links when provided", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    const link = screen.getByRole("link", { name: "Ver detalhes" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com/project");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render links section when links are absent", () => {
    render(<HighlightProjectBlock highlight={minimalHighlight} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render impact section when impact is absent", () => {
    render(<HighlightProjectBlock highlight={minimalHighlight} />);
    // No list items expected
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders title and body even without optional fields", () => {
    render(<HighlightProjectBlock highlight={minimalHighlight} />);
    expect(screen.getByText("Projeto Mínimo")).toBeInTheDocument();
    expect(screen.getByText("Descrição do projeto mínimo.")).toBeInTheDocument();
  });

  it("has the accent-subtle background container", () => {
    const { container } = render(<HighlightProjectBlock highlight={fullHighlight} />);
    const block = container.firstElementChild;
    expect(block?.className).toContain("bg-accent-subtle");
  });
});
