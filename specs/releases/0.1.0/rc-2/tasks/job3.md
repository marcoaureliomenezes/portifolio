# Job 3 — one project shape, the media renderer, the code block

Wave 2, waits on Job 1 (both write `frontend/src/types/content.ts`; the tokens and `SiteLayout` exist). Paths are relative to the repo root. Order T1..T8: RED before source. Rulings the `test(...)` commits cite: **R-M** main-thread assert-move ruling (2026-10-24: the `navProjects` and stale claim literals only; no other assert moves here). Definition of done: `npm --prefix frontend run verify`, `npm --prefix frontend run validate:content`, `npm --prefix frontend run schema:check`, and `npx vitest run src/lib src/hooks src/components/projects`, reporting counts.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J3.T1 | sr | AC2.4, AC2.6 | `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/lib/contentSchemaExport.test.ts` | RED: `media`, `code`, item `href`, `hero.media`; no `stat`, no section `diagram`; malformed `media` fails; the 3 real files parse; the export carries `media` |
| J3.T2 | sr | AC2.4, AC2.6 | `frontend/src/lib/schemas/projects.ts`, `frontend/scripts/content-schema.mjs`, `frontend/public/content/schema/v1.json` | `projects.ts` is the one authority; `content-schema.mjs` imports it; `v1.json` regenerated |
| J3.T3 | sr | AC2.4 | `frontend/src/types/content.ts` | project types become `z.infer` re-exports under their current names |
| J3.T4 | jr | AC2.4 | `frontend/scripts/check-i18n-parity.mjs` | parity keys `hero.media.alt`, `sections[].media.alt`, `sections[].media.caption` |
| J3.T5 | sr | AC3.6, AC3.4 | `frontend/src/components/projects/__tests__/Media.test.tsx`, `frontend/src/hooks/useMediaQuery.test.ts` | RED: the media component and the query hook |
| J3.T6 | sr | AC2.3 | `frontend/src/components/projects/__tests__/CodeBlock.test.tsx` | RED: copies exactly the shown text, fires `onCopy` |
| J3.T7 | sr | AC3.6, AC3.4, AC3.5 | `frontend/src/hooks/useMediaQuery.ts`, `frontend/src/components/projects/Media.tsx` | `useMediaQuery` and `Media` |
| J3.T8 | sr | AC2.3 | `frontend/src/components/projects/CodeBlock.tsx` | `CodeBlock`, the install block's copy handler generalised |

## The shape (J3.T2, the only authority)

```
Cut   = { webm, mp4, poster, width, height }                 // public paths, CSS px
Media = { type: "video", alt, caption?, desktop: Cut, phone: Cut }
   or { type: "svg",   alt, caption?, light, dark }         // light/dark pair
Section += media?: Media, code?: string, items[].href?: url
hero    += media?: Media
Library: stat removed; section.diagram removed; meta?: { language, license }; project-level diagram/diagramDark/diagramAlt unchanged
```

- This refines the as-is sketch (one `src` plus two extensions): webm and mp4 differ in bytes, so each carries its own hashed path (AC3.2).
- `meta` is a seam the SPEC left open: its design's meta row names language and license, and no field carries them. Both are plain strings (`Python`, `MIT`), language-neutral, optional so the 3 real files parse before Jobs 7 and 8 fill them; each is read from the tag's `pyproject.toml` and linked in the facts table.
- `alt` and `caption` are the only i18n keys; every path, size and `code` is identical in the three locales (the `installCommand` pattern).
- `content-schema.mjs` replaces its lines 102-188 by `import { ProjectsContentSchema } from "../src/lib/schemas/projects.ts"`. The proof runs first, in the task: `projects.ts` imports only `zod` and holds no TS-only syntax, so Node's type stripping loads it (Node >= 22.18; this machine runs v22.23.4 and `ci.yml` pins `node-version: "22"`, the latest 22.x). The check is `node scripts/export-content-schema.mjs --check`, which `contentSchemaExport.test.ts` already runs inside `test:run`, so `verify` fails if the import chain breaks. Fallback, only if that command fails on a supported Node: keep the second copy and add one vitest parse of the 3 locale files; the task then reports the fallback to the main thread.
- Object schemas strip unknown keys, so the `stat` and `diagram` values still in the content files (until Jobs 7 and 8 replace them) neither fail the parse nor render.
- `useContent.ts` keeps its dev guard unchanged (it imports `ProjectsContentSchema`, which keeps its name).

## Task notes

- **J3.T1.** Cases are fixtures plus one test that reads `public/content/{pt,en,de}.json` and parses `projectsV2` with `ProjectsContentSchema`. Removed with their fields, by R-M: the `stat` and section `diagram` cases of `projects.test.ts`; no other assert changes. `contentSchemaExport.test.ts` gains one case: the exported contract has a `media` definition reachable from a project section.
- **J3.T3.** Kept names (37 consumer files): `ProjectSectionData`, `CostRow`, `ArchDecision`, `GameLink`, `CaseStudyProject`, `MetaProject`, `GamesProject`, `LibraryProject`, `ProjectsContentV2`, `Project`. `ProjectCardData` and `ProjectBase` have 0 consumers and are deleted. `ContentData` and the resume types stay. `tsc` clean is the check; a consumer needing a type change is reported, not worked around.
- **J3.T5.** `Media.test.tsx`: video has `muted`, `loop`, `playsinline`, `poster`, `width` and `height` of the chosen cut and sources webm then mp4; it mounts only after the in-view signal (`useInView`) and has `preload="none"`; the phone cut is chosen when `(min-width: 640px)` does not match; under reduced motion no `<video>` exists and an `<img>` of the poster carries the same `alt`; an `svg` media renders the light/dark pair through `DiagramAsset`; the accessible name is `alt`. The hook test covers initial value, change events and cleanup.
- **J3.T6 / J3.T8.** `CodeBlock({ code, copyLabel, copiedLabel, onCopy? })` renders the text in `<pre>`, a button that writes exactly `code` to the clipboard, and calls `onCopy` after a successful copy; it reads no content and fires no `track()` itself. Job 6 passes `track('project_cta', …)` only for the install block, so `copy_install` never fires from the "Try it" block.
- **J3.T7.** `useMediaQuery(query)` returns the live `matchMedia` match (false when `matchMedia` is absent). `Media` uses it for `(prefers-reduced-motion: reduce)` and `(min-width: 640px)`. The box is `w-full h-auto max-w-full` with the cut's `width` and `height`, so nothing overflows at 360 px.

## Hand-back evidence

- Sweep: `git grep -n 'zod-to-json-schema\|section.diagram\|\.stat\b' frontend/src frontend/scripts` has no hit in source; the count of `ProjectSectionDataSchema` definitions is 1.
- `node scripts/export-content-schema.mjs --check` exit code and `jq '.definitions.PortfolioContentV1.properties.projectsV2 | length'` on the regenerated `v1.json`.
- Net lines of `src/` and `scripts/` for the job at or below 0 (the mirror types and the schema copy go).
