import { describe, expect, it } from "vitest";
import { classifySkillCategory, skillCategoryStyle } from "./skillCategoryColors";

describe("classifySkillCategory", () => {
  it.each([
    ["AWS", "cloud"],
    ["Azure", "cloud"],
    ["Cloud Platforms", "cloud"],
    ["Linguagens de Programação", "language"],
    ["Programming Languages", "language"],
    ["Bancos de Dados", "database"],
    ["Storage", "database"],
    ["AI & Tooling", "ai-tooling"],
    ["Random Misc", "default"],
    // AI tooling matchers — new in T-FE-WAVE5
    ["Claude Code", "ai-tooling"],
    ["Devin", "ai-tooling"],
    ["Windsurf", "ai-tooling"],
    ["GitHub Copilot", "ai-tooling"],
    ["Codex", "ai-tooling"],
    ["Opencode", "ai-tooling"],
    ["Openclaw", "ai-tooling"],
    ["Hermes", "ai-tooling"],
    ["Spec-Driven Development", "ai-tooling"],
    ["TDD com AI", "ai-tooling"],
    ["AI-augmented engineering", "ai-tooling"],
    ["Machine Learning", "ai-tooling"],
    ["LLM", "ai-tooling"],
    ["Agent", "ai-tooling"],
  ])("classifies %s as %s", (input, expected) => {
    expect(classifySkillCategory(input)).toBe(expected);
  });
});

describe("skillCategoryStyle", () => {
  it("returns blue tokens for cloud", () => {
    const s = skillCategoryStyle("AWS");
    expect(s.dot).toContain("blue");
  });
  it("returns accent tokens for ai-tooling", () => {
    const s = skillCategoryStyle("AI & Tooling");
    expect(s.dot).toContain("accent");
  });
  it("returns accent tokens for Claude Code", () => {
    const s = skillCategoryStyle("Claude Code");
    expect(s.dot).toContain("accent");
  });
  it("returns accent tokens for Devin", () => {
    const s = skillCategoryStyle("Devin");
    expect(s.dot).toContain("accent");
  });
  it("returns accent tokens for Windsurf", () => {
    const s = skillCategoryStyle("Windsurf");
    expect(s.dot).toContain("accent");
  });
  it("returns accent tokens for GitHub Copilot", () => {
    const s = skillCategoryStyle("GitHub Copilot");
    expect(s.dot).toContain("accent");
  });
});
