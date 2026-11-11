# PLAN — Release 0.1.0, rc-5

**Status:** Approved
**Approved:** 2026-11-07, operator: "Aprovo (Recommended)"
**Owner:** dd-sw-engineer-sr

Paths are relative to the repo root (the app is under `frontend/`). Tree: the rc-5 `wt-rc`, SPEC at `5c1dccc` (Draft; AC5.6 and AC5.7 arrive by the SPEC amendment in flight). Facts are read at `25d1dd5` from the as-is handoff `2026-11-07T154000Z`, the grill handoff `2026-11-07T160500Z` and the consumer pre-mortem. The repo `verify:` line (`npm --prefix frontend run verify`) is unchanged.

## 1. As-is review

Ledger slice (`bugs.py status`: 0 open, 12 resolved; `_archive/bugs_histo.jsonl`: 7). Per unit, the id-line query `git log -E --grep '^(fix|refactor)\(bugs\): ' -- <file>` names the records below; no REBUILD is due by `bugs.py stats`, and the REBUILD verdicts rest on the demand (LINEAGE §The filter).

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `frontend/package.json`, `package-lock.json` | 41 open alerts, `npm audit` 43 (1 critical, 24 high); zod `^4.4.3`, vitest `^4.1.6`, `@lhci/cli` `^0.15.1`, `react-router-dom` `^6.26.2` | 2 (`content-schema-export-is-empty` 96fc100, `content-validation-never-runs` c2ba6fc), no child | UPDATE | Scratch run on the base lock (recipe of the as-is handoff): the three majors, zod `^4.6.7`, `npm audit fix` and three scoped overrides give 0 vulnerabilities. One task per major (J1.T2-T4), the rest in J1.T5. |
| `frontend/bun.lockb` | stale binary second lock, no reader | 0 | DELETE | npm is the manager (J1.T1) |
| `terraform/modules/portfolio-static-site/iam.tf:31-38` | trust `StringLike sub = repo:<owner>/<repo>:*` | 0 | UPDATE | Issued subject read: default form, `sub_claim_prefix = repo:<owner>/<repo>`. `deploy.yml` jobs declare `environment: stage` and `environment: production`. Trust becomes `StringEquals` on `<prefix>:environment:<gh-env>`; one local maps `prod` to `production` (J2.T2). |
| `terraform/modules/portfolio-static-site/ssm.tf` | none | 0 | ADD | No unit carries SSM parameters. Reference: the sibling module's `ssm.tf` (two String resources). The sync reads us-east-1 (its four existing parameters live there, none in sa-east-1), the module's default provider is sa-east-1, so both resources take `provider = aws.us_east_1`, which the module already receives (J2.T1). |
| `.github/workflows/deploy.yml` (`deploy-stage`, `deploy-prod`) | two syncs per job; the second (`--delete`, `--exclude "assets/*"`) reaches `content/*` and `schema/*`; no schema write | 0 (rc-4 J2 wrote it) | UPDATE | `--exclude "content/*" --exclude "schema/*"` on the second sync, plus one `aws s3 cp` of the schema key, in both jobs. Net lines grow; reason: new behaviour (AC2.3), no existing line carries it. The two-copy shape stays: merging needs per-environment secret renames, an operator act. |
| `.github/workflows/terraform.yml` | red since May 2026: PR jobs refused by the environment branch policy, the unapproved prod apply expired, the one job that ran lacks infra rights | 0 | KEEP in rc-5 | Owned by the hotfix lane `terraform-workflow-cannot-plan-or-apply`; rc-5's `W:` stays off it. |
| `frontend/scripts/export-content-schema.mjs`, `public/content/schema/v1.json`, `src/lib/contentSchemaExport.test.ts` | draft-07, `$ref` + `definitions` wrapper, written under `content/*`; test navigates the wrapper (`:10`, `:12`) and pins the old pattern (`:48`) and the media `oneOf` location (`:76-83`) | 2 (`content-schema-export-is-empty` 96fc100; `content-schema-rejects-committed-content` 9101242, already a REBUILD of this script) | REBUILD | The demand changes its fundamental behaviour (2020-12, root schema, new path, new owner of the path). Two records on one unit: it takes no third patch (J5.T2, J5.T3). |
| `frontend/src/lib/schemas/projects.ts` rules (`HttpUrl`, new `Email`, `SiteRelativeUrl`) | `HttpUrl = z.string().url().regex(...)` (:17): two validators, only the regex emitted | 3 (`content-urls-accept-script-schemes` b3b14ff = fix, wrote `.url().regex()`; `content-validation-never-runs` c2ba6fc; `cv-url-rule-...` 56128c4 = REBUILD of `SiteRelativeUrl`, caused_by b3b14ff) | REBUILD `HttpUrl`, ADD `Email`, KEEP `SiteRelativeUrl` | Structural cause: two validators per field, one emitted. `SiteRelativeUrl` already has the one-regex shape; `HttpUrl` follows it. Email joins as a sibling rule in the same home. |
| `projects.ts` `kindLabels` (:189-197), the three locales (:548-553) | optional block; `case-study` is not a valid Sanity field name; no `src/**` reader, no assert | 0 | DELETE | AC3.4. Consumers: `projects.ts`, 3 locales, `v1.json`, memory `content-contract.md:46` (closure). |
| `frontend/scripts/content-schema.mjs` | `.catchall(z.unknown())` over 25 undeclared label keys; `email: z.string().email()`; `link: z.union([HttpUrl, z.literal("#")])` | 3 (as above) | UPDATE | Declare the 25 keys (`src/types/content.ts` is the model), email = the one rule, `link` = one regex that admits `#` (a single string, no `anyOf`). |
| `projects.ts` `media` (:68, :81) and its consumers | `MediaSchema.optional()`: a `oneOf` of objects under a property, which the Studio mapping makes read-only (7 nodes) | 2 on the render side (`media-resize-keeps-old-cut`, `media-empty-box-layout-shift`, both e1bc71f in `Media.tsx`, which stays) | REBUILD (shape) | Operator point 8: the panel's generator is not widened. `media` becomes a list, so the union sits under `items`. The rejected alternative, a flat object with optional cuts, loosens the contract (a video without cuts would pass). Consumers: `projects.ts` (2), `LibraryProjectTemplate.tsx:65,88`, `ProjectSections.tsx:30`, `ProjectCard.tsx:15`, `check-i18n-parity.mjs:258-300`, 8 media nodes per locale (24 edits), 5 unit tests and 2 E2E specs (`rand-engine.spec.ts:29`, `library-scenes.spec.ts:23-24`). |
| `LibraryProjectTemplate.tsx`, `ProjectCard.tsx:48`, the locales' library blocks | `pypi.version` rendered; 9 literals per locale beside it (1 Try-it pin, 4 + 4 facts tags, the two libraries use different tag forms: with and without `v`) | 0 | UPDATE | `{version}` and `{tag}` placeholders, optional `pypi.tagPrefix`; one pure render function (ADD `src/lib/libraryRender.ts`: `ProjectSections` is shared with the meta and case-study templates, `projects.ts` must stay out of the bundle) (J7). |
| `src/pages/blog/BlogIndexPage.tsx:14` | re-sorts posts the reader already ordered | 0 (the reader's order: rc-4 `blog-*` records, all REBUILD, none after) | DELETE | one order decider (J3.T2) |
| `scripts/build-blog.mjs` `renderBody`, `buildBlog.test.ts:99` | marked defaults: a body `#` renders `<h1>`, the second on the page; the test pins `<h1>A heading</h1>` | 4 REBUILDs (75cd824, cbd5fc2, f16464b, e7c1c63), none after the last | UPDATE | AC5.6, new behaviour: a `heading` renderer shifts each level down one, capped at 6. The `:99` assert moves under the AC (J3.T1, J3.T3). |
| `buildBlog.test.ts`, `BlogPostPage.test.tsx` | attribute escaping (`alt`, `href`) and the empty-tags partition of `PostMeta.tsx:16` untested | 1 (`blog-tags-label-unread` e48d354 added the guard) | UPDATE | two asserts added, none moved (J3.T1) |
| `frontend/tests/e2e/**` language switch | 13 copies of "open the combobox, click the option" (4 functions: `fixtures/experience-helpers.ts:53` shared by 3 specs, `i18n-no-hardcoded.spec.ts:47`, `cv-download-routing.spec.ts:49`, `i18n-projects.spec.ts:22`; 9 inline: `post-strict-flip-smoke.spec.ts:63`, `language-switch.spec.ts:28,41,57`, `lang-persistence.spec.ts:29,45,69,90`, `layout-shell.spec.ts:134`); none waits for the loaded locale (`LanguageContext.tsx:224-226` sets content after the fetch, the trigger flips first) | 1 (`layout-shell-title-read-races-the-language-switch` 8a9e766 patched 2 copies; 910d269 and 8ce4c64 the same race: third occurrence) | REBUILD | Structural cause: no single helper. One `fixtures/language.ts` waits for loaded content; the 13 copies go (J4). Net lines negative. |
| `README.md:50` | Node floor below what the build needs | 0 | KEEP in rc-5 | hotfix lane `readme-node-floor-below-what-the-build-needs`. Job 1's majors move the floor (engines read 2026-11-07: `@lhci/cli` 0.16 `>=22.19.0`, vitest 5 `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`, vite 7.3.7 `^20.19.0 \|\| >=22.12.0`); the lane states `>=22.19`. |
| `projects.ts:2-12`, `content-schema.mjs` and `export-content-schema.mjs` headers | false "only imported by `useContent.ts`", task/SPEC ids, stale path and `.catchall` comments | 0 | UPDATE | docs only (J5.T7) |

Duplicated deciders, with the repro where the copies diverge:

- **URL validity:** `projects.ts:17` (`.url()`) against the emitted `pattern`. Repro: `HttpUrl.safeParse("https://")` fails while the emitted `^https?:\/\/` matches it; `https://a.b/x y` is the reverse. J5.T4 leaves one regex.
- **Email validity:** `.email()` against the emitted `format: email` and zod's own pattern. J5.T4 leaves one regex.
- **Post order:** the reader and `BlogIndexPage.tsx:14`. Repro: index data written out of order renders re-sorted. J3.T2 deletes the second.
- **Language switch:** the 13 copies above. J4.
- **Version of a library:** `pypi.version` against the 9 literals per locale. J7.

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| is a link valid | `HttpUrl` and `SiteRelativeUrl` (one regex each, emitted as `pattern`), `CertLink` composes `HttpUrl` + `#` | `content-schema.mjs`, `build-blog.mjs:22`, the Studio and the sync (the published `pattern`) | `.url()` in `HttpUrl` |
| is an email valid | `Email` in `projects.ts` | the export | `.email()`, the emitted `format` |
| what the published contract is | `content-schema.mjs`, exported by `export-content-schema.mjs` to `public/schema/site-content.schema.json` (2020-12) | the sync's Ajv, the panel's studio step, the deploy | `public/content/schema/v1.json`, the draft-07 wrapper |
| who writes the schema key | the deploy: one `aws s3 cp` of that key, per job | the panel's studio step reads it from the prod bucket | the old upload through the no-cache sync |
| who writes or deletes `content/*` after the switch | the sync | the deploy's syncs exclude `content/*` and `schema/*` | the deploy's upload of the repo JSON |
| a library's version | PyPI through the panel's versions job, into `pypi.version` | `libraryRender.ts` (`{version}`, `{tag}`) | 9 literals per locale |
| a tag's form | `pypi.tagPrefix` (empty when absent) | `libraryRender.ts` | none |
| a Sanity-valid key | `^[A-Za-z_][A-Za-z0-9_]*$`, walked by `contentSchemaExport.test.ts` | the keys of `projects.ts` and `content-schema.mjs` | `kindLabels` |
| a media node's shape | `MediaSchema` as list items | `Media.tsx` (one media), the three consumers | the property-level union |
| OIDC subject of a deploy role | `iam.tf` local: `<sub_claim_prefix>:environment:<gh-env>` | `deploy.yml` `environment:` | the `:*` wildcard |
| SSM names of a site | `ssm.tf` | the panel's `sites.tf` | none |
| post order | `scripts/blog-posts.mjs` `readPosts` | `build-blog.mjs`, `BlogIndexPage.tsx` | the page's sort |
| a post body's heading level | the `heading` rule of `build-blog.mjs` | the post page | the marked default |
| how E2E switch language | `tests/e2e/fixtures/language.ts` | every spec | 13 copies |
| the job gate | `package.json` `scripts.verify` | CI on push | none (unchanged) |

## 2. Order and seams

### 2.1 Waves, write sets, order

- **Wave 1:** Jobs 1 (dependencies), 2 (infra and deploy), 3 (blog and carried rows), 4 (E2E switch). Disjoint `W:` sets, proved by `release.py check`.
- **Wave 2:** Job 5 (rules and the published schema), after Job 1's zod.
- **Wave 3:** Job 6 (mappable media), after Job 5: both write `projects.ts`, the three locales and the published schema.
- **Wave 4:** Job 7 (versions), after Job 6: `projects.ts`, the locales, `rand-engine.spec.ts`.
- **Promote-facing, no job** (§2.4): the Terraform apply, the stage checks, the alert read.
- **Hotfix lanes** (`specs/bugs/AGENTS.md`, Resolution): two remain, `terraform-workflow-cannot-plan-or-apply` and `readme-node-floor-below-what-the-build-needs`. They land on `feature/0.1.0` before the jobs start and this `wt-rc` syncs after each. rc-5's `W:` sets are off `.github/workflows/terraform.yml` and `README.md`. The heading level (AC5.6) and the E2E switch (AC5.7) are rc-5 scope: `build-blog.mjs`, `buildBlog.test.ts` and the E2E files are in Jobs 3 and 4, with no lane wait.
- A behaviour is two tasks, RED then source. All tests, E2E and the helper `fixtures/language.ts` included, are `test(<id>)` commits: `WT merge` refuses an implementation commit that touches the repo's `tests:` globs. Terraform and deploy tasks have no RED: their ACs are proved by the dispatch plan and the stage checks (SPEC), and no local test can see an IAM trust.

### 2.2 Shared contracts the jobs read

- **Published schema.** Source of truth `frontend/scripts/content-schema.mjs`; export `frontend/scripts/export-content-schema.mjs`; committed file `frontend/public/schema/site-content.schema.json` (vite copies `public/` into `dist/`, and the deploy jobs only download the `dist` artifact, so the file must live there). Root `$schema` is the one zod 4 emits for 2020-12 (verified: `z.toJSONSchema(schema, { io: "input" })` with zod 4.6.7 writes `https://json-schema.org/draft/2020-12/schema`), no `$ref`/`definitions`, no `$comment` wrapper. `npm run schema:export` writes it, `schema:check` compares. Every task that changes a rule or the content shape re-records the file in the same commit (it is in that task's `W:`).
- **Rules.** `HttpUrl = z.string().regex(R)` where `R` reuses the sibling site's strict rule widened to both schemes: `^https?:\/\/[\w.-]+(:\d+)?([/?#]\S*)?$`. It refuses `https://`, a `%` or `|` in the host and a space in the path, and admits `{`/`}` in the path (AC4.1). `Email = z.string().regex(...)`, a simple `^[^@\s]+@[^@\s]+\.[^@\s]+$` shape that every committed email passes. `CertLink` is one regex built from `HttpUrl`'s source plus `#`. Every rule uses only escapes that mean the same with and without the `u` flag (no `\p{}`); the test compiles the emitted pattern both ways, no Ajv dependency is added.
- **Studio mapping walk** (`contentSchemaExport.test.ts`): every `properties` key matches `^[A-Za-z_][A-Za-z0-9_]*$`; no `anyOf` anywhere; every `oneOf` is a direct child of an `items` with a `const` on each branch (asserted from Job 6 on); no `type: "null"`, no untyped node.
- **Top-level keys (AC3.5).** The schema declares 35 keys: the 10 it has (`schema_version`, `published_at`, `profile`, `resume`, `header`, `experiences`, `certifications`, `education`, `skills`, `projectsV2`) and the 25 label keys. `required` equals the keys `src/types/content.ts` requires, plus the three the type marks optional and the contract requires, `schema_version`, `published_at` and `projectsV2` (the type keeps them optional because fixtures omit them; making the contract optional would loosen it). The test names those three. Nested label objects (`siteChrome`, `heroCTAs`, `archPage`, `libraryPage`, `heroStatsSuffix`) are declared with their keys; `archPage` and `libraryPage`, `heroTagline`, `heroCTAs` and `featuredProjectsTitle` are optional as in the type.
- **Media list.** `media: z.array(MediaSchema).optional()` on the hero and on a section. The components map the list; `ProjectCard` takes the first video; `Media.tsx` is unchanged (one media). Locale data wraps each of the 8 nodes in `[...]`, by one scripted transform per locale, not by hand.
- **Placeholders.** `{version}` becomes `pypi.version`; `{tag}` becomes `tagPrefix + pypi.version` (empty prefix when absent). `libraryRender.ts` exports one pure function over a `LibraryProject` that returns the project with `pypi.installCommand`, every section `code` and every item `href` substituted. Validation reads raw content; substitution runs at render only. It imports no zod.
- **Terraform.** `variables.tf` gains `site` (the repo name as default); `ssm.tf` has `/static-sites/${var.site}/${var.environment}/{bucket,distribution-id}` with `provider = aws.us_east_1`, `type = "String"`, values from the module's own bucket and distribution. `locals.tf` gains `github_environment = var.environment == "prod" ? "production" : var.environment` and the issued prefix; `iam.tf` trusts `StringEquals` on `"${prefix}:environment:${local.github_environment}"`. `terraform/envs/*` need no edit (the new variable has a default).
- **Deploy.** In each job: the second sync gains `--exclude "content/*" --exclude "schema/*"`; one step `aws s3 cp dist/schema/site-content.schema.json s3://<bucket>/schema/site-content.schema.json --content-type application/json --cache-control no-cache` runs after the credentials step. The existing cache rule and the route upload do not change.
- **Heading shift.** A marked `heading` renderer emits `<h{min(depth + 1, 6)}>` over the parsed inline tokens; no `id` attribute (the default emits none).
- **E2E helper.** `switchLanguage(page, option)` in `frontend/tests/e2e/fixtures/language.ts`: opens the combobox, picks the option, waits for the `/content/<lang>.json` response, then for a label read from `public/content/<lang>.json` (the header nav label) to show in the header. Content, not the trigger text (`LanguageContext.tsx:224` against `:243`).

### 2.3 Definition of done, E2E and ports

- **Every job's Definition of done** is the repo `verify:` line plus the test directories its change reaches, as its job file lists. No gate, preflight or step is added; `lighthouserc.json`'s content, `ci.yml` and `playwright.config.ts` do not change; nothing reruns a check the merge runs.
- **Jobs that change a served page or the E2E (Jobs 3, 4, 6, 7)** also run the specs named in their job file, with the rc-4 recipe: `verify` has built `frontend/dist`; register one port per job (Job 3 5301, 4 5302, 6 5303, 7 5304) with `registry.py`; from `frontend/` start `npx vite preview --port N --strictPort` on loopback; run `E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium <specs>`; stop the server and release the port.
- **Job 2** also runs, from the repo root and without any credential, `terraform fmt -check -recursive terraform` and, in each of `terraform/envs/stage` and `terraform/envs/prod`, `terraform init -backend=false` then `terraform validate`. No `plan`, no `apply`, no AWS call (repo `AGENTS.md` stop condition).
- **A red outside the diff** is listed by name as suspected pre-existing and proven at the merge base before it is called so.
- **Pre-existing asserts that move** are product-contract changes the operator confirmed; each moves in a `test(<task>)` commit that names the main-thread ruling and keeps the partition: `contentSchemaExport.test.ts:10,:12,:16-21,:25,:48,:76-83` (J5.T2, J6.T1), `buildBlog.test.ts:99` (J3.T1), the `rand-engine.spec.ts` install-command compare (J7.T1).

### 2.4 Promote-facing steps (no job; the main thread drives them)

1. After this rc merges into `feature/0.1.0`, the rc PR to develop runs CI; after the merge, the `Deploy` workflow to stage runs. Stage checks (AC2.3): `/schema/site-content.schema.json` answers 200 `application/json` with a 2020-12 `$schema`; `/content/pt.json` still answers 200; the `grep` of the stage deploy log shows no `delete:` line under `content/` or `schema/`.
2. The Terraform apply (AC2.1, AC2.2) runs only through the rebuilt `terraform.yml` dispatch, once the panel's rc-2 role and the operator's bootstrap act exist. The plan evidence comes from that run's output: 2 parameter creates and 1 trust update per environment, 0 destroy, 0 replace. No local AWS and no local plan.
3. The next stage deploy run after the apply is green (AC2.2, the narrowed trust). Prod deploys on the promote.
4. At the promote, the alert read of AC1.4 (`gh api repos/<owner>/<repo>/dependabot/alerts?state=open --paginate`, count and time recorded). A withdrawn advisory that GitHub keeps open is reported, never dismissed.

### 2.5 Pre-mortem answers (each hit of the consumer sweep)

| hit | answer |
|---|---|
| `export-content-schema.mjs:24,:26,:32-33,:44` old path, draft-7, wrapper, message | J5.T3 rewrites them |
| `contentSchemaExport.test.ts:10,:12,:16-21,:25,:78,:80-82,:48` | J5.T2 (path, wrapper, pattern literal, root), J6.T1 (media location) |
| `content-schema.mjs:7-9` comment, `package.json:22-23` script names | J5.T7 rewrites the comment; the script names stay (no `package.json` write in Job 5) |
| `public/content/schema/v1.json` | J5.T3 deletes it |
| `deploy.yml:88,:150` second syncs, the cp step after credentials (`:67-72`, `:129-134`) | J2.T3 |
| rc-4 SPEC `:269` (v1.json byte-equal) and `:126-127` (one upload rule) | broken on purpose, stated in this rc's SPEC (Replaces) |
| panel `deploy.yml:104-112` reads `schema/site-content.schema.json` from the prod bucket | order of §2.4 and the SPEC's risk table: rc-5 reaches prod first |
| panel `sync.ts:38,:53-56`, `validate.ts` (Ajv2020, draft-07 cannot compile) | the 2020-12 root of J5.T3; the sync's absent-key case needs the deploy of §2.4 |
| panel `schemaFromJson.ts` root fieldsOf reads root `properties` only | J5.T3 (no wrapper) and J5.T6 (declared keys) |
| panel studio fixture `portfolio.schema.json` drift | the panel's rc-2 re-derives it; outside this repo |
| panel `project.ts:9-10,23-25` discriminator on `items.oneOf` | `projectsV2.list` keeps its `oneOf`-of-const under `items`; J6 moves only `media` to the same shape |
| memory `content-contract.md:18,:46,:55-56`, `catalog.json:68`, `ARCHITECTURE.md:24-25`, `deploy-infrastructure.md:11-13,:37-38`, `catalog.json:83,:97-99` | the closure memory pass (SPEC Closure); no job writes `specs/memory` |
| `kindLabels` at `projects.ts:189-197`, locales `:548-553`, parity `check-i18n-parity.mjs:579` | J5.T5 (the parity script reads no `kindLabels`; the locale parity still checks the rest) |
| versions: locale lines `:654`, `:668,:673,:678,:683`, `:959,:964,:969,:974` | J7.T3 |
| `projects.ts:159-163` pypi object | J7.T2 adds `tagPrefix` |
| `HttpUrl` validates raw JSON (`contentSchemaExport.test.ts:86-91`) | the placeholder passes the rule as written (J5.T1 partitions); substitution runs at render |
| `LibraryProjectTemplate.tsx:29,:51,:54,:57-58`, `ProjectSections.tsx` shared with meta and case-study | J7.T2 substitutes in the library template once, before `ProjectSections` receives the sections |
| `rand-engine.spec.ts:44-46` compares the install command to the raw content | J7.T1 asserts the rendered value, under a named ruling |
| `iam.tf:31-38` wildcard; `var.environment` is `stage\|prod`, GitHub's is `production` | J2.T2 local map |
| `scripts/bootstrap-oidc.sh:82` wildcard bootstrap role | one-off CloudShell script for the account-wide provider; no workflow assumes it; stays, stated here, no task |
| `terraform.yml` callers, `-var-file`, backend keys, `TF_STATE_*`, `AWS_REGION` | the hotfix lane keeps them; rc-5 does not touch the file |
| README `:27,:61-64` terraform text | closure derived-docs pass (shape 9) |
| branch protection requires CI checks only | removing the Terraform PR jobs blocks no merge; no task |
| `.catchall` to declared keys (`content-schema.mjs:14-16,:119-121`) and the 25 keys | J5.T6; the panel's seed carries all 25 (SPEC Non-goals note) |
| `projects.ts:10-11` false docstring | J5.T7 |

### 2.6 PLAN-stage ADR check

No ADR is needed: every decision above follows a ruling of the grill handoff or an existing contract, none changes an architecture-level boundary (the published schema is the panel's glossary term; the media list and the placeholders are content-shape choices of this repo).

### 2.7 Acceptance map

| AC | task(s) | level |
|---|---|---|
| AC1.1 | J1.T5 | integration (`npm ls zod --all`) |
| AC1.2 | J1.T2, J1.T3, J1.T4, J1.T5 | integration (`npm audit`, one `npm run lighthouse` in J1.T4) |
| AC1.3 | J1.T1 | none |
| AC1.4 | J1.T5 (lock yields 0), §2.4 step 4 | integration at the promote |
| AC2.1 | J2.T1, §2.4 step 2 | integration (dispatch plan) |
| AC2.2 | J2.T2, §2.4 steps 2-3 | integration |
| AC2.3 | J2.T3, §2.4 step 1 | none local; stage check |
| AC3.1 | J5.T2, J5.T3 | unit |
| AC3.2 | J5.T1, J5.T4 | unit |
| AC3.3 | J5.T1 | unit |
| AC3.4 | J5.T2, J5.T5, J5.T6 (keys, `anyOf`), J6.T1-T3 (`oneOf` placement, generator probe) | unit, one integration probe |
| AC3.5 | J5.T2, J5.T6 | unit |
| AC4.1 | J5.T1 (URL partitions), J7.T1, J7.T2 | unit |
| AC4.2 | J7.T1, J7.T3 | unit |
| AC4.3 | J7.T1, J7.T2, J7.T3 | unit, reviewer diffs `pin.txt` |
| AC5.1 | J3.T1 | unit |
| AC5.2 | J3.T1, J3.T2 | unit |
| AC5.3 | J5.T7 | none |
| AC5.4 | J3.T1 | integration |
| AC5.5 | every job's Definition of done (§2.3) | verify |
| AC5.6 | J3.T1, J3.T3 | unit |
| AC5.7 | J4.T1-T4 | E2E, grep for 0 copies |

### 2.8 Open points for the main thread

1. **AC3.5 wording.** "Required exactly where the type requires" cannot hold for `schema_version`, `published_at` and `projectsV2` (optional in the type, required in the contract). The PLAN keeps them required and names them in the test (§2.2). The SPEC should say so.
2. **AC3.4 and the media list** is a content-shape change across 3 locales, 3 components, 7 tests and 2 E2E specs (Job 6). The alternative that touches nothing, widening the panel's generator, is closed by the operator's point 8.
3. **Node floor.** The lane for `README.md:50` must state `>=22.19`, which `@lhci/cli` 0.16 requires; CI uses Node 22 (any 22.x the runner image carries).
4. **Job 2 and Job 5 both fix the schema path** (`public/schema/site-content.schema.json`); the deploy `cp` fails on a deploy of a tree that holds Job 2 but not Job 5. Both land in one rc PR, so no deploy runs between them.

## DAG

| job | waits on | wave | `W:` |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/bun.lockb`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/App.tsx`, `frontend/vitest.config.ts`, `frontend/src/test-setup.ts` |
| Job 2 | — | 1 | `terraform/modules/portfolio-static-site/ssm.tf`, `terraform/modules/portfolio-static-site/variables.tf`, `terraform/modules/portfolio-static-site/iam.tf`, `terraform/modules/portfolio-static-site/locals.tf`, `.github/workflows/deploy.yml` |
| Job 3 | — | 1 | `frontend/src/pages/blog/BlogIndexPage.test.tsx`, `frontend/src/pages/blog/BlogPostPage.test.tsx`, `frontend/src/lib/buildBlog.test.ts`, `frontend/src/pages/blog/BlogIndexPage.tsx`, `frontend/scripts/build-blog.mjs` |
| Job 4 | — | 1 | `frontend/tests/e2e/fixtures/language.ts`, `frontend/tests/e2e/fixtures/experience-helpers.ts`, `frontend/tests/e2e/pages/language-switch.spec.ts`, `frontend/tests/e2e/pages/lang-persistence.spec.ts`, `frontend/tests/e2e/pages/post-strict-flip-smoke.spec.ts`, `frontend/tests/e2e/pages/cv-download-routing.spec.ts`, `frontend/tests/e2e/pages/i18n-no-hardcoded.spec.ts`, `frontend/tests/e2e/pages/ai-emphasis-content.spec.ts`, `frontend/tests/e2e/pages/role-skill-badges.spec.ts`, `frontend/tests/e2e/pages/highlight-project-block.spec.ts`, `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts`, `frontend/tests/e2e/projects-cluster/i18n-projects.spec.ts` |
| Job 5 | Job 1 | 2 | `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/lib/contentSchemaExport.test.ts`, `frontend/src/lib/schemas/projects.ts`, `frontend/scripts/content-schema.mjs`, `frontend/scripts/export-content-schema.mjs`, `frontend/public/schema/site-content.schema.json`, `frontend/public/content/schema/v1.json`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json` |
| Job 6 | Job 5 | 3 | `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/lib/contentSchemaExport.test.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx`, `frontend/src/components/projects/__tests__/ProjectSections.test.tsx`, `frontend/src/components/projects/__tests__/ProjectCard.test.tsx`, `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts`, `frontend/tests/e2e/projects-cluster/library-scenes.spec.ts`, `frontend/src/lib/schemas/projects.ts`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json`, `frontend/scripts/check-i18n-parity.mjs`, `frontend/public/schema/site-content.schema.json`, `frontend/src/pages/projects/LibraryProjectTemplate.tsx`, `frontend/src/components/projects/ProjectSections.tsx`, `frontend/src/components/projects/ProjectCard.tsx` |
| Job 7 | Job 6 | 4 | `frontend/src/lib/libraryRender.test.ts`, `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx`, `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts`, `frontend/src/lib/libraryRender.ts`, `frontend/src/lib/schemas/projects.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.tsx`, `frontend/public/schema/site-content.schema.json`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json` |
