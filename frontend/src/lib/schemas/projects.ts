/**
 * Zod validation schemas for the projects content block.
 * T-FE-PROJ-01 (F-P0-09 §3.3)
 */
import { z } from "zod";

const ProjectCardSchema = z.object({
  cover: z.string().startsWith("/assets/projects/"),
  summary: z.string().min(1),
  tech: z.array(z.string()).min(1),
});

const ProjectBaseSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(["case-study", "games", "meta"]),
  hero: z.object({ title: z.string(), tagline: z.string(), logo: z.string().optional() }),
  card: ProjectCardSchema,
  seo: z.object({ title: z.string(), description: z.string() }),
  diagram: z.string().optional(),
});

const CaseStudySchema = ProjectBaseSchema.extend({
  kind: z.literal("case-study"),
  sections: z.array(z.any()).min(1),
  cta: z.object({ github: z.string(), docs: z.string().optional() }),
});

const MetaSchema = ProjectBaseSchema.extend({
  kind: z.literal("meta"),
  sections: z.array(z.any()),
  stack: z.array(z.any()).min(1),
  costs: z.array(z.any()),
  decisions: z.array(z.any()).min(1),
  links: z.object({ repo: z.string(), terraform: z.string(), specs: z.string() }),
});

const GamesSchema = ProjectBaseSchema.extend({
  kind: z.literal("games"),
  items: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    engine: z.string(),
    cover: z.string(),
    body: z.string(),
    repo: z.string(),
    playUrl: z.string(),
  })).min(1),
});

export const ProjectSchema = z.discriminatedUnion("kind", [
  CaseStudySchema,
  MetaSchema,
  GamesSchema,
]);

export const ProjectsContentSchema = z.object({
  index: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    seo: z.object({ title: z.string(), description: z.string() }),
  }),
  list: z.array(ProjectSchema).min(1),
});
