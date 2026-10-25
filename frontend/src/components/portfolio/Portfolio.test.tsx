import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Portfolio } from "./Portfolio";
import type { ContentData } from "@/types/content";

/** The committed locale file the app fetches: the required profile. */
const committed = JSON.parse(
  readFileSync(resolve(process.cwd(), "public/content/pt.json"), "utf-8"),
) as Pick<ContentData, "profile">;

const content: ContentData = {
  profile: committed.profile,
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
  earlierLabel: "Anteriormente",
  detailsOpen: "Detalhes +",
  detailsClose: "Detalhes −",
  storyOpen: "Ler a história",
  storyClose: "Ocultar a história",
  impactLabel: "Impacto",
  header: { title: "Data Engineer", location: "BH", viewEmail: "Email" },
  resume: { short: "Short resume.", full: "Full resume." },
  heroTagline: "Data Engineering at Scale with AI Augmented Capabilities",
  heroStats: { years: 5, certifications: 11, clouds: 4 },
  heroCTAs: { downloadCv: "Download CV", seeExperience: "See experience", seeProjects: "See projects" },
  skills: [],
  experiences: [
    {
      company: "A",
      fullName: "A Inc",
      location: "BH",
      totalPeriod: "01-2020 a Presente",
      type: "main",
      roles: [
        { title: "R1", period: "01-2020 a 01-2021", responsibilities: ["Did a thing."] },
        { title: "R2", period: "01-2021 a Presente", responsibilities: ["Did another."] },
      ],
    },
  ],
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

vi.mock("@/hooks/useContent", () => ({
  useContent: () => ({ content, language: "en" }),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Portfolio />
    </MemoryRouter>,
  );
}

const SECTIONS = [
  "section[aria-labelledby=hero-heading]",
  "#experiencia",
  "#projetos-destaque",
  "#habilidades",
  "#certificacoes",
  "#educacao",
];

describe("Portfolio", () => {
  it("renders Hero, Experience, Projects, Skills, Certifications, Education in that order", () => {
    const { container } = renderHome();
    const found = SECTIONS.map((selector) => container.querySelector(selector));
    expect(found.every((el) => el !== null)).toBe(true);
    const order = [...container.querySelectorAll(SECTIONS.join(","))];
    expect(order).toEqual(found);
  });

  it("is not wrapped in its own width: the column comes from the layout", () => {
    const { container } = renderHome();
    expect(container.querySelector(".max-w-5xl")).toBeNull();
  });

  it("with every role closed, the only disclosures are the story toggle and one Details button per role", () => {
    const { container } = renderHome();
    const controls = [...container.querySelectorAll("[aria-expanded]")];
    expect(controls.map((el) => el.textContent)).toEqual([
      "Ler a história",
      "Detalhes +",
      "Detalhes +",
    ]);
    expect(controls.every((el) => el.getAttribute("aria-expanded") === "false")).toBe(true);
    fireEvent.click(controls[1]);
    expect(controls[1]).toHaveAttribute("aria-expanded", "true");
  });
});
