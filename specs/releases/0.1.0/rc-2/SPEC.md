# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-10-24
**Origin:** backlog:library-pages-in-motion

---

## Bug window review

**Window:** the whole history (`specs/audits/_archive/audits_histo.jsonl` is empty). The ledger holds one record, resolved: `ci-never-runs-the-checks-develop-requires` (MEDIUM, `caused_by: none`, culprit `415c57d`). `bugs.py status`: 0 open.

| fix | what it changed | overfitting check | verdict |
|---|---|---|---|
| `67257ef` | `ci.yml` `pull_request.branches` `[main]` → `[develop, main]` | no test changed, no special case, no new branch or path (the one trigger list gains the branch develop's protection requires), no reach, nothing deleted | **KEEP** — restores the one trigger to the protection's contract |
| `993011a` | two comments (`ci.yml:116`, `playwright.config.ts:4`) | comment-only | **KEEP** — removes text contradicting the fix |

No child bug names either fix; no REBUILD. `QUALITY.md` Gates still says `e2e` runs on PRs to main only: a closure memory item.

## 1. Problem

Operator words (2026-10-24): "I like minimalim" · "The frames that a person reading it views are not good. Many information. It's a bit not organized." · "I don't want a huge change her. But we need to do a refinement". On `/projetos/rand-engine`: "it's poor, it lacks diagrams hat are representatives. It lacks animated GIFs presenting some dynamics and functionality".

What the grill found (`feature/0.1.0` @ `993011a`):

- **No site frame.** The header renders only on `/` (`frontend/src/pages/Index.tsx:7`); `/projetos/*` and the 404 have no nav, theme or language control. Five components build it, with a JS mobile branch and six dead props.
- **Portuguese leaks into every locale**: hard-coded chrome strings (AC1.3) and a fixed `<html lang="pt-BR">`.
- **Inverted hierarchy, boxes in boxes**: section `h2` 24 px > home headline 20 px; every block a `Card`; no type scale; each template has its own header offset and nested `<main>`.
- **The two library pages state false or unsourced facts** (the strings AC4.6 and AC5.4 list). rand-engine shows 0.6.4 while PyPI serves 0.8.0 (2026-10-18), DuckDB (dropped in 0.7.0) and `.generate(n_rows)` (the API is `.size(n).get_df()`). dadaia-workspace: production shows 0.1.5 and `context activate` (no such verb); stage, from rc-1, shows "0.5.0 (PyPI)" and verbs of the unpublished 0.5.0 branch while PyPI serves 0.4.7.
- **Nothing moves; diagrams are illegible on phones** (390 px: 293×164 px, text ≈ 4 px).

Operator rulings this SPEC rests on (grill 2026-10-24, verbatim options):

- Structure: "Home = resume, refined (Recommended)". Order: "Projects first (Recommended)": rc-2 = shared base + the two library pages in motion; rc-3 resume; rc-4 blog.
- Projects: "Keep, restyled only (Recommended)". The games project and Portfolio Architecture move onto the new template with their current content and no new animation.
- rand-engine scenes: "Spec → DataFrame (Recommended), Related tables, PK/FK (Recommended), Event stream (Recommended), Files written in parts".
- dadaia-workspace scenes: "One command, one workspace (Recommended), Demand → merge flow (Recommended), The gate refuses (Recommended), One law, six harnesses". The page states only what the PyPI version on recording day ships.
- Confirm: "Confirmed, proceed (Recommended)", defaults included: dark default, one amber accent, Inter + JetBrains Mono; no nested boxes, accordions or rainbow pills; muted looping WebM/MP4 with poster, animated SVG diagrams, reduced motion shows the still; recordings scripted in the repo; versioned asset names; `$ now` panel dropped; a static mockup for approval; Blog nav item only once a post exists.
- Test changes ("Do you approve these test changes?" → "Approve all (Recommended)"). These are deleted: `NavAnchors.test`, `use-mobile.test`, the 4 `Header.test` cases of the deleted desktop/mobile JS branch, and the 2 orphan PNGs of `email-modal-dark-mode.spec.ts-snapshots`. These are rewritten: PC-E2E-17 and PC-E2E-19 (`nav-projects.spec.ts`) and the `0.6.4` literal at `rand-engine.spec.ts:43`. The surviving theme and active-link asserts move into the new header test. Every PLAN `test(...)` commit that applies this ruling names it.
- Phone nav ("On phones, how should the header reach the pages? …" → "Second nav row (Recommended)"): on phones the nav links sit in a visible row under the name, theme and language on the top row; no menu button. It extends the test ruling: the hamburger asserts, T-LAY-01's "hamburger present" included, become "phone nav row present" in a `test(...)` commit naming this ruling.
- Meta row ("The mockup's meta row shows 'Python ≥ 3.10 · MIT · PyPI 0.8.0', but no content field holds language or license. Where do they go?" → "Facts table only (Recommended)"): language and license sit in the facts table with their source; no schema field is added.
- Bug `content-schema-export-is-empty` (MEDIUM): "Register, fix in its own lane (Recommended)".

**Main-thread ruling (2026-10-24)**, not the operator's: asserts that follow the operator's rulings are moved or narrowed, each named in its `test(...)` commit: the header labels (Resume · Projects), the library diagram pair replaced by scenes (PC-E2E-10 `diagram-light`/`diagram-dark`, the `LibraryProjectTemplate.test` diagram case), the stale `0.6.4` and claim literals, and the `navProjects` key. No other assert is removed.

**Agent default, unruled** (main thread, following the confirmed defaults):

- The rc-2 header carries Resume · Projects, plus theme and language. Blog joins in rc-4, when the first post exists.
- The in-page section anchors leave the header.
- `lighthouserc.json` stays unchanged; no gate is added.

**Design under approval** (not a ruling). Approved with this SPEC: a private static mockup (its link kept out of this public repo) of home and the rand-engine page at 1440 and 390 px. Its rules:

- Columns: one 760 px reading column on the resume (rc-3) and 960 px on project pages.
- Section titles are quiet 12 px mono uppercase labels.
- Type scale: label 12 mono · meta 13 mono · body 16 · item 17/600 · hero headline 20/700 (operator ruling 2026-06-11, kept) · project page title 32/700, 28 on phones.
- No boxes inside boxes, no section accordions, one neutral pill style, one amber accent.
- Library page order: breadcrumb, title, one-line purpose, meta (PyPI version, GitHub, PyPI), copyable install line, hero loop with poster, "How it works" (three scenes, each a title, two sentences and a moving image; on phones each scene shows a portrait 4:5 cut with larger type), "Try it" (a copyable real example), "Why it exists", a "Facts · <lib> <version>" table whose rows each name their source file at the pinned tag, and "← All projects".

## 2. Measurable Goals

| # | goal | target | source |
|---|---|---|---|
| 1 | pages with the header | all routes: `/`, `/projetos`, 4 project pages, 404 | E2E AC1.1 |
| 2 | hard-coded pt chrome strings in the listed components | 0 | `git grep` at the PR head (AC1.3) |
| 3 | false or unsourced claims on the two library items, all 3 locales | 0 hits of every string in AC4.6 and AC5.4 | `git grep` at the PR head |
| 4 | facts rows with a source link at the pinned tag | every row | the reviewer opens each link (AC4.4, AC5.3) |
| 5 | moving scenes | 8 (4 per library page), each with poster, alt and still | E2E AC3.6 |

## 3. Non-goals

- Resume refinement (760 px column, home sections, the "Earlier" line, `font-medium` in resume parts): rc-3. The resume only gains the header in rc-2.
- The blog, its nav item, prerendering and RSS: rc-4.
- Bug `content-schema-export-is-empty`: fixed in its own lane (`adfc1c8`).
- Any `lighthouserc.json` change; any new gate, CI job, `verify:` step or merge check.
- New content or animation for the games project and Portfolio Architecture.
- Removing the unused `case-study` schema kind (intake).
- Upstream, carried to the main thread: dadaia-workspace rc-21 AC8.1/A8 re-checks the portfolio claim table pinned at `2059b779e`, which rc-2 rewrites; rc-2 edits no other repo. `/projetos/dadaia-workspace` stays (that package's Homepage).
- The 15 pre-existing full-suite chromium E2E failures, except those AC1.1 turns green.

## 4. Requirements

Paths are relative to `frontend/`. Domain names: `projectsV2` items, `LibraryProjectTemplate`, the content JSON (`public/content/{pt,en,de}.json`), the locale (`pt`, `en`, `de`, `LanguageContext`).

**Wave ranking.**

1. Law, skills and dev loop: nothing in rc-2.
2. Shared foundation: FR1 (site frame and tokens), FR2 (shared project parts and schema) and FR3 (media pipeline and asset rules). The recording pipeline can run beside the base.
3. Features: FR4 (rand-engine page) and FR5 (dadaia-workspace page), plus the restyle of the games and Portfolio Architecture pages in FR2. Both library items' content lands last.
4. Promote-facing: AC4.7 and AC5.5 at the candidate PR, and the backlog exit at closure.

### FR1 — one site frame on every page

- **AC1.1** `/`, `/projetos`, each `/projetos/<slug>` of the 4 items and an unknown path each render exactly one header and one `<main id="main-content">`, with no nested `<main>`. Test: unit (the layout route rendered on each path). E2E: PC-E2E-04/05/18 (`i18n-projects.spec.ts`), the `layout-shell.spec.ts` case and RE-E2E-04 pass with their asserts unchanged.
- **AC1.2** The header shows a Resume link (`/`), a Projects link (`/projetos`), the theme toggle and the language selector. The current route's link carries `aria-current="page"`, and Projects is current on every `/projetos*` route. There is no Blog link and no in-page section anchor. Below `md` the two links sit in a visible row under the name and no menu button exists (phone-nav ruling). Test: unit (the new header test, holding the re-homed asserts). E2E: PC-E2E-17 and PC-E2E-19, rewritten under the test ruling; T-LAY-01 asserts the phone nav row.
- **AC1.3** In each locale, these strings render from that locale's content JSON: the nav labels, the menu and nav `aria-label`s, the theme and language control labels, the breadcrumb, the back link and the games empty state. `git grep` finds none of `Projetos`, `Voltar para projetos`, `Menu de navegação`, `Navegação principal`, `Instalação`, `Em breve` or `Os jogos estao sendo preparados` as string or JSX text in `src/components/**` or `src/pages/**`, resume parts (`src/components/portfolio/**`, rc-3) aside. `navProjects` is gone. Test: unit (header and project shell rendered per locale). Integration: `check:i18n-projects` covers the new chrome keys in all three files.
- **AC1.4** After the locale changes, the primary subtag of `<html lang>` equals the active locale. No `Content-Language` meta remains. Test: unit (`LanguageContext`).
- **AC1.5** On a first visit (nothing stored), the page paints dark whatever the OS colour scheme; with `theme=light` stored, it paints light. The inline script and `useTheme` decide the same way. Test: E2E (Playwright `colorScheme: 'light'` with empty storage: `<html>` has `dark` before the app mounts).
- **AC1.6** The tokens declare exactly the type steps of the design under approval, and the header and the project parts use only those steps. Only weights 400, 600 and 700 are loaded; 800 is not. The header offset is one token, consumed by the layout route only. Test: none (design tokens); the reviewer checks the token file and 1440/390 px screenshots against the mockup.

### FR2 — shared project parts, one project shape

- **AC2.1** The index and the 4 project pages sit in one column of at most 960 px. No bordered or shadowed box sits inside another, no section uses an accordion, every pill uses the one neutral style, and amber is the only accent. Test: unit (each template's section has no nested card element). Visual rules: as AC1.6.
- **AC2.2** `LibraryProjectTemplate` renders the design's order: breadcrumb, `h1`, purpose, meta row, install line, hero loop, "How it works" with 3 scenes, "Try it", "Why it exists", the facts table and "← All projects". Every heading text comes from the content JSON. Test: unit (section order). E2E: `project-detail-library.spec.ts` and `rand-engine.spec.ts`.
- **AC2.3** The install line and the "Try it" example each have a copy button that copies exactly the text shown, and the existing `track()` events still fire. Test: unit (the shared code block).
- **AC2.4** A project's shape in content has one definition. The section `diagram` field becomes `media`, a video or an SVG pair. Sections gain `code` and item links (`href`); the hero gains `media`. The project-level `diagram*` fields stay for Portfolio Architecture. `alt` and `caption` are parity keys. The three locale files parse against the definition inside `verify`, and a malformed `media` entry fails the parse. Test: unit (schema cases, and the parse of the 3 real files). Integration: `check:i18n-projects`.
- **AC2.5** The games project and Portfolio Architecture render on the shared parts with their content unchanged. Comparing their `projectsV2` items at the PR head with `993011a` (`jq`, 3 locales) shows no difference. Test: E2E (`project-detail-meta.spec.ts`, `project-detail-games.spec.ts`, asserts unchanged). The `jq` comparison is the reviewer's.
- **AC2.6** No project card (`/projetos`, home) and no library page renders a `stat` chip, and the project shape has no `stat` field; the facts table carries the figures. Test: unit (`ProjectCard` and `LibraryProjectTemplate` render no `project-card-stat` or `library-stat`).

### FR3 — scenes: recorded from text, named by hash, legible at 360 px

- **AC3.1** Every recorded scene can be reproduced from text in the repo: a committed script and the transcript of the real output of the pinned PyPI version. One documented command re-records a scene. Nothing in this pipeline joins `verify` or CI. Test: none; this is a developer tool. Evidence: the job hand-back runs the command and attaches one frame per scene.
- **AC3.2** Each library-page media file is named `<scene>-<first 8 hex of its sha256>.<ext>`, matching its bytes. Every file under `public/assets/projects/` is referenced by a content file, and every referenced file exists. Test: unit (a content-assets contract test inside `test:run`).
- **AC3.3** Video scenes run 8 to 12 s with no audio track: webm ≤ 300 KB, mp4 ≤ 400 KB, poster ≤ 60 KB. Each SVG scene is ≤ 50 KB (the existing CI SVG size gate). Test: unit (the contract test of AC3.2).
- **AC3.4** Video is recorded at a 360 CSS px wide viewport and never shown below 1:1 at 360 px. On phones each "How it works" scene shows its portrait 4:5 cut. An SVG scene's `viewBox` is at most 360 wide and every `font-size` is ≥ 12 units. Test: unit (the contract test for the SVG rules). Evidence for the rest: a 360×800 screenshot of each page in the hand-back.
- **AC3.5** Each animated SVG carries a `prefers-reduced-motion: reduce` rule, and its un-animated state is the complete still. It ships as a light/dark pair that follows the site's theme toggle. Test: unit (the contract test).
- **AC3.6** On both library pages, at 1440 px and 360 px, each of the 8 scenes (4 per page), without reduced motion, plays muted and looped: a video has `muted`, `loop`, `playsinline`, a `poster` with width and height, webm then mp4 sources, and is mounted only when in view; an SVG animates. Each scene has an accessible name from its `alt`. Under `prefers-reduced-motion: reduce`, no `<video>` exists and each scene shows its still with the same `alt`. No scene overflows the viewport at 360 px. Test: unit (the media component: attributes, reduced motion, in-view mount). E2E: both pages, Playwright `reducedMotion` emulation, viewports 1440 and 360.
- **AC3.7** Nothing the built site serves references a deleted asset: every asset path in the content JSON, `src/**` and `index.html` exists under `public/`. A deleted URL falls to CloudFront's SPA fallback (200 `text/html`; 9 such URLs today), so no redirect is added; no old name gets new bytes. Test: unit (the contract test of AC3.2).

### FR4 — rand-engine page tells the truth, in motion

- **AC4.1** The page is pinned to rand-engine at the tag of the PyPI latest on recording day: 0.8.0 today, git tag `0.8.0`. A newer release before recording moves the pin. `pypi.version`, the meta row and the "Facts · rand-engine <version>" heading all show the pin, and every recording ran that version. Test: E2E (RE-E2E-02's version assert, rewritten under the test ruling, reads the expected version from the content item, not a literal).
- **AC4.2** Scenes: the hero loop is spec → DataFrame (a recording). "How it works" holds related tables PK/FK, event stream, and files written in parts. Each scene's title and two sentences are true at the pin. Test: none; the reviewer checks the copy against the tag. Presence is AC3.6.
- **AC4.3** "Try it" is a real example that runs unchanged against the pin and prints what the page shows. Test: none (no Python in `verify`). Evidence: the hand-back runs it in a throwaway environment at the pin and pastes the output.
- **AC4.4** Each facts row has a label, a value and a link to its source file at the pinned tag (`…/blob/<tag>/<path>`). Performance comes only from `docs/BENCHMARKS.md` at the tag, until rand-engine publishes its per-release benchmark page. Spark speed is not featured, because Spark is maintenance-only in rand-engine's roadmap. A test count or spec count appears only if read from the tag. Python and pandas ranges, license and benchmarks sit in the facts table only (meta-row ruling); no version-dependent fact appears in prose or scene text. Test: none; the reviewer opens every link.
- **AC4.5** Documentation links point to the docs root or the API reference only. Test: none; reviewer.
- **AC4.6** The text of the rand-engine item (3 locales) and its scenes contains none of: `0.6.4`, `0.6.3`, `DuckDB`, `.generate(`, `partitioned`, `.stream()`, `dict / JSON schema`, `12K`, `132K`, `5.1M`, `494`, `17+`, `20+`; a Faker comparison appears only if sourced at the tag (`docs/comparison.md`). Test: none. Copy is not pinned by tests (root map §1); the reviewer greps.
- **AC4.7** Stage serves the page after the rc-2 PR merges into develop. Test: E2E by hand: the `deploy-stage` run URL and one fetch of the stage page, plus one video asset with `curl -I` showing its content type, recorded in the closure summary.

### FR5 — dadaia-workspace page states only what PyPI ships

- **AC5.1** The page is pinned to the PyPI latest on recording day: 0.4.7 today, git tag `v0.4.7`; 0.5.0 is unpublished. The version, scenes, prose, "Try it" and facts state only what that version ships. The install line is the one the pin's README documents; at `v0.4.7` that is `uvx dadaia-workspace init <dir> --harness <name>` (`README.md:62-63`), so PC-E2E-06 keeps its assert. Test: E2E (`project-detail-library.spec.ts`).
- **AC5.2** Scenes: the hero loop is one command → workspace + doctor (a recording). "How it works" holds demand → merge flow (SVG), the gate refuses (a recording of the pin's real refusal and its `fix:` line), and one law → six harnesses (SVG, the six harnesses `v0.4.7`'s `README.md:35` lists). Each scene is true at the pin. Test: none; the reviewer checks against the tag. Presence is AC3.6.
- **AC5.3** "Try it" is the pin's real first command, runnable in an empty directory. Each facts row links its source file at `v0.4.7`. Test: none; the hand-back runs it in a throwaway environment and the reviewer opens every link.
- **AC5.4** The text of the dadaia-workspace item (3 locales) and its scenes contains none of: `0.5.0`, `0.1.5`, `worktree pause`, `worktree resume`, `export --hard`, `init --from`, `context activate`, `5 agent roles`, the four-role diagrams, or `workspace-panel-01.webp`. A role count appears only if read from the tag; `v0.4.7` ships three persona files under `dadaia_workspace/public/agents/`, so "five roles" is false there. Test: none; the reviewer greps.
- **AC5.5** Stage shows `0.4.7` after the rc-2 PR merges into develop (evidence as AC4.7).

### FR6 — the gate holds

- **AC6.1** The repo `verify:` line (`npm --prefix frontend run verify`) exits 0 on every job merge and on the rc PR head, unchanged. `check:i18n-projects` passes on all three files. Test: the existing suite plus this rc's unit tests. The job hand-back states the measured `test:run` delta the contract test adds, never above one `verify` run.

### Replaces

- The five header components (`Header` with its legacy props and display-name bridge, `HeaderShell`, `HeaderDesktopLayout`, `HeaderMobileLayout`, `NavAnchors`), the `useIsMobile` JS layout branch, the scroll-state blur and `src/routes.ts`'s unused nav list, replaced by one header in one layout route (AC1.1, AC1.2).
- The per-page header, present only on `/` via `src/pages/Index.tsx` (AC1.1).
- The in-page section anchors (experience, skills, certifications) in the header (AC1.2).
- The hard-coded pt strings, the untranslated `navProjects` key, the fixed `<html lang="pt-BR">` and the `Content-Language` meta (AC1.3, AC1.4).
- `index.html`'s first paint following the OS colour scheme, against `useTheme`'s dark default (AC1.5).
- The dead `sidebar` colour tokens, the unused header-height variables, the seven hard-coded header offsets and the five nested `<main>` elements (AC1.1, AC1.6).
- `Card`-boxed project sections: the three branches of `ProjectSections`, the carded `ProjectHero` with its cover and 36 px `h1`, and the old library page order (AC2.1, AC2.2).
- The section `diagram` field and the three hand-kept copies of the project shape (`src/lib/schemas/projects.ts`, `scripts/content-schema.mjs:102-188`, `src/types/content.ts:103-244`) (AC2.4).
- The two libraries' static images under stable names (`rand-engine/cover.webp`, `rand-engine/architecture-{light,dark}.svg`, `dadaia-workspace/architecture-{light,dark}.svg`, `dadaia-workspace/cover.svg`, `workspace-panel-01.webp`). Hash-named scenes and posters replace them (AC3.2).
- The orphan assets `dadaia-workspace/{logo.svg,diagram.svg,workspace-panel-02.webp}` and the two unreferenced SVGs of the games project.
- The card and library-page `stat` chip (`5.1M rows/s (Spark)`, `5 agent roles`) and its content field; the facts table replaces it (AC2.6).
- rand-engine's false and unsourced claims (AC4.6).
- rc-1's dadaia-workspace 0.5.0 copy, reversing rc-1 AC3.3, AC3.4 and AC3.6; the closed rc-1 SPEC is not edited (AC5.1, AC5.4).
- The tests and snapshot PNGs the test ruling removes: their subjects are deleted, their surviving asserts re-homed (AC1.2, AC3.2).

### Closure

- `backlog.py exit library-pages-in-motion --disposition delivered --release 0.1.0` at the reconcile.
- The summary records the pins (tags and PyPI versions), AC4.7 and AC5.5 evidence, and the `test:run` delta.
- Memory: the `dadaia-workspace-page` atom is rewritten to the 0.4.7 page; a rand-engine page atom is added; the stale E2E trigger line in `QUALITY.md` Gates is fixed.

## 5. Constraints and risks

| risk | answer |
|---|---|
| Bug `content-schema-export-is-empty` touched `scripts/content-schema.mjs` and `scripts/export-content-schema.mjs`, which FR2 also rebuilds. | Its lane merged into `feature/0.1.0` (`adfc1c8`); the `wt-rc` syncs onto it before rc-2 implements. FR2's one project-shape authority builds on that export (Zod 4 `z.toJSONSchema`; `zod-to-json-schema` removed). |
| Claims drift: a library publishes during rc-2 (rand-engine 0.8.1 is pending; dadaia-workspace 0.5.0 is in closure). | Pin on recording day (AC4.1, AC5.1). Version-dependent facts stay out of prose and scenes (AC4.4). |
| Unhashed assets are cached immutable for a year (`deploy.yml:74-80`); a replacement under the same name is served stale. | Hash-in-name contract test (AC3.2). The content JSON is fetched `no-cache`. |
| The header moves the fixed offset on four pages at once. | One offset token (AC1.6); T-LAY-01..06 and AC3.6 guard it. |
| PRs run only the 9 E2E smoke specs. | Each job hand-back carries local chromium runs of the E2E files it reaches. |
| A video poster becomes the library pages' LCP. | Sized poster, `preload="none"`, in-view mount (AC3.6); the existing PR Lighthouse job judges the dadaia-workspace page. |
| `content-schema.mjs` importing a `.ts` schema relies on Node's type stripping (≥ 22.18; CI pins `node-version: "22"`). | The PLAN proves it first and names its fallback. |

## 6. Open questions

None.
