# PLAN — Release 0.1.0, rc-6

**Status:** Approved
**Approved:** 2026-11-11, operator: "Aprovo (Recommended)"
**Owner:** dd-sw-engineer-sr

Paths are relative to the repo root (the app is under `frontend/`). Tree: the rc-6 `wt-rc`, SPEC at `f75bd8b` (Draft). Facts are read at `66e643f` from the as-is handoff `2026-11-11T032902Z`, the grill handoff `2026-11-11T033022Z` and the pre-mortem `0.1.0-rc6-premortem.md`. The repo `verify:` line is unchanged: `npm --prefix frontend run verify`.

## 1. As-is review

Ledger slice: `bugs.py status` 0 open; `_archive/bugs_histo.jsonl` 24 records. No REBUILD is due by `bugs.py stats`; the one REBUILD below rests on the demand (LINEAGE §The filter).

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `frontend/src/lib/schemas/projects.ts:14` `HttpUrl` | one regex for every http(s) link; `(:\d+)?` accepts port 99999 | 3 (`content-urls-accept-script-schemes`, `blog-link-rule-admits-protocol-relative-redirects`, `cv-url-rule-admits-a-control-character-after-the-slash`), all fixed in this one home with a partition table | UPDATE | the partition table in `projects.test.ts` is the contract home: add the port rows, change one regex. No layer. |
| `projects.ts:15` `Email` | `^[^@\s]+@[^@\s]+\.[^@\s]+$`, quadratic: 1798.6 ms at 50 000 chars | 0 | UPDATE | swap in the linear `^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$` (0.1 ms measured) |
| `frontend/scripts/content-schema.mjs:115-155` label shapes | zod object, strips unknown keys; the second copy of the label shape | 4 (`content-schema-export-is-empty`, `content-schema-rejects-committed-content`, `content-urls-accept-script-schemes`, `cv-url-rule-admits-a-control-character-after-the-slash`); the first two are copy-drift | KEEP, hardened by one assert | it is the contract owner; the cost is AC1.4's one assert |
| `content-schema.mjs:8` `Consumers:` line | lists importers, goes stale | 0 | DELETE | deletion test: a grep finds importers; a docstring states only its unit's contract |
| `frontend/src/types/content.ts:132-235` `ContentData` and label interfaces | hand-written copy of the label shape, 26 interfaces | 1 (`blog-tags-label-unread`, type and JSON key drifted) | KEEP | deriving it from the schema was spiked: 15 `tsc` errors, fixtures of 30 files break (SPEC §3) |
| `frontend/src/lib/contentSchemaExport.test.ts:90` pinned `HttpUrl` literal | pins the old pattern | 2 (the two copy-drift bugs) | UPDATE | moves with the regex, in a `test(` commit naming the ruling |
| `contentSchemaExport.test.ts:146-152` locale-parse test | parses `pt`, `en`, `de`; never compares the parse to its input | 2 (same) | UPDATE | one added `expect(result.data).toEqual(data)` makes the strip a failure |
| `frontend/public/schema/site-content.schema.json` | the published schema, 20 pattern lines move | 2 (same) | UPDATE (regenerate) | `npm run schema:export`; never hand-edited |
| `frontend/scripts/check-i18n-parity.mjs:244-252` `checkMediaListParity` | no direct test; reached through `checkProject` (`:278`, `:317`) | 0 | KEEP + test | the rule works; one case in `homeParity.test.ts`, which already spawns this CLI |
| `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx:401` | `toContain("pip install rand-engine")` | 1 (`library-scene-second-media-leaves-the-media-column`, same file) | UPDATE | `toBe` the literal; the component renders `pypi.installCommand` alone |
| `LibraryProjectTemplate.tsx:89` `media?.length ? … : null` | its false partition has no case | 1 (same bug, which added the branch) | KEEP + test | one added partition, AC2.7; no source change |
| `frontend/src/pages/blog/BlogIndexPage.test.tsx:70-80` title "newest first" | the fixtures are already newest first, so the case proves no order | 2 (`blog-pending-test-waits-by-clock`, `post-page-blanks-the-head...`) | UPDATE | serve the index oldest first, rename the case; rc-5 AC5.2 deleted the page's sort |
| `frontend/tests/e2e/projects-cluster/nav-projects.spec.ts:12`, `layout-shell.spec.ts:132`, `pages/language-switch.spec.ts:60` | module-scope label read, one-shot title read, task id in a title | 1 (`layout-shell-title-read-races-the-language-switch`, same file; `:132` is its second occurrence) | UPDATE | one edit each; the title read becomes web-first |
| `frontend/src/lib/contentAssets.test.ts:69` | `f.split("/")` breaks on Windows | 0 | UPDATE | `basename` from `node:path` |
| `frontend/scripts/blog-posts.mjs:99` missing posts root | returns `[]`; the site builds before its first post | 4 on the build (link rule, media rule, default image, link suffix) | KEEP | the partition is pinned at `buildBlog.test.ts:138` (AC2.6); J4 keeps it |
| `terraform/modules/portfolio-static-site/iam.tf:11` `data aws_caller_identity.current` | 0 readers | 1 (`deploy-role-can-write-terraform-state`, same file) | DELETE | deletion test: nothing reads it |
| `frontend/src/deployRolePolicy.test.ts:16` | forbidden-word list over the policy block; `"s3:*"` stays green | 1 (the bug above; this test is its RED) | REBUILD | a forbidden list passes for any grant it did not name; an allowlist cannot |
| `.github/workflows/deploy.yml` `run:` scripts (`vars.S3_BUCKET` 8 uses, `vars.DOMAIN` 2) | expression text interpolated into shell (CWE-78) | 2 (`terraform-workflow-cannot-plan-or-apply`, `ci-never-runs-the-checks-develop-requires`; other files of the dir) | UPDATE | job-level `env:` read once, quoted shell variables |
| `deploy.yml` the two deploy jobs | 5 near-identical steps; differ in `if`, `environment`, two secrets, session name, summary | 0 | KEEP | a matrix cannot carry the job-level `if`; a reusable workflow needs a file and an operator-side secret rename (SPEC §3) |
| `README.md:60` prod row | omits the schema upload the stage row names | 0 | UPDATE | one cell |
| `frontend/playwright.config.ts:47` `webServer` | starts even when `E2E_BASE_URL` names a running site | 0 | UPDATE | conditional on the variable, net 0 lines; spiked: `--list` loads 780 tests with no server |
| `frontend/scripts/build-blog.mjs` `buildBlog` and `src/lib/{buildBlog,blogPages,blogFeed}.test.ts` | `buildBlog` is module-private; 27 spawns of `node scripts/build-blog.mjs` (13 + 9 + 5) | 5 (`blog-media-poster-test-spawns-three-builds-and-times-out` is a timeout from this pattern; `blog-pending-test-waits-by-clock` is its sibling) | REBUILD (the tests' harness), UPDATE (script) | export one word; a spawn per case is the structural cause of the timeout bug |
| `frontend/scripts/export-content-schema.mjs` + `contentSchemaExport.test.ts:70-77` | the script runs and exits at import; one spawn of `--check` | 1 (`content-schema-export-is-empty`) | KEEP | one spawn is the CLI's own contract; importing would execute it |
| `frontend/src/lib/homeParity.test.ts:27` spawn | env-driven CLI | 0 | KEEP | the CLI's contract, not in the pick |
| `frontend/package.json` nested `overrides` (3) | `basic-ftp`, `minimatch`, `postcss-selector-parser` | 0 | KEEP all three | each removed gives 9 high, 7 moderate, 2 moderate under `npm audit` (SPEC §3) |
| `frontend/lighthouserc.json:51-53` `upload` | `temporary-public-storage`; nothing reads the report | 0 | DELETE | `autorun.js:143-144` skips the upload without the block; `assert` still runs (`:137`) |

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| what a link or an email in the content is | `frontend/src/lib/schemas/projects.ts` `HttpUrl`, `Email` | `content-schema.mjs`, `build-blog.mjs:22`, the published schema, `contentSchemaExport.test.ts` | none |
| which keys the content contract carries | `frontend/scripts/content-schema.mjs` `ContentDataSchema` | `src/types/content.ts` (a hand-written view), `contentSchemaExport.test.ts` (parse equals input) | the `Consumers:` line |
| what the deploy role may do | the `iam.tf` policy block | `deployRolePolicy.test.ts` (allowlist) | `data aws_caller_identity.current` |
| which bucket and domain a deploy uses | the job-level `env:` in `deploy.yml`, read once from `vars.*` | the `run:` steps | the 10 inline `${{ vars.… }}` |
| who serves the site under E2E | `E2E_BASE_URL` in `playwright.config.ts` (set: the running site; unset: `webServer`) | the E2E recipe | the unconditional `webServer` |
| how a blog build is tested | `buildBlog` called in process | the three test files; one spawn per CLI-contract case | the per-case spawn helpers |
| whether an override is needed | `npm audit` on the lock re-resolved without it | `package.json` | none (all kept) |
| whether Lighthouse publishes | `lighthouserc.json` (no `upload`) | `npm run lighthouse` | the `upload` block |

Consumers of the one grammar that changes (the `Email` and `HttpUrl` patterns): `content-schema.mjs` (`ProfileSchema`, `CertLink`, `thesisLink`), `build-blog.mjs:22`, the published schema, `contentSchemaExport.test.ts:90`, and, through the published file, one other repo of the context (the panel's Studio generator and its site-sync). The pre-mortem swept it: 0 engine disagreements over 56 cases. No fix line, public name or format is rebuilt.

## 2. Order and seams

### 2.1 Waves, write sets, order

The five write sets are disjoint (proved by `release.py check`). **Agent cap: 3 at once**, because another session keeps this machine at load 12 or more on 8 cores. Wave 1 holds three jobs and wave 2 two, so the order follows the SPEC's ranking:

- **Wave 1, dispatch in this order:** Job 4 (the harness), Job 1 (the content contract), Job 3 (deploy). Each job runs one task at a time, so three agents at most.
- **Wave 2:** Job 2 (the pins) and Job 5 (Lighthouse), each as a slot frees. Job 2 **waits on Job 4**: its E2E specs run with the recipe of §2.3, which needs Job 4's `webServer` change. Job 5 waits on nothing; only the cap puts it in wave 2.
- **The reconcile** is the `wt-rc`'s last commits, no job (`RC-FLOW.md` step 4): the memory atoms `content-contract` (`content-contract.md:55-59`), `deploy-infrastructure`, `blog` and `e2e-suite` (SPEC Closure), then `memory.py drift` lists no uncovered unit.
- A behaviour is two tasks, RED then source. Every test, E2E included, is a `test(<id>)` commit: `WT merge` refuses an implementation commit that touches the repo's `tests:` globs. Pins of behaviour that already holds (AC2.1-AC2.5, AC2.7, AC3.1) have no implementation task; each is proved by the reviewer reverting the rule and seeing the case go red, as the SPEC says.

### 2.2 Shared contracts the jobs read

- **Email.** `Email = z.string().regex(/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/)`.
- **Port.** `HttpUrl`'s `(:\d+)?` becomes `(:(?:[1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d\d|655[0-2]\d|6553[0-5]))?`. Measured at the as-is review: `:1`, `:80`, `:65535` accepted; `:0`, `:080`, `:08080`, `:65536`, `:99999` refused, the same with and without `u`. It stays one `regex`: the export reads the emitted `pattern`, and a `.refine` would not reach it.
- **Published schema.** `npm run schema:export` writes `frontend/public/schema/site-content.schema.json`, `npm run schema:check` compares. The regeneration is in the same job as the regex (Job 1, J1.T3). 20 lines move: 19 URL, 1 Email.
- **The in-process build.** `buildBlog(postsDir, distDir)` is exported; it reads `public/content/pt.json` relative to cwd, and vitest runs in `frontend/`. A case that needs another cwd keeps its spawn.

### 2.3 Definition of done, recipes, E2E and ports

- **The job gate** is the repo `verify:` line: `npm --prefix frontend run verify`. Every job's Definition of done is that line plus the test directories its change reaches, as its job file lists. No gate, preflight or step is added; nothing reruns a check the merge runs (AC6.2).
- **Typecheck:** `npm --prefix frontend run typecheck` (it runs `tsc --noEmit -p tsconfig.app.json`). Never `tsc -p .`: the root config has `files: []` and checks nothing.
- **The E2E recipe** (Job 2 runs it; Job 4's evidence needs no server):
  1. From `frontend/`, `npm run build` (`verify` has already built `dist`). Open a port: `python3 .agents/skills/dd-cli-library/scripts/registry.py next --project <project> --json`, then `register --port N --project <project>`.
  2. Start `npx vite preview --port N --strictPort` on loopback, as its own process group.
  3. Run `E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium <specs>`.
  4. Kill the process group, then `registry.py release --port N`.
- **The wrapper config is gone from Job 4's merge on.** rc-5 ran a config copy without `webServer` so that Playwright did not start a second server. With AC4.1, `E2E_BASE_URL` set starts none. Job 4 is the only job that edits the config, and Job 2, the only other E2E runner, waits on it, so rc-6 never uses a wrapper.
- **AC6.1's recipe** is read-only from the panel's rc-2 tree; the commands are in J1.T4. The panel's `git status --porcelain` is empty before and after.
- **Asserts that move** are product-contract changes the operator approves with the SPEC; each moves in a `test(<task>)` commit that names its ruling and keeps its partition:
  - `contentSchemaExport.test.ts:90` (J1.T2). Ruling: the grill record's seam-1 finding plus the operator's approval of the SPEC.
  - `deployRolePolicy.test.ts:16` (J3.T2). AC3.1 names the replacement.
  - `BlogIndexPage.test.tsx:70-80`, the title and the served order (J2.T4). AC2.3.
  - `LibraryProjectTemplate.test.tsx:401`, `toContain` to `toBe`, a tightening (J2.T2).
  - The spawn cases of the three blog files, which become calls and `toThrow` (J4.T2-T4); no assert is removed or loosened.
- **A red outside the diff** is listed by name as suspected pre-existing and proven at the merge base before it is called so.

### 2.4 Promote-facing steps (no job; the main thread drives them)

1. After the rc PR merges into develop, the `Deploy` workflow to stage runs: AC3.3's stage check is that run green and `/schema/site-content.schema.json` answering 200. The run URL goes into the closure report.
2. The site-sync's own status is the gate for live Sanity docs (SPEC §5); no check is added.

### 2.5 Pre-mortem answers

| hit | answer |
|---|---|
| Regenerate the artifact | J1.T3 runs `npm run schema:export` in the commit that changes the regexes; `schema:check` is in its Definition of done. |
| Move the pin at `contentSchemaExport.test.ts:90` | J1.T2, a `test(J1.T2)` commit naming the ruling (§2.3). It lands in the same job as the regex, so no merge to `wt-rc` holds a red pin. |
| Add the port and email rows | J1.T2 adds them to the partition tables of `projects.test.ts`. |
| Update the memory atom `content-contract.md:55-59` | the reconcile (§2.1), not a job: a job file may not name `specs/memory`. |
| State the narrowings as contract changes | done in the SPEC (AC1.2, AC1.3); the operator rules on them by approving it. |
| Accept the site-sync risk | §2.4 step 2; recorded, nothing added. |
| AC6.1 runs the panel's recipe | J1.T4, after J1.T3, with the exact commands. Its evidence is the hand-back. |
| `projects.test.ts:446-462`, `:465` hold | J1.T2 keeps both and adds beside them. |
| `rc-5/PLAN.md:77` and the Studio fixtures | no change. |

### 2.6 PLAN-stage ADR check

No decision here crosses the threshold: no new layer, dependency, gate or public name. No ADR.

### 2.7 Acceptance map

| AC | task | level |
|---|---|---|
| AC1.1, AC1.2, AC1.3 | J1.T2, J1.T3 | unit |
| AC1.4 | J1.T2 | unit |
| AC1.5 | J1.T1 | none; grep |
| AC2.1 | J2.T1 | integration |
| AC2.2, AC2.7 | J2.T2, J2.T3 | unit |
| AC2.3 | J2.T4 | unit |
| AC2.4 | J2.T5 | E2E |
| AC2.5 | J2.T6 | unit |
| AC2.6 | J4.T2 (kept) | unit, existing |
| AC3.1 | J3.T2 | unit |
| AC3.2 | J3.T1 | none; grep and CI |
| AC3.3 | J3.T3, §2.4 step 1 | none local; stage check |
| AC3.4 | J3.T4 | none; docs |
| AC4.1 | J4.T1 | integration |
| AC4.2 | J4.T2-T5 | unit |
| AC5.1 | J5.T1 | integration |
| AC6.1 | J1.T4 | integration, once |
| AC6.2 | every job's Definition of done | verify |

### 2.8 Open points for the main thread

1. **AC5.1's last sentence.** "No workflow runs Lighthouse on a PR" does not hold today: `.github/workflows/ci.yml:154-176` runs `npm run lighthouse` in the `lighthouse` job on `pull_request`. The upload block's removal leaves that job running `assert` only. J5.T1 cites the grep and runs `npm run lighthouse` once; the SPEC's sentence is the product engineer's to correct.
2. **J1.T4 has a `W:` and no commit.** The task is read-only (AC6.1); its `W:` names the file it reads, since a task row must carry one.
3. **AC1.4 may go red on a committed key.** If the added assert fails on a key the locales carry and the content contract does not declare, J1.T2 reports it and J1.T3 declares it in `content-schema.mjs`; the locale is never edited.

## DAG

| job | waits on | wave | W: |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/scripts/content-schema.mjs`, `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/lib/contentSchemaExport.test.ts`, `frontend/src/lib/schemas/projects.ts`, `frontend/public/schema/site-content.schema.json` |
| Job 2 | Job 4 | 2 | `frontend/src/lib/homeParity.test.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx`, `frontend/src/pages/blog/BlogIndexPage.test.tsx`, `frontend/tests/e2e/projects-cluster/nav-projects.spec.ts`, `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts`, `frontend/tests/e2e/pages/language-switch.spec.ts`, `frontend/src/lib/contentAssets.test.ts` |
| Job 3 | — | 1 | `terraform/modules/portfolio-static-site/iam.tf`, `frontend/src/deployRolePolicy.test.ts`, `.github/workflows/deploy.yml`, `README.md` |
| Job 4 | — | 1 | `frontend/playwright.config.ts`, `frontend/src/lib/buildBlog.test.ts`, `frontend/src/lib/blogPages.test.ts`, `frontend/src/lib/blogFeed.test.ts`, `frontend/scripts/build-blog.mjs` |
| Job 5 | — | 2 | `frontend/lighthouserc.json` |
