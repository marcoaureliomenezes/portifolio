import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CertificationsSection } from "./CertificationsSection";
import type { ContentData, Certification } from "@/types/content";

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
  earlierLabel: "Anteriormente",
  detailsOpen: "Detalhes +",
  detailsClose: "Detalhes −",
  storyOpen: "Ler a história",
  storyClose: "Ocultar a história",
  impactLabel: "Impacto",
  header: { title: "Data Engineer", location: "BH", viewEmail: "Email" },
  resume: { short: "Resumo curto.", full: "Resumo completo." },
  skills: [],
  experiences: [],
  education: { degreeLevel: "", degreeField: "", institution: "", location: "", period: "", courseworkLabel: "", coursework: "", thesisLabel: "", thesis: "" },
  certifications: [],
  siteChrome: {
    nav: { label: "Principal", resume: "Resumo", projects: "Projetos" },
    theme: { toLight: "Tema claro", toDark: "Tema escuro" },
    language: { label: "Idioma" },
    breadcrumb: { label: "Trilha", projects: "Projetos" },
    backToProjects: "Voltar aos projetos",
    footer: {
      label: "Rodapé do site",
      owner: "Marco Menezes",
      email: "E-mail",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
  },
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

describe("CertificationsSection — i18n", () => {
  it("renders singular certSingular when a category has 1 cert", () => {
    render(
      <CertificationsSection
        content={{
          ...baseContent,
          certifications: [{ ...mockCert, category: "GCP" }],
          certSingular: "certificado",
          certPlural: "certificados",
        } as unknown as ContentData}
      />,
    );
    expect(screen.getByText(/1 certificado/)).toBeInTheDocument();
    expect(screen.queryByText(/certificados/)).not.toBeInTheDocument();
  });

  it("renders plural certPlural when a category has many", () => {
    render(
      <CertificationsSection
        content={{
          ...baseContent,
          certifications: [
            { ...mockCert, category: "GCP" },
            { ...mockCert, category: "GCP", name: "Other Cert" },
          ],
          certSingular: "certificado",
          certPlural: "certificados",
        } as unknown as ContentData}
      />,
    );
    expect(screen.getByText(/2 certificados/)).toBeInTheDocument();
  });
});
