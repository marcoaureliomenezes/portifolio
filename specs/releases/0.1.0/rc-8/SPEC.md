# SPEC — Release: 0.1.0

**Status:** Approved
**Approved:** 2026-11-12, operator: "Aprovo (Recommended)"
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-11-12
**Origin:** operator-demand

---

## Bug window review

**Window:** the records resolved since rc-7 was defined (2026-11-12T10:46:19Z, `_RELEASE.json` `defined.ts`).
- `bugs.py status`: 0 open, and `BUGS.jsonl` is empty.
- The newest `closed_at` in `specs/bugs/_archive/bugs_histo.jsonl` is 2026-11-08T00:16:23Z.
- `git log --since=2026-11-12T10:46:19Z -E --grep '^(fix|refactor)\(bugs\): '` prints nothing.

**0 records are in the window, so no fix needs judging and no REBUILD is proposed.**

The history of the units this candidate touches:

| unit | history | reading |
|---|---|---|
| `scripts/build-blog.mjs` `buildBlog` | rc-7 `2c5be96` (J2.T5) | Review caught a HIGH: the content file was read relative to the cwd, and the test's `process.chdir` hid it. The fix derives the path from `import.meta.url`. No gated test fails if it is reverted, because vitest runs in `frontend/`. AC4.3 adds that guard. |
| `src/workflowScripts.test.ts` | rc-7 `2cf839a` (J1.T1) | This is its second shape in two candidates. The structural cause is that it scans YAML with its own regexes over a fixed list of four files. AC1.1 deletes the scanner. |
| `src/deployRolePolicy.test.ts` | rc-6 AC3.1, rc-7 `2d7aacf` | The literal blocks hold. Its blind spot is any IAM resource or bucket-policy grant outside the two named blocks. AC2.2 and AC2.3 close it without a parser. |

## 1. Problem

The operator's standing demand is that every finding is fixed before the promote. rc-7's reviews left findings: intake items 213–219 and rc-7's closure summary (`_RELEASE.json`, summary of 2026-11-12T11:25:31Z). The main thread's positions fix the set below, and the scope is closed. Everything was read in this tree at `dacbc53`. Paths are relative to `frontend/` unless they start with `terraform/`, `.github/`, `specs/` or `.gitattributes`.

1. **The workflow pin test can miss a script.**
   - `src/workflowScripts.test.ts:5` reads a fixed list of four files, so a fifth workflow escapes it.
   - Its own regex extractor (`:9-26`) misses `run: | # comment`, `|2-`, plain multi-line and bare `run:` forms.
   - A YAML parser is already installed, but only transitively, and the repo states no rule on importing one:
     - `yaml` 2.9.0 comes through `tailwindcss` → `postcss-load-config` (`package-lock.json:10603`);
     - `js-yaml` 4.3.2 comes through `@eslint/eslintrc`, dev only (`:6632`).
2. **The weekly E2E pays an install it never uses.** `ci-weekly.yml:36` runs `npx playwright install --with-deps chromium webkit`. GitHub Actions sets `CI`, and `playwright.config.ts:17,38-40` then selects the Chromium project alone, so WebKit is never run. Three labels say otherwise: `ci-weekly.yml:15`, `ci-weekly.yml:34` and `playwright.config.ts:37` ("Local / weekly: full 5-browser matrix"). The apt step failed three runs in a row on the runner's mirror (intake 195).
3. **The deploy grants an action it never uses.**
   - `s3:PutObjectAcl` is granted in the deploy policy (`terraform/modules/portfolio-static-site/iam.tf:69`) and in the bucket policy (`s3_policies.tf:40`).
   - No `aws s3` call in `deploy.yml` (`:79,83,92,105,151,155,164,177`) passes `--acl`, and the bucket blocks public ACLs (`s3.tf:37,39`).
   - The bucket policy's deploy statement (`s3_policies.tf:32-49`) is pinned by no test.
   - The policy test reads only the two named blocks, so a new `aws_iam_*` resource elsewhere in the module escapes it (`deploy-infrastructure.md:44`).
4. **The projects index has no title of its own.** `ProjectsIndexPage.tsx` calls no `useDocumentSeo`, so `/projetos` keeps the site's default `<title>` (`index.html:6`). rc-7's J2.T3 therefore pinned that default (`layout-shell.spec.ts:123`). The content already carries the index's own copy: `projectsV2.index.title` and `.description`, required by `ProjectsIndexSchema` (`src/lib/schemas/projects.ts:185-188`) and in the parity check's `INDEX_I18N_KEYS` (`scripts/check-i18n-parity.mjs:88`). The pt title is "Projetos", en "Projects", de "Projekte".
5. **Title asserts that would pass on the site default.**
   - PC-E2E-22 (`tests/e2e/projects-cluster/project-detail-library.spec.ts:56-58`) and PC-E2E-23 (`project-detail-meta.spec.ts:53-55`) check only that the title is non-empty and not `projetos`.
   - E2E-15 (`tests/e2e/pages/deep-link.spec.ts:24-25`) checks only that it is non-empty.
   - `i18n-projects.spec.ts:106`'s non-empty check is implied by the literal `toHaveTitle` at `:105`.
6. **Other gaps.**
   - Line endings: no `.gitattributes` exists, and three tests split a file on `"\n"` (`src/deployRolePolicy.test.ts:5`, `src/terraformWorkflow.test.ts:5`, `src/workflowScripts.test.ts:10`). All 434 text files are LF in the index (`git ls-files --eol`).
   - The install command: `LibraryProjectTemplate.test.tsx:401`, the item the PLAN author placed at `:410` before rc-7's deletions, sits in a case titled "with the pinned literals". It reads its expected value from the same committed content it renders (`:377,393`), so it passes whatever the content holds.

## 2. Measurable Goals

| # | goal | today | target | source |
|---|---|---|---|---|
| 1 | workflow files the pin test can miss | any file outside 4 names | 0 | AC1.1 |
| 2 | `run:` script forms the pin test misses | 4 | 0 | AC1.1 |
| 3 | apt installs per weekly run | 1 | 0 | AC1.2 |
| 4 | `s3:PutObjectAcl` grants | 2 | 0 | AC2.1 |
| 5 | deploy grants or IAM resources in the module that no test pins | the bucket statement + any new resource | 0 | AC2.2, AC2.3 |
| 6 | `/projetos` routes without their own document title | 1 | 0 | AC3.1 |
| 7 | title asserts that pass on the site default title | 4 | 0 | AC3.2, AC4.1 |
| 8 | gated tests that fail when the build-blog content-path fix is reverted | 0 | 1 | AC4.3 |
| 9 | text-reading tests that depend on the checkout's line endings | 3 | 0 | AC5.1 |

## 3. Non-goals

Each item is OUT, with its reason:

- **The central panel's beacon script tag.** The panel's beacon is not live until the panel's promote. The tag is the next release's first candidate.
- **The boundary policy's own allow list**, `s3:PutObjectAcl` included. That list lives in the central panel's bootstrap. AC2.1 removes the grant on this side, and the boundary stays a ceiling.
- **A privacy footer line.** The site stores only the visitor's own language and theme choices (rc-7 §3).
- **A weekly WebKit run.** It would need the apt step back, and the CI config runs only Chromium by design (`playwright.config.ts:36`).
- **`package.json:21`'s `test:e2e:install`, which keeps `--with-deps`.** It is a local script for the five-project local matrix, no workflow runs it, and a developer's machine may lack the browsers' system libraries.
- **The backlog entry `switch-restores-the-content-exclusion`.** It is triggered by the panel's first publish to this site's buckets, which comes after the 0.1.0 promote.
- **Any new gate, CI job, `verify:` step or merge check.**

## 4. Requirements

Domain names: the pin test (`src/workflowScripts.test.ts`), the policy test (`src/deployRolePolicy.test.ts`), the module (`terraform/modules/portfolio-static-site/`), the deploy policy, the bucket policy (`aws_s3_bucket_policy.website`), the projects index (`ProjectsIndexPage`), the SEO hook (`useDocumentSeo`), and the build (`scripts/build-blog.mjs`).

**Wave ranking:**

1. Law, skills, dev loop: FR1 (workflows) and FR5 (line endings).
2. Shared foundation: FR2 (the deploy's least privilege).
3. Features and bugs: FR3 (the index title) and FR4 (test pins).
4. Promote-facing: AC2.4 and §5's carried checks.

The write sets are disjoint: only FR1 may touch `package.json`.

### FR1 — workflows

- **AC1.1** The pin test's contract has two parts:
  - **Files.** The file set is the listing of `.github/workflows/` for `*.yml` and `*.yaml`, never a written list. A file that does not parse fails the test, and so does a file that yields no `run:` script.
  - **Scripts.** Every string-valued `run:` key at any depth of every file is a script, whatever its YAML form: block scalar with any indicator or comment, plain or quoted, single- or multi-line. `defaults: run:` is a mapping, not a script, and stays out. No script holds `${{`.

  The PLAN chooses the mechanism, under one ruling. A transitive package is not imported undeclared: a tailwind or eslint upgrade would drop it silently. A parser is acceptable when it is declared in `devDependencies` at the version the lock already resolves (`yaml` `^2.9.0` or `js-yaml` `^4.3.2`). That adds no package to the installed tree and replaces the regex extractor. Test: unit.

  The reviewer puts one `${{ }}` into a scratch copy in each of four forms (`run: | # c`, `run: |2-`, plain multi-line, and a fifth file `extra.yaml`) and sees each go red. The rebuild is a `test(` commit naming the main thread's ruling, which this SPEC's approval grants.
- **AC1.2** `ci-weekly.yml:36` runs `npx playwright install chromium`, with no `--with-deps` and no `webkit`. The job name (`:15`), the step name (`:34`) and `playwright.config.ts:37`'s comment name Chromium only for CI and the weekly run. Test: integration, live: the next weekly run, or one `workflow_dispatch` of it, is green. Its run id goes in the closure summary.

### FR2 — the deploy's least privilege

- **AC2.1** `s3:PutObjectAcl` leaves the deploy policy (`iam.tf:69`) and the bucket policy (`s3_policies.tf:40`). The deploy keeps `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject` and `cloudfront:CreateInvalidation`. Test: unit, AC2.2.
- **AC2.2** The policy test's deploy-policy literal loses `s3:PutObjectAcl`. The test also compares the bucket policy block (`s3_policies.tf`, `resource "aws_s3_bucket_policy" "website"`) with `toBe` against one literal, so the change in AC2.1 is gated on both files. The reviewer puts `s3:PutObjectAcl` back in each file and sees red. Test: unit. The move is a `test(` commit naming the main thread's ruling, which this SPEC's approval grants.
- **AC2.3** The policy test pins the module's IAM resources. The `resource "aws_iam_…" "…"` header lines across the module's `*.tf` files, read from the directory listing and matched as header lines with no parser, equal the literal list `aws_iam_role.github_actions_deploy` and `aws_iam_role_policy.github_actions_deploy`. A new IAM resource is a deliberate test change. Test: unit. The reviewer adds an `aws_iam_policy` block to a scratch copy of any module file and sees red.
- **AC2.4** *Live check at the promote, CI only* (`AGENTS.md`: no local AWS). The central panel's bootstrap must be applied first, and rc-7's boundary is not yet applied. Then `terraform.yml` is dispatched for stage, then for prod. Each plan reads **0 to add, 3 to change, 0 to destroy**, the three in-place updates being:
  - `aws_iam_role.github_actions_deploy` (`permissions_boundary`, rc-7);
  - `aws_iam_role_policy.github_actions_deploy` (`policy`);
  - `aws_s3_bucket_policy.website` (`policy`).

  The no-delete-or-replace guard and the apply are green. The next stage deploy run is then green. Test: integration, live, once; the evidence is the run ids. This supersedes rc-7 AC2.3's "1 to change", which was never dispatched.

### FR3 — the projects index title

- **AC3.1** `ProjectsIndexPage` calls `useDocumentSeo` with `projectsV2.index.title` and `projectsV2.index.description`, in the same way the blog index calls it with its own copy (`BlogIndexPage.tsx:14`). On `/projetos` the document title is the locale's index title, and the description and `og:` tags carry the index description. No content key, schema or parity entry is added. Test: unit, in `ProjectsIndexPage.test.tsx`, one `it.each` over pt, en and de asserting `document.title` against the fixture's literal.
- **AC3.2** `layout-shell.spec.ts:123`'s `toHaveTitle` of the site default becomes the index's pt title, `"Projetos"`. Test: E2E. The move is a `test(` commit naming the main thread's ruling, which this SPEC's approval grants.

### FR4 — test pins

- **AC4.1** Three title checks compare with `toHaveTitle` against a literal: the page's pt `seo.title` from `public/content/pt.json`.
  - PC-E2E-22 (`project-detail-library.spec.ts:56-58`) and E2E-15 (`deep-link.spec.ts:24-25`), the library project page.
  - PC-E2E-23 (`project-detail-meta.spec.ts:53-55`), the meta project page.

  Their `page.title()` reads go. *Operator ruling, granted by approving this SPEC:* their non-empty and not-`projetos` asserts are removed, 5 asserts in all, because each is implied by the literal. Test: E2E.
- **AC4.2** *Operator ruling, granted by approving this SPEC:* `i18n-projects.spec.ts:106` (1 assert) is removed. The literal `toHaveTitle` at `:105` implies it. Test: E2E, the spec passes.
- **AC4.3** `src/lib/buildBlog.test.ts` gains one CLI case. It runs `node <absolute>/scripts/build-blog.mjs --posts <absolute> --dist <absolute>` with `cwd` set to a temp directory outside `frontend/`, and expects exit 0 and `<dist>/blog/index.json`. Test: integration. The reviewer reverts `2c5be96`'s line in `build-blog.mjs:106` and sees the case go red.
- **AC4.4** `LibraryProjectTemplate.test.tsx:401` asserts the install command with `toBe` against its literal string, not the content value it renders. Test: unit. The reviewer edits the committed install command in a scratch copy of `public/content/en.json` and sees the case go red. The move is a `test(` commit naming the main thread's ruling.

### FR5 — line endings

- **AC5.1** A root `.gitattributes` holds `* text=auto eol=lf`. `git ls-files --eol` shows `attr/text=auto eol=lf` for every path. Adding the file renormalizes nothing, since the index holds no CRLF file. Test: no automated test, since this is checkout configuration. The reviewer clones this tree with `-c core.autocrlf=true` into a temp directory and finds the three text-reading files of §1.6 as `w/lf`.

### FR6 — the gate

- **AC6.1** The repo's `verify:` line exits 0, unchanged, on every job merge and on the rc PR head (measured at 30.07 s at rc-7's closure). Every CI job on the rc PR is green. Test: the existing suite plus this rc's tests.

### Replaces

- The pin test's fixed four-file list and its regex extractor (AC1.1).
- The weekly WebKit install and its apt step, and the labels that name WebKit (AC1.2).
- `s3:PutObjectAcl` in the deploy policy and the bucket policy (AC2.1).
- The unpinned bucket-policy statement, and IAM resources outside any test (AC2.2, AC2.3).
- rc-7 AC2.3's expected plan of 1 change (AC2.4).
- The site default title on `/projetos` and its pin at `layout-shell.spec.ts:123` (AC3.1, AC3.2).
- The non-empty and not-`projetos` title checks (AC4.1, AC4.2).
- The content-read install-command assert (AC4.4).
- Line endings left to each checkout (AC5.1).

### Closure

- Memory:
  - `e2e-suite`: `:27` covers both workflows installing Chromium without system packages, and `:38-42` says every title check compares a literal and the index has its own title;
  - `site-chrome`: the index's title;
  - `deploy-infrastructure`: no `PutObjectAcl`, the bucket-policy literal and the IAM header pin, replacing `:44`'s coverage gap;
  - `blog`: the CLI case from outside `frontend/`;
  - `memory.py drift` lists no uncovered unit.
- AC1.2's run id goes in the closure summary.

## 5. Carried live checks

The releases law gives these no other home, so rc-8's closure summary names each one: in `delivered` once collected, in `carried` while it waits on the promote.

| owed by | check | state |
|---|---|---|
| rc-7 AC2.3 | the boundary apply | Superseded by AC2.4, at the promote. |
| rc-7 AC4.2, AC5.1 | the rc PR's E2E installing Chromium without system packages, and every CI job | Collected: PR #39, all checks pass (intake 220). |
| rc-5 AC2.1–AC2.3, rc-6 AC3.3 | the prod schema check | After the promote. |
| rc-5 AC1.4 | the Dependabot read: 0 open alerts and none dismissed | At the promote. |

## 6. Constraints, risks and the promote order

**Order:**

1. The operator applies the central panel's bootstrap.
2. This candidate runs.
3. The 0.1.0 promote, with AC2.4's dispatch.
4. The central panel's promote.
5. The next release's first candidate, the beacon tag.

| risk | answer |
|---|---|
| `PutRolePolicy` is refused, because the apply role writes a role policy only on a bounded role. | `aws_iam_role_policy` references the role, so Terraform updates the role's boundary first, and the policy write then meets the condition. |
| The deploy needs `PutObjectAcl` after all. | No `aws s3` call passes `--acl`, and the bucket blocks public ACLs. AC2.4 ends on a green stage deploy before prod is dispatched. |
| The plan shows more than 3 changes. | rc-5's applies were green on 2026-11-11, and since then the module has changed only by rc-6's and rc-7's edits named here. The guard refuses any delete or replace, and AC2.4 reads the plan line. |
| A declared parser changes the lock. | It is declared at the version the lock resolves, so `npm ci` installs the same tree, and the lock diff is the root `devDependencies` entry only. |
| The index title changes the title a visitor sees on `/projetos`. | Intended. Leaving the index restores the previous title (the SEO hook's cleanup), and a project page sets its own. |
| `WT merge` refuses an implementation commit that touches the repo's `tests:` globs. | Every task that touches a test is a `test(` commit in its own tree. |

## 7. Open questions

None for the operator beyond approving this SPEC. The approval grants the assert removals of AC4.1 and AC4.2, and the test moves of AC1.1, AC2.2, AC2.3, AC3.2 and AC4.4.
