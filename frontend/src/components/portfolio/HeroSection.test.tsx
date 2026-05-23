import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeroSection } from "./HeroSection";
import type { ContentData } from "@/types/content";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

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
  heroTagline: "Data Engineering at Scale with AI Augmented Capabilities",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Baixar CV", seeExperience: "Ver experiência", seeProjects: "Personal Projects" },
  skills: [],
  experiences: [],
  education: { degreeLevel: "", degreeField: "", institution: "", location: "", period: "", courseworkLabel: "", coursework: "", thesisLabel: "", thesis: "" },
  certifications: [],
};

describe("HeroSection", () => {
  it("preserves #hero-heading ID so home.spec.ts (E2E-01) does not break", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.id).toBe("hero-heading");
  });

  it("renders the approved first-fold headline from heroTagline", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    expect(
      screen.getByRole("heading", {
        name: "Data Engineering at Scale with AI Augmented Capabilities",
      }),
    ).toBeInTheDocument();
  });

  it("uses the large headline scale for the redesigned hero", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-4xl");
    expect(heading).toHaveClass("md:text-6xl");
  });

  it("renders the profile avatar inside the hero (identity anchor above the headline)", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    expect(
      screen.getByRole("img", { name: /Marco Aurelio Menezes/i }),
    ).toBeInTheDocument();
  });

  it("renders exactly 2 CTAs: primary 'See projects' link + secondary 'Download CV' link", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    expect(screen.getByRole("link", { name: /Personal Projects/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Baixar CV/i })).toBeInTheDocument();
    // 'See experience' button must be gone
    expect(screen.queryByRole("button", { name: /Ver experiência/i })).not.toBeInTheDocument();
  });

  it("falls back to resumeTitle when heroTagline is absent", () => {
    const { heroTagline: _omit, ...rest } = baseContent;
    renderWithRouter(<HeroSection content={rest as ContentData} />);
    expect(screen.getByText("Resumo")).toBeInTheDocument();
  });

  it("'Personal Projects' CTA links to /projetos (T-PHP-03)", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    const link = screen.getByRole("link", { name: /Personal Projects/i });
    expect(link).toHaveAttribute("href", "/projetos");
  });

  // T-FE-QUAL-10 — locale-keyed CV URL routing
  // Operator decision (2026-05-17): single PT PDF serves all locales.
  it("CV download link href is /cv.pdf when locale is 'pt'", () => {
    renderWithRouter(<HeroSection content={baseContent} locale="pt" />);
    const link = screen.getByRole("link", { name: /Baixar CV/i });
    expect(link).toHaveAttribute("href", "/cv.pdf");
  });

  it("CV download link href is /cv.pdf when locale is 'en' (shared PT asset)", () => {
    renderWithRouter(<HeroSection content={baseContent} locale="en" />);
    const link = screen.getByRole("link", { name: /Baixar CV/i });
    expect(link).toHaveAttribute("href", "/cv.pdf");
  });

  it("CV download link href is /cv.pdf when locale is 'de' (shared PT asset)", () => {
    renderWithRouter(<HeroSection content={baseContent} locale="de" />);
    const link = screen.getByRole("link", { name: /Baixar CV/i });
    expect(link).toHaveAttribute("href", "/cv.pdf");
  });
});
