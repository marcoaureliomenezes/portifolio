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
  degreeLevel: string;
  degreeField: string;
  institution: string;
  location: string;
  period: string;
  courseworkLabel: string;
  coursework: string;
  thesisLabel: string;
  thesis: string;
  thesisLink?: string;
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

// ── New discriminated-union project types (projects-cluster-v1 / T-PC-A-01) ──

export interface ProjectCardData {
  /** Path to cover image, relative to /assets/. ≤ 60 KB. */
  cover?: string;
  /** 1-line summary ≤ 280 chars. i18n. */
  summary: string;
  /** Tech badges (≥ 3). Partial i18n (non-translatable tech names pass through). */
  tech: string[];
}

export interface ProjectBase {
  /** URL-safe identifier. Regex: ^[a-z0-9-]+$. Not i18n. */
  slug: string;
  /** Discriminator. Not i18n. */
  kind: "case-study" | "meta" | "games" | "library";
  hero: {
    /** i18n. */
    title: string;
    /** i18n. */
    tagline: string;
  };
  card: ProjectCardData;
  seo: {
    /** i18n. */
    title: string;
    /** i18n. */
    description: string;
  };
  /** Optional path to diagram asset (light version). Not i18n. */
  diagram?: string;
  /** rc-2: dark-mode diagram variant; falls back to `diagram` when absent. Not i18n. */
  diagramDark?: string;
  /** Alt text for diagram. i18n. Required when diagram is present. */
  diagramAlt?: string;
}

export interface CaseStudyProject extends ProjectBase {
  kind: "case-study";
  /** ≥ 1 section. */
  sections: ProjectSectionData[];
  cta: {
    github: string;
    githubLabel?: string;
  };
}

export interface MetaProject extends ProjectBase {
  kind: "meta";
  /** ≥ 1 section. */
  sections: ProjectSectionData[];
  /** ≥ 1 stack rows. */
  stack: StackRow[];
  /** Cost breakdown rows. */
  costs: CostRow[];
  /** ≥ 1 architectural decisions. */
  decisions: ArchDecision[];
  links: {
    repo: string;
    terraform: string;
    specs: string;
  };
}

export interface GameLink {
  slug: string;
  title: string;
  engine: string;
  cover: string;
  body: string;
  repo: string;
  playUrl: string;
}

export interface GamesProject extends ProjectBase {
  kind: "games";
  /** ≥ 1 game links. */
  items: GameLink[];
}

/** rc-2 (ADR-PC2-R2-01): open-source library published on a package registry. */
export interface LibraryProject extends ProjectBase {
  kind: "library";
  /** ≥ 1 section. */
  sections: ProjectSectionData[];
  /** Registry metadata rendered as the install block. Not i18n. */
  pypi: {
    package: string;
    version: string;
    installCommand: string;
  };
  /** Optional headline stat (e.g. rows/s, test count). i18n label. */
  stat?: {
    label: string;
    value: string;
  };
  links: {
    repo: string;
    pypi: string;
    docs?: string;
  };
}

/** Discriminated union of all project kinds. */
export type Project = CaseStudyProject | MetaProject | GamesProject | LibraryProject;

/** New open-list shape for the projects section in content JSON. */
export interface ProjectsContentV2 {
  /** i18n metadata for the /projetos index page. */
  index: {
    title: string;
    description: string;
    /** rc-2: i18n labels for the kind chip on ProjectCard. Optional with code fallback. */
    kindLabels?: Record<Project["kind"], string>;
  };
  /** Fixed-order list: dadaia-workspace, portifolio, tauan-games, rand-engine. */
  list: Project[];
}

export interface ProjectSectionData {
  id: string;
  title: string;
  body?: string;
  diagram?: string;
  items?: Array<{ label: string; value: string }>;
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

// ─────────────────────────────────────────────────────────────────────────────

export interface HeroStats {
  years: number;
  certifications: number;
  clouds: number;
}

export interface HeroCTAs {
  downloadCv: string;
  seeExperience: string;
  /** 3rd CTA label linking to /projetos — T-PC-C-05. */
  seeProjects?: string;
}

export interface HeroStatsSuffix {
  years: string;
  certs: string;
  clouds: string;
}

/** Labels for the library project template (T-PC2-R2-04). */
export interface LibraryPageLabels {
  installTitle: string;
  versionLabel: string;
  copyLabel: string;
  copiedLabel: string;
  linkPypi: string;
}

export interface ArchPageLabels {
  infraDiagramTitle: string;
  techStackTitle: string;
  monthlyCostsTitle: string;
  tableHeaderLayer: string;
  tableHeaderTechnology: string;
  tableHeaderService: string;
  tableHeaderCostUsd: string;
  archDecisionsTitle: string;
  linksTitle: string;
  linkGithubRepo: string;
  linkTerraform: string;
  linkSpecs: string;
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
  /** Label for the issuer field in CertificationCard (T-FE-QUAL-06). */
  issuerLabel: string;
  /** Singular/plural for certification count in CertificationCategoryGroup (T-FE-QUAL-06). */
  certSingular: string;
  certPlural: string;
  /** Career progression section label in ExperienceCard (T-FE-QUAL-06). */
  careerProgression: string;
  /** Singular/plural for role count in ExperienceCard (T-FE-QUAL-06). */
  roleSingular: string;
  rolePlural: string;
  /** Avatar hover label in HeaderDesktopLayout / HeaderMobileLayout (T-FE-QUAL-06). */
  viewLarger: string;
  /** Games empty-state labels (T-FE-QUAL-06). */
  gamesComingSoon: string;
  gamesComingSoonDesc: string;
  /** NotFound page labels (T-FE-QUAL-06). */
  notFoundMessage: string;
  returnHome: string;
  /** Suffixes for hero stats line (T-FE-QUAL-06). Falls back to en values when absent. */
  heroStatsSuffix?: HeroStatsSuffix;
  /** Architecture / infra section labels (T-FE-QUAL-06). */
  archPage?: ArchPageLabels;
  /** Library template labels (T-PC2-R2-04). Falls back to PT literals when absent. */
  libraryPage?: LibraryPageLabels;
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
  /**
   * Navigation label for the "Projetos" header link (T-PC-C-04).
   * Falls back to "Projetos" when absent.
   */
  navProjects?: string;
  /**
   * Open-list shape for projects-cluster-v1 (T-PC-A-01).
   */
  projectsV2?: ProjectsContentV2;
}
