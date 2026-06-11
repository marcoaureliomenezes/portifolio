/**
 * content-schema.mjs — T-RD-11 (AC-RD-08)
 *
 * THE canonical machine contract for portfolio content (headless Phase 1).
 * Single-sourced here (plain ESM so Node can run it without a TS toolchain):
 *  - consumed by scripts/validate-content.mjs (CI gate over public/content/*)
 *  - exported as JSON Schema by scripts/export-content-schema.mjs — the
 *    versioned artifact (/content/schema/v1.json) the external admin-panel
 *    project renders its forms from.
 *
 * The projects sub-schema mirrors src/lib/schemas/projects.ts (dev-runtime
 * guard); structural drift between the two is caught because CI validates the
 * real locales against THIS schema while the dev guard validates projectsV2
 * against the TS one.
 *
 * Policy: structured collections are strict; top-level UI label keys are
 * intentionally tolerated via .catchall() — labels come and go with features
 * and must not require a schema major bump.
 */

import { z } from "zod";

// ── shared ──────────────────────────────────────────────────────────────────

const Slug = z.string().regex(/^[a-z0-9-]+$/);
const Id = z.string().min(1);

export const ProfileSchema = z.object({
  linkedinUrl: z.string().url(),
  githubUrl: z.string().url(),
  instagramUrl: z.string().url(),
  email: z.string().email(),
  cvUrl: z.string().min(1),
});

// ── experiences ─────────────────────────────────────────────────────────────

const HighlightProjectSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  impact: z.array(z.string()).optional(),
  links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
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
  link: z.string(),
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
  thesisLink: z.string().optional(),
});

export const SkillCategorySchema = z.object({
  id: Id,
  title: z.string().min(1),
  icon: z.string(),
  skills: z.array(z.string()).min(1),
});

// ── projects (mirrors src/lib/schemas/projects.ts) ──────────────────────────

const ProjectCardSchema = z.object({
  cover: z.string().optional(),
  summary: z.string().min(1),
  tech: z.array(z.string()).min(3),
});

const ProjectSectionDataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  diagram: z.string().optional(),
  items: z.array(z.object({ label: z.string().min(1), value: z.string() })).optional(),
});

const ProjectBaseSchema = z.object({
  slug: Slug,
  hero: z.object({ title: z.string().min(1), tagline: z.string().min(1) }),
  card: ProjectCardSchema,
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  diagram: z.string().optional(),
  diagramDark: z.string().optional(),
  diagramAlt: z.string().optional(),
});

const CaseStudyProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("case-study"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  cta: z.object({ github: z.string().url(), githubLabel: z.string().optional() }),
});

const MetaProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("meta"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  stack: z.array(z.object({ layer: z.string().min(1), tech: z.string().min(1) })).min(1),
  costs: z.array(z.object({ service: z.string().min(1), monthly_usd: z.number() })),
  decisions: z
    .array(z.object({ title: z.string().min(1), rationale: z.string().min(1), spec: z.string().min(1) }))
    .min(1),
  links: z.object({ repo: z.string().url(), terraform: z.string().url(), specs: z.string().url() }),
});

const GamesProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("games"),
  items: z
    .array(
      z.object({
        slug: Slug,
        title: z.string().min(1),
        engine: z.string().min(1),
        cover: z.string().min(1),
        body: z.string().min(1),
        repo: z.string().url(),
        playUrl: z.string().url(),
      }),
    )
    .min(1),
});

const LibraryProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("library"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  pypi: z.object({
    package: z.string().min(1),
    version: z.string().min(1),
    installCommand: z.string().min(1),
  }),
  stat: z.object({ label: z.string().min(1), value: z.string().min(1) }).optional(),
  links: z.object({ repo: z.string().url(), pypi: z.string().url(), docs: z.string().url().optional() }),
});

export const ProjectSchema = z.discriminatedUnion("kind", [
  CaseStudyProjectSchema,
  MetaProjectSchema,
  GamesProjectSchema,
  LibraryProjectSchema,
]);

export const ProjectsContentSchema = z.object({
  index: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    kindLabels: z
      .object({
        "case-study": z.string().min(1),
        meta: z.string().min(1),
        games: z.string().min(1),
        library: z.string().min(1),
      })
      .optional(),
  }),
  list: z.array(ProjectSchema),
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
  // UI label keys (resumeTitle, seeMore, nowPanel, …) are feature-owned and
  // intentionally schema-tolerant; i18n parity is enforced by check-i18n-parity.
  .catchall(z.unknown());
