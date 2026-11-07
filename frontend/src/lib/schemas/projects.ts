/**
 * projects.ts
 *
 * Zod schemas for the projects-cluster-v1 content model.
 * Inputs: none; each exported schema parses an unknown value (safeParse, parse).
 * Output: the URL, email and media schemas, the four per-kind project schemas,
 * ProjectSchema (a discriminated union on `kind`), ProjectsContentSchema, and
 * their inferred types.
 * Side effects: none; imports only zod.
 */

import { z } from "zod";

export const HttpUrl = z.string().regex(/^https?:\/\/[\w.-]+(:\d+)?([/?#]\S*)?$/); // links render as <a href>: no javascript:/data:, no space or %| in the host
export const Email = z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
// eslint-disable-next-line no-control-regex -- the control range is the point
export const SiteRelativeUrl = z.string().regex(/^\/(?![\\/\x00-\x20\x7f])/); // same-origin path: no //, /\, whitespace or control after the slash

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

const CutSchema = z.object({
  webm: z.string().min(1),
  mp4: z.string().min(1),
  poster: z.string().min(1),
  width: z.number(),
  height: z.number(),
});

export const MediaSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    alt: z.string().min(1),
    caption: z.string().optional(),
    desktop: CutSchema,
    phone: CutSchema,
  }),
  z.object({
    type: z.literal("svg"),
    alt: z.string().min(1),
    caption: z.string().optional(),
    light: z.string().min(1),
    dark: z.string().min(1),
  }),
]);

const ProjectHeroSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  media: MediaSchema.optional(),
});

const ProjectSectionItemSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
  href: HttpUrl.optional(),
});

export const ProjectSectionDataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  media: MediaSchema.optional(),
  code: z.string().optional(),
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
  spec: HttpUrl,
});

export const GameLinkSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1),
  engine: z.string().min(1),
  cover: z.string().min(1),
  body: z.string().min(1),
  repo: HttpUrl,
  playUrl: HttpUrl,
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
  /** Dark-mode diagram; falls back to `diagram` when absent. */
  diagramDark: z.string().optional(),
  diagramAlt: z.string().optional(),
});

export const CaseStudyProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("case-study"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  cta: z.object({
    github: HttpUrl,
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
    repo: HttpUrl,
    terraform: HttpUrl,
    specs: HttpUrl,
  }),
});

export const GamesProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("games"),
  items: z.array(GameLinkSchema).min(1),
});

/** Open-source library published on a package registry. */
export const LibraryProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("library"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  pypi: z.object({
    package: z.string().min(1),
    version: z.string().min(1),
    installCommand: z.string().min(1),
  }),
  links: z.object({
    repo: HttpUrl,
    pypi: HttpUrl,
    docs: HttpUrl.optional(),
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
