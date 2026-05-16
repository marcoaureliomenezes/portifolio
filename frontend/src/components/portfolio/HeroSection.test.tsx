import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeroSection } from "./HeroSection";
import type { ContentData } from "@/types/content";

const baseContent = {
  resumeTitle: "Resumo",
  skillsTitle: "Habilidades",
  experienceTitle: "Experiência",
  educationTitle: "Educação",
  certificationsTitle: "Certificações",
  seeMore: "Ver mais",
  seeLess: "Ver menos",
  responsibilities: "Responsabilidades:",
  technologies: "Tecnologias:",
  validUntil: "Válido até",
  viewCredential: "Ver credencial",
  header: { title: "Data Engineer", location: "BH", viewEmail: "Email" },
  resume: { short: "Resumo curto.", full: "Resumo completo expandido." },
  heroTagline: "Construo pipelines de dados em escala",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Baixar CV", seeExperience: "Ver experiência" },
  skills: [],
  experiences: [],
  education: { degree: "", institution: "", period: "", coursework: "", thesis: "" },
  certifications: [],
} as ContentData;

describe("HeroSection", () => {
  it("preserves #hero-heading ID so home.spec.ts (E2E-01) does not break", () => {
    render(<HeroSection content={baseContent} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.id).toBe("hero-heading");
  });

  it("renders the tagline from heroTagline", () => {
    render(<HeroSection content={baseContent} />);
    expect(screen.getByText(/Construo pipelines de dados em escala/i)).toBeInTheDocument();
  });

  it("renders both CTAs (Download CV + See experience)", () => {
    render(<HeroSection content={baseContent} />);
    expect(screen.getByRole("link", { name: /Baixar CV/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver experiência/i })).toBeInTheDocument();
  });

  it("falls back to resumeTitle when heroTagline is absent", () => {
    const { heroTagline: _omit, ...rest } = baseContent;
    render(<HeroSection content={rest as ContentData} />);
    expect(screen.getByText("Resumo")).toBeInTheDocument();
  });

  // T-FE-PROJ-03 — 3rd CTA
  it("renders seeProjects CTA as a link to /projetos when present (T-FE-PROJ-03)", () => {
    const contentWith3Ctas = {
      ...baseContent,
      heroCTAs: { downloadCv: "Baixar CV", seeExperience: "Ver experiência", seeProjects: "Ver projetos" },
    } as ContentData;
    render(
      <MemoryRouter>
        <HeroSection content={contentWith3Ctas} />
      </MemoryRouter>
    );
    const projectsLink = screen.getByRole("link", { name: /ver projetos/i });
    expect(projectsLink).toBeInTheDocument();
    expect(projectsLink).toHaveAttribute("href", "/projetos");
  });

  it("does NOT render seeProjects CTA when absent from heroCTAs (T-FE-PROJ-03)", () => {
    render(<HeroSection content={baseContent} />);
    expect(screen.queryByRole("link", { name: /ver projetos/i })).toBeNull();
  });
});
