/**
 * projects.ts — T-PC-A-02
 *
 * Zod schemas for the projects-cluster-v1 content model.
 *
 * Constraints (from SPEC §5.5 / Architect HIGH-3):
 * - Zero z.any() — all shapes explicit.
 * - z.discriminatedUnion("kind", [...]) with 3 variants.
 * - sections / stack / costs / decisions are z.array(z.object({...})).min(1).
 * - This file is ONLY imported in:
 *   (a) frontend/scripts/validate-content.mjs (Node, build-time), and
 *   (b) frontend/src/hooks/useContent.ts (inside if(import.meta.env.DEV) guard).
 * Vite tree-shakes Zod from the production bundle (AC-PC-02).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, {
  message: "slug must match ^[a-z0-9-]+$",
});

const ProjectCardSchema = z.object({
  cover: z.string().optional(),
  summary: z.string().min(1),
  tech: z.array(z.string()).min(3),
});

const ProjectSeoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const ProjectHeroSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
});

const ProjectSectionItemSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
});

export const ProjectSectionDataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  diagram: z.string().optional(),
  items: z.array(ProjectSectionItemSchema).optional(),
});

export const StackRowSchema = z.object({
  layer: z.string().min(1),
  tech: z.string().min(1),
});

export const CostRowSchema = z.object({
  service: z.string().min(1),
  monthly_usd: z.number(),
});

export const ArchDecisionSchema = z.object({
  title: z.string().min(1),
  rationale: z.string().min(1),
  spec: z.string().min(1),
});

export const GameLinkSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1),
  engine: z.string().min(1),
  cover: z.string().min(1),
  body: z.string().min(1),
  repo: z.string().url(),
  playUrl: z.string().url(),
});

// ---------------------------------------------------------------------------
// Per-kind schemas
// ---------------------------------------------------------------------------

/** Base fields shared by all project kinds. */
const ProjectBaseSchema = z.object({
  slug: SlugSchema,
  hero: ProjectHeroSchema,
  card: ProjectCardSchema,
  seo: ProjectSeoSchema,
  diagram: z.string().optional(),
  /** rc-2: dark-mode diagram variant; falls back to `diagram` when absent. */
  diagramDark: z.string().optional(),
  diagramAlt: z.string().optional(),
});

export const CaseStudyProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("case-study"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  cta: z.object({
    github: z.string().url(),
    githubLabel: z.string().optional(),
  }),
});

export const MetaProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("meta"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  stack: z.array(StackRowSchema).min(1),
  costs: z.array(CostRowSchema),
  decisions: z.array(ArchDecisionSchema).min(1),
  links: z.object({
    repo: z.string().url(),
    terraform: z.string().url(),
    specs: z.string().url(),
  }),
});

export const GamesProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("games"),
  items: z.array(GameLinkSchema).min(1),
});

/** rc-2 (ADR-PC2-R2-01): open-source library published on a package registry. */
export const LibraryProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("library"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  pypi: z.object({
    package: z.string().min(1),
    version: z.string().min(1),
    installCommand: z.string().min(1),
  }),
  stat: z
    .object({
      label: z.string().min(1),
      value: z.string().min(1),
    })
    .optional(),
  links: z.object({
    repo: z.string().url(),
    pypi: z.string().url(),
    docs: z.string().url().optional(),
  }),
});

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

export const ProjectSchema = z.discriminatedUnion("kind", [
  CaseStudyProjectSchema,
  MetaProjectSchema,
  GamesProjectSchema,
  LibraryProjectSchema,
]);

// ---------------------------------------------------------------------------
// Top-level content schema
// ---------------------------------------------------------------------------

export const ProjectsIndexSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  /** rc-2: i18n labels for the kind chip on ProjectCard. Optional with code fallback. */
  kindLabels: z
    .object({
      "case-study": z.string().min(1),
      meta: z.string().min(1),
      games: z.string().min(1),
      library: z.string().min(1),
    })
    .optional(),
});

export const ProjectsContentSchema = z.object({
  index: ProjectsIndexSchema,
  list: z.array(ProjectSchema),
});

// ---------------------------------------------------------------------------
// TypeScript types inferred from schemas
// ---------------------------------------------------------------------------

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type CaseStudyProjectSchemaType = z.infer<typeof CaseStudyProjectSchema>;
export type MetaProjectSchemaType = z.infer<typeof MetaProjectSchema>;
export type GamesProjectSchemaType = z.infer<typeof GamesProjectSchema>;
export type LibraryProjectSchemaType = z.infer<typeof LibraryProjectSchema>;
export type ProjectsContentSchemaType = z.infer<typeof ProjectsContentSchema>;
