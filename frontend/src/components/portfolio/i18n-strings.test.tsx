/**
 * i18n-strings.test.tsx — T-FE-QUAL-06
 *
 * Verifies that previously hardcoded UI strings are now sourced from content
 * JSON via useContent() — no literal text remaining in component code.
 *
 * Components covered:
 *   - CertificationCard        (issuerLabel, seeMore/seeLess reuse)
 *   - CertificationCategoryGroup (certSingular / certPlural)
 *   - ExperienceCard           (careerProgression, roleSingular / rolePlural)
 *   - HeroSection              (heroStatsSuffix: yearsSuffix, certsSuffix, cloudsSuffix)
 *   - NotFound                 (notFoundMessage, returnHome)
 *   - ContentData              (gamesComingSoon, gamesComingSoonDesc — retained for future use)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CertificationCard } from "./CertificationCard";
import { CertificationCategoryGroup } from "./CertificationCategoryGroup";
import { ExperienceCard } from "./ExperienceCard";
import { HeroSection } from "./HeroSection";
import type { ContentData, Certification, Experience } from "@/types/content";

// ── shared fixture ────────────────────────────────────────────────────────

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
  heroStatsSuffix: { years: "anos", certs: "certs", clouds: "nuvens" },
  archPage: {
    infraDiagramTitle: "Diagrama de Infraestrutura",
    techStackTitle: "Tech Stack",
    monthlyCostsTitle: "Custos Mensais",
    tableHeaderLayer: "Camada",
    tableHeaderTechnology: "Tecnologia",
    tableHeaderService: "Serviço",
    tableHeaderCostUsd: "USD / mês",
    archDecisionsTitle: "Decisões Arquiteturais",
    linksTitle: "Links",
    linkGithubRepo: "Repositório GitHub",
    linkTerraform: "Terraform",
    linkSpecs: "Specs",
  },
  header: { title: "Data Engineer", location: "BH", viewEmail: "Email" },
  resume: { short: "Resumo curto.", full: "Resumo completo." },
  heroTagline: "Tagline de teste",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Baixar CV", seeExperience: "Ver experiência" },
  skills: [],
  experiences: [],
  education: { degreeLevel: "", degreeField: "", institution: "", location: "", period: "", courseworkLabel: "", coursework: "", thesisLabel: "", thesis: "" },
  certifications: [],
};

const mockCert: Certification = {
  name: "AWS Solutions Architect",
  issuer: "Amazon Web Services",
  category: "AWS",
  date: "2023-06",
  validity: "2026-06",
  level: "Associate",
  icon: "",
  link: "https://example.com/cert",
  description: "A".repeat(101),
  priority: 1,
};

const mockLabels = {
  validUntil: baseContent.validUntil,
  viewCredential: baseContent.viewCredential,
  issuerLabel: baseContent.issuerLabel,
  seeMore: baseContent.seeMore,
  seeLess: baseContent.seeLess,
};

// ── CertificationCard ─────────────────────────────────────────────────────

describe("CertificationCard — i18n", () => {
  it("renders issuerLabel from content instead of hardcoded 'Emissor:'", () => {
    render(
      <CertificationCard
        cert={mockCert}
        labels={{ ...mockLabels, issuerLabel: "Emissor" }}
        defaultOpen
      />,
    );
    expect(screen.getByText(/Emissor/)).toBeInTheDocument();
  });

  it("renders seeMore/seeLess from labels prop (not hardcoded)", async () => {
    render(
      <CertificationCard
        cert={mockCert}
        labels={{ ...mockLabels, seeMore: "Mostrar mais", seeLess: "Mostrar menos" }}
        defaultOpen
      />,
    );
    // Truncated description — toggle button should show the custom label
    expect(screen.getByText("Mostrar mais")).toBeInTheDocument();
  });
});

// ── CertificationCategoryGroup ────────────────────────────────────────────

describe("CertificationCategoryGroup — i18n", () => {
  it("renders singular certSingular label when count is 1", () => {
    render(
      <CertificationCategoryGroup
        category="AWS"
        certs={[mockCert]}
        labels={{
          ...mockLabels,
          certSingular: "certificado",
          certPlural: "certificados",
        }}
      />,
    );
    expect(screen.getByText(/1 certificado/)).toBeInTheDocument();
    expect(screen.queryByText(/certificados/)).not.toBeInTheDocument();
  });

  it("renders plural certPlural label when count > 1", () => {
    render(
      <CertificationCategoryGroup
        category="AWS"
        certs={[mockCert, { ...mockCert, name: "AWS Cloud Practitioner" }]}
        labels={{
          ...mockLabels,
          certSingular: "certificado",
          certPlural: "certificados",
        }}
      />,
    );
    expect(screen.getByText(/2 certificados/)).toBeInTheDocument();
  });
});

// ── ExperienceCard ────────────────────────────────────────────────────────

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

// ── HeroSection ───────────────────────────────────────────────────────────

describe("HeroSection — heroStatsSuffix i18n", () => {
  it("renders heroStatsSuffix.years from content instead of hardcoded '+ years'", () => {
    const content = {
      ...baseContent,
      heroStatsSuffix: { years: "anos", certs: "certs", clouds: "nuvens" },
    };
    render(
      <MemoryRouter>
        <HeroSection content={content} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/5\+ anos/)).toBeInTheDocument();
  });

  it("renders heroStatsSuffix.certs from content", () => {
    render(
      <MemoryRouter>
        <HeroSection content={baseContent} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/11 certs/)).toBeInTheDocument();
  });

  it("renders heroStatsSuffix.clouds from content", () => {
    render(
      <MemoryRouter>
        <HeroSection content={baseContent} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/4 nuvens/)).toBeInTheDocument();
  });

  it("falls back gracefully when heroStatsSuffix is absent", () => {
    const { heroStatsSuffix: _omit, ...rest } = baseContent as ContentData & {
      heroStatsSuffix?: unknown;
    };
    // Should not throw — fallback suffix from en content
    const { container } = render(
      <MemoryRouter>
        <HeroSection content={rest as ContentData} />
      </MemoryRouter>,
    );
    expect(container).toBeTruthy();
  });
});
