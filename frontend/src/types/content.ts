/**
 * Content type definitions for the portfolio i18n system.
 *
 * SupportedLanguages uses short locale codes ("pt" | "en" | "de").
 * Content is loaded from src/data/content/{pt,en,de}.json — T-CONTENT-01.
 */

export type SupportedLanguages = "pt" | "en" | "de";

export interface HighlightProject {
  title: string;
  body: string;
  impact?: string[];
  links?: { label: string; url: string }[];
}

export interface Position {
  title: string;
  period: string;
  responsibilities?: string[];
  technologies?: string;
  skills?: string[];
  highlightProject?: HighlightProject;
}

export interface Experience {
  company: string;
  fullName: string;
  location: string;
  totalPeriod: string;
  type: "main" | "minor";
  roles: Position[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  coursework: string;
  thesis: string;
}

export interface Resume {
  short: string;
  full: string;
}

export interface Certification {
  name: string;
  issuer: string;
  category: string;
  date: string;
  validity: string;
  level: string;
  icon: string;
  link: string;
  description: string;
  priority: number;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export interface HeaderInfo {
  title: string;
  location: string;
  viewEmail: string;
}

// ── Project tab content types ─────────────────────────────────────────────

export interface ProjectSeoData {
  title: string;
  description: string;
}

export interface ProjectCtaData {
  github: string;
  docs?: string;
}

export interface ProjectHeroData {
  title: string;
  tagline: string;
  logo?: string;
}

export interface ProjectSectionData {
  id: string;
  title: string;
  body?: string;
  diagram?: string;
  items?: Array<{ label: string; value: string }>;
}

export interface DadaiaWorkspaceProject {
  hero: ProjectHeroData;
  sections: ProjectSectionData[];
  cta: ProjectCtaData;
  seo: ProjectSeoData;
}

/** @deprecated Use GameLink instead. Kept for migration compatibility. */
export interface GameItem {
  slug: string;
  title: string;
  engine: string;
  image: string;
  body: string;
  repo: string;
}

/** @deprecated Use GamesProject instead. */
export interface TauanGamesProject {
  hero: ProjectHeroData;
  items: GameItem[];
  seo: ProjectSeoData;
}

export interface StackRow {
  layer: string;
  tech: string;
}

export interface CostRow {
  service: string;
  monthly_usd: number;
}

export interface ArchDecision {
  title: string;
  rationale: string;
  spec: string;
}

export interface PortifolioProjectLinks {
  repo: string;
  terraform: string;
  specs: string;
}

/** @deprecated Use MetaProject instead. */
export interface PortifolioProject {
  hero: ProjectHeroData;
  diagram: string;
  stack: StackRow[];
  costs: CostRow[];
  decisions: ArchDecision[];
  links: PortifolioProjectLinks;
  seo: ProjectSeoData;
}

// ── Discriminated union model (F-P0-09) ─────────────────────────────────────

export type ProjectKind = "case-study" | "games" | "meta";

export interface ProjectCard {
  cover: string;    // path: /assets/projects/<slug>/cover.webp
  summary: string;  // 1-2 sentence description for the index card
  tech: string[];   // display tags (>= 3)
}

export interface ProjectBase {
  slug: string;
  kind: ProjectKind;
  hero: ProjectHeroData;
  card: ProjectCard;
  seo: ProjectSeoData;
  diagram?: string;
}

export interface CaseStudyProject extends ProjectBase {
  kind: "case-study";
  sections: ProjectSectionData[];
  cta: ProjectCtaData;
}

export interface MetaProject extends ProjectBase {
  kind: "meta";
  sections: ProjectSectionData[];
  stack: StackRow[];
  costs: CostRow[];
  decisions: ArchDecision[];
  links: PortifolioProjectLinks;
}

export interface GameLink {
  slug: string;
  title: string;
  engine: string;
  cover: string;    // /assets/projects/tauan-games/<slug>.webp (fallback to .svg)
  body: string;
  repo: string;
  playUrl: string;  // GH Pages URL (F-P0-14)
}

export interface GamesProject extends ProjectBase {
  kind: "games";
  items: GameLink[];
}

export type Project = CaseStudyProject | MetaProject | GamesProject;

export interface ProjectsContent {
  index: {
    title: string;
    subtitle?: string;
    seo: ProjectSeoData;
  };
  kindCaseStudy?: string;
  kindMeta?: string;
  kindGames?: string;
  list: Project[];  // FIXED order: dadaia-workspace -> portifolio -> tauan-games
}

// ─────────────────────────────────────────────────────────────────────────────

export interface HeroStats {
  years: number;
  certifications: number;
  clouds: number;
}

export interface HeroCTAs {
  downloadCv: string;
  seeExperience: string;
  seeProjects?: string;   // 3rd CTA added in T-FE-PROJ-03
}

export interface ContentData {
  resumeTitle: string;
  skillsTitle: string;
  experienceTitle: string;
  educationTitle: string;
  certificationsTitle: string;
  seeMore: string;
  seeLess: string;
  responsibilities: string;
  technologies: string;
  validUntil: string;
  viewCredential: string;
  header: HeaderInfo;
  resume: Resume;
  /** Big tagline in Hero (T-FE-WAVE3). Falls back to resumeTitle when absent. */
  heroTagline?: string;
  /** Inline stats line under the tagline (T-FE-WAVE3). */
  heroStats?: HeroStats;
  /** CTA labels for Hero (T-FE-WAVE3). */
  heroCTAs?: HeroCTAs;
  skills: SkillCategory[];
  experiences: Experience[];
  education: Education;
  certifications: Certification[];
  projects?: ProjectsContent;
}
