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
  "responsibilities" | "technologies" | "detailsOpen" | "detailsClose" | "impactLabel"
> = {
  responsibilities: "Responsibilities",
  technologies: "Technologies",
  detailsOpen: "Details +",
  detailsClose: "Details −",
  impactLabel: "Impacto",
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
    render(<ExperienceCard experience={singleRoleWithSkills} labels={mockLabels} locale="en" />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getAllByText("Jan 2021 – Present").length).toBeGreaterThan(0);
    expect(screen.getByText("São Paulo, BR")).toBeInTheDocument();
    expect(screen.getByText("Built pipelines")).toBeInTheDocument();
    expect(screen.queryByTestId("skill-badge")).not.toBeInTheDocument();
  });

  it("renders skill badges after expanding a role", async () => {
    const user = userEvent.setup();
    render(<ExperienceCard experience={singleRoleWithSkills} labels={mockLabels} locale="en" />);
    await user.click(screen.getByRole("button", { name: /Details/ }));
    const badges = screen.getAllByTestId("skill-badge");
    expect(badges).toHaveLength(4);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Azure")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
  });

  it("does not render badges when skills are absent", () => {
    render(<ExperienceCard experience={singleRoleNoExtras} labels={mockLabels} locale="en" />);
    expect(screen.queryByTestId("skill-badge")).not.toBeInTheDocument();
  });

  it("renders highlight block after expanding when highlightProject is set", async () => {
    const user = userEvent.setup();
    render(<ExperienceCard experience={singleRoleWithHighlight} labels={mockLabels} locale="pt" />);
    await user.click(screen.getByRole("button", { name: /Details/ }));
    expect(screen.getByText("Migração SAS → Azure")).toBeInTheDocument();
    expect(screen.getByText("Redução SLA: 12 meses → 2 meses")).toBeInTheDocument();
    expect(screen.getByLabelText("Impacto")).toBeInTheDocument();
  });

  it("does not render highlight block when highlightProject is absent", () => {
    render(<ExperienceCard experience={singleRoleWithSkills} labels={mockLabels} locale="pt" />);
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
  it("does NOT render hardcoded 'Progressão de carreira' when custom label supplied", () => {
    render(
      <ExperienceCard
        experience={multiRoleExperience}
        labels={{ ...mockLabels, responsibilities: "Responsabilidades:", technologies: "Tecnologias:" }}
        locale="en"
      />,
    );
    // Hardcoded 'Progressão de carreira' must NOT appear
    expect(screen.queryByText(/Progressão de carreira/i)).not.toBeInTheDocument();
  });
});

// ── ExperienceCard — employer line ────────────────────────────────────────

describe("ExperienceCard — employer line", () => {
  const closed: Experience = {
    ...multiRoleExperience,
    totalPeriod: "07-2022 a 02-2024",
    roles: [
      { title: "Senior Engineer", period: "07-2022 a 02-2024" },
      { title: "Mid Engineer", period: "07-2022 a 02-2024" },
    ],
  };

  it("renders company, localized period and location in one h3", () => {
    render(<ExperienceCard experience={closed} labels={mockLabels} locale="pt" />);
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3).toHaveTextContent("Acme Corp");
    expect(h3).toHaveTextContent("jul. de 2022 – fev. de 2024 · 1 ano 7 meses");
    expect(h3).toHaveTextContent("São Paulo");
  });

  it("puts the employer line and its roles under a left rule, with no card", () => {
    const { container } = render(
      <ExperienceCard experience={closed} labels={mockLabels} locale="en" />,
    );
    const rule = container.querySelector('[class*="border-l"]');
    expect(rule).not.toBeNull();
    expect(rule).toContainElement(screen.getByRole("heading", { level: 3 }));
    expect(rule).toContainElement(screen.getAllByText("Senior Engineer")[0]);
    expect(screen.getByRole("heading", { level: 3 }).closest('[class*="bg-card"]')).toBeNull();
    expect(container.querySelector('[class*="bg-gradient"]')).toBeNull();
  });

  it("renders no career-progression count", () => {
    render(<ExperienceCard experience={closed} labels={mockLabels} locale="en" />);
    expect(screen.queryByText(/2 roles/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Career progression/i)).not.toBeInTheDocument();
  });
});
