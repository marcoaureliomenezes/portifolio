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
  responsibilities: ["Built pipelines", "Optimized queries", "Reduced batch failures", "Led migrations"],
  technologies: "Python, Spark, AWS",
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
      />
    );
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders the period", () => {
    render(
      <RoleCollapsible
        role={mockRole}
        labels={mockLabels}
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
      />
    );

    // Three-line teaser should be visible before toggle, but full details remain hidden.
    expect(screen.getByText(/Built pipelines Optimized queries Reduced batch failures/)).toBeInTheDocument();
    expect(screen.queryByText("Led migrations")).not.toBeInTheDocument();

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
      />
    );

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders skill badges when position.skills is present and collapsible is open", async () => {
    const user = userEvent.setup();
    const roleWithSkills: Position = {
      ...mockRole,
      skills: ["Python", "Azure", "Claude Code"],
    };

    render(
      <RoleCollapsible
        role={roleWithSkills}
        labels={mockLabels}
        defaultOpen
      />
    );

    const badges = screen.getAllByTestId("skill-badge");
    expect(badges).toHaveLength(3);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Azure")).toBeInTheDocument();
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
    // force use of user to satisfy the import
    expect(user).toBeDefined();
  });

  it("renders highlight block when position.highlightProject is present and collapsible is open", () => {
    const roleWithHighlight: Position = {
      ...mockRole,
      highlightProject: {
        title: "Migration Project",
        body: "Solo AI-augmented migration.",
        impact: ["SLA: 12 months → 2 months"],
      },
    };

    render(
      <RoleCollapsible
        role={roleWithHighlight}
        labels={mockLabels}
        defaultOpen
      />
    );

    expect(screen.getByText("Migration Project")).toBeInTheDocument();
    expect(screen.getByText("SLA: 12 months → 2 months")).toBeInTheDocument();
    expect(screen.getByLabelText("Impacto")).toBeInTheDocument();
  });
});
