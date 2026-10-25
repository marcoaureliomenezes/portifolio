# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-10-25
**Origin:** backlog:resume-refinement

---

## Bug window review

**Window:** the whole history (`specs/audits/_archive/audits_histo.jsonl` is empty). rc-2 judged `ci-never-runs-the-checks-develop-requires` (KEEP), so it leaves the window. This review judges the eight records resolved in rc-2. `bugs.py status`: 0 open.

The rc-2 history was rewritten. Where a record's `fix_sha` is not reachable from HEAD, the table names the reachable id-line commit (`specs/bugs/AGENTS.md` §2).

| record | fix (HEAD) | what it changed | overfitting check | verdict |
|---|---|---|---|---|
| `content-schema-export-is-empty` | `96fc100` | export via Zod 4 `z.toJSONSchema`; dependency dropped; `v1.json` regenerated | no assert loosened (the RED test asserts real fields); one child bug followed (next row) | **KEEP**, as amended by `9101242` |
| `content-schema-rejects-committed-content` (`caused_by` the row above) | `9101242` | REBUILD of the export: `io: "input"`, one line | no branch or flag; the contract test adds a partition (no closed object) | **KEEP**; it leaves the window if rc-3 adds no child bug |
| `content-urls-accept-script-schemes` | `b3b14ff` | one `HttpUrl` rule on every href sink; the certification `#` no-link sentinel; same-origin `cvUrl` | `#` is the content's own sentinel, not a test value. The rule is written once in each of the two schema files (`content-schema.mjs`, `projects.ts`) | **KEEP**; the second copy goes to the intake |
| `content-validation-never-runs` | `c2ba6fc` | the unrun `validate-content.mjs` and its npm script deleted; a parse test in `verify` | the deleted script is replaced by a test in the gate, not lost | **KEEP** |
| `media-terminal-final-line-dropped` | `2536e47` (record hint `7973878`) | REBUILD of `render` in integer ticks, net 0 lines | none | **KEEP** |
| `media-resize-keeps-old-cut`, `media-empty-box-layout-shift` | `2663928` (record hint `e1bc71f`) | REBUILD of `Media`: one render path, `key={cut.webm}` | branches collapsed, +3/−2 | **KEEP** |
| `smoke-e2e-encodes-the-pre-rc2-header` | `29c45a8` | four E2E specs select by role and region | the fix is a test change, with selectors only and asserts unchanged; the cause is a smoke spec encoding a removed element | **KEEP**; rc-3 removes home elements, so see §5 |

No fix is judged REBUILD. `bugs.py stats` reports 4 of 8 rc-2 bugs as fix-induced (`caused_by` J1.T9, J2.T1, J3.T7 ×2).

## 1. Problem

Operator words (backlog `resume-refinement`, 2026-10-24): "I like minimalism"; "The frames that a person reading it views are not good. Many information. It's a bit not organized."; "I don't want a huge change here. But we need to do a refinement … about position of topics inside the website".

What the as-is review measured (`feature/0.1.0` @ `5ec1db9`, `vite preview`, Chromium, reduced motion, dark, every role closed):

- The home is 4525 px tall at 1440×900 (5.0 screens) and 6572 px at 390×844 in en (7.8 screens; pt 6644). Skills plus Certifications take 40% of the desktop page.
- Every section sits in a bordered card and a fold (`MobileCollapsibleSection` around four sections). Experience nests a card per employer and a card per role, under a "Career progression" label. The three pre-data roles render as full cards.
- The hero carries a `$ now` panel, a second column and two CTAs. Its stat line says "4 clouds" from a hand-typed `heroStats.clouds`, while Skills lists three providers (a second decider).
- The home column is 1024 px (`max-w-5xl`); the project shell's is 960 px (two deciders of one width).
- The page has no footer.
- Two i18n gaps: role periods render English months, "Present" and yrs/mos in pt and de; the impact badge says "Impacto" in every locale.

Design reference: the operator's canvas boards "Home · desktop" (1440) and "Home · phone" (390) (its link kept out of this public repo). Two things on the boards are not built: the Blog nav item (rc-4), and the looping card previews, which the card ruling below replaces with a still poster.

Operator rulings this SPEC rests on (grill 2026-10-25, verbatim answers):

- Home project cards → "Still poster (Recommended)". One shared `ProjectCard`, restyled for both `/projetos` and the home, shows the scene's poster image (≤ 60 KB). Motion lives on the project page, and the home loads no video bytes.
- Test changes → "Approve all (Recommended)". The hero "See projects" CTA is dropped. SMOKE-05 (`post-strict-flip-smoke.spec.ts`) clicks the header Projects link instead. `HeroSection.test`'s "exactly 2 CTAs" becomes 1. The tests of deleted units leave with them: `HeroNowPanel.test`, `SkillCategoryCard.test`, `MobileCollapsibleSection.test`, `CertificationCard.test`. The AI-stack assert moves to the `SkillsSection` test. The `i18n-strings.test.tsx` blocks move, unnarrowed, to each component's test. Each change is named in its `test(...)` commit with this ruling.
- The two i18n gaps → "Register, fix in rc-3 (Recommended)". The main thread ruled (2026-10-25, after the registration lane's review) that they are not bugs but Arm A: no merged contract breaks (`specs/bugs/AGENTS.md` §1). rc-2 AC1.3 (`rc-2/SPEC.md:98`) exempts the resume parts (`src/components/portfolio/**`, rc-3); `formatPeriod.ts:26-31` documents its English output; the "⚡ Impacto" badge text was specified by an archived SPEC. The operator wanted them fixed in rc-3, so they are rc-3 requirements (AC4.5, AC4.6), with no bug record or hotfix lane.
- Summary → "Confirm (Recommended)". The home equals the boards: Hero > Experience > Projects (2 featured) > Skills > Certifications > Education. No section frames or folds; only the per-role "Details +" disclosure remains. One 960 px column with prose at 680 px, and a footer on every route. The check: CI smoke E2E green, and the home height within 10% of the boards (1440 px: 4525 → ~3000; 390 px: 6572 → ~4300).

Confirmed in that summary, from the grill's inspection answers and agent defaults:

- **Hero stats are derived from content**, one authority each. The cloud names are the Skills cloud row (AWS · Azure · Databricks), and `heroStats.clouds` is deleted. The certification count is the length of the certifications list. Years are the whole years since the first data role (Nov 2020), so the line reads "5+ years" until Nov 2026. The typed `heroStats` numbers leave.
- **"Read the story"** is the inline toggle on `resume.full`. No route exists, and a route is rc-4 territory.
- **The Earlier line.** Trie Engenharia flips to type `main` in three locales (data only). Earlier is `Experience.type === "minor"`: one localized line built from data, with the stored company names and a year range. There is no `shortName` field, and "Summer Internship" follows the data.
- **Role summaries** are `responsibilities[0]`, unclamped, with no new field.
- **Strings and footer** (agent default, unruled):
  - The footer lives in `SiteLayout` on every route. Its strings are in `siteChrome` (parity-checked); the email and links come from `profile`; the year is computed at build.
  - Other new home strings are flat keys, with a parity line added for them in `check-i18n-parity.mjs`.
- **Certifications and Skills are content edits.**
  - Certifications: one flat ruled list, newest first via `priority`, names without their level, dates as written, fields rendered verbatim. Orphan provider and badge assets stay, since `icon` is required by the schema; their deletion goes to the intake.
  - Skills: a `<dl>` in the board's order (Programming, Cloud, Data platforms, AI engineering, DevOps, Languages). "On-premises Data Technologies" is renamed "Data platforms" in three locales.
  - `RoleSkillBadges` and `HighlightProjectBlock` stay inside "Details +".
- **The rc-2 intake taken into rc-3:**
  - `siteChrome` becomes required, and the 3 non-null assertions are dropped.
  - The unused `achievements` text (0 readers) and the dead hero and label keys are deleted.
  - The README and repo `AGENTS.md` dead links are fixed.
  - The dead `useInView` mock in `Portfolio.test.tsx` is removed.
  - One full E2E run at the merge base names the 15 known failures (a one-off, not a gate).
  - Left out, to the intake or backlog: the type-step triple list, the live-content header tests, the other two own-hook mocks, and the orphan assets.

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
- Looping video on the home cards; the boards' card loop is replaced by the still poster.
- A `shortName` or `summary` field, or any other new schema field.
- Out of the rc-2 intake: the type-step triple list, the live-content header tests, the two other own-hook mocks (`ProjectsIndexPage.test`, `ProjectDetailPage.test`) and the orphan certification assets.
- Fixing the 15 pre-existing full-suite E2E failures beyond those a job's own change turns red. AC7.5 only names them.
- Any new gate, CI job, `verify:` step, merge check or `lighthouserc.json` change.

## 4. Requirements

Paths are relative to `frontend/`. Domain names: the home (`Portfolio`), its sections, `SiteLayout`, `ProjectCard`, the content JSON (`public/content/{pt,en,de}.json`), `profile`, `siteChrome`, the locale.

**Wave ranking.**

1. Law, skills and dev loop: none in rc-3.
2. Shared foundation: FR1 (content and contract) and FR2 (column and footer).
3. Features: FR3 (hero), FR4 (experience), FR5 (projects) and FR6 (skills, certifications, education), in parallel on disjoint files once FR1 lands.
4. Promote-facing: FR7 (the composed home, smoke specs, measured height) and the backlog exit at closure.

### FR1 — content holds one authority per fact

- **AC1.1** The three locale files have:
  - no `nowPanel`, `heroStats` numbers, `heroStatsSuffix.clouds`, `achievements` or `heroCTAs.seeProjects`;
  - none of the label keys the rebuilt sections stop reading: `careerProgression`, `roleSingular`, `rolePlural`, `certSingular`, `certPlural`, `viewCredential`, `validUntil`, `issuerLabel`;
  - no other key that `src/**` stops reading.

  `types/content.ts` declares none of them, and `siteChrome` is required. `Header.tsx`, `ThemeToggle.tsx` and `LanguageSelector.tsx` carry no non-null assertion on it. Test: unit (the three-locale parse test stays green); the reviewer greps `src/**` for each deleted key.
- **AC1.2** Trie Engenharia is `type: "main"` in all three locales. The three pre-data experiences stay `minor`. Test: unit (a content test asserts the `minor` set by company literal).
- **AC1.3** Certifications in each locale are ordered newest first by `priority`. Each `name` carries no level that `level` already states. Dates stay as written. Test: unit (a content test asserts the first and last names per locale as literals).
- **AC1.4** Skills in each locale are in the board's order: Programming, Cloud, Data platforms, AI engineering, DevOps, Languages. "On-premises Data Technologies" reads "Data platforms" in en, with its pt and de translations. Test: unit (a content test asserts the category order).
- **AC1.5** Every new home string is a flat key present and non-blank in all three locales: the Earlier label, the "Details" toggle, the story toggle and "All →". `check:i18n-projects` fails when one is missing in a locale. Test: integration (`check:i18n-projects` on a fixture missing one key).
- **AC1.6** The `i18n-strings.test.tsx` blocks live in each component's own test with their asserts unnarrowed, and the shared file is gone (test ruling). Test: unit; the reviewer compares the moved asserts.

### FR2 — one column, one footer

- **AC2.1** The home and the project shell read one column width of 960 px from one place. The hero story and the role summaries cap at 680 px. `max-w-5xl` is gone from `Portfolio.tsx`. Test: unit (the home's column element carries the shared width class). Visual: the reviewer's 1440 and 390 screenshots against the boards.
- **AC2.2** `SiteLayout` renders one `<footer>` after `<main>` on every route: `/`, `/projetos`, a project page and the 404. It shows the owner's name and the build year, the email from `profile`, and the LinkedIn and GitHub links from `profile`. Its labels come from the active locale's `siteChrome`. No email or URL literal sits in `src/**`. Test: unit (the layout on each route, per locale). E2E: the layout smoke asserts one `contentinfo` landmark.

### FR3 — hero

- **AC3.1** The hero renders one column: avatar, mono name and location line, the compact `h1#hero-heading` on the `text-hero` step (operator ruling 2026-06-11, kept), and one story line. It then shows the "Read the story" toggle, which expands `resume.full` inline with `aria-expanded`, the stat line, Download CV and the social links. There is no `$ now` panel and no projects CTA; exactly one CTA remains (test ruling). Test: unit (`HeroSection.test`).
- **AC3.2** The stat line reads `<n>+ <years> · <m> <certifications> · <clouds>`. Here n is the whole years since the earliest start of a `main` experience, m is the certification list's length, and the clouds are the items of the Skills cloud row joined by " · ". With today's content, it renders "5+ years · 11 certifications · AWS · Azure · Databricks" in en before Nov 2026. Test: unit (stat line with a fixed clock and a fixture, literals expected).
- **AC3.3** `HeroNowPanel` and its test are deleted (test ruling). Test: none; the deletion is checked by the reviewer's grep of `src/**`.

### FR4 — experience

- **AC4.1** Experience renders each `main` employer as one line (company, period, location) with a left rule and its roles beneath it. It has no card, no gradient rail and no "Career progression" label. Each role shows its title, its period and `responsibilities[0]` unclamped. Test: unit (`ExperienceCard`/`RoleCollapsible` tests: no card class, full summary text).
- **AC4.2** Each role has one "Details +" disclosure (`aria-expanded`, the `section_expand` and `section_collapse` track events kept). The disclosure reveals the remaining responsibilities, `RoleSkillBadges` and `HighlightProjectBlock`, and starts closed. Test: unit (`RoleCollapsible.test`).
- **AC4.3** After the employers, one Earlier line lists every `minor` experience in content order as `<title>, <company> (<year range>)`, joined by " · ", under the localized Earlier label. The company is the stored name, and the year range comes from `formatPeriod` in the active locale (e.g. `2015–18`, or one year when start and end match). Test: unit (pt, en and de fixtures, literal lines).
- **AC4.4** `#experiencia` and `#experiencia-heading` keep their ids. Test: E2E (T-LAY-05 unchanged).
- **AC4.5** Role periods render in the visitor's locale: month names, the present word and the duration units, for pt, en and de. The source is the period strings stored in `/content/<lang>.json` (`ARCHITECTURE.md` Structure), and no English word appears in a pt or de period. Test: unit (`formatPeriod` per locale, literals expected, e.g. the stored `02/2024 bis Heute` renders German words).
- **AC4.6** The highlight project's impact badge text and its accessible name come from the active locale's content. pt keeps "Impacto": the four `getByLabelText('Impacto')` asserts stay (`HighlightProjectBlock.test.tsx:52`, `ExperienceCard.test.tsx:111` and `:117`, `RoleCollapsible.test.tsx:180`), and en and de asserts are added. No assert is removed. Test: unit.

### FR5 — projects

- **AC5.1** The home's Projects section shows exactly two cards, rand-engine then dadaia-workspace, two per row from `md`, one per row below. Its heading row ends with an "All →" link (`data-testid="see-all-projects"`) to `/projetos`. `#projetos-destaque` keeps its id. Test: unit (`FeaturedProjects.test`).
- **AC5.2** `ProjectCard`, the one card of the home and `/projetos`, shows four things: the item's hero-media poster (`<img>` with width, height and alt), its name, its one-line purpose and, for a library item, `PyPI <pypi.version>`. An item without hero media keeps today's cover or placeholder. The card has no kind chip, badges or install hint. No `<video>` and no webm or mp4 URL is rendered or fetched on `/` (operator: "Still poster"). Test: unit (`ProjectCard` per kind). E2E: the home smoke asserts no `video` element under `#projetos-destaque`.

### FR6 — skills, certifications, education

- **AC6.1** Skills renders one `<dl>`: each category a `<dt>`, its items in one `<dd>` joined by " · ", in content order. `SkillCategoryCard` and its test are deleted (test ruling). The AI-stack assert lives in the `SkillsSection` test. Test: unit.
- **AC6.2** Certifications renders one flat list in content order. Each entry shows `<name> · <level>` and then a mono `<issuer> · <date>` line, fields verbatim, and links to the credential when `link` is not `#`. There is no provider grouping, logo, badge or count. `CertificationCard`'s old test leaves (test ruling), and `#certificacoes` keeps its id. Test: unit. E2E: T-LAY-06 unchanged.
- **AC6.3** Education renders one entry without a frame or location chip: degree, year, institution and coursework, then the thesis link. Test: unit.

### FR7 — the home, composed and checked

- **AC7.1** The home renders exactly Hero, Experience, Projects, Skills, Certifications and Education, in that order. `Portfolio.test.tsx` asserts the order with literal ids and has no `useInView` mock. Test: unit. E2E: T-LAY-05.
- **AC7.2** No home section is a card or a fold. `MobileCollapsibleSection` and its test are deleted (test ruling), and the only disclosures on the home are the per-role "Details +" and the story toggle. Test: unit (the composed home has no `[data-state]` section trigger other than these).
- **AC7.3** Measured as the as-is review measured (production build, `vite preview`, Chromium, reduced motion, dark, every role closed, en), the home's `documentElement.scrollHeight` is 2700–3300 px at 1440×900 and 3870–4730 px at 390×844. Test: none, since a height assert would be a new gate. Evidence: the FR7 job's hand-back states both numbers and the pt figures beside them.
- **AC7.4** SMOKE-05 clicks the header Projects link (test ruling). Every smoke spec that selected a removed home element changes in the job that removes it. CI's `e2e` smoke job is green on the rc PR head. Test: E2E (the smoke set).
- **AC7.5** The full E2E suite runs once on chromium at the rc-3 merge base, before the FR7 job changes any spec. The job hand-back names the failing tests, and the names go to the main thread's intake. This run is a one-off and adds no gate. Test: none; evidence is the run's list.
- **AC7.6** `README.md` and the repo `AGENTS.md` link only to paths that exist under `specs/`. The README's CI row names what `ci.yml` runs, and its dev-server port matches `vite.config.ts`. Test: none (documentation); the reviewer opens each link.
- **AC7.7** The repo `verify:` line (`npm --prefix frontend run verify`) exits 0 on every job merge and on the rc PR head, unchanged. Test: the existing suite plus this rc's unit tests.

### Replaces

- The `$ now` panel (`HeroNowPanel`, `ContentData.nowPanel` and its three locale blocks) (AC3.3, AC1.1).
- The hand-typed `heroStats` numbers, `heroStatsSuffix.clouds` and their fallback literals in `HeroSection` (AC3.2).
- The hero's second column, its 3-line bio clamp with See more, and the "See projects" CTA (AC3.1).
- The employer card with its gradient rail and "Career progression (n roles)" label, the bordered role card and the 2-line summary clamp (AC4.1).
- The three pre-data roles as full cards (AC4.3).
- English-only period words in every locale and the literal "Impacto" badge in en and de (AC4.5, AC4.6).
- The section folds (`MobileCollapsibleSection` around four sections) and every section card (AC7.2).
- `SkillCategoryCard`, its icon map and its uninterpolatable gap classes (AC6.1).
- The provider-grouped certificate tiles: logos, 48 px badge box, counts and hover tile (AC6.2).
- The framed education card with its location chip (AC6.3).
- The third featured card and the three-column grid (AC5.1).
- The `ProjectCard` kind chip, badges, install hint and hover lift (AC5.2).
- The 1024 px home column (AC2.1).
- The optional `siteChrome` and its three non-null assertions; the unread `achievements` and dead label keys (AC1.1).
- `i18n-strings.test.tsx` as one file shared by three features (AC1.6).
- The dead `useInView` mock in `Portfolio.test.tsx` (AC7.1).
- The README's and repo `AGENTS.md`'s dead `specs/` links (AC7.6).

### Closure

- `backlog.py exit resume-refinement --disposition delivered --release 0.1.0` at the reconcile.
- The summary records AC7.3's measured heights and AC7.5's failing-test names.
- It also records rc-2's carried AC4.7 and AC5.5 stage evidence, collected 2026-10-25:
  - PR #34 merged into develop as `11ac2bb`;
  - deploy run https://github.com/marcoaureliomenezes/portifolio/actions/runs/40194175406 succeeded;
  - stage `/projetos/rand-engine` answers 200 `text/html`, and the spec-to-dataframe and init-workspace desktop webm answer 200 `video/webm`;
  - stage `en.json` serves 0.4.7 and no 0.5.0;
  - the stage Playwright pass ran 24/24 OK (2 pages × pt/en/de × 1440/360 × motion/reduced);
  - facts: 13/13 match their sources at tags `0.8.0` and `v0.4.7`.
- Memory: one atom for the home resume (sections, order, the Earlier rule, derived hero stats, localized periods). `site-chrome` gains the footer and the one shared column, and its boundary line "The resume's own sections … outside this frame" is updated. `content-contract` drops the deleted keys and records the parity line for the home strings.

## 5. Constraints and risks

| risk | answer |
|---|---|
| `formatPeriod.ts` serves both the role periods (AC4.5) and the Earlier line's year range (AC4.3). | One job owns `formatPeriod.ts` and both ACs, or the PLAN draws the edge between the two jobs. |
| `smoke-e2e-encodes-the-pre-rc2-header` showed that a smoke spec encoding a removed element turns CI red after the merge. | AC7.4: the job that removes a home element changes the smoke spec that selects it in the same job, and the PLAN lists each spec per job. |
| Restyling `ProjectCard` touches `/projetos`, whose unit and E2E tests may assert the removed chip, badges or install hint. | The PLAN lists each such assert. Moving or narrowing one needs the main thread's ruling, named in its `test(...)` commit. No other assert is removed. |
| Making `siteChrome` required forces every full `ContentData` fixture to carry it (14 test files import the type). | The FR1 job owns those fixtures; its `W:` names each one. |
| `content-schema.mjs` carries a resolved fix chain (`content-schema-export-is-empty` → `content-schema-rejects-committed-content`). | rc-3 adds no schema field. Content edits stay inside the one schema, and `schema:check` stays green. |
| PRs run only the 9 smoke specs; the 8 full-suite specs that reach `#experiencia` run weekly. | Each job hand-back carries local chromium runs of the E2E files its change reaches. |

## 6. Open questions

None.
