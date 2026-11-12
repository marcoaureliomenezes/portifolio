# PLAN — Release 0.1.0, rc-7

**Status:** Approved
**Approved:** 2026-11-12, operator: "Aprovo (Recommended)"
**Owner:** dd-sw-engineer-sr

Paths are relative to the repo root (the app is under `frontend/`). Tree: the rc-7 `wt-rc`, SPEC at `c2682bd` (Draft). Facts are read in this tree and from the as-is review handoff of 2026-11-12. The repo `verify:` line is unchanged: `npm --prefix frontend run verify` (measured 32.5 s wall, exit 0, at the as-is review with `time npm --prefix frontend run verify`).

## 1. As-is review

Ledger slice: `bugs.py status` 0 open; the SPEC's Bug window review reads the units below. The SDK's one fix (`338a964`) is closed by the DELETE. The policy test's chain (`32269ed`, then rc-6's rebuild, then three open probes) is the one REBUILD, and it shrinks.

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `frontend/vendor/analytics-sdk/**` | 7 tracked files, 262 lines; with an endpoint it writes a per-tab UUID to `sessionStorage`; no endpoint is ever set | 1 (`338a964`, HIGH) | DELETE | the central panel's contract allows no storage and no identifier; no event ever reached an ingest endpoint |
| `frontend/package.json:30`, `package-lock.json` (3 entries: `:11`, `node_modules/@dadaia/analytics-sdk`, `vendor/analytics-sdk`), `frontend/.gitignore:15-16`, `frontend/.env.example` | the dependency, its lock entries, the `dist/` exemption and the one variable the SDK read | 0 | DELETE | nothing else uses them |
| `main.tsx:9-17` `init`, `App.tsx:8,43-46` `page_view` effect | start the SDK and count one page view | 1 (same) | DELETE | `App`'s `useEffect` import goes if it has no other user |
| `track` calls: `ThemeToggle.tsx:19`, `LanguageSelector.tsx:35`, `HeroSection.tsx:80`, `ProjectCard.tsx:25`, `RoleCollapsible.tsx:31`, `LibraryProjectTemplate.tsx:39,62` | each is a side call after the act that matters | 0 | DELETE | the wrapper handler keeps its one act (`toggleTheme()`, `onLanguageChange(next)`, `setOpen(next)`); the two `onClick` props with only a `track` leave |
| `CodeBlock.tsx:9,13,29` `onCopy`; `LibraryProjectTemplate.tsx:33` `link(…, action?)` | one producer (`:62`) and one use of `action`; both dead after the DELETE | 0 | DELETE | a parameter nothing passes is dead; the deletion test |
| `analyticsBeacon.test.ts`; the `track` and `onCopy` cases and mocks in `LibraryProjectTemplate.test.tsx`, `RoleCollapsible.test.tsx`, `ProjectSections.test.tsx`, `CodeBlock.test.tsx`; the mock in `blogRoutes.test.tsx:5-6` | 13 asserts on the deleted behaviour (AC1.3) | 0 | DELETE | they test what leaves; the operator's order is the SPEC approval |
| `terraform/modules/portfolio-static-site/iam.tf:18-44` `aws_iam_role.github_actions_deploy` | no `permissions_boundary`; the file has no partition or account data source | 2 (`438e193`, `171db50`, both deleted lines) | UPDATE | two data sources and one attribute; the policy and the trust are unchanged |
| `frontend/src/deployRolePolicy.test.ts` | a forbidden-word list became three regex collectors over HCL; three probes pass (`NotAction`, `Action = local.x`, `Statement = concat(…)`) | 1 (`32269ed` is its RED; rebuilt once) | REBUILD | the cause is parsing HCL with regexes; compare each block as one literal |
| `.github/workflows/deploy.yml:113,121,183,191`, `terraform.yml:51,53` | six `${{ }}` inside `run:` scripts (secrets, vars, `github.sha`) | 2 (`terraform-workflow-cannot-plan-or-apply`, `ci-never-runs-the-checks-develop-requires`) | UPDATE | `env:` plus quoted shell variables; `$GITHUB_SHA` for the sha |
| `.github/workflows/ci.yml:140` | `playwright install --with-deps chromium` ran apt; failed three runs on PR #38 | 0 | UPDATE | drop `--with-deps`; the Lighthouse job on the same image runs Chrome with no install |
| `.github/workflows/ci-weekly.yml:36` | the same line, also installs WebKit | 0 | KEEP | stated non-goal; WebKit needs its packages; it gates no merge |
| `frontend/src/terraformWorkflow.test.ts` | pins triggers, environment, role and apply order of `terraform.yml` by line | 1 (`terraform-workflow-cannot-plan-or-apply`) | KEEP | still holds after the env edit; the new pin test reads the `run:` scripts, a different fact |
| `frontend/src/lib/{buildBlog,blogPages,blogFeed}.test.ts:16,13,15` | module-scope `process.chdir(frontend)`; vitest already runs in `frontend/` | 0 | DELETE | 3 lines |
| `frontend/src/pages/blog/BlogIndexPage.test.tsx:83-88` | repeats the order assert of the `it.each` (`:70-81`) on the same fixture | 2 (`blog-pending-test-waits-by-clock`, rc-6 title rework) | DELETE | exact duplicate |
| `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts:110-133` PC-E2E-35 | reads `page.title()` once (`:120`) and uses it as the expected value (`:124`, `:128`) | 1 (`layout-shell-title-read-races-the-language-switch`, `8a9e766`) | UPDATE | three literals; this is the family's last one-shot read |
| `frontend/src/lib/homeParity.test.ts:54-59` | pins the hero-media check (`check-i18n-parity.mjs:278`) only | 0 | KEEP + test | one case for `:317`, which removing alone leaves the suite green; no source change |
| `frontend/scripts/check-i18n-parity.mjs:317` | the section-media check, untested | 0 | KEEP | the rule works; only its pin is missing |
| `frontend/index.html`, `terraform/**` headers, `lighthouserc.json` | no CSP, no framing policy; no `upload` block | 0 | KEEP | the beacon tag is the next candidate (SPEC §3) |

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| what the site counts or stores about a visitor | the central panel's beacon (a later candidate); this repo stores only `localStorage` language and theme | none | `@dadaia/analytics-sdk`, `init`, 8 `track` calls, `dadaia_session_id`, `VITE_ANALYTICS_ENDPOINT` |
| what the deploy role may do and carry | the `iam.tf` role and policy blocks | `deployRolePolicy.test.ts` (each block as one literal), `terraform.yml` apply | the policy test's three collectors |
| which values reach a workflow shell | `env:` blocks of the workflows | the `run:` scripts; one test over `.github/workflows/*.yml` | the six inline `${{ }}` |
| which E2E install a PR runs | `ci.yml` | the `CI / E2E` job | `--with-deps` in `ci.yml` |
| the document title a spec expects | literals in `layout-shell.spec.ts` | `useDocumentSeo` | the one-shot `page.title()` read |

Consumers of a changed name: `onCopy` has one producer (`LibraryProjectTemplate.tsx:62`) and one declaration; `link`'s `action` is passed by two of its three callers (`:54,55`). `grep -rn 'onCopy\|analytics-sdk' frontend` across `src`, `tests`, `scripts` is the sweep. No grammar, format or fix line changes, so no other repo of the context consumes anything this rc removes.

## 2. Order and seams

### 2.1 Waves, write sets, order

The four write sets are disjoint (`release.py check`). **Agent cap: 3 at once.** No job waits on another, so the waves are the SPEC's ranking, held by the cap: Jobs 1 and 2 in wave 1 (law and dev loop), Job 3 in wave 2 (shared foundation), Job 4 in wave 3 (the deploy role). Dispatch Job 3 as soon as a wave-1 slot frees, then Job 4. Each job runs one task at a time.

- **The reconcile** is the `wt-rc`'s last commits, no job (`RC-FLOW.md` step 4): memory pass per SPEC Closure (the `analytics-sdk` atom deleted, `library-page`, `deploy-infrastructure`, `e2e-suite`), the carried checks of SPEC §5 into the closure summary, then `memory.py drift` lists no uncovered unit.
- A behaviour is two tasks, RED then source. A DELETE has no RED: its AC is a sweep. Every task that touches a file in the repo's `tests:` globs is a `test(<task>)` commit, because `WT merge` refuses an implementation commit that touches them; source tasks come after the test tasks that free them.
- Test-only tasks that pin behaviour already true (J2.T4) have no source task: the reviewer reverts the rule and sees the case go red.

### 2.2 Shared contracts the jobs read

- **The `run:` extraction (J1.T1).** A script is the text of an inline `run: <cmd>` or of a block scalar (`run: |`, `run: >`), up to the first line indented no deeper than the `run:` key. The test fails with `file:line` for every `${{` inside one, and asserts each of the four workflow files yields at least one script, so a broken extractor cannot pass empty.
- **The boundary expression (J4).** Verbatim from SPEC AC2.1: `permissions_boundary = "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:policy/portifolio-roles-boundary"`, with `data "aws_partition" "current" {}` and `data "aws_caller_identity" "current" {}` in `iam.tf`.
- **The block literals (J4.T1).** The role block runs from `resource "aws_iam_role" "github_actions_deploy" {` to the next line that is exactly `}`; the policy block likewise from `resource "aws_iam_role_policy" "github_actions_deploy" {`. Each is compared with `toBe` against a template literal that holds the whole block.
- **Env names in `deploy.yml` (J1.T2).** `DISTRIBUTION_ID` is set from the secret in the step's own `env:`; `GITHUB_SHA` needs no `env:`.

### 2.3 Definition of done, recipes, ports

- **The job gate** is the repo `verify:` line: `npm --prefix frontend run verify`. Every job's Definition of done is that line plus the test directories its change reaches, as its job file lists. No gate, preflight or step is added and nothing reruns a check the merge runs.
- **Typecheck:** `npm --prefix frontend run typecheck` (`tsc --noEmit -p tsconfig.app.json`).
- **No local AWS** (`AGENTS.md`, "Sem credenciais AWS locais"): no `terraform plan`, `apply`, `import`, no `aws` call, no AWS-profile variable. Allowed: `terraform fmt -check`, `terraform init -backend=false` and `terraform validate` (the provider download is a registry fetch, not an AWS call), with the plugin cache at `.dadaia/tmp/terraform-cache` and the tree left clean.
- **The E2E recipe** (J2.T3 only; no other task serves a page):
  1. From `frontend/`, `npm run build` (`verify` has already built `dist`). Open a port with a project name of the task, not the repo's (`portifolio-j2`): `python3 .agents/skills/dd-cli-library/scripts/registry.py next --project portifolio-j2 --json`, then `register --port N --project portifolio-j2`.
  2. Start `npx vite preview --port N --strictPort` on loopback, as its own process group.
  3. Run `E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium tests/e2e/projects-cluster/layout-shell.spec.ts`.
  4. Kill the process group, then `registry.py release --port N`.
- **Asserts removed or moved** are rulings the operator grants by approving the SPEC; each lands as a `test(<task>)` commit that names its AC and "operator approval of the rc-7 SPEC":
  - AC1.3, 13 asserts (J3.T1-T3); the count per file is in each task.
  - AC3.2, one case with its assert (J2.T2).
  - AC2.2, the four policy-test cases become two literal compares (J4.T1); each assert tightens.
  - AC3.3, three title reads become literals (J2.T3).
- **A red outside the diff** is listed by name as suspected pre-existing and proven at the merge base before it is called so.

### 2.4 Promote-facing steps (no job; the main thread drives them)

In order:

1. The operator applies the central panel's bootstrap (the boundary exists).
2. This candidate's `wt-rc` merges, the rc PR merges into develop, and every CI job is green (AC5.1). `CI / E2E` green is AC4.2's evidence; the job's hand-back says which form landed.
3. The 0.1.0 promote to `main`, with `terraform.yml` dispatched for stage, then prod (AC2.3). Each run must show `0 to add, 1 to change, 0 to destroy`, the guard and the apply green. A green stage deploy run follows before prod is dispatched. The run ids go in the closure summary.
4. The central panel's promote.
5. A one-job candidate adds the beacon tag.

SPEC §5's carried checks that wait on the promote (the prod schema check, the Dependabot read) are read at step 3.

### 2.5 PLAN-stage ADR check

No decision here crosses the threshold: no new layer, dependency, gate or public name. The only addition is one test file (J1.T1), which reads text and adds no dependency. No ADR.

### 2.6 Acceptance map

| AC | task | level |
|---|---|---|
| AC1.1 | J3.T4-T7 | none; grep sweep |
| AC1.2 | J3.T4, J3.T5 | unit, E2E (existing) |
| AC1.3 | J3.T1, J3.T2, J3.T3 | unit |
| AC2.1 | J4.T2 | unit (AC2.2) |
| AC2.2 | J4.T1 | unit |
| AC2.3 | J4.T2 (live: §2.4 step 3) | integration, CI once |
| AC3.1 | J2.T1 | unit |
| AC3.2 | J2.T2 | unit |
| AC3.3 | J2.T3 | E2E |
| AC3.4 | J2.T4 | integration |
| AC4.1 | J1.T1, J1.T2, J1.T3 | unit |
| AC4.2 | J1.T4 | integration, CI |
| AC5.1 | J1.T4, J2.T4, J3.T7, J4.T2 (each job's last task, its Definition of done) | verify |

### 2.7 Open points for the main thread

1. **J1.T4 has no local evidence.** `--with-deps` is removed, but only a runner proves Chromium launches. The task names the fallback (channel `chrome`); the rc PR's `CI / E2E` is the evidence.
2. **AC2.3 has no task.** It is a CI dispatch at the promote (§2.4); J4.T2 carries it in its AC column so the map is complete, and its Definition of done is the local `terraform fmt`, `init -backend=false`, `validate`.
3. **The SPEC's line references were checked against this tree** and hold (`ci.yml:140`, the three `chdir` lines, `.gitignore:15-16`, the three lock entries, `onCopy`, the AC1.3 line lists). The `terraform init -backend=false` of J4.T2 writes `.terraform/`, which the repo `.gitignore` already covers (`:31-32`).

## DAG

| job | waits on | wave | W: |
|---|---|---|---|
| Job 1 | — | 1 | `.github/workflows/deploy.yml`, `.github/workflows/terraform.yml`, `.github/workflows/ci.yml`, `frontend/src/workflowScripts.test.ts` |
| Job 2 | — | 1 | `frontend/src/lib/buildBlog.test.ts`, `frontend/src/lib/blogPages.test.ts`, `frontend/src/lib/blogFeed.test.ts`, `frontend/src/pages/blog/BlogIndexPage.test.tsx`, `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts`, `frontend/src/lib/homeParity.test.ts` |
| Job 3 | — | 2 | `frontend/vendor/analytics-sdk/**`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/.gitignore`, `frontend/.env.example`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/components/header/ThemeToggle.tsx`, `frontend/src/components/header/LanguageSelector.tsx`, `frontend/src/components/portfolio/HeroSection.tsx`, `frontend/src/components/portfolio/RoleCollapsible.tsx`, `frontend/src/components/projects/ProjectCard.tsx`, `frontend/src/components/projects/CodeBlock.tsx`, `frontend/src/pages/projects/LibraryProjectTemplate.tsx`, `frontend/src/lib/analyticsBeacon.test.ts`, `frontend/src/pages/blog/blogRoutes.test.tsx`, `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx`, `frontend/src/components/portfolio/RoleCollapsible.test.tsx`, `frontend/src/components/projects/__tests__/ProjectSections.test.tsx`, `frontend/src/components/projects/__tests__/CodeBlock.test.tsx` |
| Job 4 | — | 3 | `terraform/modules/portfolio-static-site/iam.tf`, `frontend/src/deployRolePolicy.test.ts` |
