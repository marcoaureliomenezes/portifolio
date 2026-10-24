# PLAN — Release 0.1.0, rc-2

**Status:** Draft
**Owner:** dd-sw-engineer-sr

Paths are relative to `repos/portifolio/`. Tree: `feature/0.1.0` @ `adfc1c8` (the schema bug is fixed; `zod-to-json-schema` is gone, Zod 4 `z.toJSONSchema` is in use) with the SPEC at `085327c`.

## 1. As-is review

Ledger slice (`bugs.py status` 0 open, 2 resolved; `_archive/bugs_histo.jsonl` empty): `ci-never-runs-the-checks-develop-requires` touches `.github/workflows/ci.yml` only; `content-schema-export-is-empty` (fix `96fc100`, `caused_by: none`, `rebuild: none`) touches `frontend/scripts/export-content-schema.mjs`, `frontend/public/content/schema/v1.json`, `frontend/package.json` and `frontend/src/lib/contentSchemaExport.test.ts`. No REBUILD is due by ledger. Each REBUILD below is chosen by the other triggers: the demand changes the unit's fundamental behaviour, or the change would need a layer. History read with `git log` of the header, projects and pages files: the header was split in 7 (`42a3496`), bridged and collapsed (`fe-qual-refactor-v1`) and re-skinned three times (`visual-identity-v1`, `b99da2a`, `38f6305`, `fc4d1f3`): five rewrites of a page-owned part, so the structural fix is to make it route-owned. Order: DELETE, REBUILD, UPDATE, KEEP, ADD.

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `src/routes.ts:1-36` | `routes`, `headerNavRoutes`; 0 importers | 0 | DELETE | dead second source of the nav list |
| `src/pages/Index.tsx` | the only `<Header/>` render (`:7`) and a `<main>` | 0 | DELETE | the layout route owns both; `/` renders `Portfolio` |
| `src/components/header/{NavAnchors,HeaderShell,HeaderDesktopLayout,HeaderMobileLayout}.tsx` (+`NavAnchors.test`) | home-only anchors, JS `useIsMobile` branch, scroll blur, 6 dead props, hard-coded pt/en labels | 0 | DELETE | collapsed into one header; the anchors are rc-3's home nav |
| `src/hooks/use-mobile.tsx` (+test) | only importer is `HeaderShell` | 0 | DELETE | one responsive header, CSS only |
| `src/components/Header.tsx` | legacy display-name bridge, unused props, `navProjects ?? "Projetos"` | 0 | REBUILD | route-owned Resume/Projects + theme + language, i18n labels, phone nav row |
| `src/App.tsx:41-55` | three sibling roots, header on one | 0 | REBUILD | one pathless `SiteLayout` route wraps all four; `page_view` effect stays in `App` |
| `src/components/projects/ProjectsLayoutShell.tsx` | breadcrumb + back link, hard-coded pt, own offset, `void location` | 0 | UPDATE | strings to content keys, offset to the layout, back link after the outlet |
| `src/pages/NotFound.tsx:17`, `src/components/portfolio/Portfolio.tsx:21` | own `<main>`; own `pt-16 md:pt-[72px]` | 0 | UPDATE | the layout owns landmark and offset |
| `src/contexts/LanguageContext.tsx:196-243` | locale authority; never sets `documentElement.lang` | 0 | UPDATE | one effect, no new state |
| `index.html` | fixed `lang="pt-BR"`, `Content-Language` meta, theme script falls back to the OS scheme | 0 | UPDATE | script agrees with `useTheme`; meta deleted |
| `src/hooks/useTheme.ts:5-17` | first-visit default `dark` | 0 | KEEP | the authority for the first paint |
| `tailwind.config.ts:61-70`, `src/index.css`, `src/main.tsx:4-8` | 10 dead `sidebar` tokens, unused header vars, no type scale, Inter 800 loaded unused | 0 | REBUILD | declare the type steps and one `--header-h`; drop the dead block and the 800 weight |
| `src/components/ui/disclosure.tsx`, `portfolio/MobileCollapsibleSection.tsx` | resume accordion in a `Card` | 0 | KEEP | project pages do not use them; the resume (rc-3) decides |
| `src/components/projects/ProjectSections.tsx` | three near-identical `Card` branches, 24 px `h2` | 0 | REBUILD | one branch on `Block`; adds `media`, `code`, item links |
| `src/components/projects/ProjectHero.tsx`, `DiagramCard.tsx` | carded hero with 36 px `h1`; carded diagram with a wrong title on library pages | 0 | UPDATE | un-boxed on the tokens; cover logic and its 6 tests kept; library pages stop using `DiagramCard` |
| `src/components/projects/DiagramAsset.tsx` | theme-aware light/dark `<img>` pair | 0 | KEEP | the SVG-scene renderer, unchanged |
| `src/components/projects/{ProjectCard,GameCard,CostsTable,DecisionsList}.tsx`, `pages/projects/ProjectsIndexPage.tsx` | cards and tables; `stat` chip; index has its own `<main>` | 0 | UPDATE | tokens only, `stat` chip and `<main>` out; content and testids unchanged |
| `src/pages/projects/LibraryProjectTemplate.tsx:1-175` | hero, install card, diagram card, sections, links card; own `<main>`; pt fallback; `stat` | 0 | REBUILD | page order changes and a new section grammar (`media`, `code`) |
| `src/pages/projects/{Meta,Games,CaseStudy}ProjectTemplate.tsx` | own `<main pt-36>`, `Card` blocks, hard-coded pt | 0 | UPDATE | onto the shared parts, content unchanged; `case-study` kind stays (removing it is an intake item) |
| `src/pages/projects/ProjectDetailPage.tsx` | `switch(kind)` + `assertNever` | 0 | KEEP | the dispatch authority |
| `src/lib/schemas/projects.ts` (+test, 33 cases) | Zod project shape; one of three hand copies | 0 | REBUILD | the one authority: `media`, `code`, `href`, `hero.media`; `stat`, section `diagram` out |
| `frontend/scripts/content-schema.mjs:102-188` | second copy of the project sub-schema | 0 | DELETE (the copy; the file stays) | imports `projects.ts` (Node type stripping, proven in Job 3) |
| `src/types/content.ts:103-244` | hand-written mirror (37 consumer files) | 0 | DELETE (the mirror) | `z.infer` re-exports under the same names |
| `frontend/scripts/export-content-schema.mjs`, `public/content/schema/v1.json`, `src/lib/contentSchemaExport.test.ts` | Zod 4 `z.toJSONSchema` export; the test is the export's contract test; `v1.json` non-empty from `adfc1c8` | 1 (`content-schema-export-is-empty`) | KEEP | the fix is sound (RED test first, cause named); Job 3 regenerates `v1.json` and extends that test |
| `frontend/scripts/{validate-content,check-i18n-parity}.mjs` | `validate:content` is not in `verify`; the parity script runs in it | 0 | UPDATE (parity) / KEEP | parity gains `siteChrome` and the `media` keys; `validate-content` untouched |
| `public/content/{pt,en,de}.json`: top-level keys, `libraryPage` | `navProjects` (English in pt/de); no chrome object | 0 | UPDATE | `siteChrome` in, `navProjects` out, four `libraryPage` keys |
| `public/content/*.json` `projectsV2` items `rand-engine`, `dadaia-workspace` | 0.6.4 / 0.5.0 claims, stable-name images, `stat` | 0 | REBUILD | every claim rebuilt from the pinned tag; games and portifolio items untouched |
| `public/assets/projects/**` (17 files) | 5 orphans, 9 library files under stable names, 1 year immutable cache | 0 | DELETE | new files get hashed names, old ones go |
| `tests/e2e/pages/email-modal-dark-mode.spec.ts-snapshots/` | 2 orphan PNGs | 0 | DELETE | operator test ruling |
| `src/components/header/Header.test.tsx`, `NavAnchors.test.tsx`, `use-mobile.test.tsx` | pin the deleted branch and props | 0 | DELETE (2 files, 4 cases) / REBUILD | operator test ruling; surviving asserts re-homed in the new header test |
| `tests/e2e/projects-cluster/nav-projects.spec.ts`, `pages/layout.spec.ts` T-LAY-01, `rand-engine.spec.ts`, `project-detail-library.spec.ts` PC-E2E-10, `index.spec.ts` PC-E2E-01/02 | hamburger, `Personal Projects`, `0.6.4`, diagram pair, 3-card loop | 0 | UPDATE | operator test and phone-nav rulings, main-thread ruling; PC-E2E-01 is a tightening |
| `tests/e2e/projects-cluster/{i18n-projects,layout-shell}.spec.ts`, `rand-engine.spec.ts` RE-E2E-04 | need a header on `/projetos*` | 0 | KEEP | go green when Job 1 lands; asserts unchanged |
| `.github/workflows/ci.yml:96-112`, `lighthouserc.json`, `deploy.yml:74-80` | SVG size gate, Lighthouse URLs, immutable 1 year cache | 0 | KEEP | unchanged; hashed names make the cache safe |
| `frontend/media/**`, `Media`, `CodeBlock`, `Block`, `SiteLayout`, `useMediaQuery`, `contentAssets.test.ts`, `library-scenes.spec.ts` | do not exist | - | ADD | no unit can carry them: no `<video>` renderer exists, `DiagramAsset` is an `<img>` pair, no layout route exists |

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| where the header renders | `SiteLayout` (pathless layout route in `src/App.tsx`) | the four routes | `<Header/>` in `Index.tsx:7`; `Index.tsx` |
| `<main id="main-content">` and the header offset | `SiteLayout` and one `--header-h` token | every page body | the offsets `pt-36 md:pt-32` (x4 templates), `pt-24 md:pt-20` (shell), `pt-16 md:pt-[72px]` (`Portfolio.tsx:21`); the 5 nested `<main>` |
| which links the header shows | the `Header` nav array (Resume, Projects; Blog joins in rc-4) | `NavLink` active state | `src/routes.ts`; `NAV_ANCHORS` |
| active locale and `<html lang>` | `LanguageContext` | `Header` selector; the new `lang` effect | the `Content-Language` meta |
| first-paint theme | `useTheme.readInitialTheme` (default dark) | the `index.html` script | the `matchMedia` branch of that script |
| site-chrome strings | the locale JSON, object `siteChrome`; games empty state: top-level `gamesComingSoon*` | `Header`, shell, `LanguageSelector`, `ThemeToggle`, games template | `navProjects`; the hard-coded pt strings; the dead `?? "..."` fallbacks |
| the shape of a project in content | `src/lib/schemas/projects.ts` (Zod) | `content-schema.mjs`, `types/content.ts`, `check-i18n-parity.mjs` | the copy in `content-schema.mjs:102-188`; the mirror `types/content.ts:103-244` |
| breadcrumb and back link | `ProjectsLayoutShell` | the project pages | none (pages render neither) |
| which asset files exist, names, budgets | `src/lib/contentAssets.test.ts` over the locale JSON | `record.mjs` (writes the names), `ci.yml` SVG gate | the 5 orphans; 9 stable-name library files |
| whether motion plays | `useMediaQuery('(prefers-reduced-motion: reduce)')` in `Media`; each SVG's own `@media` rule | `useInView` | none |
| what a library page may claim | the pinned tag of the library's repo (`0.8.0`, `v0.4.7`), via a `claim | file:line` table per job | the facts rows' `href` at the tag | every unsourced number (SPEC AC4.6, AC5.4) |
| the job gate | `package.json` `scripts.verify` | CI on push | none (unchanged) |

Duplicated deciders, with a repro where the copies diverge: first-paint theme, `index.html:25-30` (stored, else OS scheme) against `useTheme.ts:16` (stored, else dark). Repro: empty storage on an OS set to light: the script leaves `<html>` light, React then applies `dark`, a light flash. Job 1 makes the script follow `useTheme`. The header offset has 7 literal copies (no divergence, the stacking offset on a detail page is 144 px: shell `pt-24` plus template `pt-36`). The project shape has 3 copies that agree today; the cost is lockstep editing.

## 2. Order and seams

- **Waves.** Wave 1 is the shared foundation: Job 1 (frame) and Job 2 (recording tool). Wave 2: Job 3 (shape and renderers, after Job 1 for `types/content.ts`), Jobs 4 and 5 (scenes, after Job 2). Wave 3: Job 6 (pages, after Job 3). Wave 4: Job 7 (rand-engine content). Wave 5: Job 8 (dadaia-workspace content and the contract test). The locale JSON files are written by Jobs 1, 6, 7 and 8, one job per wave. Job 7 and Job 8 cannot share a wave: the same three files.
- **Why the contract test is last (Job 8).** `contentAssets.test.ts` asserts that every asset file is referenced and every referenced file exists. Jobs 4 and 5 add assets before any content references them, so landing the test earlier makes `verify` red at their merges. In Job 8 it is its own RED task and goes green when the content and the deletions land.
- **Test and source tasks are separate.** `tests:` globs refuse a source task that touches a test file, so every test deletion or edit is a `test(...)` task (Job 1 T1 to T5, Job 3 T1/T5/T6, Job 6 T1 to T4, Job 7 T1, Job 8 T1/T3/T4). The subject deleted before its test: a test task deletes the test with the operator's ruling named, then a source task deletes the subject.
- **The job gate is the merge.** `verify` runs at each job's `wt-main` merge, not per task, so intermediate trees inside a job may be red. Each job's Definition of done is `npm --prefix frontend run verify` (measured 27 to 34 s) plus the test directories its change reaches. No step, preflight or gate is added; `lighthouserc.json` and the `verify:` line are unchanged.
- **Node type stripping.** `content-schema.mjs` imports `src/lib/schemas/projects.ts`. Proven here on the read-only tree: Node v22.23.4 loads a `.ts` file with `import type`/`export type` through a `.mjs` import (it stopped only at the uninstalled `zod`); `projects.ts` imports only `zod`. CI pins `node-version: "22"` (latest 22.x, type stripping unflagged since 22.18). Job 3 T2 runs `node scripts/export-content-schema.mjs --check`, which `contentSchemaExport.test.ts` already runs inside `test:run`, so a break fails `verify`. Fallback: keep the second copy and add one vitest parse of the 3 files, reported to the main thread.
- **Media shape (refines the as-is sketch).** A video cut carries `webm`, `mp4`, `poster`, `width`, `height` as separate hashed paths, because webm and mp4 differ in bytes and each name carries its own sha256. A video has a `desktop` (16:9, 640×360) and a `phone` (4:5, 360×450) cut; `Media` picks by `(min-width: 640px)` so only one video loads. This is the one JS branch in the media path; layout elsewhere is CSS. An SVG scene is a light/dark pair through `DiagramAsset`.
- **Scenes.** rand-engine: `spec-to-dataframe` (video, hero), `related-tables` (svg), `event-stream` (svg), `files-in-parts` (video). dadaia-workspace: `init-workspace` (video, hero), `demand-to-merge` (svg), `gate-refuses` (video), `six-harnesses` (svg). 4 videos in 2 cuts (24 files with posters), 4 SVG pairs (8 files).
- **Library page composition.** Section ids carry meaning: `try`, `why`, `facts`; any other section is a scene, rendered under the "How it works" heading in order. The facts heading is composed from `libraryPage.factsTitle`, the title and `pypi.version`, so the pin shows by construction. The page renders neither breadcrumb nor back link; the shell does.
- **Seam the SPEC left open: the meta row.** The design names language and license in the meta row and no field carries them. Job 3 adds `meta?: { language, license }` (plain strings, optional); Jobs 7 and 8 fill them from the tag. Raised to the main thread in the hand-back.
- **Card covers.** A library item's `card.cover` is its hero loop's desktop poster, so the cards show a still and no placeholder; the stable cover files go.
- **Recording.** Each scene job records in a throwaway venv under `<workspace>/.dadaia/tmp/`, never in the repo, on recording day, after reading the pinned version's real CLI or API. The pin is the PyPI latest that day; if it moved past 0.8.0 or 0.4.7, the main thread is told before content is written.
- **Cost on the `verify:` line.** No step is added. One test file joins `test:run`; Job 8 measures `test:run` before and after and reports the delta, never above one `verify` run.

### 2.1 Pre-mortem answers (each hit of the read-only consumer sweep)

| hit | answer |
|---|---|
| `routes.ts`: fixture comment, `nav-projects.spec` comment | re-point: J1.T4 |
| `Index.tsx`: `App.tsx:6,42`, `frontend/README.md:30` | re-point `App.tsx`: J1.T10; the README tree line is a memory-pass item (shape 9) |
| `NavAnchors`: layouts, test, `layout.spec.ts:62-63` | delete with (J1.T6); test deleted J1.T1 (R-T); smoke assert rewritten J1.T4 (R-P) |
| `HeaderShell`/Desktop/Mobile: `Header.tsx`, `Header.test` cases, `types/content.ts:317`, avatar absence | delete with (J1.T6); cases removed J1.T3 (R-T); comment reworded J1.T8; the avatar-absence assert stays and the new header has no avatar (J1.T9) |
| `use-mobile`: `HeaderShell`, its test, `Header.test` mock | delete with (J1.T1, J1.T6); mock removed J1.T3 |
| `Header.tsx`: `Index`, `Header.test` props/`Personal Projects` cases | delete with (J1.T6); rewritten J1.T3 (R-T, R-M) |
| `App.tsx`: `page_view`, shell test mirror, `ProjectDetailPage.test` mirror, `NotFound` nested main | `page_view` stays in `App`'s mount effect (J1.T10, unchanged, not copied); shell test mirror re-pointed J1.T2; `ProjectDetailPage.test` needs no change; `NotFound` J1.T10 |
| `navProjects` key: 3 JSON, `types/content.ts:354`, `Header`, `Header.test`, e2e (href-based) | delete with: J1.T8, J1.T9, J1.T3 |
| `ProjectSections`: 3 importers, `project-section` testid | re-point: J6.T5, J6.T8, J6.T7; testid kept |
| section `diagram`: 3 JSON `:617`, `ProjectSections`, both schemas, `types/content.ts` | delete with: J3.T2, J3.T3, J6.T5, J8.T5 to T7 |
| `ProjectHero`: 4 importers, `ProjectHero.test` | re-point: J6.T6; the 6 asserts hold; h1 kept |
| `stat` chip: card, library template and tests, schemas, types, 6 content entries | delete with: J3.T2/T3, J6.T1/T2/T7/T9, J7.T3 to T5, J8.T5 to T7; no e2e reads it |
| `LibraryProjectTemplate`: dispatch, tests, `install-command` literal, PC-E2E-10, rand-engine literals, analytics, memory atom | re-point: J6.T1, J6.T4 (R-M), J7.T1; `copy_install` only from the install block (J3.T6, J6.T7); the atom is a memory-pass item |
| `types/content.ts` mirror: 37 consumers | re-point: names kept as re-exports (J3.T3); `ProjectCardData`, `ProjectBase` deleted (0 consumers) |
| `content-schema.mjs`: export, validate, scripts, `v1.json`, ARCHITECTURE.md:22-25, Node version | re-point: J3.T2 (proof in §2); `ARCHITECTURE.md` is a memory-pass item |
| `projects.ts` authority: `useContent` guard, tests | `useContent` unchanged (export name kept); `projects.test` J3.T1 |
| 5 orphan assets | delete with: J8.T2 (0 consumers; the negative slug assert in `project-detail-games.spec.ts` stays green) |
| `workspace-panel-01.webp`: 3 JSON, memory atom, `catalog.json:23` | delete with: J8.T2, J8.T5 to T7; atom and catalog glob are memory-pass items |
| `rand-engine/cover.webp`: 3 JSON, `ProjectCard`, `FeaturedProjects` | delete with: J7.T2; `card.cover` becomes the hero poster J7.T3 to T5; `ProjectCard` cover logic kept (J6.T9) |
| library `architecture-*.svg`: JSON, PC-E2E-10, template test, memory atom | delete with: J7.T2, J8.T2; PC-E2E-10 J6.T4; template test J6.T1; atom memory pass |
| email snapshots | delete with: J8.T1 |
| `800.css` import | delete with: J1.T7 |
| `font-medium` x26 in 17 files | shared and project parts: J1.T9/T10/T11, J6.T5/T8/T9/T10; resume parts and `components/ui/*`: rc-3 or KEEP (intake item) |
| `sidebar` tokens, `--header-height-*` | delete with: J1.T7; the `layout.spec.ts:108-119` negative assert stays |
| `Content-Language` meta | delete with: J1.T13 |
| theme script against `useTheme` | re-point the script: J1.T13; RED J1.T5 |
| shell breadcrumb and back-link strings, `layout-shell.spec`, shell test | re-point: J1.T11; pt values equal the old literals so asserts stay (J1.T8) |
| `pypi` block of the two items: tests, e2e, memory atom | re-point: J6.T1, J7.T1, J7.T3, J8.T5; the `project-detail-library.spec.ts:40-41` literal holds at the pin (AC5.1); atom memory pass |
| six analytics events | all survive: `page_view` (App), `theme_toggle`, `language_switch` (J1.T9 keeps the calls), `cv_download`, `section_*` (resume, untouched), `project_cta` (J6.T7, J6.T9) |
| 9 live asset URLs answered by the SPA fallback | no redirect (SPEC AC3.7); the contract test J8.T3 holds the rule |
| external: `pyproject.toml` Homepage, rc-21 AC8.1/A8, GitHub homepage | the route `/projetos/dadaia-workspace` stays; the rc-21 pin is an upstream note for the main thread (SPEC Non-goals); no other repo is edited |
| memory-pass items for `dd-product-engineer` | `dadaia-workspace-page` atom (0.4.7 page, new scenes), a rand-engine atom, the `catalog.json` sources glob, `ARCHITECTURE.md:22-25` content contract, `QUALITY.md` Gates e2e trigger, `frontend/README.md:30` tree, `specs/memory` mention of `workspace-panel-01.webp` |

### 2.2 PLAN-stage ADR check

`specs/ADRs/decisions.jsonl` holds no record, so nothing contradicts an accepted ADR. No choice passes the threshold (one-way door, architecturally significant, at least two genuine options): the single project-shape authority, the hashed-name rule, the video formats and the Playwright and ffmpeg recording tool are each reversible in one job and add no runtime dependency. None proposed.

### 2.3 Acceptance map

| AC | tasks |
|---|---|
| AC1.1 | J1.T2, J1.T6, J1.T10, J6.T3, J6.T4, J6.T7, J6.T8, J6.T9 |
| AC1.2 | J1.T1, J1.T3, J1.T4, J1.T6, J1.T9 |
| AC1.3 | J1.T2, J1.T3, J1.T8, J1.T9, J1.T11, J6.T3, J6.T8 |
| AC1.4 | J1.T2, J1.T12, J1.T13 |
| AC1.5 | J1.T5, J1.T13 |
| AC1.6 | J1.T7 |
| AC2.1 | J6.T1, J6.T2, J6.T3, J6.T5, J6.T6, J6.T8, J6.T9, J6.T10 |
| AC2.2 | J6.T1, J6.T4, J6.T7, J6.T11 |
| AC2.3 | J3.T6, J3.T8, J6.T1, J6.T7 |
| AC2.4 | J3.T1, J3.T2, J3.T3, J3.T4, J6.T5 |
| AC2.5 | J6.T8, J6.T10 |
| AC2.6 | J3.T1, J3.T2, J6.T1, J6.T2, J6.T7, J6.T9 |
| AC3.1 | J2.T1, J2.T2, J2.T3, J4.T1, J4.T4, J5.T1, J5.T4 |
| AC3.2 | J7.T2, J8.T1, J8.T2, J8.T3 |
| AC3.3 | J2.T2, J4.T4, J5.T4, J8.T3 |
| AC3.4 | J2.T1, J2.T2, J3.T5, J3.T7, J4.T2, J4.T3, J4.T4, J5.T2, J5.T3, J5.T4, J8.T3 |
| AC3.5 | J3.T7, J4.T2, J4.T3, J5.T2, J5.T3, J8.T3 |
| AC3.6 | J3.T5, J3.T7, J8.T4 |
| AC3.7 | J7.T2, J8.T2, J8.T3 |
| AC4.1 | J4.T1, J7.T1, J7.T3, J7.T4, J7.T5 |
| AC4.2 | J4.T1, J4.T2, J4.T3, J7.T3, J7.T4, J7.T5 |
| AC4.3 | J4.T1, J7.T3 |
| AC4.4 | J7.T3, J7.T4, J7.T5 |
| AC4.5 | J7.T3 |
| AC4.6 | J7.T3, J7.T4, J7.T5 |
| AC4.7 | J7.T3 |
| AC5.1 | J5.T1, J8.T5, J8.T6, J8.T7 |
| AC5.2 | J5.T1, J5.T2, J5.T3, J8.T5, J8.T6, J8.T7 |
| AC5.3 | J5.T1, J8.T5 |
| AC5.4 | J8.T5, J8.T6, J8.T7 |
| AC5.5 | J8.T5 |
| AC6.1 | J8.T3 |

## DAG

| job | waits on | wave | `W:` |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/src/components/header/NavAnchors.test.tsx`, `frontend/src/hooks/use-mobile.test.tsx`, `frontend/src/components/layout/SiteLayout.test.tsx`, `frontend/src/contexts/LanguageContext.test.tsx`, `frontend/src/components/projects/__tests__/ProjectsLayoutShell.test.tsx`, `frontend/src/components/header/Header.test.tsx`, `frontend/src/components/header/ThemeToggle.test.tsx`, `frontend/src/components/header/LanguageSelector.test.tsx`, `frontend/tests/e2e/projects-cluster/nav-projects.spec.ts`, `frontend/tests/e2e/pages/layout.spec.ts`, `frontend/tests/e2e/fixtures/routes.ts`, `frontend/tests/e2e/pages/theme-first-paint.spec.ts`, `frontend/src/routes.ts`, `frontend/src/pages/Index.tsx`, `frontend/src/hooks/use-mobile.tsx`, `frontend/src/components/header/NavAnchors.tsx`, `frontend/src/components/header/HeaderShell.tsx`, `frontend/src/components/header/HeaderDesktopLayout.tsx`, `frontend/src/components/header/HeaderMobileLayout.tsx`, `frontend/tailwind.config.ts`, `frontend/src/index.css`, `frontend/src/main.tsx`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json`, `frontend/src/types/content.ts`, `frontend/scripts/check-i18n-parity.mjs`, `frontend/src/components/Header.tsx`, `frontend/src/components/header/LanguageSelector.tsx`, `frontend/src/components/header/ThemeToggle.tsx`, `frontend/src/components/layout/SiteLayout.tsx`, `frontend/src/App.tsx`, `frontend/src/pages/NotFound.tsx`, `frontend/src/components/portfolio/Portfolio.tsx`, `frontend/src/components/projects/ProjectsLayoutShell.tsx`, `frontend/src/contexts/LanguageContext.tsx`, `frontend/index.html` |
| Job 2 | — | 1 | `frontend/media/terminal.html`, `frontend/media/record.mjs`, `frontend/package.json`, `frontend/media/capture.sh`, `frontend/media/README.md` |
| Job 3 | Job 1 | 2 | `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/lib/contentSchemaExport.test.ts`, `frontend/src/lib/schemas/projects.ts`, `frontend/scripts/content-schema.mjs`, `frontend/public/content/schema/v1.json`, `frontend/src/types/content.ts`, `frontend/scripts/check-i18n-parity.mjs`, `frontend/src/components/projects/__tests__/Media.test.tsx`, `frontend/src/hooks/useMediaQuery.test.ts`, `frontend/src/components/projects/__tests__/CodeBlock.test.tsx`, `frontend/src/hooks/useMediaQuery.ts`, `frontend/src/components/projects/Media.tsx`, `frontend/src/components/projects/CodeBlock.tsx` |
| Job 4 | Job 2 | 2 | `frontend/media/rand-engine/pin.txt`, `frontend/media/rand-engine/spec-to-dataframe.cmds`, `frontend/media/rand-engine/spec-to-dataframe.cast.json`, `frontend/media/rand-engine/files-in-parts.cmds`, `frontend/media/rand-engine/files-in-parts.cast.json`, `frontend/media/rand-engine/try-it.py`, `frontend/media/rand-engine/try-it.cast.json`, `frontend/media/rand-engine/claims.md`, `frontend/media/rand-engine/related-tables-light.svg`, `frontend/media/rand-engine/related-tables-dark.svg`, `frontend/public/assets/projects/rand-engine/related-tables-*.svg`, `frontend/media/rand-engine/event-stream-light.svg`, `frontend/media/rand-engine/event-stream-dark.svg`, `frontend/public/assets/projects/rand-engine/event-stream-*.svg`, `frontend/public/assets/projects/rand-engine/spec-to-dataframe-*`, `frontend/public/assets/projects/rand-engine/files-in-parts-*` |
| Job 5 | Job 2 | 2 | `frontend/media/dadaia-workspace/pin.txt`, `frontend/media/dadaia-workspace/init-workspace.cmds`, `frontend/media/dadaia-workspace/init-workspace.cast.json`, `frontend/media/dadaia-workspace/gate-refuses.cmds`, `frontend/media/dadaia-workspace/gate-refuses.cast.json`, `frontend/media/dadaia-workspace/try-it.cmds`, `frontend/media/dadaia-workspace/try-it.cast.json`, `frontend/media/dadaia-workspace/claims.md`, `frontend/media/dadaia-workspace/demand-to-merge-light.svg`, `frontend/media/dadaia-workspace/demand-to-merge-dark.svg`, `frontend/public/assets/projects/dadaia-workspace/demand-to-merge-*.svg`, `frontend/media/dadaia-workspace/six-harnesses-light.svg`, `frontend/media/dadaia-workspace/six-harnesses-dark.svg`, `frontend/public/assets/projects/dadaia-workspace/six-harnesses-*.svg`, `frontend/public/assets/projects/dadaia-workspace/init-workspace-*`, `frontend/public/assets/projects/dadaia-workspace/gate-refuses-*` |
| Job 6 | Job 3 | 3 | `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx`, `frontend/src/components/projects/__tests__/ProjectSections.test.tsx`, `frontend/src/components/projects/__tests__/ProjectCard.test.tsx`, `frontend/src/components/projects/__tests__/ProjectHero.test.tsx`, `frontend/src/components/projects/__tests__/DiagramCard.test.tsx`, `frontend/src/pages/projects/ProjectsIndexPage.test.tsx`, `frontend/src/pages/projects/MetaProjectTemplate.test.tsx`, `frontend/src/pages/projects/GamesProjectTemplate.test.tsx`, `frontend/src/pages/projects/CaseStudyTemplate.test.tsx`, `frontend/tests/e2e/projects-cluster/index.spec.ts`, `frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts`, `frontend/src/components/projects/Block.tsx`, `frontend/src/components/projects/ProjectSections.tsx`, `frontend/src/components/projects/ProjectHero.tsx`, `frontend/src/components/projects/DiagramCard.tsx`, `frontend/src/pages/projects/LibraryProjectTemplate.tsx`, `frontend/src/pages/projects/MetaProjectTemplate.tsx`, `frontend/src/pages/projects/GamesProjectTemplate.tsx`, `frontend/src/pages/projects/CaseStudyTemplate.tsx`, `frontend/src/components/projects/ProjectCard.tsx`, `frontend/src/pages/projects/ProjectsIndexPage.tsx`, `frontend/src/components/projects/GameCard.tsx`, `frontend/src/components/projects/CostsTable.tsx`, `frontend/src/components/projects/DecisionsList.tsx`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json`, `frontend/src/types/content.ts` |
| Job 7 | Job 4, Job 6 | 4 | `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts`, `frontend/public/assets/projects/rand-engine/cover.webp`, `frontend/public/assets/projects/rand-engine/architecture-light.svg`, `frontend/public/assets/projects/rand-engine/architecture-dark.svg`, `frontend/public/content/en.json`, `frontend/public/content/pt.json`, `frontend/public/content/de.json` |
| Job 8 | Job 5, Job 7 | 5 | `frontend/tests/e2e/pages/email-modal-dark-mode.spec.ts-snapshots/**`, `frontend/public/assets/projects/dadaia-workspace/architecture-light.svg`, `frontend/public/assets/projects/dadaia-workspace/architecture-dark.svg`, `frontend/public/assets/projects/dadaia-workspace/cover.svg`, `frontend/public/assets/projects/dadaia-workspace/workspace-panel-01.webp`, `frontend/public/assets/projects/dadaia-workspace/workspace-panel-02.webp`, `frontend/public/assets/projects/dadaia-workspace/logo.svg`, `frontend/public/assets/projects/dadaia-workspace/diagram.svg`, the two unreferenced games SVGs under `frontend/public/assets/projects/` (named in the brief), `frontend/src/lib/contentAssets.test.ts`, `frontend/tests/e2e/projects-cluster/library-scenes.spec.ts`, `frontend/public/content/en.json`, `frontend/public/content/pt.json`, `frontend/public/content/de.json` |
