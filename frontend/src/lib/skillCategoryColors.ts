export type SkillCategoryKey =
  | "cloud"
  | "language"
  | "database"
  | "ai-tooling"
  | "default";

interface SkillCategoryStyle {
  badge: string;
  border: string;
  dot: string;
}

const STYLES: Record<SkillCategoryKey, SkillCategoryStyle> = {
  cloud: {
    badge: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  language: {
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    border: "border-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  database: {
    badge: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
    border: "border-purple-300 dark:border-purple-800",
    dot: "bg-purple-500",
  },
  "ai-tooling": {
    badge: "bg-accent-subtle text-foreground border border-accent/30",
    border: "border-accent/40",
    dot: "bg-accent",
  },
  default: {
    badge: "bg-muted text-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
};

const KEYWORDS: Array<{ category: SkillCategoryKey; matchers: RegExp[] }> = [
  {
    category: "cloud",
    matchers: [/aws/i, /azure/i, /\bgcp\b/i, /google cloud/i, /cloud/i, /devops/i, /infrastructure/i, /platform/i],
  },
  {
    category: "language",
    matchers: [/languages?/i, /linguagens?/i, /python/i, /go(lang)?/i, /typescript/i, /javascript/i, /programa(c|ç)/i, /programming/i],
  },
  {
    category: "database",
    matchers: [/databases?/i, /bancos? de dados/i, /datenbank/i, /storage/i, /sql/i, /nosql/i, /data engineering/i, /engenharia de dados/i, /datenengineering/i],
  },
  {
    category: "ai-tooling",
    matchers: [/\bai\b/i, /machine learning/i, /llm/i, /agent/i, /ai-tooling/i, /tooling/i, /ferramenta/i, /werkzeug/i],
  },
];

export function classifySkillCategory(name: string): SkillCategoryKey {
  for (const { category, matchers } of KEYWORDS) {
    if (matchers.some((re) => re.test(name))) return category;
  }
  return "default";
}

export function skillCategoryStyle(name: string): SkillCategoryStyle {
  return STYLES[classifySkillCategory(name)];
}
