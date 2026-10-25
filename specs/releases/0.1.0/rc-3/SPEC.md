# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-10-25
**Origin:** backlog:resume-refinement

---

## Bug window review

**Window:** the whole history (`specs/audits/_archive/audits_histo.jsonl` is empty); rc-2 judged `ci-never-runs-the-checks-develop-requires` (KEEP), so it leaves. Judged here: the eight records resolved in rc-2. `bugs.py status`: 0 open.

rc-2's history was rewritten; an unreachable `fix_sha` is replaced by the reachable id-line commit (`specs/bugs/AGENTS.md` §2).

| record | fix (HEAD) | what it changed | overfitting check | verdict |
|---|---|---|---|---|
| `content-schema-export-is-empty` | `96fc100` | export via Zod 4 `z.toJSONSchema`; dependency dropped; `v1.json` regenerated | no assert loosened (the RED test asserts real fields); one child bug (next row) | **KEEP**, as amended by `9101242` |
| `content-schema-rejects-committed-content` (`caused_by` the row above) | `9101242` | REBUILD of the export: `io: "input"`, one line | no branch or flag; the contract test adds a partition (no closed object) | **KEEP**; leaves the window if rc-3 adds no child bug |
| `content-urls-accept-script-schemes` | `b3b14ff` | one `HttpUrl` rule on every href sink; the certification `#` no-link sentinel; same-origin `cvUrl` | `#` is the content's own sentinel, not a test value. The rule is written once in each schema file (`content-schema.mjs`, `projects.ts`) | **KEEP**; the second copy goes to the intake |
| `content-validation-never-runs` | `c2ba6fc` | the unrun `validate-content.mjs` and its npm script deleted; a parse test in `verify` | replaced by a test in the gate, not lost | **KEEP** |
| `media-terminal-final-line-dropped` | `2536e47` (record hint `7973878`) | REBUILD of `render` in integer ticks, net 0 lines | none | **KEEP** |
| `media-resize-keeps-old-cut`, `media-empty-box-layout-shift` | `2663928` (record hint `e1bc71f`) | REBUILD of `Media`: one render path, `key={cut.webm}` | branches collapsed, +3/−2 | **KEEP** |
| `smoke-e2e-encodes-the-pre-rc2-header` | `29c45a8` | four E2E specs select by role and region | selectors only, asserts unchanged; the cause is a smoke spec encoding a removed element | **KEEP**; rc-3 removes home elements, see §5 |

No fix is judged REBUILD. `bugs.py stats`: 4 of 8 rc-2 bugs fix-induced (`caused_by` J1.T9, J2.T1, J3.T7 ×2).

## 1. Problem

Operator words (backlog `resume-refinement`, 2026-10-24): "I like minimalism"; "The frames that a person reading it views are not good. Many information. It's a bit not organized."; "I don't want a huge change here. But we need to do a refinement … about position of topics inside the website".

As-is review measurements (`feature/0.1.0` @ `5ec1db9`, `vite preview`, Chromium, reduced motion, dark, every role closed):

- The home is 4525 px tall at 1440×900 (5.0 screens) and 6572 px at 390×844 in en (7.8 screens; pt 6644). Skills plus Certifications take 40% of the desktop page.
- Every section sits in a bordered card and a fold (`MobileCollapsibleSection` around four); Experience nests a card per employer and role under "Career progression"; the three pre-data roles are full cards.
- The hero carries a `$ now` panel, a second column and two CTAs. Its "4 clouds" comes from a hand-typed `heroStats.clouds`, while Skills lists three providers (a second decider).
- The home column is 1024 px (`max-w-5xl`), the project shell's 960 px (two deciders of one width).
- The page has no footer.
- Two i18n gaps: role periods render English months, "Present" and yrs/mos in pt and de; the impact badge says "Impacto" in every locale.

Design reference: the operator's canvas boards "Home · desktop" (1440) and "Home · phone" (390) (its link kept out of this public repo). Not built: the Blog nav item (rc-4) and the looping card previews, replaced by a still poster.

Operator rulings (grill 2026-10-25, verbatim answers):

- Home project cards → "Still poster (Recommended)". One shared `ProjectCard` (`/projetos` and the home) shows the scene's poster (≤ 60 KB); motion lives on the project page, the home loads no video bytes.
- Test changes → "Approve all (Recommended)". The hero "See projects" CTA is dropped; SMOKE-05 (`post-strict-flip-smoke.spec.ts`) clicks the header Projects link. `HeroSection.test`'s "exactly 2 CTAs" becomes 1. Deleted units' tests leave with them (`HeroNowPanel`, `SkillCategoryCard`, `MobileCollapsibleSection`, `CertificationCard`). The AI-stack assert moves to the `SkillsSection` test. The `i18n-strings.test.tsx` blocks move, unnarrowed, to each component's test.
- Test moves, main-thread ruling (2026-10-25 consumer pre-mortem) resting on "Approve all", "Still poster", "Projects (2)", "home = your canvas boards": `FeaturedProjects.test.tsx:52` expects 2 cards, not 3; `ProjectCard.test.tsx`'s kind, tech and install asserts leave with those elements; the `i18n-strings.test.tsx` asserts on deleted keys (:97-105, :117-146, :165-230, :270-287) leave with the keys; PC-E2E-20's hero-CTA assert (`projects-cluster/nav-projects.spec.ts`) leaves with the CTA; `expandSeniorRole` (`fixtures/experience-helpers.ts`) and its callers (`role-collapsible`, `role-skill-badges`, `ai-emphasis-content`, `highlight-project-block` specs) select the "Details +" trigger, behaviour kept; the `project-card` count asserts stay.
- Each test change is named in its `test(...)` commit with its ruling.
- The two i18n gaps → "Register, fix in rc-3 (Recommended)". Main-thread ruling (2026-10-25): Arm A, not bugs, since no merged contract breaks (`specs/bugs/AGENTS.md` §1): rc-2 AC1.3 (`rc-2/SPEC.md:98`) exempts `src/components/portfolio/**`, `formatPeriod.ts:26-31` documents English output, an archived SPEC specified "⚡ Impacto". So AC4.5, AC4.6; no bug record or hotfix lane.
- Summary → "Confirm (Recommended)". The home equals the boards: Hero > Experience > Projects (2 featured) > Skills > Certifications > Education. No section frames or folds; only the per-role "Details +" disclosure remains. One 960 px column, prose at 680 px, a footer on every route. The check: CI smoke E2E green, and the home height within 10% of the boards (1440 px: 4525 → ~3000; 390 px: 6572 → ~4300).

Confirmed in that summary (grill inspection answers, agent defaults):

- **Hero stats are derived from content**, one authority each (AC3.2); `heroStats` and `heroStatsSuffix.clouds` are deleted.
- **"Read the story"** is the inline toggle on `resume.full`; a route is rc-4's.
- **The Earlier line.** Trie Engenharia flips to type `main` in three locales (data only). Earlier is `Experience.type === "minor"`: one localized line built from data, with the stored company names and a year range. No `shortName` field; "Summer Internship" follows the data.
- **Role summaries** are `responsibilities[0]`, unclamped, no new field.
- **Strings and footer** (agent default, unruled): the footer lives in `SiteLayout` on every route, its strings in `siteChrome` (parity-checked), the email and links from `profile`, the year computed at build. Other new home strings are flat keys, with a parity line added in `check-i18n-parity.mjs`.
- **Certifications and Skills are content edits.**
  - Certifications: one flat list, newest first via `priority`, names without their level, dates as written, fields verbatim. Orphan provider and badge assets stay (`icon` is required by the schema); their deletion goes to the intake.
  - Skills: a `<dl>` in the board's order, with one rename (AC1.4).
  - `RoleSkillBadges` and `HighlightProjectBlock` stay inside "Details +".
- **The rc-2 intake taken into rc-3:** `siteChrome` becomes required and its 3 non-null assertions go; the unread `achievements` (0 readers) and the dead hero and label keys are deleted; the README and repo `AGENTS.md` dead links are fixed; the dead `useInView` mock in `Portfolio.test.tsx` goes; one full E2E run at the merge base names the 15 known failures (one-off, not a gate). Left out: §3.

## 2. Measurable Goals

| # | goal | today | target | source |
|---|---|---|---|---|
| 1 | home height, 1440×900, en | 4525 px | 2700–3300 px (board 3000 ± 10%) | AC7.3 |
| 2 | home height, 390×844, en | 6572 px | 3870–4730 px (board 4300 ± 10%) | AC7.3 |
| 3 | CI smoke E2E at the rc PR head | — | every job green | AC7.4 |
| 4 | home sections in a card or fold | 4 folds, every section carded | 0 | AC7.2 |
| 5 | hand-typed hero numbers | 3 (`heroStats`) | 0 | AC3.2 |
| 6 | English period words on the pt and de home; "Impacto" on the en and de home | every role period; every highlight | 0 | AC4.5, AC4.6 |

## 3. Non-goals

- The blog, its nav item and the "Read the story" route: rc-4.
- Looping video on the home cards (replaced by the still poster).
- A `shortName` or `summary` field, or any other new schema field.
- Out of the rc-2 intake (to the intake or backlog): the type-step triple list, the live-content header tests, the two other own-hook mocks (`ProjectsIndexPage.test`, `ProjectDetailPage.test`), the orphan certification assets.
- Fixing the 15 pre-existing full-suite E2E failures beyond those a job's own change turns red (AC7.5 only names them).
- Any new gate, CI job, `verify:` step, merge check or `lighthouserc.json` change.

## 4. Requirements

Paths are relative to `frontend/`. Domain names: the home (`Portfolio`), `SiteLayout`, `ProjectCard`, the content JSON (`public/content/{pt,en,de}.json`), `profile`, `siteChrome`, the locale.

**Wave ranking:** (1) law, skills, dev loop: none; (2) shared foundation: FR1 (content, contract), FR2 (column, footer); (3) features, in parallel on disjoint files once FR1 lands: FR3 hero, FR4 experience, FR5 projects, FR6 skills, certifications, education; (4) promote-facing: FR7 (composed home, smoke specs, height) and the backlog exit.

### FR1 — content holds one authority per fact

- **AC1.1** The three locale files have:
  - no `nowPanel`, `heroStats` numbers, `heroStatsSuffix.clouds`, `achievements` or `heroCTAs.seeProjects`;
  - none of the label keys the rebuilt sections stop reading: `careerProgression`, `roleSingular`, `rolePlural`, `certSingular`, `certPlural`, `viewCredential`, `validUntil`, `issuerLabel`;
  - no other key that `src/**` stops reading, `kindLabels` excepted (§5).

  `types/content.ts` declares none of them, and `siteChrome` is required. `Header.tsx`, `ThemeToggle.tsx` and `LanguageSelector.tsx` carry no non-null assertion on it. Test: unit (the three-locale parse test stays green); the reviewer greps `src/**` per deleted key.
- **AC1.2** Trie Engenharia is `type: "main"` in all three locales. The three pre-data experiences stay `minor`. Test: unit (a content test asserts the `minor` set by company literal).
- **AC1.3** Certifications in each locale are ordered newest first by `priority`. Each `name` carries no level that `level` already states. Dates stay as written. Test: unit (a content test asserts the first and last names per locale, literals).
- **AC1.4** Skill rows are keyed by `id`, never by title, in code, content and tests. Each locale lists them in the board's order: `programming-languages`, `cloud-providers`, `on-premises-data-technologies`, `ai-modern-tooling`, `devops-technologies`, `languages`. One rename: `on-premises-data-technologies` reads "Data platforms" (en), "Plataformas de dados" (pt), "Datenplattformen" (de); every other title stays as data. Test: unit (a content test asserts the id order and the three renamed titles).
- **AC1.5** Every new home string is a flat key present and non-blank in all three locales: the Earlier label, the "Details" toggle, the story toggle and "All →". `check:i18n-projects` fails when a locale lacks one. Test: integration (`check:i18n-projects` on a fixture missing one key).
- **AC1.6** The `i18n-strings.test.tsx` blocks on surviving keys live in each component's own test, asserts unnarrowed; the asserts on deleted keys leave with the keys; the shared file is gone (§1 test rulings). Test: unit; the reviewer compares the moved asserts.

### FR2 — one column, one footer

- **AC2.1** The home and the project shell read one column width of 960 px from one place. The hero story and role summaries cap at 680 px. `max-w-5xl` is gone from `Portfolio.tsx`. Test: unit (the column element carries the shared width class). Visual: the reviewer's 1440 and 390 screenshots vs the boards.
- **AC2.2** `SiteLayout` renders one `<footer>` after `<main>` on every route: `/`, `/projetos`, a project page and the 404. It shows the owner's name, the build year, and the email, LinkedIn and GitHub links from `profile`, labelled by the locale's `siteChrome`. No email or URL literal sits in `src/**`. Test: unit (the layout on each route, per locale). E2E: the layout smoke asserts one `contentinfo` landmark.

### FR3 — hero

- **AC3.1** The hero renders one column: avatar, mono name and location line, the compact `h1#hero-heading` on the `text-hero` step (operator ruling 2026-06-11, kept), one story line, then the "Read the story" toggle, which expands only `resume.full`, inline, with `aria-expanded`. The stat line, Download CV and the social links sit outside it, always visible (both boards). No `$ now` panel, no projects CTA; exactly one CTA remains (test ruling). Test: unit (`HeroSection.test`: story closed, the stat line, CV link and each social link visible).
- **AC3.2** The stat line reads `<n>+ <years> · <m> <certs> · <clouds>`, the words from `heroStatsSuffix.years` and `.certs`. n is the whole years since the earliest `main` start (`formatPeriod.ts`'s earliest-start reader): Trie Engenharia's 11-2020 after the AC1.2 flip, Santander's 05-2021 before it; both read "5+" today. m is the certification list's length. The clouds are the Skills row `cloud-providers` items joined by " · ". `heroStatsSuffix.certs` reads "certifications" (en), "certificações" (pt), "Zertifizierungen" (de). Today en renders "5+ years · 11 certifications · AWS · Azure · Databricks" before Nov 2026. Test: unit (fixed clock, a fixture, literals expected).
- **AC3.3** `HeroNowPanel` and its test are deleted (test ruling). Test: none; the reviewer greps `src/**`.

### FR4 — experience

- **AC4.1** Experience renders each `main` employer as one line (company, period, location) with a left rule and its roles beneath it. No card, gradient rail or "Career progression" label. Each role shows title, period and `responsibilities[0]` unclamped. Test: unit (`ExperienceCard`/`RoleCollapsible` tests: no card class, full summary text).
- **AC4.2** Each role has one "Details +" disclosure (`aria-expanded`, the `section_expand` and `section_collapse` track events kept). It reveals the remaining responsibilities, `RoleSkillBadges` and `HighlightProjectBlock`, and starts closed. Test: unit (`RoleCollapsible.test`).
- **AC4.3** After the employers, one Earlier line lists every `minor` experience in content order as `<title>, <company> (<year range>)`, joined by " · ", under the localized Earlier label. The company is the stored name; the year range comes from `formatPeriod.ts`'s year-range reader (e.g. `2015–18`, or one year when start and end match). Test: unit (pt, en and de fixtures, literal lines).
- **AC4.4** `#experiencia` and `#experiencia-heading` keep their ids. Test: E2E (T-LAY-05 unchanged).
- **AC4.5** Role periods render in the visitor's locale; `formatPeriod.ts` alone parses periods. `formatPeriod(raw, lang)` returns `<start> – <end> · <duration>` for pt, en and de: each month and year from `Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' })`, each duration unit from `Intl.NumberFormat(lang, { style: 'unit', unit: 'year' | 'month' })`, and an open end as the present word written in the source ("Presente", "Present", "Heute"). No content key or schema field is added. It also exports the year-range reader (AC4.3) and the earliest-start reader (AC3.2). No English word appears in a pt or de period. Test: unit (all three per locale, fixed clock, literals, e.g. `02/2024 bis Heute` starts `Feb. 2024 – Heute`).
- **AC4.6** The highlight project's impact badge text and its accessible name come from the active locale's content. pt keeps "Impacto": the four `getByLabelText('Impacto')` asserts stay (`HighlightProjectBlock.test.tsx:52`, `ExperienceCard.test.tsx:111` and `:117`, `RoleCollapsible.test.tsx:180`), en and de asserts are added; none is removed. Test: unit.

### FR5 — projects

- **AC5.1** The home's Projects section shows exactly two cards, rand-engine then dadaia-workspace, two per row from `md`, one per row below. Its heading ends with an "All →" link (`data-testid="see-all-projects"`) to `/projetos`. `#projetos-destaque` keeps its id. Test: unit (`FeaturedProjects.test`).
- **AC5.2** `ProjectCard`, the one card of the home and `/projetos`, shows four things: the item's hero-media poster (`<img>` with width, height and alt), its name, its one-line purpose and, for a library item, `PyPI <pypi.version>`. An item without hero media keeps today's cover or placeholder. No kind chip, badges, install hint or `kindLabels` prop; `data-testid="project-card"` stays. No `<video>` and no webm or mp4 URL is rendered or fetched on `/` (operator: "Still poster"). Test: unit (`ProjectCard` per kind). E2E: the home smoke asserts no `video` element under `#projetos-destaque`.

### FR6 — skills, certifications, education

- **AC6.1** Skills renders one `<dl>`: each category a `<dt>`, its items in one `<dd>` joined by " · ", in content order. `SkillCategoryCard` and its test are deleted (test ruling). The AI-stack assert lives in the `SkillsSection` test. Test: unit.
- **AC6.2** Certifications renders one flat list in content order. Each entry shows `<name> · <level>` and then a mono `<issuer> · <date>` line, fields verbatim, and links to the credential when `link` is not `#`. No provider grouping, logo, badge or count. `CertificationCard`'s old test leaves (test ruling), and `#certificacoes` keeps its id. Test: unit. E2E: T-LAY-06 unchanged.
- **AC6.3** Education renders one entry, no frame or location chip: degree, year, institution, coursework, then the thesis link. Test: unit.

### FR7 — the home, composed and checked

- **AC7.1** The home renders exactly Hero, Experience, Projects, Skills, Certifications and Education, in that order. `Portfolio.test.tsx` asserts it with literal ids, no `useInView` mock. Test: unit. E2E: T-LAY-05.
- **AC7.2** No home section is a card or a fold. `MobileCollapsibleSection` and its test are deleted (test ruling), and the only disclosures on the home are the per-role "Details +" and the story toggle. Test: unit (no other `[data-state]` section trigger on the composed home).
- **AC7.3** Measured as the as-is review did (§1 setup, production build, en), the home's `documentElement.scrollHeight` is 2700–3300 px at 1440×900 and 3870–4730 px at 390×844. Test: none (a height assert would be a new gate); the FR7 hand-back states both numbers, pt beside them.
- **AC7.4** SMOKE-05 clicks the header Projects link, selected as `getByRole('banner').getByRole('link', { name: <siteChrome.nav.projects of the locale> })` (test ruling). A smoke spec selecting a removed home element changes in the job that removes it. These testids leave with their elements: `hero-cta-projects`, `cert-tile`, `cert-grid-*`, `project-card-kind`, `project-card-tech`, `project-card-install`; `project-card`, `see-all-projects` and the track events stay (AC4.2, AC5.1, AC5.2). CI's `e2e` smoke job is green on the rc PR head. Test: E2E (the smoke set).
- **AC7.5** The full E2E suite runs once on chromium at the rc-3 merge base, before the FR7 job changes any spec; its hand-back names the failing tests for the main thread's intake. One-off, no gate. Test: none; evidence is the run's list.
- **AC7.6** `README.md` and the repo `AGENTS.md` link only to existing `specs/` paths. The README's CI row names what `ci.yml` runs, and its dev-server port matches `vite.config.ts`. Test: none (docs); the reviewer opens each link.
- **AC7.7** The repo `verify:` line (`npm --prefix frontend run verify`) exits 0 on every job merge and on the rc PR head, unchanged. Test: the existing suite plus this rc's unit tests.

### Replaces

- The `$ now` panel: `HeroNowPanel`, `ContentData.nowPanel`, its three locale blocks (AC3.3, AC1.1).
- Hand-typed `heroStats` numbers, `heroStatsSuffix.clouds`, their `HeroSection` fallbacks (AC3.2).
- The hero's second column, 3-line bio clamp with See more, and "See projects" CTA (AC3.1).
- The employer card, gradient rail, "Career progression (n roles)" label, bordered role card and 2-line summary clamp (AC4.1).
- The three pre-data roles as full cards (AC4.3).
- English-only period words and the literal "Impacto" badge in en and de (AC4.5, AC4.6).
- The section folds (`MobileCollapsibleSection`) and every section card (AC7.2).
- `SkillCategoryCard`, its icon map and its uninterpolatable gap classes (AC6.1).
- The provider-grouped certificate tiles, logos, 48 px badges, counts, hover (AC6.2).
- The framed education card with its location chip (AC6.3).
- The third featured card and the three-column grid (AC5.1).
- The `ProjectCard` kind chip, badges, install hint, hover lift and `kindLabels` prop (AC5.2).
- The 1024 px home column (AC2.1).
- The optional `siteChrome` and its three non-null assertions; the unread `achievements` and dead label keys (AC1.1).
- `i18n-strings.test.tsx` as one file shared by three features (AC1.6).
- The dead `useInView` mock in `Portfolio.test.tsx` (AC7.1).
- The dead `specs/` links in `README.md` and the repo `AGENTS.md` (AC7.6).

### Closure

- `backlog.py exit resume-refinement --disposition delivered --release 0.1.0` at the reconcile.
- The summary records AC7.3's measured heights, AC7.5's failing-test names, and rc-2's carried AC4.7 and AC5.5 stage evidence, collected 2026-10-25: PR #34 merged into develop as `11ac2bb`; deploy run https://github.com/marcoaureliomenezes/portifolio/actions/runs/40194175406 succeeded; stage `/projetos/rand-engine` answers 200 `text/html`, and the spec-to-dataframe and init-workspace desktop webm 200 `video/webm`; stage `en.json` serves 0.4.7 and no 0.5.0; the stage Playwright pass ran 24/24 OK (2 pages × pt/en/de × 1440/360 × motion/reduced); facts: 13/13 match their sources at tags `0.8.0` and `v0.4.7`.
- Memory: one atom for the home resume (sections, order, the Earlier rule, derived hero stats, localized periods). `site-chrome` gains the footer and the shared column, and its boundary line "The resume's own sections … outside this frame" is updated. `content-contract` drops the deleted keys and records the parity line for the home strings.

## 5. Constraints and risks

| risk | answer |
|---|---|
| `formatPeriod.ts` serves the role periods (AC4.5), the Earlier year range (AC4.3) and the stat line's start (AC3.2). | One job owns `formatPeriod.ts` and its three ACs, or the PLAN draws the edge between the jobs. |
| `smoke-e2e-encodes-the-pre-rc2-header` showed a smoke spec encoding a removed element turns CI red after merge. | AC7.4: the job that removes a home element changes the smoke spec that selects it, and the PLAN lists each spec per job. |
| Restyling `ProjectCard` touches `/projetos`, whose tests may assert the removed chip, badges or install hint. | The PLAN lists each such assert; only the §1 test rulings move or narrow one. No other assert is removed. |
| Requiring `siteChrome` and deleting keys from `ContentData` breaks every full fixture: 31 files mention `ContentData`, and the plain literals at `Portfolio.test.tsx:11`, `HeroSection.test.tsx:11` and `i18n-strings.test.tsx:27` fail typecheck. | The type change and those three literals land in one commit (main-thread ruling 2026-10-25); the FR1 job's `W:` names every fixture it touches. |
| `content-schema.mjs` carries a resolved fix chain (`content-schema-export-is-empty` → its child). | rc-3 adds no schema field. The job that changes `content-schema.mjs` or `projects.ts` regenerates `v1.json` in the same commit, and its DoD runs `npm --prefix frontend run schema:check`; no new gate. |
| `kindLabels` is read by an external consumer of the published `v1.json`. | It stays this rc: the `ProjectCard` prop goes, the content key and published schema field stay; removal goes to the intake. |
| PRs run only the 9 smoke specs; the 8 full-suite specs reaching `#experiencia` run weekly. | Each job hand-back carries local chromium runs of the E2E files it reaches. |

## 6. Open questions

None.
