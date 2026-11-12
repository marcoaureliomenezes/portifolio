# PLAN — Release 0.1.0, rc-8

**Status:** Approved
**Approved:** 2026-11-12, operator: "Aprovo (Recommended)"
**Owner:** dd-sw-engineer-sr

Paths are relative to the repo root (the app is under `frontend/`). Tree: the rc-8 `wt-rc` (rc-7 merged), SPEC at `ab560fa` (Draft); every `path:line` was read in this tree. The repo `verify:` line is unchanged: `npm --prefix frontend run verify` (30.07 s measured at rc-7's closure).

## 1. As-is review

Ledger slice: `bugs.py status` 0 open; 0 records in the window, so no REBUILD is due by `bugs.py stats`. The two REBUILD rows below rest on the SPEC's reading of the unit's history (LINEAGE §The filter).

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `frontend/src/workflowScripts.test.ts:5,9-26` | fixed list of four file names; its own regex extractor misses `run: | # comment`, `|2-`, plain multi-line and bare `run:`; splits on `"\n"` (`:10`) | 2 (`terraform-workflow-cannot-plan-or-apply`, `ci-never-runs-the-checks-develop-requires` own the workflows; this test is rc-7's pin for them) | REBUILD | second shape in two candidates; the cause is scanning YAML with regexes. The rebuild parses with a declared `yaml` |
| `frontend/package.json` `devDependencies`, `package-lock.json:10603` | `yaml` 2.9.0 is installed only through `tailwindcss` → `postcss-load-config`; `js-yaml` 4.3.2 through `@eslint/eslintrc` (`:6632`) | 0 | UPDATE | declare `"yaml": "^2.9.0"` between `vitest` and `zod`. Measured on a scratch copy with `npm install --package-lock-only`: the lock diff is the one root `devDependencies` line, nothing else moves |
| `.github/workflows/ci-weekly.yml:15,34,36` | `playwright install --with-deps chromium webkit`; job and step names say WebKit | 0 | UPDATE | `CI` is set on Actions, so `playwright.config.ts:17,38` selects Chromium only; WebKit is installed and never run |
| `frontend/playwright.config.ts:36-37` | comment "Local / weekly: full 5-browser matrix" | 0 | UPDATE | one comment line; the config logic is unchanged |
| `.gitattributes` | absent; 435 text files are `i/lf w/lf`, 41 binary, 11 `none` (`git ls-files --eol`) | 0 | ADD | no existing file can carry it; the root file is the one place git reads |
| `terraform/modules/portfolio-static-site/iam.tf:69` deploy policy | grants `s3:PutObjectAcl`; no `aws s3` call passes `--acl` (`deploy.yml:79,83,92,105,151,155,164,177`) and the bucket blocks public ACLs (`s3.tf:37,39`) | 3 (`438e193`, `171db50`, rc-7's boundary edit; all removed or added one line) | UPDATE | delete one action line |
| `terraform/modules/portfolio-static-site/s3_policies.tf:40` bucket policy | the same grant; this block is pinned by no test | 0 | UPDATE | delete one action line; AC2.2 pins the block |
| `frontend/src/deployRolePolicy.test.ts` | two literal blocks of `iam.tf`; `block()` reads only `iam.tf` (`:5-10`); the policy literal carries `s3:PutObjectAcl` (`:66`) | 1 (`32269ed` its RED; rebuilt in rc-6 and rc-7) | UPDATE | the literals hold (rc-7 closed the regex parser); add a third literal, drop the action, add the IAM header list. Net lines grow by one block; it replaces the coverage gap `deploy-infrastructure.md:44` states |
| `frontend/src/pages/projects/ProjectsIndexPage.tsx` | calls no `useDocumentSeo`; the document keeps the site default title | 0 | UPDATE | one hook call with `index.title` and `index.description`, as `BlogIndexPage.tsx:14` does |
| `frontend/src/pages/projects/ProjectsIndexPage.test.tsx:56-80` | `useContent` is mocked with one fixed index title (pt); no title assert | 0 | UPDATE | the mock takes the locale's index, then one `it.each` over pt, en, de |
| `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts:121-123` | pins the site default title on the index | 1 (`8a9e766`, the family's earlier one-shot read) | UPDATE | the literal becomes `"Projetos"`; comment line `:121` is corrected |
| `tests/e2e/projects-cluster/project-detail-library.spec.ts:56-58`, `project-detail-meta.spec.ts:53-55`, `tests/e2e/pages/deep-link.spec.ts:24-25` | read `page.title()`; assert non-empty and not `projetos` (5 asserts), which pass on the site default | 1 (same family, `8a9e766`) | UPDATE | `toHaveTitle` against the page's pt `seo.title` literal; the 5 weak asserts leave (AC4.1 ruling) |
| `tests/e2e/projects-cluster/i18n-projects.spec.ts:106` | non-empty title assert, implied by the literal at `:105` | 0 | DELETE | 1 assert (AC4.2 ruling) |
| `frontend/src/lib/buildBlog.test.ts:31-43,160-176` | CLI cases run with `cwd: frontend`; no case runs the CLI elsewhere | 5 records on the build and its tests, and rc-7's review catch (`blog-link-rule-admits-protocol-relative-redirects`, `blog-media-rule-has-two-copies-and-admits-markdown`, `blog-default-image-read-skips-the-exactly-once-rule`, `blog-link-errors-carry-the-marked-report-suffix`, `blog-media-poster-test-spawns-three-builds-and-times-out`, then `2c5be96`) | KEEP + test | the rc-7 fix (`build-blog.mjs:106`, path from `import.meta.url`) has no gated test; one CLI case from a temp cwd |
| `frontend/scripts/build-blog.mjs:106` | reads `public/content/pt.json` relative to the script | 1 (`2c5be96`) | KEEP | the code is right; only its guard is missing |
| `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx:401` | the case titled "with the pinned literals" asserts the install command against `randEngine.pypi.installCommand`, read from the content it renders (`:377,393`) | 1 (`library-scene-second-media-leaves-the-media-column`, same file, rc-6) | UPDATE | `toBe` the literal string |
| `frontend/src/**/*.test.*` `process.cwd()` reads (12, §2.7) | pass because vitest runs in `frontend/` | 0 | KEEP | carried item, not in the pick |

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| which `run:` scripts hold an expression | the parsed workflow files of the `.github/workflows/` listing, through the declared `yaml` | `workflowScripts.test.ts` | the fixed file list and the regex extractor |
| what the deploy may do and which IAM resources exist | the `iam.tf` role and policy blocks, the `s3_policies.tf` bucket-policy block, the module's `resource "aws_iam_…"` header list, each pinned in `deployRolePolicy.test.ts` | `terraform.yml` apply | `s3:PutObjectAcl` (two grants) |
| which browsers the weekly run installs | `playwright.config.ts` (`CI` selects Chromium) | `ci-weekly.yml` | `webkit` and `--with-deps` in the weekly install |
| the `/projetos` document title | `ProjectsIndexPage` through `useDocumentSeo`, copy from `projectsV2.index` | `layout-shell.spec.ts` | the site default title on that route |
| a page's expected title in E2E | a literal from `public/content/pt.json` `seo.title` | the specs | the `page.title()` reads and their non-empty asserts |
| where `build-blog` reads the content | `import.meta.url` (rc-7) | `buildBlog.test.ts` CLI case from a temp cwd | none |
| line endings of text files | `.gitattributes` `* text=auto eol=lf` | the three text-reading tests | none |

Consumers of a changed name: none. The IAM header list and the `s3_policies.tf` literal are new reads of existing files; `ProjectsIndexPage`'s title is read by `layout-shell.spec.ts:123` only (`grep -rn 'toHaveTitle' frontend/tests`). No grammar, format or fix line changes, so no other repo of the context consumes anything this rc touches.

## 2. Order and seams

### 2.1 Waves, write sets, order

The four write sets are disjoint (`release.py check`), so there are no edges and all four jobs are wave 1. **Agent cap: 3 at once**; dispatch in this order, a slot freeing starts the next: Job 1 (law and dev loop), Job 2 (the deploy), Job 3 (the index title), Job 4 (the pins). The SPEC ranking holds in that order.

- **The reconcile** is the `wt-rc`'s last commits, no job (`RC-FLOW.md` step 4): the memory pass of the SPEC's Closure (`e2e-suite`, `site-chrome`, `deploy-infrastructure`, `blog`), AC1.2's run id and SPEC §5's carried checks into the closure summary, then `memory.py drift` lists no uncovered unit.
- **One task tree per job.** Tasks of one job that depend on each other's commits land as ordered commits in ONE task tree, each commit inside its own task's `W:` and the tree green at the last commit; a RED test commit is red by design until its implementation commit. Independent tasks of the job may share that tree. A job file therefore keeps one row per task, and the order of its rows is the order of the commits.
- A `test(<task>)` commit never touches source, and a source commit never touches tests (`WT merge` refuses the second). The files under the repo's `tests:` globs are tests; `package.json`, the lock, workflows, `.tf` files, `.gitattributes`, `playwright.config.ts` and `ProjectsIndexPage.tsx` are source.
- A behaviour is RED then source. Pins of behaviour that already holds (J4, and J1.T2's rebuild) have no source task; the reviewer's scratch probes prove them red (§2.3).

### 2.2 Shared contracts the jobs read

- **The workflow pin (J1.T2).** Declared `import { parseDocument } from "yaml"`. The file list is `readdirSync(.github/workflows)` filtered to `/\.ya?ml$/`, never a written list. Per file: `parseDocument(text).errors` is `[]`, and the walk of `.toJS()` finds at least one string-valued `run` key. The walk goes to any depth, skips the subtree under `defaults` (a mapping, not a script) and counts a `run` only when its value is a string. Each hit is labelled `file:job/step` (the job id and the step's `name`, or its index when unnamed; a `run` elsewhere gets its key path). Cases: the list holds at least one file; each file parses and yields at least one script; the labels of every script holding `${{` `toEqual([])`.
- **The IAM header pin (J2.T1).** Every `*.tf` file of the module directory, from `readdirSync`, split on lines; lines matching `^resource "(aws_iam_[a-z_]+)" "([^"]+)" \{$` become `type.name`, sorted, and `toEqual` the literal `["aws_iam_role.github_actions_deploy", "aws_iam_role_policy.github_actions_deploy"]`. Data sources do not match.
- **The block literals (J2.T1).** `block(file, header)` reads a block from its header to the next line that is exactly `}`. Three literals: the role (unchanged), the deploy policy without `s3:PutObjectAcl`, and `resource "aws_s3_bucket_policy" "website" {` of `s3_policies.tf` without it.
- **The index title (J3).** pt `Projetos`, en `Projects`, de `Projekte` (the three `projectsV2.index.title` values); the description is passed as the content holds it. No content key, schema or parity entry changes.
- **The E2E title literal (J4).** The page's `seo.title` in `public/content/pt.json`, typed into the spec.

### 2.3 Definition of done, recipes, ports

- **The job gate** is the repo `verify:` line: `npm --prefix frontend run verify`. Every job's Definition of done is that line, `npm --prefix frontend run typecheck` and the test directories its change reaches, as its job file lists. No gate, preflight or step is added; nothing reruns a check the merge runs.
- **No local AWS** (`AGENTS.md`, "Sem credenciais AWS locais"): no `terraform plan`, `apply` or `import`, no `aws` call. Allowed: `terraform fmt -check`, `terraform init -backend=false` and `terraform validate` in `terraform/envs/stage` and `terraform/envs/prod` (plugin cache `.dadaia/tmp/terraform-cache`; `.terraform/` is ignored, `.gitignore:31-32`).
- **The E2E recipe** (J3.T3 and J4.T1-T3). Name the project for the task (`portifolio-j3`, `portifolio-j4`), never the repo's name, so concurrent runners take distinct ports:
  1. From `frontend/`, `npm run build` (`verify` has already built `dist`).
  2. `python3 .agents/skills/dd-cli-library/scripts/registry.py next --project <name> --json`, then `register --port N --project <name>`.
  3. One shell command sequence, nothing left behind and no `setsid`: start `npx vite preview --host 127.0.0.1 --port N --strictPort &`, poll `curl -sf http://127.0.0.1:N/` until it answers (30 s at most), run `E2E_BASE_URL=http://127.0.0.1:N npx playwright test --project=chromium <specs>` and keep its exit code, then kill the listener by its pid (`ss -ltnp "sport = :N"`), run `registry.py release --port N`, and exit with Playwright's code. `ss -ltn "sport = :N"` prints no listener at the end.
  4. The hand-back gives the command, the exit code and the test count.
- **The reviewer's probes**, on scratch copies only, each seen red:
  - AC1.1: one `${{ }}` in each of `run: | # c`, `run: |2-`, a plain multi-line `run:`, and a fifth file `extra.yaml`.
  - AC2.2: `s3:PutObjectAcl` back in each of `iam.tf` and `s3_policies.tf`.
  - AC2.3: an `aws_iam_policy` block added to any module file.
  - AC3.1: the hook call removed.
  - AC4.3: `build-blog.mjs:106` made relative to the cwd.
  - AC4.4: the install command edited in a scratch copy of `public/content/en.json`.
  The implementer of J1.T2, J2.T1, J3.T1 and J4.T4 also runs the probe for its own test and hands back the exit codes.
- **Asserts removed or moved** are rulings the operator grants by approving the SPEC. Each is a `test(<task>)` commit whose body names its AC and "operator approval of the rc-8 SPEC":
  - AC1.1, the rebuild of the pin test (J1.T2).
  - AC2.2 and AC2.3, the policy test (J2.T1).
  - AC3.2, one title literal (J3.T3).
  - AC4.1, five asserts removed (J4.T1, J4.T2): `project-detail-library.spec.ts:57-58`, `project-detail-meta.spec.ts:54-55`, `deep-link.spec.ts:25`.
  - AC4.2, one assert removed (J4.T3): `i18n-projects.spec.ts:106`.
  - AC4.4, one expected value changes from data to a literal (J4.T5).
- **A red outside the diff** is listed by name as suspected pre-existing and proven at the merge base before it is called so.

### 2.4 Promote-facing steps (no job; the main thread drives them)

In order:

1. The operator applies the central panel's bootstrap (the boundary policy exists).
2. This candidate's `wt-rc` merges, the rc PR merges into develop, and every CI job is green (AC6.1).
3. The 0.1.0 promote. `terraform.yml` is dispatched for stage, then prod: each plan reads `0 to add, 3 to change, 0 to destroy` (the deploy role, its policy, the bucket policy), the guard and the apply are green, and a stage deploy run is green before prod is dispatched (AC2.4). In the same session `ci-weekly.yml` is dispatched once and its run is green (AC1.2). The run ids go in the closure summary.
4. The central panel's promote.
5. The next release's first candidate adds the beacon tag.

SPEC §5's checks that wait on the promote (the prod schema check, the Dependabot read) are read at step 3.

### 2.5 PLAN-stage ADR check

The one new dependency declaration (`yaml`, a dev dependency already installed at that version) and the one new file (`.gitattributes`) add no layer, gate or public name. The SPEC's ruling covers the declaration. No ADR.

### 2.6 Acceptance map

| AC | task | level |
|---|---|---|
| AC1.1 | J1.T1, J1.T2 | unit |
| AC1.2 | J1.T3 (live: §2.4 step 3) | integration, live once |
| AC2.1 | J2.T2 | unit (AC2.2) |
| AC2.2 | J2.T1 | unit |
| AC2.3 | J2.T1 | unit |
| AC2.4 | J2.T2 (live: §2.4 step 3) | integration, CI once |
| AC3.1 | J3.T1, J3.T2 | unit |
| AC3.2 | J3.T3 | E2E |
| AC4.1 | J4.T1, J4.T2 | E2E |
| AC4.2 | J4.T3 | E2E |
| AC4.3 | J4.T4 | integration |
| AC4.4 | J4.T5 | unit |
| AC5.1 | J1.T4 | none; checkout configuration, the reviewer's `-c core.autocrlf=true` clone |
| AC6.1 | J1.T4, J2.T2, J3.T3, J4.T5 (each job's last task, its Definition of done) | verify |

### 2.7 Notes and open points for the main thread

1. **The `process.cwd()` family.** Twelve reads under `frontend/src` resolve a file against the cwd and pass only because vitest runs in `frontend/`: `test-setup.ts:29`, `components/header/LanguageSelector.test.tsx:93`, `components/header/Header.test.tsx:19`, `components/header/ThemeToggle.test.tsx:12`, `components/layout/SiteLayout.test.tsx:20`, `components/portfolio/Portfolio.test.tsx:11`, `components/portfolio/HeroSection.test.tsx:11`, `components/projects/__tests__/ProjectsLayoutShell.test.tsx:33`, `pages/projects/ProjectsIndexPage.test.tsx:64`, `pages/projects/GamesProjectTemplate.test.tsx:70`, `pages/projects/LibraryProjectTemplate.test.tsx:200,377`. **No AC touches them.** AC5.1 is about line endings, AC4.3 guards `build-blog.mjs` alone, and AC4.4 changes the assert at `LibraryProjectTemplate.test.tsx:401`, not the read at `:377`. J3.T1 edits `ProjectsIndexPage.test.tsx` but leaves its `:64` read as it is. They are a **carried item for the next release**: one shared `contentPath()` helper next to `test-setup.ts` would replace the twelve.
2. **J1.T2 is green when it lands.** The rebuilt pin test passes on today's workflows; its red is the reviewer's five probes (§2.3), which the implementer also runs and reports.
3. **J1.T3 and J2.T2's plan line have no local evidence.** They are live checks at the promote (§2.4 step 3). Their local evidence is the grep and the `terraform fmt`, `init -backend=false`, `validate` commands in the job files.
4. **J3.T1** makes `ProjectsIndexPage.test.tsx`'s mocked `useContent` locale-aware. The existing cases keep their pt expectations.
5. **SPEC lines:** no wrong `path:line` found. One consequence the SPEC does not state: after J1.T2 the pin test no longer splits on `"\n"`, so §1.6's three line-split tests become two. Goal 9's target of 0 depends on `.gitattributes` alone and still holds.

## DAG

| job | waits on | wave | W: |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/workflowScripts.test.ts`, `.github/workflows/ci-weekly.yml`, `frontend/playwright.config.ts`, `.gitattributes` |
| Job 2 | — | 1 | `frontend/src/deployRolePolicy.test.ts`, `terraform/modules/portfolio-static-site/iam.tf`, `terraform/modules/portfolio-static-site/s3_policies.tf` |
| Job 3 | — | 1 | `frontend/src/pages/projects/ProjectsIndexPage.test.tsx`, `frontend/src/pages/projects/ProjectsIndexPage.tsx`, `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts` |
| Job 4 | — | 1 | `frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts`, `frontend/tests/e2e/projects-cluster/project-detail-meta.spec.ts`, `frontend/tests/e2e/pages/deep-link.spec.ts`, `frontend/tests/e2e/projects-cluster/i18n-projects.spec.ts`, `frontend/src/lib/buildBlog.test.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx` |
