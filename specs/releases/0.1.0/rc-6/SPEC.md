# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-11-11
**Origin:** operator-demand

---

## Bug window review

**Window:** the records resolved since rc-5 was defined (2026-11-07T18:45:20Z, `_RELEASE.json` `defined.ts`), five records. rc-5's window review judged every earlier one. `BUGS.jsonl` is empty, so all five are read from `specs/bugs/_archive/bugs_histo.jsonl`. `bugs.py status`: 0 open. Each fix and its RED test were read with `git show --stat --patch`.

| record | fix | what it changed | overfitting check | verdict |
|---|---|---|---|---|
| `readme-node-floor-below-what-the-build-needs` | `c909c7b` | `engines.node` in `frontend/package.json` is the one statement of the Node floor. The README names the field instead of a number, and the lock's root entry is synced. | No branch and no assert changed. It deletes the README's second copy of the number. | KEEP |
| `terraform-workflow-cannot-plan-or-apply` | `438e193`, `c7540a5` | `terraform.yml` becomes one dispatched apply per environment on the infra role, and the bootstrap script creates only the OIDC provider. 342 lines are deleted. Its RED tests are `40c58c3` and `d1ac240`. | It replaces the PR, push and destroy-bootstrap paths and adds no layer. The record's `expected` was superseded by the operator ruling of 2026-11-07. It left the deploy role's state statement dead, which became the child record below. That was a missed deletion, not a layer, and `171db50` deleted it. | KEEP |
| `blog-pending-test-waits-by-clock` | `4254018` | Two pending cases wait on the index fetch with `vi.waitFor` instead of sleeping 50 ms. | The change is test-only, and the "no empty message / no 404 while pending" asserts are kept. Net +1 line. This is the same wait-by-clock family as `layout-shell-title-read-races-the-language-switch` (correlates). The family's remaining one-shot read, `layout-shell.spec.ts:132`, is AC2.4. | KEEP |
| `deploy-role-can-write-terraform-state` | `171db50` | Deletes the deploy role's state statement (−14 lines). Its RED test is `32269ed`. | The fix is a deletion, so it is KEEP. Its RED test, `deployRolePolicy.test.ts:16`, is a forbidden-word list: it stays green for any grant whose text it does not name (`"s3:*"`, as-is review D3). That test pins the symptom's words, not the policy. | fix KEEP; RED test REBUILD, carried by AC3.1 (candidate scope, entry 3) |
| `library-scene-second-media-leaves-the-media-column` | `0a92d60` | A scene's media list renders inside one cell, so the scene grid has two children. Its RED test is `a84bc35`. | No assert is loosened. The fix adds one branch, `media?.length ? … : null` (`LibraryProjectTemplate.tsx:89`). No fixture scene lacks media, since both scenes in `richProject` carry it, so the branch's false partition is unpinned. | KEEP. AC2.7 pins the unpinned partition (entry 2's class). |

There is no REBUILD of a fix, so no bug is proposed. The one REBUILD is a RED test, and AC3.1 carries it inside the picked set. `bugs.py stats`: no REBUILD due.

## 1. Problem

The operator ruled on the 2026-11-11 intake (the main thread's `0.1.0-intake-ruling.md`) with "Aprovo, drenar antes (Recommended)". The 10 grouped entries are drained before the promotes, and entries 1–5 are this repo's rc-6. With "Aceito as duas (Recommended)", the rc-5 summary's readings of AC3.2 and AC3.4 hold.

Read at `66e643f` (as-is review handoff `2026-11-11T032902Z`; grill handoff `2026-11-11T033022Z`, 9 rulings, 0 operator questions):

1. **The content contract.**
   - The label shape is written twice: the type (`src/types/content.ts:132-235`) and the content contract (`scripts/content-schema.mjs:115-155`). zod strips an unknown nested key. A locale with an extra `siteChrome.nav.newKey` parses with success, the key is dropped, and no test fails. The locale-parse test (`src/lib/contentSchemaExport.test.ts:146-152`) never compares the parse to its input.
   - `HttpUrl` (`src/lib/schemas/projects.ts:14`) accepts any port: `(:\d+)?`.
   - `Email` (`projects.ts:15`) is quadratic (CWE-1333). A 50 000-character input takes 1798.6 ms with the old regex and 0.1 ms with the linear one.
   - The `Consumers:` line in the content contract's docstring (`content-schema.mjs:8`) lists importers and goes stale.
2. **Unpinned rules.**
   - `checkMediaListParity` (`scripts/check-i18n-parity.mjs:244-252`) has no direct test.
   - The install command is asserted with `toContain` (`LibraryProjectTemplate.test.tsx:401`).
   - The case titled "newest first" (`BlogIndexPage.test.tsx:74`) proves no order. Since rc-5 AC5.2, the page holds no sort, and the fixtures are already newest first.
   - The label is read at module scope (`tests/e2e/projects-cluster/nav-projects.spec.ts:12`).
   - The title is read once with no wait (`layout-shell.spec.ts:132`).
   - A task id sits in an E2E title (`tests/e2e/pages/language-switch.spec.ts:60`).
   - A path is split on `/` (`contentAssets.test.ts:69`).
   - The question of whether a missing posts root is valid.
   - A scene with no media is untested: the branch `0a92d60` added at `LibraryProjectTemplate.tsx:89` has no case for its false partition.
3. **The deploy.**
   - The policy test is a forbidden-word list.
   - `data "aws_caller_identity" "current"` (`terraform/modules/portfolio-static-site/iam.tf:11`) has 0 readers.
   - `deploy.yml` interpolates `${{ vars.S3_BUCKET }}` (8 uses) and `${{ vars.DOMAIN }}` (2 uses) into shell text (CWE-78).
   - The prod row of the README's CI/CD table (`README.md:60`) omits the schema upload.
4. **The test harness.**
   - Playwright's `webServer` starts even when `E2E_BASE_URL` names a running site (`playwright.config.ts:47`).
   - Three blog test files spawn `node scripts/build-blog.mjs` per case: 27 runs (13 + 9 + 5). A 5000 ms timeout bug, `blog-media-poster-test-spawns-three-builds-and-times-out`, already came from this pattern. The four spawning files take 6.41 s together.
5. **Dependencies.** Lighthouse uploads every report to temporary-public-storage (`lighthouserc.json:51-53`). Nothing reads the upload.

The published schema is read by one other repo of the context, in two places:

- the panel's Studio generator maps its `pattern` values;
- the panel's site-sync validates live Sanity docs against it with Ajv.

FR1 changes 20 of its lines, all patterns: 19 URL and 1 Email. The PLAN regenerates the file. The pre-mortem found 0 engine disagreements on the candidate patterns, across `RegExp` with and without `u`, Ajv2020 with the site-sync defaults, the Studio rule and zod.

Glossary:

- `<site>`: the site's registry slug, as in rc-5.
- **The panel's recipe**: the panel's 0.2.0 rc-2 J4.T1 check, its AC4.5. It runs `typesFor` over `<site>` and the published schema, then runs `sanity schema validate` on a git-ignored copy of the emitted type, and removes the copy.

## 2. Measurable Goals

| # | goal | today | target | source |
|---|---|---|---|---|
| 1 | `Email` on a 50 000-character adversarial input | 1798.6 ms | under 50 ms (measured 0.1 ms) | AC1.1 |
| 2 | ports outside 1–65535 that `HttpUrl` accepts | all | 0 | AC1.3 |
| 3 | nested unknown keys the locale-parse test lets pass | any | 0 | AC1.4 |
| 4 | policy actions or resources the policy test lets through unlisted | any | 0 | AC3.1 |
| 5 | `${{ vars.… }}` expressions inside `deploy.yml` `run:` scripts | 10 | 0 | AC3.3 |
| 6 | per-case `build-blog.mjs` spawns in the three blog test files | 27 | only the CLI-contract cases | AC4.2 |
| 7 | Lighthouse report uploads per run | 1 | 0 | AC5.1 |

## 3. Non-goals

Each item is OUT, with the grill's reason:

- **Deriving `ContentData` from the content contract.** It would delete about 104 lines. But the spike gave 15 `tsc` errors, since the `.mjs` is untyped. The real form needs the schema renamed to `.ts`. It also needs `id`, `schema_version`, `published_at` and `projectsV2` made required, which breaks the fixtures of 30 files. AC1.4's one assert closes the strip instead, and the type stays a hand-written consumer view.
- **Counting `.min` in code points instead of UTF-16 units.** The only lengths are `.min(1)`, which gives the same verdict under both counts, and one `.min(3)` on an array, which counts items. No field and no committed value is affected.
- **Merging the two deploy jobs.** A matrix cannot carry the job-level `if` and `environment`. A reusable workflow costs a new file, `secrets: inherit` and an operator-side secret rename.
- **Exit text for the kept overrides, or dropping one.** All three nested overrides are needed, measured with `npm audit` after removing each:
  - `basic-ftp`: 9 high;
  - `postcss-selector-parser`: 2 moderate;
  - `minimatch`: 7 moderate once the lock's nested entry is dropped too.

  JSON takes no comment, and the check is `npm audit` at the next dependency pass.
- **Importing the export script in process.** `export-content-schema.mjs` runs and exits at import, so its one `--check` spawn is the CLI's own contract.
- **The recipe's leftover vite child.** It belongs to a command run outside the repo, not to repo code. Once AC4.1 holds, the one Playwright-owned server dies with the run.
- The panel's entries 6–10 of the same ruling. They belong to the panel's own candidate.
- The backlog entry `switch-restores-the-content-exclusion`. It stays active, since this ruling did not pick it.
- Bounding the port in the other site's own https rule. That rule lives in another repo of the context and is separate from this one; it is logged to intake.
- Any new gate, CI job, `verify:` step or merge check. AC6.1 runs once, outside every gate.

## 4. Requirements

Paths are relative to `frontend/` unless they start with `terraform/`, `.github/` or `README.md`.

Domain names:

- the content contract (`scripts/content-schema.mjs`);
- the one project schema (`src/lib/schemas/projects.ts`);
- the export and the published schema (`public/schema/site-content.schema.json`);
- the locale;
- the post reader (`scripts/blog-posts.mjs`) and the build (`scripts/build-blog.mjs`);
- the parity check;
- the deploy, the module, stage and prod.

**Wave ranking:**

1. Law, skills, dev loop: FR4, the test harness.
2. Shared foundation: FR1, the content contract.
3. Features and bugs: FR2, FR3 and FR5, each on its own files.
4. Promote-facing: AC6.1, after FR1 merges, and AC3.3's stage check, after the rc PR merges into develop.

The as-is review found the five write sets disjoint. The PLAN schedules the waves and the agent cap.

### FR1 — the content contract: linear rules, a bounded port, a lossless parse

- **AC1.1** `Email` is the linear `^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$`. Its verdict on `a@` followed by 50 000 `.` and one space takes under 50 ms. Test: unit, in `src/lib/schemas/projects.test.ts`. The bound sits 500 times above the measured 0.1 ms and 36 times below the old 1798.6 ms.
- **AC1.2** *Product-contract change (a).* `Email` refuses `a@b..c`, `a@.b.c` and `a@b.c.`, which today's rule accepts. It accepts `a@b.test` and `first.last@sub.example.test`, and still refuses an address without `@` and one with a space. For each partition, zod's verdict equals the verdict of the emitted pattern compiled with and without the `u` flag (rc-5 AC3.2's table). Test: unit, same file. The operator rules on this narrowing by approving this SPEC.
- **AC1.3** *Product-contract change (b).* `HttpUrl` bounds the port inside its regex.
  - `https://a.io:1/`, `https://a.io:80/` and `https://a.io:65535/` are accepted.
  - `https://a.io:0/`, `https://a.io:080/`, `https://a.io:08080/`, `https://a.io:65536/` and `https://a.io:99999/` are refused.
  - A port with a leading zero is refused, which today's rule accepts. This is part of the contract change, and no committed URL carries a port.
  - A URL with no port keeps today's verdicts.
  - Each partition holds in zod and in the emitted pattern, compiled both ways.

  The rule stays one `regex`, since the export reads the emitted `pattern` and a `.refine` would not reach it. The literal pinned at `contentSchemaExport.test.ts:90` moves to the new pattern in a `test(` commit. That commit names the main thread's ruling: the grill record's seam-1 ruling plus the operator's approval of this SPEC. The published schema is regenerated by `npm run schema:export`, and `schema:check` passes. Test: unit, the `HttpUrl` partition table in `projects.test.ts`, and the freshness test. The operator rules on this narrowing by approving this SPEC.
- **AC1.4** The locale-parse test proves both halves:
  - every committed value stays accepted;
  - the parse is lossless: for `pt`, `en` and `de`, `ContentDataSchema.safeParse` succeeds, and `result.data` equals the parsed file.

  An unknown nested key, such as `siteChrome.nav.newKey`, makes the test fail. Test: unit, one added `expect(result.data).toEqual(data)` in `contentSchemaExport.test.ts:146-152`. The reviewer adds such a key to a scratch copy of a locale and sees the case go red.
- **AC1.5** The content contract's docstring loses its `Consumers:` line. Test: none, since this is a docstring. The reviewer greps `Consumers:` in `scripts/` and finds 0 hits.

### FR2 — pins for unpinned rules

- **AC2.1** The parity check refuses a media list whose items differ in an optional key across locales. The case runs over a copy of the locales: one locale's `media[i]` lacks an optional key that the other locales carry, and the CLI exits non-zero with a message naming that `….media[<i>]` path. Test: integration, one case in `src/lib/homeParity.test.ts`, which already spawns the parity CLI over a locale copy. The reviewer removes the `checkMediaListParity` calls (`check-i18n-parity.mjs:278`, `:317`) and sees the case go red.
- **AC2.2** The library page's install command is asserted with `toBe` against the full rendered literal (`LibraryProjectTemplate.test.tsx:401`). The component renders `pypi.installCommand` alone. Test: unit.
- **AC2.3** The blog index renders the posts in the order the index data holds them. The case serves the index oldest first and asserts that order, and its title names the index's order, not "newest first" (`BlogIndexPage.test.tsx:70-80`). Newest-first stays the post reader's contract, pinned at `buildBlog.test.ts:70`. Test: unit. The reviewer adds a sort to the page and sees the case go red.
- **AC2.4** Three E2E specs change:
  - `nav-projects.spec.ts` reads the projects label inside the test, with no module-scope file read;
  - in `layout-shell.spec.ts`'s title case, every title comparison is a web-first assertion (`toHaveTitle` or `expect.poll`), and no one-shot `page.title()` read (`:132`) is compared after a load or a switch;
  - the title at `language-switch.spec.ts:60` loses `J4.T1:`.

  Test: E2E, the three specs pass. The reviewer greps the E2E titles for `J\d+\.T\d+` and finds 0 hits.
- **AC2.5** The asset-name test takes a file's name with `basename` from `node:path`, not `split("/")` (`contentAssets.test.ts:69`). Test: unit, the existing cases pass.
- **AC2.6** A missing posts root is valid. The post reader returns `[]` (`blog-posts.mjs:99`), and the build writes `blog/index.json` as `[]`, so the site builds before its first post. This partition is already pinned by `buildBlog.test.ts:138` ("writes [] for an absent one"). It needs no code change and no new case, and it survives FR4's move. Test: unit, existing.
- **AC2.7** A scene with no media renders no media cell and no empty grid cell. The scene's `section` has exactly one child, its text cell (heading and body), so the text keeps the grid's one column. Test: unit, one added partition in `LibraryProjectTemplate.test.tsx` next to the one-cell case, with a scene fixture that carries no `media`. The reviewer renders the media cell unconditionally and sees the case go red.

### FR3 — the deploy role and the deploy workflow

- **AC3.1** The policy test is an allowlist. It reads the `aws_iam_role_policy.github_actions_deploy` block of `iam.tf` and makes two checks:
  - the sorted set of granted actions equals `cloudfront:CreateInvalidation`, `s3:DeleteObject`, `s3:GetObject`, `s3:ListBucket`, `s3:PutObject`, `s3:PutObjectAcl`;
  - its `Resource` expressions equal the bucket ARN, the bucket ARN with `/*`, and the distribution ARN.

  The forbidden-word assert at `deployRolePolicy.test.ts:16` is replaced in a `test(` commit that names this AC. A state grant still fails, since its action or resource leaves the set. Test: unit. The reviewer adds `"s3:*"` to a scratch copy of the policy and sees the case go red.
- **AC3.2** `data "aws_caller_identity" "current"` leaves `iam.tf`. Test: none, since this is a deletion. The reviewer greps `aws_caller_identity` under `terraform/` and finds 0 hits, and CI's `terraform validate` passes.
- **AC3.3** Each deploy job in `deploy.yml` declares job-level `env:` entries that read `vars.S3_BUCKET` and `vars.DOMAIN` once. Every `run:` script uses the quoted shell variables, so no `${{ vars.… }}` expression stays inside a `run:` script. Test: none local. The reviewer's grep finds `${{ vars.` only on `env:` lines. Stage check: the next stage deploy run is green, and `/schema/site-content.schema.json` answers 200.
- **AC3.4** The prod row of the README's CI/CD table names the published schema upload, as the stage row does (`README.md:60`). Test: none, since this is docs. The reviewer reads the two rows.

### FR4 — the test harness

- **AC4.1** Playwright starts its `webServer` only when `E2E_BASE_URL` is unset. Test: integration. The job's hand-back cites two runs of `npx playwright test --list` with their exit codes and test counts: one with `E2E_BASE_URL` set to an unreachable address, which starts no server, and one with it unset, which keeps today's server.
- **AC4.2** The build exports `buildBlog`, and `buildBlog.test.ts`, `blogPages.test.ts` and `blogFeed.test.ts` call it in process.
  - The cases of the CLI's own contract keep one spawn each: stderr text, exit status 1, and "importing build-blog runs nothing".
  - Every other case calls the function. An error case uses `toThrow` with the CLI's message.
  - No assert is removed or loosened, and AC2.6's absent-root partition stays.

  Test: unit. The job's hand-back gives the before and after count of cases and spawns per file, and the three files' wall time against the 6.41 s four-file baseline.

### FR5 — Lighthouse publishes nothing

- **AC5.1** `lighthouserc.json` holds no `upload` block, and `assert` still runs. Test: integration. The job's hand-back cites one run of `npm run lighthouse` with its exit code and no upload line. On a PR, the `ci.yml` `lighthouse` job runs `npm run lighthouse` (`.github/workflows/ci.yml:154-176`), and that job, the last step of the file, uploads no artifact. No workflow or step reads the uploaded report: the workflows' `upload-artifact` steps carry only `dist/` and `playwright-report/`. Deleting the `upload` block therefore loses nothing, and that PR run keeps its `assert`.

### FR6 — the consumer and the gate

- **AC6.1** The panel's Studio generator reads this candidate's published schema. After FR1 merges, the committed `public/schema/site-content.schema.json` passes the panel's recipe:
  - `typesFor` over `<site>` throws nothing;
  - the emitted type passes `sanity schema validate` with 0 errors.

  The check runs read-only. The panel's `git status --porcelain` is empty before and after, and the copy is removed. Test: integration, once. Its evidence is the job's hand-back, with both commands, their exit codes and the counts. A construct the generator cannot map ends the job red, as a `bug-proposal:` against the panel's generator.
- **AC6.2** The repo `verify:` line exits 0, unchanged, on every job merge and on the rc PR head. Test: the existing suite plus this rc's tests.

### Replaces

- `Email`'s quadratic regex, and its acceptance of `a@b..c`, `a@.b.c` and `a@b.c.` (AC1.1, AC1.2).
- `HttpUrl`'s unbounded port, and the pinned pattern literal at `contentSchemaExport.test.ts:90` (AC1.3).
- The locale-parse test's tolerance of a silently stripped nested key (AC1.4).
- The `Consumers:` docstring line of the content contract (AC1.5).
- The `toContain` on the install command (AC2.2), and the "newest first" title of a case that proves no order (AC2.3).
- The module-scope label read, the one-shot title read and the task id in an E2E title (AC2.4); the `split("/")` path read (AC2.5).
- The forbidden-word assert of the policy test (AC3.1); `data "aws_caller_identity" "current"` (AC3.2).
- The 10 inline `${{ vars.… }}` expressions in `deploy.yml` `run:` scripts (AC3.3).
- The unconditional Playwright `webServer` (AC4.1).
- The per-case `build-blog.mjs` spawns outside the CLI-contract cases, and their spawn helpers (AC4.2).
- The Lighthouse upload to temporary-public-storage (AC5.1).

### Closure

- AC3.3's stage check is collected after the rc PR merges into develop, with the deploy run URL.
- Memory:
  - `content-contract`: the linear `Email`, the bounded port without a leading zero, the lossless locale parse (`content-contract.md:55-59`);
  - `deploy-infrastructure`: the allowlist policy test, the job-level `env:`;
  - `blog`: `buildBlog` exported and tested in process;
  - `e2e-suite`: `webServer` only without `E2E_BASE_URL`;
  - `memory.py drift` lists no uncovered unit.

## 5. Constraints and risks

| risk | answer |
|---|---|
| The narrowed `Email` or port refuses a committed value. | No committed URL carries a port (grep: 0 per locale), and the committed email is accepted by both rules. AC1.4's locale parse runs the rules on the raw content. |
| The changed patterns break the panel's Studio, which reads the published schema. | AC6.1 runs the panel's recipe on the regenerated file. Each pattern gives the same verdict with and without `u` (AC1.2, AC1.3). The `dd-researcher` pre-mortem returned GO: 0 engine disagreements, J4.T1's recipe passes on the candidate export, `sanity schema validate` exits 0, and the emitted types are byte-identical to the base. |
| The panel's site-sync publish gate validates live Sanity docs with Ajv against the published schema (`backend/site-sync/src/sync.ts:53-66`). A doc holding a newly refused form fails that target with its `failedPath`, and the last content stays served. | The risk is low: this site has no live Sanity docs yet. Its seed comes at the promote from the repo JSON, which AC1.4 proves accepted. The sync's own status is the gate, and no new check is added. |
| Asserts move: `contentSchemaExport.test.ts:90` (AC1.3) and `deployRolePolicy.test.ts:16` (AC3.1). | Each move is its own `test(` commit naming its AC, and each tightens: the new pattern refuses more, and the allowlist refuses any unlisted grant. |
| AC1.4 goes red on a key the committed content carries but the content contract does not declare. | That is the defect the assert exists to show. The key is declared in the content contract, never removed from the locale, and the PLAN names it. |
| The in-process build reads `public/content/pt.json` relative to cwd. | vitest runs in `frontend/`, and the spike wrote `rss.xml` in 32 ms. A case that needs another cwd keeps its spawn. |
| AC1.1's timing bound flakes under load, like `blog-pending-test-waits-by-clock`. | The bound is 500 times the measured time. A red run is a failure that gets registered, never retried. |
| `WT merge` refuses an implementation commit that touches the repo's `tests:` globs. | Every task touching a test is a `test(` commit in its own tree. |

## 6. Open questions

None for the operator beyond approving the two narrowings (AC1.2, AC1.3) with this SPEC.

None for the main thread: the pre-mortem returned GO, and its conditions are in AC1.3, §1 and §5.
