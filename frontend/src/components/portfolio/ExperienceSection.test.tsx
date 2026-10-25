import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperienceSection } from "./ExperienceSection";
import type { ContentData, Experience, SupportedLanguages } from "@/types/content";

const main = (company: string, totalPeriod: string): Experience => ({
  company,
  fullName: company,
  location: "Belo Horizonte, MG",
  totalPeriod,
  type: "main",
  roles: [{ title: "Engineer", period: totalPeriod }],
});

const minor = (title: string, company: string, totalPeriod: string): Experience => ({
  company,
  fullName: company,
  location: "Ouro Preto, MG",
  totalPeriod,
  type: "minor",
  roles: [{ title, period: totalPeriod }],
});

const CASES: Record<
  SupportedLanguages,
  { label: string; titles: [string, string, string]; periods: [string, string, string]; line: string }
> = {
  en: {
    label: "Earlier",
    titles: ["Adjunct Instructor", "Laboratory Assistant", "Summer Internship"],
    periods: ["04-2015 to 07-2018 (3y 4m)", "08-2016 to 08-2017 (1y)", "01-2015 to 02-2015 (2m)"],
    line: "Adjunct Instructor, Colégio Técnico Inconfidentes Álvares Maciel (2015–18) · Laboratory Assistant, Universidade Federal de Ouro Preto (2016–17) · Summer Internship, Analógica Instrumentação e Controle (2015)",
  },
  pt: {
    label: "Anteriormente",
    titles: ["Professor Auxiliar", "Assistente de Laboratório", "Estagiário de Verão"],
    periods: ["04-2015 a 07-2018 (3a 4m)", "08-2016 a 08-2017 (1a)", "01-2015 a 02-2015 (2m)"],
    line: "Professor Auxiliar, Colégio Técnico Inconfidentes Álvares Maciel (2015–18) · Assistente de Laboratório, Universidade Federal de Ouro Preto (2016–17) · Estagiário de Verão, Analógica Instrumentação e Controle (2015)",
  },
  de: {
    label: "Früher",
    titles: ["Dozent", "Laboratory Assistant", "Sommerpraktikant"],
    periods: ["04/2015 bis 07/2018 (3 J. 4 M.)", "08/2016 bis 08/2017 (1 J.)", "01/2015 bis 02/2015 (2 M.)"],
    line: "Dozent, Colégio Técnico Inconfidentes Álvares Maciel (2015–18) · Laboratory Assistant, Universidade Federal de Ouro Preto (2016–17) · Sommerpraktikant, Analógica Instrumentação e Controle (2015)",
  },
};

function contentFor(lang: SupportedLanguages): ContentData {
  const c = CASES[lang];
  return {
    experienceTitle: "Professional Experience",
    earlierLabel: c.label,
    responsibilities: "Responsibilities",
    technologies: "Technologies",
    detailsOpen: "Details +",
    detailsClose: "Details −",
    impactLabel: "Impact",
    experiences: [
      main("Santander", "07-2022 to 02-2024"),
      minor(c.titles[0], "Colégio Técnico Inconfidentes Álvares Maciel", c.periods[0]),
      main("Trie Engenharia", "11-2020 to 05-2021"),
      minor(c.titles[1], "Universidade Federal de Ouro Preto", c.periods[1]),
      minor(c.titles[2], "Analógica Instrumentação e Controle", c.periods[2]),
    ],
  } as unknown as ContentData;
}

describe("ExperienceSection", () => {
  it("keeps the landmark ids and a single h2", () => {
    const { container } = render(
      <ExperienceSection content={contentFor("en")} locale="en" />,
    );
    const section = container.querySelector("#experiencia") as HTMLElement;
    expect(section).not.toBeNull();
    const h2s = within(section).getAllByRole("heading", { level: 2 });
    expect(h2s).toHaveLength(1);
    expect(h2s[0].id).toBe("experiencia-heading");
    expect(h2s[0]).toHaveTextContent("Professional Experience");
    expect(section).toHaveAttribute("aria-labelledby", "experiencia-heading");
  });

  it("renders one h3 per main employer and none for minor ones", () => {
    render(<ExperienceSection content={contentFor("en")} locale="en" />);
    const h3s = screen.getAllByRole("heading", { level: 3 });
    expect(h3s).toHaveLength(2);
    expect(h3s[0]).toHaveTextContent("Santander");
    expect(h3s[1]).toHaveTextContent("Trie Engenharia");
  });

  it.each(["en", "pt", "de"] as const)("lists the minor experiences as one Earlier line (%s)", lang => {
    render(<ExperienceSection content={contentFor(lang)} locale={lang} />);
    const line = screen.getByText(CASES[lang].line, { exact: false });
    expect(line.tagName).toBe("P");
    expect(line).toHaveTextContent(`${CASES[lang].label}`);
    expect(line.textContent).toContain(CASES[lang].line);
  });

  it("renders no card and no section fold", () => {
    render(<ExperienceSection content={contentFor("en")} locale="en" />);
    const employer = screen.getAllByRole("heading", { level: 3 })[0];
    expect(employer.closest('[class*="bg-card"]')).toBeNull();
    expect(screen.queryByRole("button", { name: /Professional Experience/ })).toBeNull();
  });
});
