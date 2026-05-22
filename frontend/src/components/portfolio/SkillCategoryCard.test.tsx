import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkillCategoryCard } from "./SkillCategoryCard";

describe("SkillCategoryCard", () => {
  it("renders the full AI / Modern Tooling stack required by portfolio-home-polish-v1", () => {
    render(
      <SkillCategoryCard
        skillCategory={{
          title: "AI / Modern Tooling",
          icon: "🤖",
          skills: [
            "AI",
            "LLM",
            "Devin",
            "OpenAI Codex",
            "Claude Code",
            "Opencode",
            "Hermes agent",
            "Openclaw",
            "Spec Driven Development",
            "Harness",
            "Context engineering",
          ],
        }}
      />,
    );

    for (const skill of [
      "OpenAI Codex",
      "Claude Code",
      "Opencode",
      "Hermes agent",
      "Openclaw",
      "Spec Driven Development",
      "Harness",
      "Context engineering",
    ]) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });
});
