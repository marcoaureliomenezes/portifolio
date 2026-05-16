/**
 * HighlightProjectBlock.test.tsx — T-FE-WAVE6
 *
 * Targets:
 *  - Smoke: renders title, body, and "⚡ Impacto" badge
 *  - Impact list: renders each item in impact array
 *  - Links optional: renders link buttons only when links are passed
 *  - A11y: badge has aria-label="Impacto"
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HighlightProjectBlock } from "./HighlightProjectBlock";
import type { HighlightProject } from "@/types/content";

const baseHighlight: HighlightProject = {
  title: "Migração SAS → Azure + Databricks",
  body: "Conduzindo solo a re-arquitetura de pipelines de dados críticos.",
};

const fullHighlight: HighlightProject = {
  ...baseHighlight,
  impact: [
    "Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)",
    "Execução solo viabilizada por AI-augmented engineering",
  ],
  links: [
    { label: "GitHub", url: "https://github.com/example" },
  ],
};

describe("HighlightProjectBlock", () => {
  it("renders the project title", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    expect(screen.getByText("Migração SAS → Azure + Databricks")).toBeInTheDocument();
  });

  it("renders the body paragraph", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    expect(
      screen.getByText("Conduzindo solo a re-arquitetura de pipelines de dados críticos.")
    ).toBeInTheDocument();
  });

  it("renders the ⚡ Impacto badge text", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    // The badge should have the emoji and label
    expect(screen.getByText(/Impacto/)).toBeInTheDocument();
  });

  it("impact badge has aria-label for screen readers", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    const impactBadge = screen.getByLabelText("Impacto");
    expect(impactBadge).toBeInTheDocument();
  });

  it("renders each impact item when impact array is provided", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    expect(
      screen.getByText("Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Execução solo viabilizada por AI-augmented engineering")
    ).toBeInTheDocument();
  });

  it("does not render impact list when impact is not provided", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    // No list items for impact
    expect(
      screen.queryByText("Redução do tempo de migração: 12 meses → 2 meses (SLA de execução do projeto)")
    ).not.toBeInTheDocument();
  });

  it("renders link buttons when links are provided", () => {
    render(<HighlightProjectBlock highlight={fullHighlight} />);
    const link = screen.getByRole("link", { name: "GitHub" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://github.com/example");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not render links section when links are not provided", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    // No link role elements (besides any navigation)
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("has region role with aria-labelledby for screen readers", () => {
    render(<HighlightProjectBlock highlight={baseHighlight} />);
    const region = screen.getByRole("region");
    expect(region).toBeInTheDocument();
  });
});
