/**
 * RoleSkillBadges.test.tsx — T-FE-WAVE6
 *
 * Tests:
 *  - renders N badges from N skills
 *  - each badge gets the correct color class based on skillCategoryColors
 *  - renders nothing (null / empty container) for empty array
 *  - works for mixed-category skill lists
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RoleSkillBadges } from "./RoleSkillBadges";

describe("RoleSkillBadges", () => {
  it("renders nothing when skills array is empty", () => {
    const { container } = render(<RoleSkillBadges skills={[]} />);
    // Should render no badge elements
    expect(container.querySelectorAll("[data-testid='skill-badge']").length).toBe(0);
  });

  it("renders the correct number of badges", () => {
    const skills = ["Python", "SQL", "Azure"];
    render(<RoleSkillBadges skills={skills} />);
    const badges = screen.getAllByTestId("skill-badge");
    expect(badges).toHaveLength(3);
  });

  it("renders each skill text", () => {
    const skills = ["Python", "SQL", "Azure"];
    render(<RoleSkillBadges skills={skills} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByText("Azure")).toBeInTheDocument();
  });

  it("applies language category class to Python", () => {
    render(<RoleSkillBadges skills={["Python"]} />);
    const badge = screen.getByTestId("skill-badge");
    // language category: bg-emerald-100
    expect(badge.className).toContain("bg-emerald-100");
  });

  it("applies cloud category class to Azure", () => {
    render(<RoleSkillBadges skills={["Azure"]} />);
    const badge = screen.getByTestId("skill-badge");
    // cloud category: bg-blue-100
    expect(badge.className).toContain("bg-blue-100");
  });

  it("applies database category class to SQL", () => {
    render(<RoleSkillBadges skills={["SQL"]} />);
    const badge = screen.getByTestId("skill-badge");
    // database category: bg-purple-100
    expect(badge.className).toContain("bg-purple-100");
  });

  it("applies ai-tooling category class to Claude Code", () => {
    render(<RoleSkillBadges skills={["Claude Code"]} />);
    const badge = screen.getByTestId("skill-badge");
    // ai-tooling category: bg-accent-subtle
    expect(badge.className).toContain("bg-accent-subtle");
  });

  it("applies default category class to unknown skill", () => {
    render(<RoleSkillBadges skills={["Unknown Skill XYZ"]} />);
    const badge = screen.getByTestId("skill-badge");
    // default category: bg-muted
    expect(badge.className).toContain("bg-muted");
  });

  it("handles mixed-category skill list with correct classes per badge", () => {
    const skills = ["Python", "AWS", "SQL", "Claude Code", "Unknown Skill XYZ"];
    render(<RoleSkillBadges skills={skills} />);
    const badges = screen.getAllByTestId("skill-badge");

    expect(badges).toHaveLength(5);
    expect(badges[0].className).toContain("bg-emerald-100"); // Python -> language
    expect(badges[1].className).toContain("bg-blue-100");    // AWS -> cloud
    expect(badges[2].className).toContain("bg-purple-100");  // SQL -> database
    expect(badges[3].className).toContain("bg-accent-subtle"); // Claude Code -> ai-tooling
    expect(badges[4].className).toContain("bg-muted");       // Unknown -> default
  });

  it("applies ai-tooling class to Devin", () => {
    render(<RoleSkillBadges skills={["Devin"]} />);
    const badge = screen.getByTestId("skill-badge");
    expect(badge.className).toContain("bg-accent-subtle");
  });

  it("applies ai-tooling class to GitHub Copilot", () => {
    render(<RoleSkillBadges skills={["GitHub Copilot"]} />);
    const badge = screen.getByTestId("skill-badge");
    expect(badge.className).toContain("bg-accent-subtle");
  });
});
