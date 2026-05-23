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
    degreeLevel: "Bachelor",
    degreeField: "Control and Automation / Mechatronics Engineering",
    institution: "Federal University of Ouro Preto",
    location: "MG - Brazil",
    period: "08/2018",
    courseworkLabel: "Relevant coursework",
    coursework: "Python, C/C++, embedded systems.",
    thesisLabel: "Bachelor Thesis",
    thesis: "Bachelor Thesis.",
    thesisLink: "https://www.monografias.ufop.br/handle/35400000/1342",
  },
  certifications: [],
};

vi.mock("@/hooks/useContent", () => ({
  useContent: () => ({ content, language: "en" }),
}));

describe("Portfolio", () => {
  it("renders Professional Experience before Education (mobile-redesign-v1 section order)", () => {
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
    // Experience must appear BEFORE Education in DOM order
    expect(
      experience!.compareDocumentPosition(education!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
