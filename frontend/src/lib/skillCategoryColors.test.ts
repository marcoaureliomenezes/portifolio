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
});
