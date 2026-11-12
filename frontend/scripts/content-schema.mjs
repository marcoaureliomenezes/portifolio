/**
 * content-schema.mjs
 *
 * Zod schema of the portfolio content document (public/content/*.json):
 * ContentDataSchema and the sub-schemas it composes.
 * Inputs: none; each schema parses an unknown value (safeParse, parse).
 * Side effects: none; imports zod and projects.ts (loaded by Node type stripping).
 */

import { z } from "zod";
import { Email, HttpUrl, ProjectsContentSchema, SiteRelativeUrl } from "../src/lib/schemas/projects.ts";

// ── shared ──────────────────────────────────────────────────────────────────

const Id = z.string().min(1);

export const ProfileSchema = z.object({
  linkedinUrl: HttpUrl,
  githubUrl: HttpUrl,
  instagramUrl: HttpUrl,
  email: Email,
  cvUrl: SiteRelativeUrl,
});

// one regex: HttpUrl's source or a bare "#"
const CertLink = z.string().regex(new RegExp(`${z.toJSONSchema(HttpUrl).pattern}|^#$`));

// ── experiences ─────────────────────────────────────────────────────────────

const HighlightProjectSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  impact: z.array(z.string()).optional(),
  links: z.array(z.object({ label: z.string(), url: HttpUrl })).optional(),
});

export const RoleSchema = z.object({
  id: Id,
  title: z.string().min(1),
  period: z.string().min(1),
  responsibilities: z.array(z.string()).optional(),
  technologies: z.string().optional(),
  skills: z.array(z.string()).optional(),
  highlightProject: HighlightProjectSchema.optional(),
});

export const ExperienceSchema = z.object({
  id: Id,
  company: z.string().min(1),
  fullName: z.string().min(1),
  location: z.string().min(1),
  totalPeriod: z.string().min(1),
  type: z.enum(["main", "minor"]),
  roles: z.array(RoleSchema).min(1),
});

// ── certifications / education / skills ────────────────────────────────────

export const CertificationSchema = z.object({
  id: Id,
  name: z.string().min(1),
  issuer: z.string().min(1),
  category: z.string().min(1),
  date: z.string().min(1),
  validity: z.string(),
  level: z.string().min(1),
  icon: z.string(),
  link: CertLink,
  description: z.string(),
  priority: z.number(),
});

export const EducationSchema = z.object({
  id: Id,
  degreeLevel: z.string().min(1),
  degreeField: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().min(1),
  period: z.string().min(1),
  courseworkLabel: z.string(),
  coursework: z.string(),
  thesisLabel: z.string(),
  thesis: z.string(),
  thesisLink: HttpUrl.optional(),
});

export const SkillCategorySchema = z.object({
  id: Id,
  title: z.string().min(1),
  icon: z.string(),
  skills: z.array(z.string()).min(1),
});

// ── top-level contract ──────────────────────────────────────────────────────

const Str = z.string();
const obj = (keys) => z.object(Object.fromEntries(keys.map((k) => [k, Str])));

export const ContentDataSchema = z.object({
  schema_version: z.literal("1"),
  published_at: z.string().min(1),
  profile: ProfileSchema,
  resume: z.object({ short: z.string().min(1), full: z.string().min(1) }),
  header: z.object({
    title: z.string().min(1),
    location: z.string().min(1),
    viewEmail: z.string().min(1),
  }),
  experiences: z.array(ExperienceSchema).min(1),
  certifications: z.array(CertificationSchema).min(1),
  education: EducationSchema,
  skills: z.array(SkillCategorySchema).min(1),
  projectsV2: ProjectsContentSchema,
  // UI labels, as src/types/content.ts carries them
  resumeTitle: Str,
  skillsTitle: Str,
  experienceTitle: Str,
  educationTitle: Str,
  certificationsTitle: Str,
  responsibilities: Str,
  technologies: Str,
  gamesComingSoon: Str,
  gamesComingSoonDesc: Str,
  notFoundMessage: Str,
  returnHome: Str,
  seeAllProjects: Str,
  earlierLabel: Str,
  detailsOpen: Str,
  detailsClose: Str,
  storyOpen: Str,
  storyClose: Str,
  impactLabel: Str,
  heroStatsSuffix: obj(["years", "certs"]),
  featuredProjectsTitle: Str.optional(),
  heroTagline: Str.optional(),
  heroCTAs: obj(["downloadCv"]).optional(),
  archPage: obj([
    "infraDiagramTitle", "techStackTitle", "monthlyCostsTitle", "tableHeaderLayer", "tableHeaderTechnology",
    "tableHeaderService", "tableHeaderCostUsd", "archDecisionsTitle", "linksTitle", "linkGithubRepo",
    "linkTerraform", "linkSpecs",
  ]).optional(),
  libraryPage: obj([
    "installTitle", "versionLabel", "copyLabel", "copiedLabel", "linkPypi", "linkDocs", "howTitle", "factsTitle",
  ]).optional(),
  siteChrome: z.object({
    nav: obj(["label", "resume", "projects", "blog"]),
    theme: obj(["toLight", "toDark"]),
    language: obj(["label"]),
    breadcrumb: obj(["label", "projects"]),
    backToProjects: Str,
    blog: obj(["title", "intro", "empty", "tagsLabel", "filteredBy", "allPosts", "back"]),
    footer: obj(["label", "owner", "email", "linkedin", "github"]),
  }),
});
