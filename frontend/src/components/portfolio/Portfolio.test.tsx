import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Portfolio } from "./Portfolio";
import type { ContentData } from "@/types/content";

vi.mock("@/hooks/useInView", () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

const content: ContentData = {
  resumeTitle: "Resume",
  skillsTitle: "Skills",
  experienceTitle: "Professional Experience",
  educationTitle: "Education",
  certificationsTitle: "Certifications",
  seeMore: "See more",
  seeLess: "See less",
  responsibilities: "Responsibilities",
  technologies: "Technologies",
  validUntil: "Valid until",
  viewCredential: "View credential",
  issuerLabel: "Issuer",
  certSingular: "certification",
  certPlural: "certifications",
  careerProgression: "Career progression",
  roleSingular: "role",
  rolePlural: "roles",
  viewLarger: "View larger",
  gamesComingSoon: "Coming soon",
  gamesComingSoonDesc: "Coming soon.",
  notFoundMessage: "Not found",
  returnHome: "Home",
  header: { title: "Data Engineer", location: "BH", viewEmail: "Email" },
  resume: { short: "Short resume.", full: "Full resume." },
  heroTagline: "Data Engineering at Scale with AI Augmented Capabilities",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Download CV", seeExperience: "See experience", seeProjects: "See projects" },
  skills: [],
  experiences: [],
  education: {
    degree: "Bachelor of Control and Automation / Mechatronics Engineering",
    institution: "Federal University of Ouro Preto",
    period: "08/2018",
    coursework: "Relevant coursework.",
    thesis: "Bachelor Thesis.",
  },
  certifications: [],
};

vi.mock("@/hooks/useContent", () => ({
  useContent: () => ({ content, language: "en" }),
}));

describe("Portfolio", () => {
  it("renders Education before Professional Experience", () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole("heading", { name: "Education" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Professional Experience" }).length).toBeGreaterThan(0);
    const education = document.getElementById("educacao");
    const experience = document.getElementById("experiencia");
    expect(education).not.toBeNull();
    expect(experience).not.toBeNull();
    expect(
      education!.compareDocumentPosition(experience!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
