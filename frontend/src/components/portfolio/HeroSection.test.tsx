import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "./HeroSection";
import type { ContentData } from "@/types/content";

const baseContent: ContentData = {
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
  issuerLabel: "Emissor",
  certSingular: "certificado",
  certPlural: "certificados",
  careerProgression: "Progressão de carreira",
  roleSingular: "cargo",
  rolePlural: "cargos",
  viewLarger: "Ver maior",
  gamesComingSoon: "Em construção",
  gamesComingSoonDesc: "Os jogos serão listados aqui em breve.",
  notFoundMessage: "Oops! Página não encontrada",
  returnHome: "Voltar ao início",
  header: { title: "Data Engineer", location: "BH", viewEmail: "Email" },
  resume: { short: "Resumo curto.", full: "Resumo completo expandido." },
  heroTagline: "Construo pipelines de dados em escala",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Baixar CV", seeExperience: "Ver experiência" },
  skills: [],
  experiences: [],
  education: { degree: "", institution: "", period: "", coursework: "", thesis: "" },
  certifications: [],
};

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

  // T-FE-QUAL-10 — locale-keyed CV URL routing
  it("CV download link href defaults to /cv.pdf when locale is 'pt'", () => {
    render(<HeroSection content={baseContent} locale="pt" />);
    const link = screen.getByRole("link", { name: /Baixar CV/i });
    expect(link).toHaveAttribute("href", "/cv.pdf");
  });

  it("CV download link href falls back to /cv.pdf when locale is 'en' (asset pending)", () => {
    render(<HeroSection content={baseContent} locale="en" />);
    const link = screen.getByRole("link", { name: /Baixar CV/i });
    expect(link).toHaveAttribute("href", "/cv.pdf");
  });

  it("CV download link href falls back to /cv.pdf when locale is 'de' (asset pending)", () => {
    render(<HeroSection content={baseContent} locale="de" />);
    const link = screen.getByRole("link", { name: /Baixar CV/i });
    expect(link).toHaveAttribute("href", "/cv.pdf");
  });
});
