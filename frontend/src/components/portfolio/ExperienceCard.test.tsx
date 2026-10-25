/**
 * ExperienceCard.test.tsx — T-FE-WAVE6
 *
 * Verifies:
 *  - badges render for a single-role experience with skills
 *  - highlight block renders when highlightProject is set on a single-role
 *  - badges and highlight do not render when absent (no regression)
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ExperienceCard } from "./ExperienceCard";
import type { Experience, ContentData } from "@/types/content";

const mockLabels: Pick<
  ContentData,
  "responsibilities" | "technologies" | "careerProgression" | "roleSingular" | "rolePlural"
> = {
  responsibilities: "Responsibilities",
  technologies: "Technologies",
  careerProgression: "Career progression",
  roleSingular: "role",
  rolePlural: "roles",
};

const singleRoleWithSkills: Experience = {
  company: "Acme",
  fullName: "Acme Corp",
  location: "São Paulo, BR",
  totalPeriod: "Jan 2021 – Present",
  type: "main",
  roles: [
    {
      title: "Senior Data Engineer",
      period: "Jan 2021 – Present",
      responsibilities: ["Built pipelines"],
      technologies: "Python, Spark",
      skills: ["Python", "Azure", "SQL", "Claude Code"],
    },
  ],
};

const singleRoleWithHighlight: Experience = {
  company: "Banco",
  fullName: "Banco S.A.",
  location: "São Paulo, BR",
  totalPeriod: "Mar 2022 – Present",
  type: "main",
  roles: [
    {
      title: "Senior Data Engineer",
      period: "Mar 2022 – Present",
      skills: ["Python"],
      highlightProject: {
        title: "Migração SAS → Azure",
        body: "Solo migration using AI tooling.",
        impact: ["Redução SLA: 12 meses → 2 meses"],
      },
    },
  ],
};

const singleRoleNoExtras: Experience = {
  company: "OldCo",
  fullName: "OldCo Inc",
  location: "Recife, BR",
  totalPeriod: "2019 – 2021",
  type: "minor",
  roles: [
    {
      title: "Junior Dev",
      period: "2019 – 2021",
    },
  ],
};

describe("ExperienceCard", () => {
  it("renders a single-role experience in the same collapsed model with a teaser", () => {
    render(<ExperienceCard experience={singleRoleWithSkills} labels={mockLabels} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getAllByText("Jan 2021 – Present").length).toBeGreaterThan(0);
    expect(screen.getByText("São Paulo, BR")).toBeInTheDocument();
    expect(screen.getByText("Built pipelines")).toBeInTheDocument();
    expect(screen.queryByTestId("skill-badge")).not.toBeInTheDocument();
  });

  it("renders skill badges after expanding a role", async () => {
    const user = userEvent.setup();
    render(<ExperienceCard experience={singleRoleWithSkills} labels={mockLabels} />);
    await user.click(screen.getByRole("button", { name: /Senior Data Engineer/i }));
    const badges = screen.getAllByTestId("skill-badge");
    expect(badges).toHaveLength(4);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Azure")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
  });

  it("does not render badges when skills are absent", () => {
    render(<ExperienceCard experience={singleRoleNoExtras} labels={mockLabels} />);
    expect(screen.queryByTestId("skill-badge")).not.toBeInTheDocument();
  });

  it("renders highlight block after expanding when highlightProject is set", async () => {
    const user = userEvent.setup();
    render(<ExperienceCard experience={singleRoleWithHighlight} labels={mockLabels} />);
    await user.click(screen.getByRole("button", { name: /Senior Data Engineer/i }));
    expect(screen.getByText("Migração SAS → Azure")).toBeInTheDocument();
    expect(screen.getByText("Redução SLA: 12 meses → 2 meses")).toBeInTheDocument();
    expect(screen.getByLabelText("Impacto")).toBeInTheDocument();
  });

  it("does not render highlight block when highlightProject is absent", () => {
    render(<ExperienceCard experience={singleRoleWithSkills} labels={mockLabels} />);
    // No ⚡ Impacto badge should appear
    expect(screen.queryByLabelText("Impacto")).not.toBeInTheDocument();
  });
});

// ── ExperienceCard — i18n ─────────────────────────────────────────────────

const multiRoleExperience: Experience = {
  company: "Acme Corp",
  fullName: "Acme Corp",
  location: "São Paulo",
  totalPeriod: "2020–present",
  type: "main",
  roles: [
    { title: "Senior Engineer", period: "2022–present" },
    { title: "Mid Engineer", period: "2020–2022" },
  ],
};

describe("ExperienceCard — i18n", () => {
  it("renders careerProgression label from labels prop (not hardcoded)", () => {
    // Use a custom string — if the component had it hardcoded, this would fail
    render(
      <ExperienceCard
        experience={multiRoleExperience}
        labels={{
          responsibilities: "Responsabilidades:",
          technologies: "Tecnologias:",
          careerProgression: "Trajeto profissional",
          roleSingular: "cargo",
          rolePlural: "cargos",
        }}
      />,
    );
    expect(screen.getByText(/Trajeto profissional/)).toBeInTheDocument();
  });

  it("does NOT render hardcoded 'Progressão de carreira' when custom label supplied", () => {
    render(
      <ExperienceCard
        experience={multiRoleExperience}
        labels={{
          responsibilities: "Responsabilidades:",
          technologies: "Tecnologias:",
          careerProgression: "Career progression",
          roleSingular: "position",
          rolePlural: "positions",
        }}
      />,
    );
    // Hardcoded 'Progressão de carreira' must NOT appear
    expect(screen.queryByText(/Progressão de carreira/i)).not.toBeInTheDocument();
  });

  it("renders plural rolePlural when roles.length > 1", () => {
    render(
      <ExperienceCard
        experience={multiRoleExperience}
        labels={{
          responsibilities: "Responsabilidades:",
          technologies: "Tecnologias:",
          careerProgression: "Career progression",
          roleSingular: "position",
          rolePlural: "positions",
        }}
      />,
    );
    expect(screen.getByText(/2 positions/)).toBeInTheDocument();
  });

  it("renders singular roleSingular when roles.length === 1", () => {
    const singleRole: Experience = {
      ...multiRoleExperience,
      roles: [{ title: "Senior Engineer", period: "2022–present" }],
    };
    render(
      <ExperienceCard
        experience={singleRole}
        labels={{
          responsibilities: "Responsabilidades:",
          technologies: "Tecnologias:",
          careerProgression: "Career progression",
          roleSingular: "position",
          rolePlural: "positions",
        }}
      />,
    );
    expect(screen.getByText(/1 position/)).toBeInTheDocument();
  });
});
