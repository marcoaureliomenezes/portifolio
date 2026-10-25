/**
 * content-schema.mjs — T-RD-11 (AC-RD-08)
 *
 * THE canonical machine contract for portfolio content (headless Phase 1).
 * Single-sourced here (plain ESM so Node can run it without a TS toolchain):
 *  - parsed against public/content/*.json by src/lib/contentSchemaExport.test.ts (inside verify)
 *  - exported as JSON Schema by scripts/export-content-schema.mjs — the
 *    versioned artifact (/content/schema/v1.json) the external admin-panel
 *    project renders its forms from.
 *
 * The projects sub-schema is imported from src/lib/schemas/projects.ts, its
 * one authority (Node type stripping loads it; it imports only zod).
 *
 * Policy: structured collections are strict; top-level UI label keys are
 * intentionally tolerated via .catchall() — labels come and go with features
 * and must not require a schema major bump.
 */

import { z } from "zod";
import { HttpUrl, ProjectsContentSchema } from "../src/lib/schemas/projects.ts";

// ── shared ──────────────────────────────────────────────────────────────────

const Id = z.string().min(1);

export const ProfileSchema = z.object({
  linkedinUrl: HttpUrl,
  githubUrl: HttpUrl,
  instagramUrl: HttpUrl,
  email: z.string().email(),
  cvUrl: z.string().regex(/^\/(?![\/\\])/), // same-origin path only
});

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
  link: z.union([HttpUrl, z.literal("#")]),
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

export const ContentDataSchema = z
  .object({
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
  })
  // UI label keys (resumeTitle, storyOpen, …) are feature-owned and
  // intentionally schema-tolerant; i18n parity is enforced by check-i18n-parity.
  .catchall(z.unknown());
