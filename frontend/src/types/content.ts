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

export interface GameItem {
  slug: string;
  title: string;
  engine: string;
  image: string;
  body: string;
  repo: string;
}

export interface TauanGamesProject {
  hero: ProjectHeroData;
  items: GameItem[];
  seo: ProjectSeoData;
  emptyMessage?: string;
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

export interface PortifolioProjectLabels {
  diagram: string;
  stack: string;
  stackHeaders: [string, string];
  costs: string;
  costsHeaders: [string, string];
  decisions: string;
  githubRepository: string;
  terraform: string;
  specs: string;
}

export interface PortifolioProject {
  hero: ProjectHeroData;
  diagram: string;
  stack: StackRow[];
  costs: CostRow[];
  decisions: ArchDecision[];
  links: PortifolioProjectLinks;
  seo: ProjectSeoData;
  labels?: PortifolioProjectLabels;
}

export interface ProjectsContent {
  "dadaia-workspace": DadaiaWorkspaceProject;
  "tauan-games": TauanGamesProject;
  portifolio: PortifolioProject;
}

// ── Navigation labels ─────────────────────────────────────────────────────────

export interface NavLabels {
  backToHome: string;
}

export interface UiLabels {
  underConstruction: string;
  contentComingSoon: string;
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
  /** Navigation labels (T-FE-QUAL-04) */
  nav?: NavLabels;
  careerProgression?: string;
  roleSingular?: string;
  rolePlural?: string;
  issuer?: string;
  certificate?: string;
  certificates?: string;
  contactByEmail?: string;
  sendEmail?: string;
  viewLarger?: string;
  photoAlt?: string;
  notFoundTitle?: string;
  ui?: UiLabels;
}
