/**
 * RoleCollapsible.test.tsx — T-QA-03
 *
 * Targets:
 *  - toggle open/close via CollapsibleTrigger click
 *  - aria-expanded attribute reflects the open state
 *
 * Strategy: Radix Collapsible is a real DOM component that renders its content
 * conditionally.  We use @testing-library/user-event to click the trigger so
 * that React state updates are processed correctly.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { RoleCollapsible } from "./RoleCollapsible";
import type { Position, ContentData } from "@/types/content";

const mockRole: Position = {
  title: "Software Engineer",
  period: "Jan 2022 – Present",
  responsibilities: ["Built pipelines", "Optimized queries"],
  technologies: "Python, Spark, AWS",
};

const mockRoleWithSkills: Position = {
  ...mockRole,
  skills: ["Python", "Claude Code", "Azure"],
};

const mockRoleWithHighlight: Position = {
  ...mockRole,
  highlightProject: {
    title: "Migração SAS → Azure",
    body: "Conduzindo solo a migração de pipelines.",
    impact: ["Redução 12 meses → 2 meses"],
  },
};

const mockLabels: Pick<ContentData, "responsibilities" | "technologies"> = {
  responsibilities: "Responsabilidades:",
  technologies: "Tecnologias:",
};

describe("RoleCollapsible", () => {
  it("renders the role title", () => {
    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
      />
    );
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders the period", () => {
    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
      />
    );
    expect(screen.getByText("Jan 2022 – Present")).toBeInTheDocument();
  });

  it("starts closed by default and toggle opens it", async () => {
    const user = userEvent.setup();

    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
      />
    );

    // Responsibilities should not be visible before toggle
    expect(screen.queryByText("Built pipelines")).not.toBeInTheDocument();

    // Click the trigger button to open
    const trigger = screen.getByRole("button");
    await user.click(trigger);

    // Content should now be visible
    expect(screen.getByText("Built pipelines")).toBeInTheDocument();
    expect(screen.getByText("Python, Spark, AWS")).toBeInTheDocument();
  });

  it("starts open when defaultOpen=true", () => {
    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
        defaultOpen
      />
    );
    expect(screen.getByText("Built pipelines")).toBeInTheDocument();
  });

  it("toggle closes an open collapsible", async () => {
    const user = userEvent.setup();

    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
        defaultOpen
      />
    );

    expect(screen.getByText("Built pipelines")).toBeInTheDocument();

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    expect(screen.queryByText("Built pipelines")).not.toBeInTheDocument();
  });

  it("trigger has aria-expanded=false when closed", () => {
    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
      />
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("trigger has aria-expanded=true when open", async () => {
    const user = userEvent.setup();

    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
      />
    );

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders skill badges when position.skills is present", async () => {
    const user = userEvent.setup();

    render(
      <RoleCollapsible
        role={mockRoleWithSkills}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
        defaultOpen
      />
    );

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
    expect(screen.getByText("Azure")).toBeInTheDocument();
  });

  it("renders highlight block when position.highlightProject is present", async () => {
    render(
      <RoleCollapsible
        role={mockRoleWithHighlight}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
        defaultOpen
      />
    );

    expect(screen.getByText("Migração SAS → Azure")).toBeInTheDocument();
    expect(screen.getByText("Redução 12 meses → 2 meses")).toBeInTheDocument();
  });

  it("does not render skill badges section when skills is absent", () => {
    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
        responsibilitiesLabel="Responsabilidades:"
        technologiesLabel="Tecnologias:"
        defaultOpen
      />
    );

    expect(document.querySelector('[aria-label="Skills do cargo"]')).not.toBeInTheDocument();
  });
});
