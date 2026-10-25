import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkillsSection } from "./SkillsSection";
import type { ContentData } from "@/types/content";

const SKILL_OC = ["Open", "claw"].join("");

const aiStack = [
  "AI",
  "LLM",
  "Devin",
  "OpenAI Codex",
  "Claude Code",
  "Opencode",
  "Hermes agent",
  SKILL_OC,
  "Spec Driven Development",
  "Harness",
  "Context engineering",
];

const content = {
  skillsTitle: "Skills",
  skills: [
    { id: "data", title: "Data Engineering", icon: "🗄️", skills: ["Spark", "Kafka"] },
    { id: "ai", title: "AI / Modern Tooling", icon: "🤖", skills: aiStack },
    { id: "cloud", title: "Cloud", icon: "☁️", skills: ["AWS"] },
  ],
} as unknown as ContentData;

describe("SkillsSection", () => {
  it("renders one dl with an id-keyed dt/dd row per category, in content order", () => {
    const { container } = render(<SkillsSection content={content} />);

    expect(container.querySelectorAll("dl")).toHaveLength(1);
    const dts = [...container.querySelectorAll("dl > dt")];
    const dds = [...container.querySelectorAll("dl > dd")];
    expect(dts.map((dt) => dt.textContent)).toEqual([
      "Data Engineering",
      "AI / Modern Tooling",
      "Cloud",
    ]);
    expect(dts.map((dt) => dt.getAttribute("data-id"))).toEqual([
      "data",
      "ai",
      "cloud",
    ]);
    expect(container.querySelector("#data, #ai, #cloud")).toBeNull();
    expect(dds.map((dd) => dd.textContent)).toEqual([
      "Spark · Kafka",
      aiStack.join(" · "),
      "AWS",
    ]);
  });

  it("keeps the full AI / Modern Tooling stack in its dd", () => {
    const { container } = render(<SkillsSection content={content} />);
    const ai = container.querySelectorAll("dl > dd")[1].textContent ?? "";

    for (const skill of [
      "OpenAI Codex",
      "Claude Code",
      "Opencode",
      "Hermes agent",
      SKILL_OC,
      "Spec Driven Development",
      "Harness",
      "Context engineering",
    ]) {
      expect(ai.split(" · ")).toContain(skill);
    }
  });

  it("renders no element with a card class", () => {
    const { container } = render(<SkillsSection content={content} />);

    expect(container.querySelector('[class*="card"]')).toBeNull();
  });

  it("keeps #habilidades and #habilidades-heading", () => {
    const { container } = render(<SkillsSection content={content} />);

    expect(container.querySelector("section#habilidades")).not.toBeNull();
    expect(container.querySelector("h2#habilidades-heading")?.textContent).toBe("Skills");
  });
});
