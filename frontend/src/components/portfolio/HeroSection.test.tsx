import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HeroSection } from "./HeroSection";
import type { ContentData } from "@/types/content";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const baseContent: ContentData = {
  profile: {
    linkedinUrl: "https://www.linkedin.com/in/marco-menezes-731542b9",
    githubUrl: "https://github.com/marcoaureliomenezes",
    instagramUrl: "https://www.instagram.com/marcoaurelioreislima/",
    email: "x@y.com",
    cvUrl: "/cv.pdf",
  },
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
  resume: { short: "Resumo curto.", full: "Resumo completo expandido." },
  heroTagline: "Data Engineering at Scale with AI Augmented Capabilities",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Baixar CV", seeExperience: "Ver experiência", seeProjects: "Personal Projects" },
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

  it("uses the compact headline scale and always wraps — never truncates (T-RD-02 + operator feedback)", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-lg");
    expect(heading).toHaveClass("md:text-xl");
    expect(heading.className).not.toMatch(/whitespace-nowrap|text-ellipsis|bg-clip-text/);
  });

  it("renders the profile avatar inside the hero (identity anchor above the headline)", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    expect(
      screen.getByRole("img", { name: /Marco Aurelio Menezes/i }),
    ).toBeInTheDocument();
  });

  it("renders exactly one CTA: the 'Download CV' link; no projects CTA", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    expect(screen.getByRole("link", { name: /Baixar CV/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Personal Projects/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-cta-projects")).not.toBeInTheDocument();
    // 'See experience' button must be gone
    expect(screen.queryByRole("button", { name: /Ver experiência/i })).not.toBeInTheDocument();
    const ctas = document.querySelectorAll("a[href='/cv.pdf'][download]");
    expect(ctas).toHaveLength(1);
  });

  it("falls back to resumeTitle when heroTagline is absent", () => {
    const { heroTagline: _omit, ...rest } = baseContent;
    renderWithRouter(<HeroSection content={rest as ContentData} />);
    expect(screen.getByText("Resumo")).toBeInTheDocument();
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

  it("renders LinkedIn, GitHub and Instagram social links (T-MR-03)", () => {
    renderWithRouter(<HeroSection content={baseContent} />);
    const linkedin = screen.getByRole("link", { name: /LinkedIn/i });
    const github = screen.getByRole("link", { name: /GitHub/i });
    const instagram = screen.getByRole("link", { name: /Instagram/i });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/marco-menezes-731542b9");
    expect(github).toHaveAttribute("href", "https://github.com/marcoaureliomenezes");
    expect(instagram).toHaveAttribute("href", "https://www.instagram.com/marcoaurelioreislima/");
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("target", "_blank");
    expect(instagram).toHaveAttribute("target", "_blank");
  });
});

// ── one column, story toggle, derived stat line (AC3.1, AC3.2) ────────────

const period = (totalPeriod: string, type: "main" | "minor") => ({
  company: "C",
  fullName: "C",
  location: "BH",
  totalPeriod,
  type,
  roles: [],
});

const derived: ContentData = {
  ...baseContent,
  heroStats: { years: 99, certifications: 99, clouds: 9 },
  heroStatsSuffix: { years: "years", certs: "certifications", clouds: "unused" },
  experiences: [
    period("05-2021 a Presente", "main"),
    period("11-2020 a 05-2021", "main"),
    period("01-2015 a 01-2016", "minor"),
  ],
  certifications: Array.from({ length: 11 }, (_, i) => ({
    name: `Cert ${i}`, issuer: "I", category: "c", date: "", validity: "", level: "", icon: "", link: "", description: "", priority: i + 1,
  })),
  skills: [
    { id: "other", title: "Other", icon: "x", skills: ["Zed"] },
    { id: "cloud-providers", title: "Clouds", icon: "x", skills: ["AWS", "Azure", "Databricks"] },
  ],
};

function byFullText(expected: string) {
  return (_: string, element: Element | null) =>
    element !== null && (element.textContent ?? "").trim() === expected;
}

const STAT = "5+ years · 11 certifications · AWS · Azure · Databricks";

describe("HeroSection — one column and story toggle (AC3.1)", () => {
  it("is one section labelled by hero-heading with no second column or $ now panel", () => {
    const { container } = renderWithRouter(<HeroSection content={derived} />);
    const sections = container.querySelectorAll("section[aria-labelledby='hero-heading']");
    expect(sections).toHaveLength(1);
    expect(screen.queryByText(/\$ now/)).not.toBeInTheDocument();
    expect(sections[0].querySelector("[class*='grid-cols-2'], [class*='lg:grid-cols'], [class*='md:grid-cols']")).toBeNull();
  });

  it("hides resume.full while closed, shows resume.short, and the toggle reads storyOpen", () => {
    renderWithRouter(<HeroSection content={derived} />);
    expect(screen.getByText("Resumo curto.")).toBeInTheDocument();
    expect(screen.queryByText("Resumo completo expandido.")).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Ler a história" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("one click expands only resume.full, keeps resume.short, and relabels the toggle storyClose", () => {
    renderWithRouter(<HeroSection content={derived} />);
    fireEvent.click(screen.getByRole("button", { name: "Ler a história" }));
    const toggle = screen.getByRole("button", { name: "Ocultar a história" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Resumo completo expandido.")).toBeInTheDocument();
    expect(screen.getByText("Resumo curto.")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.queryByText("Resumo completo expandido.")).not.toBeInTheDocument();
  });

  it("keeps the stat line, Download CV and the three socials outside the toggle, visible while closed", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    renderWithRouter(<HeroSection content={derived} />);
    expect(screen.getByText(byFullText(STAT))).toBeVisible();
    expect(document.querySelector("a[href='/cv.pdf'][download]")).toBeVisible();
    for (const name of [/LinkedIn/i, /GitHub/i, /Instagram/i]) {
      expect(screen.getByRole("link", { name })).toBeVisible();
    }
    vi.useRealTimers();
  });
});

describe("HeroSection — derived stat line (AC3.2)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reads '5+ years · 11 certifications · AWS · Azure · Databricks' at 2026-10-15", () => {
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    renderWithRouter(<HeroSection content={derived} />);
    expect(screen.getByText(byFullText("5+ years · 11 certifications · AWS · Azure · Databricks"))).toBeInTheDocument();
  });

  it("reads '6+' at 2026-11-15, from the earliest main start (minor roles ignored)", () => {
    vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
    renderWithRouter(<HeroSection content={derived} />);
    expect(screen.getByText(byFullText("6+ years · 11 certifications · AWS · Azure · Databricks"))).toBeInTheDocument();
  });

  it("takes the words from heroStatsSuffix and the clouds from the cloud-providers row", () => {
    vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
    const content: ContentData = {
      ...derived,
      heroStatsSuffix: { years: "anos", certs: "certificações", clouds: "unused" },
      skills: [{ id: "cloud-providers", title: "Nuvens", icon: "x", skills: ["GCP"] }],
    };
    renderWithRouter(<HeroSection content={content} />);
    expect(screen.getByText(byFullText("5+ anos · 11 certificações · GCP"))).toBeInTheDocument();
  });
});
