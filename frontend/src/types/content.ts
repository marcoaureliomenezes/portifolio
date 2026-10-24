/**
 * Content type definitions for the portfolio i18n system.
 *
 * SupportedLanguages uses short locale codes ("pt" | "en" | "de").
 * Content is loaded from src/data/content/{pt,en,de}.json — T-CONTENT-01.
 */

export type SupportedLanguages = "pt" | "en" | "de";

/**
 * Operator profile — T-RD-10: absorbed from the old src/data/profile.ts into
 * content so the future admin panel can edit contact/CV without a release.
 */
export interface Profile {
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string;
  /** CV asset path (single PDF serves all locales — operator decision 2026-05-17). */
  cvUrl: string;
}

export interface HighlightProject {
  title: string;
  body: string;
  impact?: string[];
  links?: { label: string; url: string }[];
}

export interface Position {
  /** Stable entity id (T-RD-09, admin contract). */
  id?: string;
  title: string;
  period: string;
  responsibilities?: string[];
  technologies?: string;
  skills?: string[];
  highlightProject?: HighlightProject;
}

export interface Experience {
  /** Stable entity id (T-RD-09, admin contract). */
  id?: string;
  company: string;
  fullName: string;
  location: string;
  totalPeriod: string;
  type: "main" | "minor";
  roles: Position[];
}

export interface Education {
  /** Stable entity id (T-RD-09, admin contract). */
  id?: string;
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
  /** Stable entity id (T-RD-09, admin contract). */
  id?: string;
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
  /** Stable entity id (T-RD-09, admin contract). */
  id?: string;
  title: string;
  icon: string;
  skills: string[];
}

export interface HeaderInfo {
  title: string;
  location: string;
  viewEmail: string;
}

// ── Project types: inferred from the one schema, src/lib/schemas/projects.ts ──

import type { z } from "zod";
import type {
  ArchDecisionSchema,
  CaseStudyProjectSchema,
  CostRowSchema,
  GameLinkSchema,
  GamesProjectSchema,
  LibraryProjectSchema,
  MetaProjectSchema,
  ProjectSchema,
  ProjectSectionDataSchema,
  ProjectsContentSchema,
  StackRowSchema,
} from "../lib/schemas/projects";

export type ProjectSectionData = z.infer<typeof ProjectSectionDataSchema>;
export type StackRow = z.infer<typeof StackRowSchema>;
export type CostRow = z.infer<typeof CostRowSchema>;
export type ArchDecision = z.infer<typeof ArchDecisionSchema>;
export type GameLink = z.infer<typeof GameLinkSchema>;
export type CaseStudyProject = z.infer<typeof CaseStudyProjectSchema>;
export type MetaProject = z.infer<typeof MetaProjectSchema>;
export type GamesProject = z.infer<typeof GamesProjectSchema>;
export type LibraryProject = z.infer<typeof LibraryProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectsContentV2 = z.infer<typeof ProjectsContentSchema>;

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
  linkDocs: string;
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
  /** Headless Phase 1 (T-RD-09): contract version + publish stamp. */
  schema_version?: string;
  published_at?: string;
  /** Contact/CV data (T-RD-10) — admin-editable. */
  profile?: Profile;
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
  /** Avatar hover label. */
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
  /** Featured-projects strip labels (T-RD-04). */
  featuredProjectsTitle?: string;
  seeAllProjects?: string;
  /** Hero "now" panel labels (T-RD-05). */
  nowPanel?: {
    title: string;
    currentRole: string;
    latestCert: string;
    latestProject: string;
  };
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
  /** Site chrome labels: header nav, theme toggle, language selector, breadcrumb, back link. */
  siteChrome?: {
    nav: { label: string; resume: string; projects: string };
    theme: { toLight: string; toDark: string };
    language: { label: string };
    breadcrumb: { label: string; projects: string };
    backToProjects: string;
  };
  /**
   * Open-list shape for projects-cluster-v1 (T-PC-A-01).
   */
  projectsV2?: ProjectsContentV2;
}
