/**
 * RoleSkillBadges.test.tsx — T-FE-WAVE6
 *
 * Targets:
 *  - Smoke: renders N badges for N skills
 *  - Category color: ai-tooling skills get bg-accent-subtle className
 *  - Category color: cloud skills get bg-blue-100 className
 *  - Aria label on container for a11y
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RoleSkillBadges } from "./RoleSkillBadges";

describe("RoleSkillBadges", () => {
  it("renders one badge per skill", () => {
    const skills = ["Python", "Spark", "Azure"];
    render(<RoleSkillBadges skills={skills} />);
    skills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });

  it("renders the correct number of badges", () => {
    const skills = ["Python", "SQL", "Linux", "Databricks", "Claude Code"];
    render(<RoleSkillBadges skills={skills} />);
    // Each skill text should appear exactly once
    expect(screen.getAllByText(/Python|SQL|Linux|Databricks|Claude Code/).length).toBe(5);
  });

  it("applies ai-tooling badge class to Claude Code skill", () => {
    render(<RoleSkillBadges skills={["Claude Code"]} />);
    const badge = screen.getByText("Claude Code");
    // bg-accent-subtle is the ai-tooling badge class
    expect(badge.className).toMatch(/bg-accent-subtle/);
  });

  it("applies ai-tooling badge class to GitHub Copilot skill", () => {
    render(<RoleSkillBadges skills={["GitHub Copilot"]} />);
    const badge = screen.getByText("GitHub Copilot");
    expect(badge.className).toMatch(/bg-accent-subtle/);
  });

  it("applies cloud badge class to Azure skill", () => {
    render(<RoleSkillBadges skills={["Azure"]} />);
    const badge = screen.getByText("Azure");
    expect(badge.className).toMatch(/bg-blue-100/);
  });

  it("applies cloud badge class to AWS skill", () => {
    render(<RoleSkillBadges skills={["AWS"]} />);
    const badge = screen.getByText("AWS");
    expect(badge.className).toMatch(/bg-blue-100/);
  });

  it("renders empty without crashing when skills array is empty", () => {
    const { container } = render(<RoleSkillBadges skills={[]} />);
    const wrapper = container.querySelector('[aria-label="Skills do cargo"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.children.length).toBe(0);
  });

  it("container has aria-label for a11y", () => {
    render(<RoleSkillBadges skills={["Python"]} />);
    expect(screen.getByRole("list", { hidden: true })).toBeInTheDocument();
    // container aria-label
    const container = document.querySelector('[aria-label="Skills do cargo"]');
    expect(container).toBeInTheDocument();
  });
});
