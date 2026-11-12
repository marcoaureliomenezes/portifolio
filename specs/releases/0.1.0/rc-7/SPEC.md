# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-11-12
**Origin:** operator-demand

---

## Bug window review

**Window:** the records resolved since rc-6 was defined (2026-11-11T04:12:25Z, `_RELEASE.json` `defined.ts`). `bugs.py status`: 0 open. `BUGS.jsonl` is empty. The newest `closed_at` in `specs/bugs/_archive/bugs_histo.jsonl` is 2026-11-08T00:16:23Z, and `git log --since=2026-11-11T04:12:25Z -E --grep '^(fix|refactor)\(bugs\): '` prints nothing. **0 records are in the window, so there is no fix to judge and no REBUILD to propose.** rc-6's review judged every earlier record.

The ledger slice of the units this candidate touches (`LINEAGE.md` §The filter):

| unit | fixes | reading |
|---|---|---|
| `frontend/vendor/analytics-sdk/**` | `338a964` (`analytics-beacons-the-page-without-an-endpoint`, HIGH) | Until that fix, every deployed build POSTed its event queue to the page's own URL. The fix left the SDK inert with no endpoint. FR1 deletes the unit and its bug surface. |
| `terraform/modules/portfolio-static-site/iam.tf` | `438e193`, `171db50` | Both deleted lines and added no layer. FR2 adds one attribute and the two data sources it reads. |
| `src/deployRolePolicy.test.ts` | the RED test `32269ed`, rebuilt by rc-6 AC3.1 | This is the third shape of this test in two candidates: a forbidden-word list, then three regex collectors over HCL. rc-6's reviewer found that the collectors still pass three probes: a `NotAction` statement, `Action = local.x` and `Statement = concat(…)`. The structural cause is that the test parses HCL with regexes. AC2.2 deletes the parser: each block is compared as one literal. |
| `tests/e2e/projects-cluster/layout-shell.spec.ts` | `8a9e766` (`layout-shell-title-read-races-the-language-switch`) | The family's last one-shot read (`:120`) is AC3.3. |

## 1. Problem

The operator's demand, as the main thread's brief states it on 2026-11-12, is: every audit finding fixed, and the portfolio managed by the central panel with working analytics. The main thread's intake records the same goal at item 192. The as-is review (read-only, tree clean, `verify:` measured at 32.5 s) and the main thread's grill positions of 2026-11-12 fix the picked set below. The scope is closed.

Read in this tree at `222c7b8`. Paths are relative to `frontend/` unless they start with `terraform/`, `.github/` or `specs/`.

1. **The vendored analytics SDK contradicts the central panel's analytics contract**, which keeps counters only, with no cookie, no storage and no identifier.
   - `vendor/analytics-sdk/**` is 7 tracked files and 262 lines; its `src/` is 170 of them.
   - The SDK is installed as `@dadaia/analytics-sdk` (`package.json:30`, three `package-lock.json` entries). `.gitignore:15-16` exempts its `dist/`.
   - `main.tsx:9-17` calls `init` with `VITE_ANALYTICS_ENDPOINT`. `.env.example` holds only that variable, and no workflow sets it.
   - There are 8 `track` calls: `App.tsx:45`, `ThemeToggle.tsx:19`, `LanguageSelector.tsx:35`, `HeroSection.tsx:80`, `ProjectCard.tsx:25`, `RoleCollapsible.tsx:31` and `LibraryProjectTemplate.tsx:39,62`.
   - With an endpoint set, `init` writes a per-tab UUID to `sessionStorage` under `dadaia_session_id` (`src/session.ts:13-18`). Every event carries it.
   - With no endpoint, which is every build since `338a964`, `init` returns early, so each `track` is a no-op and nothing is stored. Before `338a964`, every build POSTed its queue to its own URL. No event ever reached an ingest endpoint.
   - The copy callback `CodeBlock`'s `onCopy` (`CodeBlock.tsx:9,29`) has one producer, the `copy_install` track call at `LibraryProjectTemplate.tsx:62`.
2. **The deploy role has no permissions boundary.** The central panel's bootstrap gives this repo's apply role IAM role writes only on a role that carries the boundary policy named `portifolio-roles-boundary`. It also allows `iam:PutRolePermissionsBoundary` only with that ARN (the panel's `terraform/bootstrap/roles.tf:45,60,194-206`). That boundary holds every action of the deploy policy: S3 object writes and reads, bucket listing, and CloudFront invalidation (the panel's `terraform/bootstrap/boundary.tf:10-15,108-124`). `aws_iam_role.github_actions_deploy` (`iam.tf:18-44`) sets no `permissions_boundary`. So from the bootstrap's apply on, any change to its inline policy is refused.
3. **Test hygiene.**
   - Three test files change the process cwd at module scope: `process.chdir(frontend)` at `src/lib/blogFeed.test.ts:15`, `src/lib/blogPages.test.ts:13` and `src/lib/buildBlog.test.ts:16`. vitest already runs in `frontend/`.
   - `BlogIndexPage.test.tsx:83-88` repeats the order assert of the `it.each` at `:70-81` on the same fixture.
   - In `layout-shell.spec.ts`, PC-E2E-35 reads the title once (`:120`) and uses it as the expected value. Its `not.toHaveTitle(titlePT)` (`:124`) passes against any other title, the default included.
   - The parity check's section-media call (`scripts/check-i18n-parity.mjs:317`) has no test. Removing it alone keeps the suite green, while the hero-media call (`:278`) is pinned at `src/lib/homeParity.test.ts:54-59`.
4. **Workflows.**
   - Six `${{ }}` expressions sit inside `run:` scripts: `deploy.yml:113` and `:183` (the distribution ids), `deploy.yml:121` and `:191` (`github.sha`), and `terraform.yml:51` and `:53` (the state bucket and region).
   - `ci.yml:140` runs `npx playwright install --with-deps chromium`. On PR #38 it failed three runs in a row on the runner's apt mirror, and no test ran (intake item 195). The Lighthouse job on the same `ubuntu-24.04` image runs Chrome with no install step (`ci.yml:155-176`).

## 2. Measurable Goals

| # | goal | today | target | source |
|---|---|---|---|---|
| 1 | tracked files under `vendor/analytics-sdk/` | 7 (262 lines) | 0 | AC1.1 |
| 2 | `track` and `init` calls in `src/` | 8 + 1 | 0 | AC1.1 |
| 3 | code paths that write a visitor identifier to browser storage | 1 | 0 | AC1.1 |
| 4 | deploy roles carrying `portifolio-roles-boundary` | 0 of 2 | 2 of 2 | AC2.3 |
| 5 | policy-test probes that pass with a changed policy (intake 179) | 3 | 0 | AC2.2 |
| 6 | `process.chdir` calls in test files | 3 | 0 | AC3.1 |
| 7 | parity-check media calls with no test that turns red when the call is removed | 1 | 0 | AC3.4 |
| 8 | `${{ }}` expressions inside `run:` scripts, across the four workflows | 6 | 0 | AC4.1 |
| 9 | `--with-deps` in `ci.yml` | 1 | 0 | AC4.2 |

## 3. Non-goals

Each item is OUT, with its reason:

- **The central panel's beacon script tag.**
  - The beacon is live only after the panel's promote. An E2E spec fails on any console error (`role-collapsible.spec.ts:44-53`), so a tag pointing at a dead beacon reddens CI.
  - A one-job candidate adds the tag after the panel's promote (§6).
- **A privacy footer line.** After FR1, the site stores only the visitor's own language and theme choices, in `localStorage` (`LanguageContext.tsx:174`, `useTheme.ts:31`). It stores no identifier and sets no cookie, and the panel's pipeline keeps counters only.
- **The two other sites the panel manages.** They belong to the second round.
- **`ci-weekly.yml:36`'s `--with-deps`.** It also installs WebKit, which the Lighthouse job's Chrome says nothing about, and the weekly run gates no merge.
- **The backlog entry `switch-restores-the-content-exclusion`.** This pick does not take it, so it stays active.
- **Any new gate, CI job, `verify:` step, merge check or dependency.** AC4.1's test reads the workflow files as text.

## 4. Requirements

Domain names: the SDK (`@dadaia/analytics-sdk`), the deploy role (`aws_iam_role.github_actions_deploy`), the deploy policy (`aws_iam_role_policy.github_actions_deploy`), the boundary (`portifolio-roles-boundary`), the parity check (`scripts/check-i18n-parity.mjs`), the build (`scripts/build-blog.mjs`), stage and prod.

**Wave ranking:**

1. Law, skills, dev loop: FR4 (the workflows) and FR3 (test hygiene).
2. Shared foundation: FR1, which touches the dependency, the entry point and shared components.
3. Features and bugs: FR2, the deploy role.
4. Promote-facing: AC2.3's applies, AC4.1's and AC4.2's live runs, and §5's carried checks.

The as-is review found the four write sets disjoint, so the PLAN schedules them in parallel.

### FR1 — the site sends and stores no analytics

- **AC1.1** The SDK and everything that reaches it leave:
  - `vendor/analytics-sdk/**`;
  - the `package.json:30` dependency and its lock entries, with the lock regenerated;
  - `.gitignore:15-16`;
  - `.env.example`;
  - the `init` call (`main.tsx:9-17`);
  - the `page_view` effect (`App.tsx:8,43-46`);
  - the 8 `track` calls of §1.

  Test: no new test, since this is a deletion. The reviewer greps `analytics-sdk`, `track(`, `VITE_ANALYTICS` and `sessionStorage` under `frontend/` (excluding `node_modules/`) and finds 0 hits. `verify:` (its `npm ci` included) exits 0.
- **AC1.2** The deletion leaves no dead parameter:
  - `CodeBlock` loses `onCopy`, whose only producer was the deleted call;
  - `LibraryProjectTemplate`'s `link` loses its `action` argument;
  - each wrapper handler that only added a `track` call (`ThemeToggle.tsx:15-20`, `LanguageSelector.tsx:32-37`, `RoleCollapsible.tsx:28-32`) keeps its one remaining act.

  The theme toggle, the language switch, the role disclosure, the CV download, the project card link and the copy button behave as today. Test: unit and E2E, the existing cases of each component pass.
- **AC1.3** *Operator ruling, granted by approving this SPEC.* The repo's test law removes an assert only on the operator's order. Approving this SPEC is that order for exactly these removals, and nothing else:
  - `src/lib/analyticsBeacon.test.ts`, the whole file: 2 cases, 3 asserts;
  - `LibraryProjectTemplate.test.tsx:328`, `:329-332` and `:341`, the track asserts. The `writeText` asserts of those cases stay, and their titles lose "tracks …";
  - `RoleCollapsible.test.tsx:279-287`, a case that asserts only `track`: 2 asserts;
  - `ProjectSections.test.tsx:154`, 1 assert. The title at `:149` loses "and tracks nothing";
  - `CodeBlock.test.tsx`:
    - `:38-43`, the `onCopy` case, 1 assert;
    - `:52`, the `onCopy` assert of the reject case, whose label asserts `:53-54` stay;
    - `:64-70`, a case that only repeats `:38-43` plus the track assert: 2 asserts;
  - each file's `vi.mock` of the SDK and its `track` import or `mockClear` (`LibraryProjectTemplate.test.tsx:18,26,33`, `RoleCollapsible.test.tsx:16,28`, `ProjectSections.test.tsx:18,20,26`, `CodeBlock.test.tsx:3,6`, `blogRoutes.test.tsx:5-6`).

  13 asserts in total. They land as `test(` commits that name this AC and the operator's approval. Test: unit, the remaining cases pass.

### FR2 — the deploy role under the boundary

- **AC2.1** `iam.tf` declares `data "aws_partition" "current"` and `data "aws_caller_identity" "current"`. The deploy role sets:

  `permissions_boundary = "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:policy/portifolio-roles-boundary"`

  No literal account id appears in any file. The deploy policy and the trust are unchanged. Test: unit, AC2.2.
- **AC2.2** `src/deployRolePolicy.test.ts` is rebuilt. It reads the deploy role block and the deploy policy block from `iam.tf` and compares each, as one string, with `toBe` against a literal. This replaces its four cases (found, statement keys, actions, resources).
  - The reviewer edits a scratch copy and sees red for each of: the `permissions_boundary` line removed, `"s3:*"` added, a `NotAction` statement added, `Action = local.x`, `Statement = concat(…)`.
  - The rebuild is a `test(` commit that names the main thread's ruling, which this SPEC's approval grants. Each assert tightens, because any edit to either block turns it red.

  Test: unit.
- **AC2.3** *Live check, CI only.* This repo forbids local AWS (`AGENTS.md`, "Sem credenciais AWS locais"), so every AWS act runs in GitHub Actions. After the central panel's bootstrap is applied (§6) and the rc PR merges into develop, `terraform.yml` is dispatched for stage, then for prod. Each run must show:
  - a plan of `0 to add, 1 to change, 0 to destroy`, where the change is the deploy role updated in place;
  - the no-delete-or-replace guard green;
  - the apply green.

  Then the next stage deploy run is green. Test: integration, live, once. The evidence is both dispatch run ids and the deploy run id.

### FR3 — test hygiene

- **AC3.1** The three `process.chdir(frontend)` lines (§1.3) leave. Each of the three files passes run alone from `frontend/` (`npx vitest run <file>`) and under `verify:`. A case that needs another root passes it to the build as an argument and never changes the process cwd. Test: unit, the existing cases.
- **AC3.2** *Operator ruling, granted by approving this SPEC.* `BlogIndexPage.test.tsx:83-88` ("renders the index in the order the data holds, not by date") leaves, together with its 1 assert. The `it.each` at `:70-81` asserts the same order on the same fixture in pt, en and de. Test: unit, the `it.each` passes. The reviewer adds a date sort to the page and sees the `it.each` go red.
- **AC3.3** PC-E2E-35 (`layout-shell.spec.ts:110-133`) reads no title with `page.title()`. Each title assert compares against a literal:
  - the project page's pt title replaces `titlePT` at `:128`;
  - `toHaveTitle(<the index's pt title>)` replaces `not.toHaveTitle(titlePT)` at `:124`.

  The move is a `test(` commit that names the main thread's ruling, which this SPEC's approval grants. Test: E2E, the spec passes.
- **AC3.4** `src/lib/homeParity.test.ts` gains one case next to `:54-59`. It runs over a copy of the locales in which one locale's `sections[<s>].media[<i>]` lacks an optional key (`alt` or `caption`) that the other locales carry. The parity check exits non-zero with a line naming that locale and the `.sections[<s>].media[<i>]` path. Test: integration. The reviewer removes the call at `check-i18n-parity.mjs:317` alone and sees the case go red.

### FR4 — workflows

- **AC4.1** No `run:` script in `.github/workflows/*.yml` holds a `${{ }}` expression.
  - The four expressions at `deploy.yml:113,183` and `terraform.yml:51,53` are read from `env:` as quoted shell variables.
  - The two `${{ github.sha }}` at `deploy.yml:121,191` read the runner's `$GITHUB_SHA`.

  Test: unit, one test in `src/` that reads the four workflow files as text, with no new dependency. The reviewer puts one expression back into a scratch copy and sees it go red. Live: AC2.3's dispatch runs and the next stage deploy run are green.
- **AC4.2** `ci.yml:140` installs Playwright's Chromium without `--with-deps`. Test: integration, the rc PR's `CI / E2E` job is green. Fallback, if the browser cannot launch: the CI project runs on channel `chrome`, the runner's installed Chrome, and the install step goes. The job's hand-back states which form landed.

### FR5 — the gate

- **AC5.1** The repo's `verify:` line exits 0, unchanged, on every job merge and on the rc PR head. Every CI job on the rc PR is green. Test: the existing suite plus this rc's tests.

### Replaces

- The SDK, its `@dadaia/analytics-sdk` dependency and lock entries, and the `.gitignore` exception for its `dist/` (AC1.1).
- The `init` call and `VITE_ANALYTICS_ENDPOINT` with its `.env.example` (AC1.1).
- The events `page_view`, `theme_toggle`, `language_switch`, `cv_download`, `project_cta` (card, links, copy install), `section_expand` and `section_collapse` (AC1.1).
- The per-tab `dadaia_session_id` the SDK writes to `sessionStorage` once an endpoint is set (AC1.1).
- `CodeBlock`'s `onCopy` callback and `link`'s `action` argument (AC1.2).
- The beacon tests and the track and `onCopy` asserts of AC1.3.
- A deploy role with no permissions boundary (AC2.1).
- The policy test's regex collectors over HCL (AC2.2).
- Module-scope `process.chdir` in three test files (AC3.1); the duplicate order case (AC3.2).
- PC-E2E-35's one-shot title read and its `not.toHaveTitle` (AC3.3).
- `${{ }}` expressions inside `run:` scripts (AC4.1); `--with-deps` in `ci.yml` (AC4.2).

### Closure

- Memory:
  - the atom `analytics-sdk` is deleted, and the catalog and index are regenerated;
  - `library-page` drops its `track("project_cta", …)` line (`library-page.md:49`);
  - `deploy-infrastructure` records the boundary, the literal policy test and the `env:`-only workflow scripts;
  - `e2e-suite` records the CI install line;
  - `memory.py drift` lists no uncovered unit.
- The AC2.3 run ids and AC4.2's landed form go in the closure summary.

## 5. Carried live checks (owed by rc-5 and rc-6)

The releases law hand-writes only a `summary` and an operator-authorization `note` into `_RELEASE.json`. A closed candidate is never amended. An evidence note for rc-5 or rc-6 therefore has no home in this candidate, so each check is carried here. rc-7's closure summary names each one: in `delivered` with its run id once collected, or in `carried` while it waits on the promote. The run ids below are read from the main thread's intake report (items 163-165, 185, 195).

| owed by | check | state |
|---|---|---|
| rc-5 AC2.1–AC2.3 | the plans, the applies and the stage checks | Collected. The develop runs at `61b5c7e` are Deploy 42941809049 and CI 42941809057. The `terraform.yml` dispatches are stage 43033017567 and prod 43033212849, each "2 added, 2 changed, 0 destroyed". The stage schema check ran on 2026-11-11. Still due: the prod schema check, after the promote. |
| rc-5 AC1.4 | the Dependabot read: 0 open alerts and none dismissed | Due at the promote. |
| rc-5 AC1.2 | the evidence run the rc-5 review found uncited (intake 163) | To be cited in rc-7's closure summary. |
| rc-5 AC3.2, AC3.4 | the operator's "Aceito as duas (Recommended)" | Already recorded in the approved `rc-6/SPEC.md:28`. Nothing is owed. |
| rc-6 AC3.3 | the stage deploy run and `/schema/site-content.schema.json` answering 200 | Collected on 2026-11-12: develop CI 43156369853 and Deploy 43156369842. Still due: the prod check, after the promote. |
| rc-6 AC6.2 | `verify:` and CI on the rc PR head | Collected: PR #38 was green on the fourth attempt of run 43039708160. The three reds were the apt mirror, which AC4.2 removes. |

## 6. Constraints, risks and the promote order

**Order after approval:**

1. The operator applies the central panel's bootstrap, which creates the boundaries.
2. This candidate runs.
3. The 0.1.0 promote, which gives prod the published content schema the panel's Studio build needs.
4. The central panel's promote.
5. The candidate that adds the beacon tag.

| risk | answer |
|---|---|
| The boundary policy is missing when AC2.3 applies, so `PutRolePermissionsBoundary` fails. | Order step 1 comes first. A failed apply changes nothing and is re-dispatched. |
| The boundary is narrower than the deploy policy, so the deploy breaks. | The boundary holds all six deploy actions (§1.2). AC2.3 ends on a green stage deploy before prod is dispatched. |
| The plan carries drift beyond the role. | rc-5's applies were green on 2026-11-11, and since then `terraform/` has changed only by rc-6's deletion of a data source. The guard refuses any delete or replace, and AC2.3 reads the plan line. |
| Chromium does not launch without its system packages. | AC4.2's fallback is channel `chrome`. |
| The literal policy test turns red on a format-only edit to `iam.tf`. | That is intended: the block and its literal change in one commit. `terraform fmt -check` runs in the dispatch. |
| The portfolio has no analytics until the beacon-tag candidate lands. | Accepted by the order. No event was ever ingested before this candidate either. |
| `WT merge` refuses an implementation commit that touches the repo's `tests:` globs. | Every task that touches a test is a `test(` commit in its own tree. |

## 7. Open questions

None for the operator beyond approving this SPEC. The approval grants the test rulings of AC1.3 and AC3.2 and the assert moves of AC2.2 and AC3.3.
