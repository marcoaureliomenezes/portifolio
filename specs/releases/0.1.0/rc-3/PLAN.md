# PLAN — Release 0.1.0, rc-3

**Status:** Approved
**Owner:** dd-sw-engineer-sr

Paths are relative to the repo root (the `portifolio` tree; the app is under `frontend/`). Tree: the rc-3 `wt-rc`, base `f34f33c` (`feature/0.1.0`), SPEC at `d2da14b`. Measurements are from the as-is review of the base build (`vite preview`, Chromium, reduced motion, dark, every role closed).

## 1. As-is review

Ledger slice (`bugs.py status`: 0 open, 9 resolved; `_archive/bugs_histo.jsonl` empty). No record names `components/portfolio/**`, `Portfolio`, `types/content.ts` or `check-i18n-parity.mjs`. Three touch `scripts/content-schema.mjs` or `export-content-schema.mjs` (`content-schema-export-is-empty` and its child `content-schema-rejects-committed-content`; `content-urls-accept-script-schemes`): rc-3 adds no schema field, and the one edit there is a comment (J8.T4). One touches the smoke set (`smoke-e2e-encodes-the-pre-rc2-header`, fix `29c45a8`): the same failure family returns if a job removes a home element a smoke spec selects, so each job below owns the spec of the element it removes. History (`git log`): every portfolio component dates from the pre-rc-2 redesigns (`fc4d1f3`, `38f6305`, `b99da2a`, `55cdd37`); rc-2 touched the home only for `1dd6171` (`SiteLayout`). No REBUILD is due by ledger; each REBUILD below is the demand's (the unit's fundamental behaviour changes). Order: DELETE, REBUILD, UPDATE, KEEP, ADD.

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `components/portfolio/HeroNowPanel.tsx` + test | `$ now` aside, lg+ only | 0 | DELETE | operator ruling; its only mount is `HeroSection.tsx:135` (J4.T3, J4.T5) |
| `heroStats`, `heroStatsSuffix.clouds` (type, 3 locales, fallbacks `HeroSection.tsx:18,20`) | hand-typed `clouds: 4` while Skills lists 3 providers | 0 | DELETE | a second decider of the cloud list; derived from the Skills row instead (J4.T4, J8.T3, J8.T4) |
| `MobileCollapsibleSection.tsx` + test | card and fold around Experience, Skills, Certifications, Education (4 callers) | 0 | DELETE | the boards have no fold or frame; 0 callers once J5.T5 and J7.T4 to T6 land (J8.T2, J8.T6) |
| `SkillCategoryCard.tsx` + test | bordered hover card per category, icon map, `gap-${...}` classes Tailwind cannot generate | 0 | DELETE | replaced by the `<dl>` (J7.T3, J7.T7); `skillCategoryColors.ts` stays (`RoleSkillBadges` reads it) |
| `CertificationCard.tsx` + test | provider tile, 48 px badge box, logo, count | 0 | DELETE | replaced by the flat list (J7.T3, J7.T7) |
| `i18n-strings.test.tsx` | one file holding the i18n tests of Hero, Experience, Certifications (three features) | 0 | DELETE | its four blocks move unnarrowed to their component tests so job write sets stay disjoint (J1.T4) |
| `HeroSection.tsx` + test | 2-column layout, 3-line clamp and See more, 2 CTAs, stats from `heroStats`, `HeroNowPanel` mount | 0 | REBUILD | one column, story toggle on `resume.full`, stat line derived from content, 1 CTA (J4.T1, J4.T4) |
| `ExperienceCard.tsx` + test | bordered card, gradient rail, "Career progression (n roles)" label, role cards | 0 | REBUILD | employer line + left rule + roles, no card or label (J5.T3, J5.T5) |
| `SkillsSection.tsx` | one card per category inside a fold | 0 | REBUILD | one `<dl>` (J7.T1, J7.T4) |
| `CertificationsSection.tsx` | provider-grouped tiles inside a fold | 0 | REBUILD | one flat list (J7.T2, J7.T5) |
| `Portfolio.tsx` + test | order Hero, Featured, Experience, Skills, Cert, Education; wrapper `container … max-w-5xl` (`:21`); dead `vi.mock("@/hooks/useInView")` (`:7`) | 0 | UPDATE | new order; the column comes from the layout (J5.T5 one line, J8.T3, J8.T5, J8.T7) |
| `FeaturedProjects.tsx` + test | 3 cards, 3 columns, arrow-icon link | 0 | UPDATE | 2 slugs, 2 columns, "All →" (J6.T2, J6.T5) |
| `components/projects/ProjectCard.tsx` + test (shared with `/projetos`) | cover, kind chip, ≤4 badges, install hint, hover lift, `kindLabels` prop | 0 | UPDATE | poster, name, purpose, `PyPI <version>`; the diff only removes (J6.T1, J6.T4); one card for both pages |
| `ExperienceSection.tsx` | wraps cards in the fold, passes 5 labels | 0 | UPDATE | plain section, employer cards, the Earlier line (J5.T3, J5.T5) |
| `RoleCollapsible.tsx` + test | role card, summary clamped to 2 lines, trigger on the title | 0 | UPDATE | article, unclamped summary, "Details +" button; `Disclosure`, `aria-expanded` and the two track events kept (J5.T4, J5.T6) |
| `HighlightProjectBlock.tsx` + test | hard-coded `Impacto` (`:23,25`) in every locale | 0 | UPDATE | text and accessible name from `impactLabel` (J5.T4, J5.T6) |
| `EducationSection.tsx` | folded card, gradient rail, location chip | 0 | UPDATE | one entry (J7.T2, J7.T6) |
| `lib/formatPeriod.ts` | English month array for every locale; no year-range or earliest-start reader | 0 | UPDATE | `Intl`-based `formatPeriod(raw, lang)` (J5.T1, J5.T2); the two readers (J1.T1, J1.T2) |
| `types/content.ts` | `siteChrome?` optional (`:242`); dead keys; no home keys | 0 | UPDATE | required `siteChrome` + `footer` + six keys (J1.T4); dead keys out (J8.T3) |
| `public/content/{pt,en,de}.json` | Trie `minor`, certs in AWS-first order with levels in names, skills in old order, dead keys, `achievements` ×3 | 0 | UPDATE | J1.T6 (data, new keys), J8.T4 (dead keys) |
| `scripts/check-i18n-parity.mjs` | parity for `projectsV2` and a static `siteChrome` set (`:69`) | 0 | UPDATE | `CONTENT_DIR`, footer keys, one home-key block (J1.T7); no new gate |
| `scripts/content-schema.mjs`, `public/content/schema/v1.json` | strict collections + catchall for labels | 3 (chain above) | UPDATE | comment only (J8.T4); `v1.json` byte-identical, `schema:check` proves it |
| `Header.tsx`, `header/ThemeToggle.tsx`, `header/LanguageSelector.tsx` | 3 non-null assertions on `siteChrome` | 0 | UPDATE | `siteChrome` required (J1.T8) |
| `layout/SiteLayout.tsx` + test | header + `main`, no footer | 0 | UPDATE | column wrapper, footer (J3.T1, J3.T4) |
| `projects/ProjectsLayoutShell.tsx` + test | own `max-w-[960px]` wrapper (`:30`), `chrome?.` chains | 0 | UPDATE | the width comes from the layout (J3.T2, J3.T5) |
| `README.md`, repo `AGENTS.md` | dead `specs/` links, stale CI row, port 5173 | 0 | UPDATE | J2.T1 |
| E2E smoke set (`playwright.config.ts:5-14`) | `post-strict-flip-smoke` SMOKE-05 clicks `hero-cta-projects`; `layout` T-LAY-02/04/05/06; `home`; `responsive`, `cv-download-routing`, `not-found`, `deep-link`, `health`, `project-tabs` | 1 | UPDATE | SMOKE-05 (J4.T2), `layout` (J3.T3), `home` (J6.T3); the rest KEEP and run in every job's DoD |
| E2E full-suite specs reaching the home | `expandSeniorRole` and four specs filter a role button by title; `nav-projects` PC-E2E-20 clicks the hero CTA; `rand-engine` RE-E2E-01 reads the card chip and install hint; a stale comment in `i18n-no-hardcoded` | 0 | UPDATE | J5.T7, J4.T2, J6.T3, J8.T2 |
| `lib/utils.ts`, `tailwind.config.ts`, `index.css` (type steps), `skillCategoryColors.ts`, `RoleSkillBadges.tsx`, `contentSchemaExport.test.ts`, `lib/schemas/projects.ts` | rc-3 adds no step, no schema field | 0 | KEEP | the type steps listed in 3 places stay intake (SPEC §3) |
| `components/portfolio/SectionHeading.tsx`, `lib/layout.ts` | — | — | ADD | no unit carries the section `h2` once `MobileCollapsibleSection` goes (five call sites); `max-w-5xl` (1024 px) and `max-w-[960px]` are two deciders of one width, and `max-w-[680px]` would be typed twice (J1.T9) |

Duplicated deciders, with a repro where the copies diverge:

- Column width: `Portfolio.tsx:21` (`max-w-5xl`, 1024 px) against `ProjectsLayoutShell.tsx:30` (`max-w-[960px]`): one column, two widths, so the same content edge sits at two x positions at 1440 px. J1.T9 and J3.T4 make `COLUMN` the one source.
- Clouds: `heroStats.clouds` (4) against the Skills row (AWS, Azure, Databricks). Repro: the en home reads "4 clouds" beside three providers. J4.T4 derives the list from the row.
- Years: `heroStats.years` is hand-typed 6 while the earliest `main` start gives 5; the stat line becomes `yearsSince(...)`.
- Prose width: `max-w-[680px]` is typed in `LibraryProjectTemplate.tsx:47,82` and `ProjectSections.tsx:27`; rc-3 reads `PROSE` in its two new places and leaves those three copies to the intake.

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| which sections the home has, and their order | `Portfolio.tsx` | `Portfolio.test.tsx`, `layout.spec.ts` T-LAY-05 | the old order; `MobileCollapsibleSection` |
| the column width of every route | `lib/layout.ts` `COLUMN`, applied by `SiteLayout` | the footer, the project shell (no own width) | `max-w-5xl` in `Portfolio.tsx`; the shell's wrapper classes |
| prose width (680 px) | `lib/layout.ts` `PROSE` | `HeroSection`, `RoleCollapsible` | none |
| the section heading | `SectionHeading` | five home sections | the heading inside `MobileCollapsibleSection` |
| which clouds the hero names | the Skills row `cloud-providers` | `HeroSection` | `heroStats.clouds`, `heroStatsSuffix.clouds`, their fallbacks |
| the hero years | `yearsSince` in `formatPeriod.ts` over the `main` experiences | `HeroSection` | `heroStats.years` |
| which roles are Earlier | `Experience.type === "minor"` in content | `ExperienceSection` | the three pre-data full cards |
| period parsing and rendering | `formatPeriod.ts` (`formatPeriod`, `yearRange`, `yearsSince`) | `ExperienceCard`, `RoleCollapsible`, `ExperienceSection`, `HeroSection` | the English `MONTHS` array |
| the footer facts | `profile` in content (email and links), `siteChrome.footer` (words) | `SiteLayout` | none |
| the project card's image | `hero.media` (video `desktop` cut: `poster`, `width`, `height`, and `alt`), else `card.cover` | `ProjectCard` | `kindLabels` prop, `KIND_FALLBACK_LABELS` |
| certificate order | content `priority` equal to array order | `CertificationsSection` | provider grouping |
| skill rows | `id` in content | `SkillsSection`, `HeroSection` | lookup by title |
| key parity of the new home strings | `check-i18n-parity.mjs` | `content-schema.mjs` (catchall) | none |
| the job gate | `package.json` `scripts.verify` | CI on push | none (unchanged) |

## 2. Order and seams

### 2.1 Waves, write sets, deletion order

- **Waves.** Wave 1: Job 1 (content, contract and shared pieces) and Job 2 (docs). Wave 2: Jobs 3 to 7, each waiting on Job 1 only; the SPEC ranks FR2 with the foundation, but no feature job needs the layout, so Job 3 runs beside them. Wave 3: Job 8 (compose, dead keys, evidence). The `W:` sets inside a wave are disjoint (`release.py check` proves it).
- **Shared files, one writer per wave.** The three locale files: Job 1, then Job 8. `types/content.ts`: Job 1, then Job 8. `Portfolio.tsx`: Job 5 (one line), then Job 8. `formatPeriod.ts` and its test: Job 1 owns the two readers (AC3.2, AC4.3), Job 5 owns `formatPeriod(raw, lang)` (AC4.5): the edge the SPEC asks for. `layout.spec.ts`: Job 3 only.
- **Keys are added first, deleted last.** Job 1 only adds keys (and removes `achievements`, which has 0 readers). A key leaves the type, the content and the fixtures in Job 8, after every reader is gone (a deleted key still read would turn the live-content tests red).
- **Deletion order.** A unit is deleted after its last caller: `HeroNowPanel` file (J4.T5) after its mount (J4.T4); `SkillCategoryCard` and `CertificationCard` (J7.T7) after their callers (J7.T4, J7.T5); `MobileCollapsibleSection` (J8.T6) after Job 5 (Experience) and Job 7 (Skills, Certifications, Education). A test is deleted by a `test(...)` task before its subject's source task.
- **The type change and the plain literals are one commit (SPEC §5, R-F).** `ContentData` is typed in three plain literals (`Portfolio.test.tsx:11`, `HeroSection.test.tsx:11`, `i18n-strings.test.tsx:27`); every other file that mentions the type casts it (`as unknown as ContentData`) or `Pick`s it. A source-subject commit cannot touch a `tests:` glob, so the commit is a `test(J1.T4)` commit holding `types/content.ts` and the fixtures; the same shape closes it in J8.T3. `i18n-strings.test.tsx` goes in the first one, so the third literal needs no edit.
- **Commit shapes.** A test move is a `test(<id>): …` commit whose body names the ruling: **R-A** SPEC §1 "Test changes → Approve all (Recommended)" (operator, grill 2026-10-25); **R-P** "Home project cards → Still poster"; **R-M** the SPEC §1 bullet "Test moves, main-thread ruling (2026-10-25 consumer pre-mortem)"; **R-F** the SPEC §5 risk row. Only these rulings move or narrow an assert; every other existing assert stays. Source tasks are `feat(<id>)`/`refactor(<id>)`; a REBUILD is `refactor(<id>): REBUILD <unit> — …`.
- **Test and source tasks are separate** (the `tests:` globs refuse a source commit that touches a test file); a behaviour is its RED test task, then its source task, in one session each.

### 2.2 Shared contracts the jobs read

New flat keys and values (J1.T6 writes them; J1.T7 checks their parity; J1.T3 asserts them). `seeAllProjects` already exists and only changes value.

| key | en | pt | de |
|---|---|---|---|
| `earlierLabel` | Earlier | Anteriormente | Früher |
| `detailsOpen` | Details + | Detalhes + | Details + |
| `detailsClose` | Details − | Detalhes − | Details − |
| `storyOpen` | Read the story | Ler a história | Die Geschichte lesen |
| `storyClose` | Hide the story | Ocultar a história | Geschichte ausblenden |
| `impactLabel` | Impact | Impacto | Wirkung |
| `seeAllProjects` | All → | Todos → | Alle → |
| `heroStatsSuffix.certs` | certifications | certificações | Zertifizierungen |
| `siteChrome.footer.label` | Site footer | Rodapé do site | Fußzeile |
| `siteChrome.footer.owner` | Marco Menezes | Marco Menezes | Marco Menezes |
| `siteChrome.footer.email` | Email | E-mail | E-Mail |
| `siteChrome.footer.linkedin`, `.github` | LinkedIn, GitHub | LinkedIn, GitHub | LinkedIn, GitHub |

- **Certifications**, newest first (a year-only date sorts ahead of the dated entries of its year); `priority` 1 to 11 equals array position, the same in all three locales. Names lose the level `level` states; dates and every other field stay verbatim.

| # | name (en) | level |
|---|---|---|
| 1 | AWS AI Practitioner | Foundational |
| 2 | AWS Solutions Architect | Associate |
| 3 | `Curso de Alemão` (pt, en), `Deutschkurs` (de) | B1 |
| 4 | AWS Data Engineer | Associate |
| 5 | Spark Data Engineer | Associate |
| 6 | Spark Developer | Associate |
| 7 | AWS Cloud Practitioner | Foundational |
| 8 | Apache Airflow | Fundamentals |
| 9 | Azure Data Engineer | Associate |
| 10 | Azure | Fundamentals |
| 11 | Santander Data Engineer | Advanced |

  Row 3 keeps today's wording minus the level (`Curso de Alemão Nível B1` becomes `Curso de Alemão`, `Deutschkurs Niveau B1` becomes `Deutschkurs`); no name is translated.
- **Type** (`types/content.ts`, J1.T4): `siteChrome` required with `footer: { label; owner; email; linkedin; github }`; `ContentData` gains required `earlierLabel`, `detailsOpen`, `detailsClose`, `storyOpen`, `storyClose`, `impactLabel`.
- **`lib/formatPeriod.ts`**: `formatPeriod(raw: string, lang: SupportedLanguages): string`; `yearRange(raw: string): string`; `yearsSince(periods: string[], now?: Date): number` (whole years from the earliest start among the raw period strings; 0 when none parses).
- **Role DOM** (J5): `<article data-testid="role">`, title in an `h4`, period, summary, one button named by `detailsOpen`/`detailsClose` with `aria-expanded` and `aria-controls`. The employer line is an `h3`; `#experiencia` holds one `h2`.
- **Section ids kept**: `hero-heading`, `experiencia`, `experiencia-heading`, `projetos-destaque`, `featured-projects-heading`, `habilidades`, `habilidades-heading`, `certificacoes`, `certificacoes-heading`, `educacao`, `educacao-heading`; each `h2` carries its id itself.
- **Testids kept**: `project-card`, `project-card-title`, `card-cover-placeholder`, `see-all-projects`, `featured-projects-grid`, `projects-grid`, the track events `section_expand` and `section_collapse`, `project_cta`, `cv_download`. **Deleted with their elements**: `hero-cta-projects`, `cert-tile`, `cert-grid-*`, `project-card-kind`, `project-card-tech`, `project-card-install`.
- **Parity set** (J1.T7): `CHROME_I18N_KEYS` gains the five `footer.*` keys; a new `HOME_I18N_KEYS` holds the seven flat keys above that are new or changed (`earlierLabel`, `detailsOpen`, `detailsClose`, `storyOpen`, `storyClose`, `impactLabel`, `seeAllProjects`).
- **Footer year**: `new Date().getFullYear()` at render. The SPEC says "computed at build"; a build-time constant cannot be pinned by a fixed-clock test, which the pre-mortem ruling (R9) requires, so the render-time form is planned and J3.T1 pins it with `vi.setSystemTime`.
- **Hero top offset**: `SiteLayout`'s `main` pads by `--header-h`; the hero adds no header-height offset of its own; T-LAY-04's comment is corrected in J3.T3.
- **Poster field**: `ProjectCard` reads `hero.media` when `type === "video"` (`media.desktop.poster`, `.width`, `.height`; `media.alt`), else `card.cover`. For the two featured items `card.cover` is already the same poster file (≤ 21 KB `.webp`).

### 2.3 Intl literals

`formatPeriod` output depends on Node's ICU data. CI pins `node-version: "22"` in every `ci.yml` job, which resolves to the newest 22.x; the newest 22.x published today is v22.23.4 (read from the Node release index) and the local `node --version` is v22.23.4, ICU 78.3, CLDR 48. The J5.T1 literals are taken from v22.23.4 and are therefore the CI version's. English renders plural abbreviations ("yrs", "mths"), pt "anos"/"meses" and "fev. de 2024", de "J"/"Mon." and "Feb. 2024". Months use `timeZone: "UTC"` on `Date.UTC`, so the host zone cannot shift them. If CI's Node 22 moves and a literal breaks, that is a bug against `formatPeriod`'s locale contract, not a reason to loosen the assert.

### 2.4 Definition of done, E2E and ports

- **Every job's Definition of done** is the repo `verify:` line (`npm --prefix frontend run verify`, measured 27 to 34 s in rc-2) plus the test directories its change reaches, as its job file lists. No step, preflight or gate is added; `lighthouserc.json`, `ci.yml` and `playwright.config.ts` are unchanged; nothing reruns a check the merge already runs.
- **Header, layout, i18n or home changes also run CI's smoke set**: the nine `pages/*` specs of `playwright.config.ts` (rc-2's lesson). Every job but Job 2 changes the home or its content, so every job but Job 2 runs it.
- **The recipe** (one port per job: Job 1 5101, 3 5103, 4 5104, 5 5105, 6 5106, 7 5107, 8 5108, the base export 5190): `verify` has built `frontend/dist`; register the port (`registry.py list`, then `register --port N --project portifolio`); from `frontend/` start `npx vite preview --port N --strictPort` on loopback; run `E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium <spec files>`, or `E2E_SMOKE=1 E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium` for the smoke set; stop the preview by the pid that listens on N, `release --port N`. A port held by another project is replaced by `registry.py next`.
- **8080.** `playwright.config.ts` still names 8080 in its `webServer` block. Observed on this machine: with 8080 free, Playwright starts a transient dev server there for the run and stops it at exit; the tests never touch it, they use `E2E_BASE_URL`. The config is not changed in this rc.
- **A red outside the diff.** A failure in a full-suite spec the job's diff cannot reach is listed by name as suspected pre-existing; J8.T1's list of the base confirms it.
- **FR7 (Job 8).** T1 runs the one full-suite pass on a `git archive` export of `git merge-base HEAD feature/0.1.0` (`f34f33c`) before the job changes any spec; AC7.5 names its failures, expected 15.
- **Schema.** A job that changes `content-schema.mjs` or `projects.ts` regenerates `v1.json` in the same commit and runs `schema:check`. Only J8.T4 touches `content-schema.mjs` (a comment); `v1.json` must stay identical.
- **Cost on the `verify:` line.** No step is added; `test:run` gains this rc's unit tests only.

### 2.5 AC7.3 measurement

Same method as the as-is review: production build (`npm run build`), `vite preview` on the job's port, Chromium, `reducedMotion: "reduce"`, dark default, every role closed, `documentElement.scrollHeight` after `networkidle`, viewports 1440×900 and 390×844, locales pt and en. Save the script outside the tree (`.dadaia/tmp/<agent>/<date>/measure.mjs`) and run it from `frontend/` so `@playwright/test` resolves: `HOME_URL=http://localhost:N/ node --input-type=module < <script>`.

```js
import { chromium } from '@playwright/test';
const url = process.env.HOME_URL;
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) for (const lang of ['pt', 'en']) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await ctx.addInitScript((l) => localStorage.setItem('lang', l), lang);
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForSelector('#hero-heading');
  await p.waitForLoadState('networkidle');
  console.log(`${w}x${h}`, lang, await p.evaluate(() => document.documentElement.scrollHeight));
  await ctx.close();
}
await b.close();
```

Run against the as-is build this session it printed `1440x900 pt 4525`, `1440x900 en 4525`, `390x844 pt 6644`, `390x844 en 6572`: the figures of the SPEC. J8.T1 reruns it on the base export, so the FR7 hand-back's after-numbers use a method proven to reproduce the before-numbers.

### 2.6 Pre-mortem answers (each hit of the consumer sweep, with the main-thread rulings)

| hit | answer |
|---|---|
| 1 `heroStats`, `heroStatsSuffix.clouds`: `HeroSection` fallbacks | rebuilt without them: J4.T4 |
| 1 the three plain literals (excess property, missing `siteChrome`) | type change and literals in one commit: J1.T4 (R-F), J8.T3 |
| 1 `i18n-strings` heroStatsSuffix block, `clouds` and fallback asserts (`:270-287`) | block moved J1.T4; the two asserts leave J4.T1 (R-M) |
| 1 `types/content.ts`, locale JSON | new keys J1.T4, J1.T6; dead keys J8.T3, J8.T4 |
| 2 `nowPanel` / `HeroNowPanel`: mount, file, test, type, JSON, `content-schema.mjs:119` comment | mount J4.T4; test J4.T3; file J4.T5; type and JSON J8.T3, J8.T4; comment J8.T4 |
| 3 `achievements` (JSON only; `BUGS.jsonl` repro) | J1.T6; the contract test `contentSchemaExport.test.ts` stays as the guard |
| 4 `heroCTAs.seeProjects` / `hero-cta-projects`: `HeroSection`, its test, `Portfolio.test.tsx:38` | J4.T1, J4.T4; `Portfolio.test.tsx` literal J1.T4, then J8.T3 |
| 4 SMOKE-05 | J4.T2 (AC7.4 selector) |
| 4 PC-E2E-20 | J4.T2 (R-M) |
| 5 `siteChrome` required; the three `!`; the three literals | J1.T4, J1.T8 |
| 5 `check-i18n-parity.mjs:69` static set (footer keys silently unchecked) | J1.T7 adds the footer keys and the home block; J1.T5 is its RED |
| 5 the 31 files that mention `ContentData` | 3 plain literals break (J1.T4); the casts and `Pick`s compile unchanged |
| 6 Trie → `main`; `Experience.type` readers | J1.T6 flips; J1.T3 asserts; J5.T5 reads `type`; the AC3.2 anchor moves with the flip (J4.T1 uses the Trie fixture) |
| 7 skills rename (de `Datentechnologien` casing) | keyed by `id`: J1.T3, J1.T6, J7.T1; `skillCategoryColors.ts` keys skill names, unaffected |
| 8 certifications: `key={cert.name}` collision, `PROVIDER_ICONS`, schema parse | J7.T5 keys by `id` and drops the icon map; `contentSchemaExport.test.ts` parses the new file in J1 |
| 9 `MobileCollapsibleSection` callers and the three comments | callers J5.T5, J7.T4 to T6; unit J8.T6 after them; comments `experience-helpers.ts` J5.T7, `i18n-no-hardcoded.spec.ts:75` J8.T2, `layout.spec.ts:219` J3.T3 |
| 10 `CertificationCard`: callers, `issuerLabel`/`viewCredential` asserts | J7.T5, J7.T3, J7.T7; asserts leave with their keys (R-M) in J7.T2/T3 |
| 11 `SkillCategoryCard` | J7.T3, J7.T7 |
| 12 `project-card` count asserts | stay (R-M); J6 runs `index.spec.ts` and `layout-shell.spec.ts` |
| 12 kind, tech, install asserts and testids | the only asserts are `rand-engine.spec.ts:29-30` (missed by the sweep): J6.T3 (R-M); unit side J6.T1 |
| 12 `card.cover` against the hero-media poster; `kindLabels` prop | §2.2 poster field; J6.T4, J6.T5 |
| 12 `FeaturedProjects.test.tsx:52` | J6.T2 (R-M) |
| 12 dead `useInView` mock | J8.T3 |
| 13 `kindLabels` data, published `v1.json` | stays this rc (SPEC §5); intake |
| 14 `formatPeriod` callers and the language-dependent e2e specs | J5.T1, J5.T2 (signature), J5.T5, J5.T6 (callers); J5's DoD runs `language-switch`, `lang-persistence`, `i18n-no-hardcoded`, `ai-emphasis-content` |
| 15 `Impacto` and its four pt asserts; `highlight-project-block.spec.ts:242-243` | J5.T4, J5.T6 (pt fixtures carry `impactLabel: "Impacto"`; en, de added); the absence assert is run in J5's DoD |
| 16 `max-w-5xl`; T-LAY-02 | J8.T5; J3 runs the layout spec |
| 17 section ids and `#experiencia h2` | kept (§2.2); one `h2` in `#experiencia` (J5.T3 asserts it) |
| 17 `expandSeniorRole` and its four callers; HP-05 | J5.T7 (R-M) |
| 18 SMOKE-06 and `cv-download-routing` (CV link visible) | the CV link sits outside the toggle (R1): J4.T1 asserts it; the smoke set runs in J4 |
| 18 T-LAY-04 comment and the hero top offset | §2.2; J3.T3, J4.T4 |
| 18 `responsive.spec` (no overflow at 375 and 1280), 404 and deep-link with a footer | run in every job's smoke set; J3.T3 asserts one `contentinfo` on the four routes |
| 19 footer: `SiteLayout.test`, memory atoms, `README.md`, repo `AGENTS.md` | J3.T1, J3.T4; atoms and catalog are closure work for `dd-product-engineer`; README and AGENTS J2.T1 |
| 20 `schema:check` outside `verify`; static parity set; Lighthouse and `ci.yml` | `schema:check` in J8's DoD (the one comment edit); parity J1.T7; `ci.yml`, `lighthouserc.json` untouched |

### 2.7 PLAN-stage ADR check

`specs/ADRs/decisions.jsonl` holds no record that rc-3 contradicts. No choice passes the threshold (one-way door, architecturally significant, two genuine options): `COLUMN` and `SectionHeading` are reversible in one job, the key names are content, the `Intl` form adds no dependency. None proposed.

### 2.8 Acceptance map

| AC | tasks |
|---|---|
| AC1.1 | J1.T4, J1.T6, J1.T8, J8.T3, J8.T4 |
| AC1.2 | J1.T3, J1.T6 |
| AC1.3 | J1.T3, J1.T6 |
| AC1.4 | J1.T3, J1.T6 |
| AC1.5 | J1.T3, J1.T5, J1.T6, J1.T7 |
| AC1.6 | J1.T4 |
| AC2.1 | J1.T9, J3.T1, J3.T2, J3.T4, J3.T5, J8.T5 |
| AC2.2 | J1.T3, J1.T6, J3.T1, J3.T3, J3.T4 |
| AC3.1 | J4.T1, J4.T4 |
| AC3.2 | J1.T1, J1.T2, J1.T3, J1.T6, J4.T1, J4.T4 |
| AC3.3 | J4.T3, J4.T5 |
| AC4.1 | J5.T3, J5.T5 |
| AC4.2 | J5.T4, J5.T6, J5.T7 |
| AC4.3 | J1.T1, J1.T2, J5.T3, J5.T5 |
| AC4.4 | J5.T3, J5.T5 |
| AC4.5 | J5.T1, J5.T2, J5.T5, J5.T6 |
| AC4.6 | J5.T4, J5.T6 |
| AC5.1 | J6.T2, J6.T5 |
| AC5.2 | J6.T1, J6.T3, J6.T4, J6.T5 |
| AC6.1 | J7.T1, J7.T3, J7.T4, J7.T7 |
| AC6.2 | J7.T2, J7.T3, J7.T5, J7.T7 |
| AC6.3 | J7.T2, J7.T6 |
| AC7.1 | J8.T3, J8.T5 |
| AC7.2 | J8.T2, J8.T3, J8.T5, J8.T6 |
| AC7.3 | J8.T7 |
| AC7.4 | J4.T2, J8.T7 |
| AC7.5 | J8.T1 |
| AC7.6 | J2.T1 |
| AC7.7 | J8.T7 |

## DAG

| job | waits on | wave | `W:` |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/src/lib/formatPeriod.test.ts`, `frontend/src/lib/formatPeriod.ts`, `frontend/src/lib/resumeContent.test.ts`, `frontend/src/types/content.ts`, `frontend/src/components/portfolio/Portfolio.test.tsx`, `frontend/src/components/portfolio/HeroSection.test.tsx`, `frontend/src/components/portfolio/ExperienceCard.test.tsx`, `frontend/src/components/portfolio/CertificationCard.test.tsx`, `frontend/src/components/portfolio/CertificationsSection.test.tsx`, `frontend/src/components/portfolio/i18n-strings.test.tsx`, `frontend/src/lib/homeParity.test.ts`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json`, `frontend/scripts/check-i18n-parity.mjs`, `frontend/src/components/Header.tsx`, `frontend/src/components/header/ThemeToggle.tsx`, `frontend/src/components/header/LanguageSelector.tsx`, `frontend/src/components/portfolio/SectionHeading.tsx`, `frontend/src/lib/layout.ts` |
| Job 2 | — | 1 | `README.md`, `AGENTS.md` |
| Job 3 | Job 1 | 2 | `frontend/src/components/layout/SiteLayout.test.tsx`, `frontend/src/components/projects/__tests__/ProjectsLayoutShell.test.tsx`, `frontend/tests/e2e/pages/layout.spec.ts`, `frontend/src/components/layout/SiteLayout.tsx`, `frontend/src/components/projects/ProjectsLayoutShell.tsx` |
| Job 4 | Job 1 | 2 | `frontend/src/components/portfolio/HeroSection.test.tsx`, `frontend/tests/e2e/pages/post-strict-flip-smoke.spec.ts`, `frontend/tests/e2e/projects-cluster/nav-projects.spec.ts`, `frontend/src/components/portfolio/HeroNowPanel.test.tsx`, `frontend/src/components/portfolio/HeroSection.tsx`, `frontend/src/components/portfolio/HeroNowPanel.tsx` |
| Job 5 | Job 1 | 2 | `frontend/src/lib/formatPeriod.test.ts`, `frontend/src/lib/formatPeriod.ts`, `frontend/src/components/portfolio/ExperienceSection.test.tsx`, `frontend/src/components/portfolio/ExperienceCard.test.tsx`, `frontend/src/components/portfolio/RoleCollapsible.test.tsx`, `frontend/src/components/portfolio/HighlightProjectBlock.test.tsx`, `frontend/src/components/portfolio/ExperienceSection.tsx`, `frontend/src/components/portfolio/ExperienceCard.tsx`, `frontend/src/components/portfolio/Portfolio.tsx`, `frontend/src/components/portfolio/RoleCollapsible.tsx`, `frontend/src/components/portfolio/HighlightProjectBlock.tsx`, `frontend/tests/e2e/fixtures/experience-helpers.ts`, `frontend/tests/e2e/pages/role-collapsible.spec.ts`, `frontend/tests/e2e/pages/role-skill-badges.spec.ts`, `frontend/tests/e2e/pages/ai-emphasis-content.spec.ts`, `frontend/tests/e2e/pages/highlight-project-block.spec.ts` |
| Job 6 | Job 1 | 2 | `frontend/src/components/projects/__tests__/ProjectCard.test.tsx`, `frontend/src/components/portfolio/FeaturedProjects.test.tsx`, `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts`, `frontend/tests/e2e/pages/home.spec.ts`, `frontend/src/components/projects/ProjectCard.tsx`, `frontend/src/components/portfolio/FeaturedProjects.tsx`, `frontend/src/pages/projects/ProjectsIndexPage.tsx` |
| Job 7 | Job 1 | 2 | `frontend/src/components/portfolio/SkillsSection.test.tsx`, `frontend/src/components/portfolio/CertificationsSection.test.tsx`, `frontend/src/components/portfolio/EducationSection.test.tsx`, `frontend/src/components/portfolio/SkillCategoryCard.test.tsx`, `frontend/src/components/portfolio/CertificationCard.test.tsx`, `frontend/src/components/portfolio/SkillsSection.tsx`, `frontend/src/components/portfolio/CertificationsSection.tsx`, `frontend/src/components/portfolio/EducationSection.tsx`, `frontend/src/components/portfolio/SkillCategoryCard.tsx`, `frontend/src/components/portfolio/CertificationCard.tsx` |
| Job 8 | Job 3, Job 4, Job 5, Job 6, Job 7 | 3 | `.dadaia/tmp/dd-sw-engineer-sr/<YYYYMMDD>/rc3-base`, `frontend/src/components/portfolio/MobileCollapsibleSection.test.tsx`, `frontend/tests/e2e/pages/i18n-no-hardcoded.spec.ts`, `frontend/src/types/content.ts`, `frontend/src/components/portfolio/Portfolio.test.tsx`, `frontend/src/components/portfolio/HeroSection.test.tsx`, `frontend/src/lib/resumeContent.test.ts`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json`, `frontend/scripts/content-schema.mjs`, `frontend/src/components/portfolio/Portfolio.tsx`, `frontend/src/components/portfolio/MobileCollapsibleSection.tsx` |

