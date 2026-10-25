import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const content = (l: string) =>
  JSON.parse(readFileSync(join(resolve(__dirname, "../.."), `public/content/${l}.json`), "utf8"));

const LOCALES = ["pt", "en", "de"] as const;

const MINOR = [
  "Colégio Técnico Inconfidentes Álvares Maciel",
  "Universidade Federal de Ouro Preto",
  "Analógica Instrumentação e Controle",
];
const german = { pt: "Curso de Alemão", en: "Curso de Alemão", de: "Deutschkurs" };
const certNames = (l: (typeof LOCALES)[number]) => [
  "AWS AI Practitioner",
  "AWS Solutions Architect",
  german[l],
  "AWS Data Engineer",
  "Spark Data Engineer",
  "Spark Developer",
  "AWS Cloud Practitioner",
  "Apache Airflow",
  "Azure Data Engineer",
  "Azure",
  "Santander Data Engineer",
];
const SKILL_IDS = [
  "programming-languages",
  "cloud-providers",
  "on-premises-data-technologies",
  "ai-modern-tooling",
  "devops-technologies",
  "languages",
];
const ONPREM_TITLE = { pt: "Plataformas de dados", en: "Data platforms", de: "Datenplattformen" };

const FLAT = {
  pt: {
    earlierLabel: "Anteriormente",
    detailsOpen: "Detalhes +",
    detailsClose: "Detalhes −",
    storyOpen: "Ler a história",
    storyClose: "Ocultar a história",
    impactLabel: "Impacto",
    seeAllProjects: "Todos →",
  },
  en: {
    earlierLabel: "Earlier",
    detailsOpen: "Details +",
    detailsClose: "Details −",
    storyOpen: "Read the story",
    storyClose: "Hide the story",
    impactLabel: "Impact",
    seeAllProjects: "All →",
  },
  de: {
    earlierLabel: "Früher",
    detailsOpen: "Details +",
    detailsClose: "Details −",
    storyOpen: "Die Geschichte lesen",
    storyClose: "Geschichte ausblenden",
    impactLabel: "Wirkung",
    seeAllProjects: "Alle →",
  },
};
const CERTS_SUFFIX = { pt: "certificações", en: "certifications", de: "Zertifizierungen" };
const FOOTER = {
  pt: { label: "Rodapé do site", owner: "Marco Menezes", email: "E-mail", linkedin: "LinkedIn", github: "GitHub" },
  en: { label: "Site footer", owner: "Marco Menezes", email: "Email", linkedin: "LinkedIn", github: "GitHub" },
  de: { label: "Fußzeile", owner: "Marco Menezes", email: "E-Mail", linkedin: "LinkedIn", github: "GitHub" },
};

const hasKey = (v: unknown, key: string): boolean =>
  Array.isArray(v)
    ? v.some((x) => hasKey(x, key))
    : v !== null && typeof v === "object"
      ? Object.entries(v).some(([k, x]) => k === key || hasKey(x, key))
      : false;

describe.each(LOCALES)("resume content — %s", (l) => {
  const d = content(l);

  it("lists Trie Engenharia as main and the three earlier roles as minor, in order", () => {
    const trie = d.experiences.find((e: { company: string }) => e.company === "Trie Engenharia");
    expect(trie.type).toBe("main");
    expect(
      d.experiences.filter((e: { type: string }) => e.type === "minor").map((e: { company: string }) => e.company),
    ).toEqual(MINOR);
  });

  it("orders certifications newest first, without the level in the name, priority = position", () => {
    expect(d.certifications.map((c: { name: string }) => c.name)).toEqual(certNames(l));
    expect(d.certifications.map((c: { priority: number }) => c.priority)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("orders skill rows by id and renames the on-premises row", () => {
    expect(d.skills.map((s: { id: string }) => s.id)).toEqual(SKILL_IDS);
    expect(d.skills.find((s: { id: string }) => s.id === "on-premises-data-technologies").title).toBe(ONPREM_TITLE[l]);
  });

  it("carries the new flat keys, the certs suffix and the footer words", () => {
    expect(d).toMatchObject(FLAT[l]);
    expect(d.heroStatsSuffix.certs).toBe(CERTS_SUFFIX[l]);
    expect(d.siteChrome.footer).toEqual(FOOTER[l]);
  });

  it("holds no achievements key at any depth", () => {
    expect(hasKey(d, "achievements")).toBe(false);
  });
});
