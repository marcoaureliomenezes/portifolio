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

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { track } from "@dadaia/analytics-sdk";
import { RoleCollapsible } from "./RoleCollapsible";
import { PROSE } from "@/lib/layout";
import type { Position, ContentData } from "@/types/content";

const mockRole: Position = {
  title: "Software Engineer",
  period: "Jan 2022 – Present",
  responsibilities: ["Built pipelines", "Optimized queries", "Reduced batch failures", "Led migrations"],
  technologies: "Python, Spark, AWS",
};

vi.mock("@dadaia/analytics-sdk", () => ({ track: vi.fn() }));

type Labels = Pick<
  ContentData,
  "responsibilities" | "technologies" | "detailsOpen" | "detailsClose" | "impactLabel"
>;

const mockLabels: Labels = {
  responsibilities: "Responsabilidades:",
  technologies: "Tecnologias:",
  detailsOpen: "Detalhes +",
  detailsClose: "Detalhes −",
  impactLabel: "Impacto",
};

const highlightRole: Position = {
  ...mockRole,
  highlightProject: {
    title: "Migration Project",
    body: "Solo AI-augmented migration.",
  },
};

beforeEach(() => vi.clearAllMocks());

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

    // T-RD-03: summary = FIRST responsibility only, visible while closed;
    // full details (later bullets) remain hidden.
    expect(screen.getByText("Built pipelines")).toBeInTheDocument();
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

    // T-RD-03: closed state shows the one-line summary (first responsibility)
    // in the trigger; the LATER bullets must be gone.
    expect(screen.queryByText("Led migrations")).not.toBeInTheDocument();
    expect(screen.getByText("Built pipelines")).toBeInTheDocument();
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

  it("renders the role as an article with the title in an h4", () => {
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);
    const article = screen.getByTestId("role");
    expect(article.tagName).toBe("ARTICLE");
    expect(
      within(article).getByRole("heading", { level: 4, name: "Software Engineer" }),
    ).toBeInTheDocument();
  });

  it("shows the summary unclamped, in the prose width, open or closed", async () => {
    const user = userEvent.setup();
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);

    const summary = screen.getByText("Built pipelines");
    expect(summary.className).toContain(PROSE);
    expect(summary.className).not.toContain("line-clamp");

    await user.click(screen.getByRole("button", { name: "Detalhes +" }));
    expect(screen.getByText("Built pipelines").className).not.toContain("line-clamp");
  });

  it("names its one button from detailsOpen, then detailsClose", async () => {
    const user = userEvent.setup();
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);

    const button = screen.getByRole("button", { name: "Detalhes +" });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.textContent).toBe("Detalhes +");

    await user.click(button);
    expect(screen.getByRole("button", { name: "Detalhes −" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(button.textContent).toBe("Detalhes −");
  });

  it("the role article is frameless: no background, border or radius classes", () => {
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);
    const article = screen.getByTestId("role");
    expect(article.className).not.toMatch(/\bbg-card\b/);
    expect(article.className).not.toMatch(/\bborder/);
    expect(article.className).not.toMatch(/\brounded/);
  });

  it("the Details button holds only its label, no icon child", () => {
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);
    const button = screen.getByRole("button");
    expect(button.childElementCount).toBe(0);
    expect(button.textContent).toBe("Detalhes +");
  });

  it("does not put the title or the summary inside the button", () => {
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);
    const button = screen.getByRole("button");
    expect(within(button).queryByText("Software Engineer")).not.toBeInTheDocument();
    expect(within(button).queryByText("Built pipelines")).not.toBeInTheDocument();
  });

  it("aria-controls points to the region holding the remaining responsibilities", async () => {
    const user = userEvent.setup();
    render(<RoleCollapsible role={highlightRole} labels={mockLabels} />);

    const button = screen.getByRole("button");
    await user.click(button);

    const region = document.getElementById(button.getAttribute("aria-controls") ?? "");
    expect(region).not.toBeNull();
    expect(within(region as HTMLElement).getByText("Led migrations")).toBeInTheDocument();
    expect(within(region as HTMLElement).getByText("Migration Project")).toBeInTheDocument();
    expect(within(region as HTMLElement).queryByText("Built pipelines")).not.toBeInTheDocument();
  });

  it("tracks section_expand then section_collapse with the role title", async () => {
    const user = userEvent.setup();
    render(<RoleCollapsible role={mockRole} labels={mockLabels} />);

    await user.click(screen.getByRole("button"));
    expect(track).toHaveBeenLastCalledWith("section_expand", { section: "Software Engineer" });
    await user.click(screen.getByRole("button"));
    expect(track).toHaveBeenLastCalledWith("section_collapse", { section: "Software Engineer" });
  });

  it.each([
    ["en", "Impact"],
    ["de", "Wirkung"],
  ])("labels the highlight impact badge in %s from impactLabel", (_lang, word) => {
    render(
      <RoleCollapsible
        role={highlightRole}
        labels={{ ...mockLabels, impactLabel: word }}
        defaultOpen
      />,
    );
    expect(screen.getByLabelText(word)).toBeInTheDocument();
    expect(screen.queryByLabelText("Impacto")).not.toBeInTheDocument();
  });
});
