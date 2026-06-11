#!/usr/bin/env node
/**
 * validate-content.mjs — T-PC-A-03
 *
 * Build-time validation script: loads the 3 locale JSON files and validates
 * the `projectsV2` block against ProjectsContentSchema (Zod).
 *
 * Usage:  node scripts/validate-content.mjs
 * Exit:   0 on success, 1 on any validation error.
 *
 * This script runs in Node.js (not in the browser bundle).
 * Zod is a devDependency; it is NOT included in the production bundle.
 * Vite tree-shakes it away because the import in useContent.ts is guarded by
 * `if (import.meta.env.DEV)` which evaluates to false in production.
 *
 * AC-PC-02 verification:
 *   After `npm run build`:
 *   grep -c "zod" dist/assets/index-*.js  =>  must return 0
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Import Zod schema via a transpiled CJS-compatible path.
// We use a dynamic import of the TypeScript source via tsx/ts-node if available,
// falling back to the pre-built CommonJS output. Since this is a Node-only
// script and zod is a devDependency, we register the schemas inline as
// a plain JavaScript reimplementation to keep the script zero-extra-config.
// This approach avoids requiring tsx or ts-node in the CI environment.

// ── Inline Zod import ──────────────────────────────────────────────────────
// We need to import zod ESM in Node.
// zod v4 ships as ESM. We use dynamic import.
const { z } = await import("zod");

// ── Schema definitions (mirrors src/lib/schemas/projects.ts) ─────────────
// Kept in sync manually; if the TS schema changes, update here too.
// The canonical source of truth is src/lib/schemas/projects.ts.

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

const ProjectSectionDataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  diagram: z.string().optional(),
  items: z.array(ProjectSectionItemSchema).optional(),
});

const StackRowSchema = z.object({
  layer: z.string().min(1),
  tech: z.string().min(1),
});

const CostRowSchema = z.object({
  service: z.string().min(1),
  monthly_usd: z.number(),
});

const ArchDecisionSchema = z.object({
  title: z.string().min(1),
  rationale: z.string().min(1),
  spec: z.string().min(1),
});

const GameLinkSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1),
  engine: z.string().min(1),
  cover: z.string().min(1),
  body: z.string().min(1),
  repo: z.string().url(),
  playUrl: z.string().url(),
});

const ProjectBaseSchema = z.object({
  slug: SlugSchema,
  hero: ProjectHeroSchema,
  card: ProjectCardSchema,
  seo: ProjectSeoSchema,
  diagram: z.string().optional(),
  diagramDark: z.string().optional(),
  diagramAlt: z.string().optional(),
});

const CaseStudyProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("case-study"),
  sections: z.array(ProjectSectionDataSchema).min(1),
  cta: z.object({
    github: z.string().url(),
    githubLabel: z.string().optional(),
  }),
});

const MetaProjectSchema = ProjectBaseSchema.extend({
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

const GamesProjectSchema = ProjectBaseSchema.extend({
  kind: z.literal("games"),
  items: z.array(GameLinkSchema).min(1),
});

// rc-2 (ADR-PC2-R2-01) — mirrors LibraryProjectSchema in src/lib/schemas/projects.ts
const LibraryProjectSchema = ProjectBaseSchema.extend({
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

const ProjectSchema = z.discriminatedUnion("kind", [
  CaseStudyProjectSchema,
  MetaProjectSchema,
  GamesProjectSchema,
  LibraryProjectSchema,
]);

const ProjectsContentSchema = z.object({
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

// ── Locale files to validate ───────────────────────────────────────────────

const LOCALES = ["pt", "en", "de"];
const DATA_DIR = resolve(__dirname, "../src/data/content");

// ── Validation loop ────────────────────────────────────────────────────────

let hasErrors = false;

for (const locale of LOCALES) {
  const filePath = resolve(DATA_DIR, `${locale}.json`);
  let raw;
  try {
    raw = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`[validate-content] ERROR: Cannot read ${filePath}`);
    console.error(err.message);
    hasErrors = true;
    continue;
  }

  const projectsData = raw.projectsV2;
  if (projectsData === undefined) {
    console.error(
      `[validate-content] ERROR: ${locale}.json is missing "projectsV2" key.`,
    );
    console.error(
      `  Hint: Run the JSON migration (T-PC-A-05) to add the projectsV2 block.`,
    );
    hasErrors = true;
    continue;
  }

  const result = ProjectsContentSchema.safeParse(projectsData);
  if (!result.success) {
    console.error(
      `[validate-content] ERROR: ${locale}.json projectsV2 validation failed:`,
    );
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "(root)";
      console.error(`  [${path}] ${issue.message}`);
    }
    hasErrors = true;
  } else {
    const itemCount = result.data.list.length;
    console.log(
      `[validate-content] OK: ${locale}.json — ${itemCount} project(s) valid.`,
    );
  }
}

if (hasErrors) {
  console.error("\n[validate-content] FAILED — fix errors above before building.");
  process.exit(1);
} else {
  console.log("\n[validate-content] All locales valid.");
  process.exit(0);
}
