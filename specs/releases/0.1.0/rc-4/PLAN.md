# PLAN — Release 0.1.0, rc-4

**Status:** Draft
**Owner:** dd-sw-engineer-sr

Paths are relative to the repo root (the `portifolio` tree; the app is under `frontend/`). Tree: the rc-4 `wt-rc`, base `899de01` (`feature/0.1.0`), SPEC at `128e88b`. Facts below are read from the tree, `gh run` and the AWS CLI reference named where used; no build, terraform or AWS call was run (no `node_modules` in this tree, no credential on this machine).

## 1. As-is review

Ledger slice (`bugs.py status`: 0 open, 10 resolved; `_archive/bugs_histo.jsonl` empty). Units touched and their records: the content schema chain (`content-schema-export-is-empty`, `content-schema-rejects-committed-content`, `content-urls-accept-script-schemes`, `content-validation-never-runs`) is read, never edited: posts get their own contract and reuse `HttpUrl`, whose bug is the lesson for the post link rule. `Media.tsx` (`media-resize-keeps-old-cut`, `media-empty-box-layout-shift`, REBUILT once in `e1bc71f`, no child bug) is not reused: a build-time string cannot call its hook, and the post `<video>` carries the sized poster that fixed the second bug. The smoke set (`smoke-e2e-encodes-the-pre-rc2-header`, `29c45a8`) is why no smoke spec counts nav links and the smoke set grows by zero. `main.tsx` (`analytics-beacons-the-page-without-an-endpoint`) is not touched. `Header.tsx`, `App.tsx`, `index.html`, `useDocumentSeo.ts`, `LanguageContext.tsx`, `deploy.yml`, `cloudfront.tf`: 0 records, feature commits only. No REBUILD is due by ledger; the one REBUILD below is the demand's (the cache rule changes the file's fundamental behaviour). Order: DELETE, REBUILD, UPDATE, KEEP, ADD.

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `terraform/_legacy/`, `terraform/README.md`, `terraform/terraform.tfvars`, `terraform/terraform.tfvars.example` | unread: `terraform.yml` runs in `terraform/envs/*` and reads their own tfvars | 0 | DELETE | AC7.3 (J1.T2) |
| `scripts/terraform_manager.sh`, `scripts/check_infrastructure.sh` | read each other only; local terraform runs, against the repo stop condition | 0 | DELETE | AC7.3 (J1.T2) |
| `scripts/build_and_serve.sh`, `scripts/server_manager.sh`, `backend/` | the Flask dev server, read by `Makefile` and the repo `AGENTS.md:33,54` | 0 | DELETE | AC7.3; consumers in J1.T3 |
| six `frontend/public/images/` files, `public/decorators/`, `public/lovable-uploads/`, `frontend/tests/e2e/setup/`, `img/` | no reader in code, CI, tests or content (grep, 0 hits outside `specs/`) | 0 | DELETE | AC7.3 (J1.T1, J1.T2); `setup/` is a `test(` commit |
| `Makefile` targets `dev`, `stop`, `test-build`, `clean`'s stop line, `.PHONY`, `help` | call the deleted scripts | 0 | UPDATE | J1.T3 (pre-mortem B12) |
| `.github/workflows/deploy.yml:76-85` (stage) and `:123-132` (prod), two copies | `sync --exclude "index.html"` with a one-year immutable header, then a no-cache copy of the root `index.html` | 0 | REBUILD | the demand turns an exclusion list into a path rule: `assets/**` immutable, everything else `no-cache` (J2.T3). Repro where the copies could diverge: edit one job only and prod serves the stale HTML a year while stage does not; the reviewer diffs both |
| `terraform/modules/portfolio-static-site/cloudfront.tf:23,28-45,48-57` | `default_root_object` for `/` only, no function, 403 and 404 answer the root document with 200 | 0 | UPDATE | one `viewer-request` association; the error responses stay (J2.T2) |
| `frontend/index.html:6-19` | one static head for every route, no `og:image`, no RSS link | 0 | UPDATE | `og:image`, `twitter:image`, one alternate link (J5.T3); it is the build's template |
| `frontend/package.json` `build`, `vite.config.ts` | `vite build`; no `define` | 0 | UPDATE | `build` runs the script, `marked` devDependency (J4.T4); one `define` (J7.T3) |
| `src/App.tsx:36-48` | routes `/`, `/projetos`, `/projetos/:slug`, `*` | 0 | UPDATE | `/blog`, `/blog/:slug` lazy, outside `ProjectsLayoutShell` (J6.T4) |
| `src/components/Header.tsx:30-33` | two `NavLink`s | 0 | UPDATE | the Blog link, conditional (J7.T3) |
| `src/types/content.ts:195,215,242` | `seeAllProjects?`, `nav` without `blog`, no blog strings | 0 | UPDATE | required `seeAllProjects`, `nav.blog`, `siteChrome.blog` (J3.T5, R-F) |
| `public/content/{pt,en,de}.json` | plain-named cover SVG refs; no blog keys | 0 | UPDATE | six renamed refs (J3.T2); nine keys per locale (J3.T4) |
| `public/assets/projects/*/` six plain-named SVGs | edited in place they stay stale a year | 0 | UPDATE | hash names (J3.T2) |
| `scripts/check-i18n-parity.mjs:69-73` | `CHROME_I18N_KEYS` is an explicit set; new labels are unchecked | 0 | UPDATE | eight keys join it (J3.T4); the SPEC's "existing check covers it" was false |
| `src/components/portfolio/FeaturedProjects.tsx:29` | `?? "Ver todos os projetos"` | 0 | UPDATE | no fallback (J3.T6) |
| `src/pages/projects/LibraryProjectTemplate.tsx:47,82`, `src/components/projects/ProjectSections.tsx:27` | three hand-written `max-w-[680px]`, a third copy of `PROSE` (`lib/layout.ts:6`) | 0 | UPDATE | read `PROSE` (J1.T4) |
| `README.md`, repo `AGENTS.md`, `.gitignore`, `terraform/.gitignore` | stale structure line; `backend/` lines; two orphan ignore groups | 0 | UPDATE | J1.T3, J1.T5 |
| `Header.test.tsx:97`, `nav-projects.spec.ts:24` | pin "never a Blog link" and a count of 2 | 0 | UPDATE | R-M: narrowed to the no-post partition (J7.T1, J7.T2) |
| `HeroSection.test.tsx:11,188`, `Portfolio.test.tsx:14` | typed literals with inline `siteChrome`; a `lg:`-only selector | 0 | UPDATE | R-F literals read `pt.json` (J3.T5); the selector tightened (J3.T7) |
| `contentAssets.test.ts:71`, `homeParity.test.ts`, `src/test-setup.ts:28-29` | hash rule for two slugs; parity table without blog keys; fetch mock answers only the three locale files | 0 | UPDATE | hardened in their homes (J3.T1, J3.T3); the mock answers `/blog/index.json` (J6.T1, B10) |
| `src/hooks/useDocumentSeo.ts`, `src/components/projects/Media.tsx`, `src/contexts/LanguageContext.tsx`, `lib/schemas/projects.ts`, `scripts/content-schema.mjs`, `v1.json`, `.github/workflows/{ci,terraform}.yml`, `playwright.config.ts`, `lighthouserc.json`, `src/lib/layout.ts`, `SectionHeading.tsx` | the runtime head reader; the project media; the locale loader; the content contract; the gates | 8 across them | KEEP | read, reused or run; none grows (`HttpUrl`, `PROSE`, `COLUMN`, `SectionHeading` are consumed, never copied) |
| `scripts/blog-posts.mjs`, `scripts/build-blog.mjs`, `scripts/image-size.mjs` | do not exist | — | ADD | the post reader, the renderer and writer, the image reader: no unit carries a content kind outside `public/` (J4, J5) |
| `terraform/modules/portfolio-static-site/viewer-request.js` | does not exist | — | ADD | no unit rewrites a path before S3 (J2.T2) |
| `src/lib/blogIndex.ts`, `src/components/blog/PostMeta.tsx`, `src/pages/blog/{BlogIndexPage,BlogPostPage}.tsx` | do not exist | — | ADD | the two pages and the shared meta line (J6) |
| `public/assets/share-<hash>.png`, `tests/fixtures/blog/**` | do not exist | — | ADD | the default share card; the proving posts (J5.T3, J4.T1) |

Duplicated deciders, with a repro where the copies diverge:

- Cache class: `deploy.yml:76-85` against `:123-132` (above). J2.T3 writes the same two steps in both and the reviewer diffs them.
- Prose width: `layout.ts:6` against the three literals (`LibraryProjectTemplate.tsx:47,82`, `ProjectSections.tsx:27`): change `PROSE` and four places stay at 680. J1.T4 makes `PROSE` the one source.
- Published posts: `vite.config.ts` (the Blog flag) and the script (index, feed, pages) would each need "which folders are published and not draft". Repro: a draft counted by one and not the other shows a Blog link over an empty index. `readPosts` in `blog-posts.mjs` is the one decider (J4.T2); both import it.
- Origin: the static tags of `frontend/index.html` and the script's `SITE` both hold `https://marco-menezes.com`; HTML cannot import. J5.T1 asserts the tags start with the exported `SITE`.

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| which posts are published | `scripts/blog-posts.mjs` `readPosts` | `build-blog.mjs`, `vite.config.ts` | none |
| whether the Blog link shows | `__BLOG_PUBLISHED__`, defined by `vite.config.ts` under `vite build` | `Header.tsx` | the "never a Blog link" assert, narrowed |
| the blog index data and a post body | `dist/blog/index.json`, `dist/blog/<slug>/body.html`, written by `build-blog.mjs` | `lib/blogIndex.ts`, `BlogPostPage`, `nav-projects.spec.ts` | none |
| a project route's head | `project.seo` in `pt.json` | `useDocumentSeo` (runtime), `build-blog.mjs` (served) | none |
| the default share image | the `og:image` tag of `frontend/index.html` | the script's pages, `contentAssets.test.ts` | none |
| an image's size | `scripts/image-size.mjs` | `build-blog.mjs`, the share-image test | none |
| which link targets a post may carry | `HttpUrl` (`lib/schemas/projects.ts`) plus `/` and `#` forms in `build-blog.mjs` | the post renderer | none |
| a file's cache class | its path: under `assets/` or not (`deploy.yml`) | the stage checks | the `index.html` exclusion |
| which route maps to which object | `viewer-request.js` | the stage checks | none |
| blog UI strings | `siteChrome.blog` and `siteChrome.nav.blog` in the locale files | the pages, the Header | none |
| key parity of those strings | `CHROME_I18N_KEYS` in `check-i18n-parity.mjs` | `homeParity.test.ts` | none |
| column and prose width | `lib/layout.ts` `COLUMN`, `PROSE` | the blog pages, the project templates | three 680 px literals |
| the section `h2` | `SectionHeading` | any h2 on the blog pages | none |
| the job gate | `package.json` `scripts.verify` | CI on push | none (unchanged) |

## 2. Order and seams

### 2.1 Waves, write sets, order

- **Waves.** Wave 1: Jobs 1 to 4, no edges (disjoint `W:` sets, proved by `release.py check`). Wave 2: Jobs 5 to 7, each waiting on Job 3 (keys, types, hash rule) and Job 4 (the script). Hosting (Job 2) feeds no wave-2 job: it is checked on stage. The SPEC ranks FR1 and FR2 as the foundation and FR3 to FR7 as parallel features; FR7 has no edge to FR2, so it rides wave 1, and FR3 to FR6 split into Jobs 5 to 7 on disjoint files. The eight-agent cap is never reached (a job's tasks run one at a time unless their `W:` sets are disjoint).
- **DELETE first.** Job 1 holds every deletion of AC7.3 and is Job 1 on purpose; its consumers follow in the same job. DELETE and REBUILD tasks precede ADD tasks inside each job.
- **Shared files, one writer per wave.** The three locale files, `types/content.ts`, `HeroSection.test.tsx`, `Portfolio.test.tsx`: Job 3 only. `scripts/build-blog.mjs` and `package.json`: Job 4 in wave 1, Job 5 in wave 2. `vite.config.ts`, `Header.tsx`: Job 7 only. `App.tsx`, `test-setup.ts`: Job 6 only.
- **Merge gate.** The repo `tests:` globs are `frontend/src/*.test.ts(x)`, `frontend/src/test-setup.ts` and `frontend/tests/*`. A task touching them is a `test(<id>)` commit in its own tree and a source commit never touches them, `frontend/tests/e2e/setup/.gitkeep` and the fixture folder included. R-F (a type change plus its typed literals) is two commits in one task tree and one merge: a `feat` commit for the type, then a `test` commit for the literals (J3.T5).
- **Rulings the `test(...)` commits cite.** **R-M** (SPEC AC6.2): `Header.test.tsx:97` and `nav-projects.spec.ts:24`, J7.T1 and J7.T2. **R-F** (SPEC §5, AC6.1, AC7.1): J3.T5. A hardening in the test's home needs no ruling (J3.T1, J3.T3, J3.T7). No other assert is moved, narrowed or removed in rc-4; each job's hand-back carries the diff-read.
- **RED first.** Each behaviour has a RED test task before its source task: J2.T1/T2, J3.T1/T2, J3.T3/T4, J4 (T1/T2, T3/T4, T5/T6, T7/T8), J5.T1 and T2 before T3 to T5, J6.T1/T3 and T2/T4, J7.T1 and T2 before T3. Without a RED by nature: the deletions, the PROSE swap, the README and ignore edits (nothing to assert), and the `seeAllProjects` fallback (J3.T6: unreachable once the key is required; evidence is the typecheck and a grep).
- **Fixtures.** A stub that renders `SiteLayout` or reads content carries the committed `siteChrome` and `profile` read from `public/content/pt.json`; no partial stub. No email address and no games-project name is typed anywhere, and a denylisted term never appears as a literal.

### 2.2 Shared contracts the jobs read

**The build script (Jobs 4, 5).** Run from `frontend/` as `node scripts/build-blog.mjs [--posts <dir>] [--dist <dir>]`, defaults `content/blog` and `dist`. `npm run build` is `vite build && node scripts/build-blog.mjs`, so `verify` and CI build the blog. Importing a script module runs nothing.

| file | role | exports |
|---|---|---|
| `scripts/blog-posts.mjs` | the post reader: front matter, zod, drafts | `readPosts(dir)` |
| `scripts/image-size.mjs` | image sizes | `imageSize(file)` |
| `scripts/build-blog.mjs` | renderer and writer | `SITE`, and the CLI |

Inputs: the posts folder; `dist/index.html` as the template; `public/content/pt.json` (project `slug`, `seo.title`, `seo.description`, `siteChrome.footer.owner`, `siteChrome.blog.*`). Outputs, all under `dist/`: `blog/index.json` (Job 4); `blog/<slug>/body.html` and the copied media (Job 4); `blog/<slug>/index.html`, `blog/rss.xml`, `projetos/<slug>/index.html` (Job 5). `readPosts(dir)` returns the published posts newest first (ties by slug): `{ slug, title, description, date, lang, tags, image, body }`; an absent folder gives `[]`; non-directories are ignored; every folder is validated, drafts included, then drafts leave.

- **The blog index data** is `dist/blog/index.json`, served at `/blog/index.json`: an array of `{ slug, title, description, date, lang, tags }`, newest first, `[]` with no post. It sits outside `assets/`, so the cache rule gives it `no-cache`.
- **The post body** is `dist/blog/<slug>/body.html`: the rendered Markdown and nothing else. `BlogPostPage` fetches it; the served page embeds the same string in `<article lang>`. The client therefore never parses a page.
- **Front-matter errors** are one `Error` per post, message `<slug>: <field>: <message>`, first failing field only. Messages: `must not be blank` (title, description); `must be YYYY-MM-DD` (date, a real calendar day); `must be one of pt, en, de`; `must be a comma list of slugs`; `must be true or false`; `no such file in the post folder` (image); `unknown key`; `is required` (a missing field, a missing `index.md` as field `index.md`, a missing leading block as field `front matter`); `line <n> is not key: value` (field `front matter`); `must match ^[a-z0-9]+(-[a-z0-9]+)*$` (field `slug`). A value is the rest of the line after the first colon, trimmed, with no quote handling; `tags` split on commas.
- **Head fields** (J5.T4): `<title>`, `meta description`, `og:title`, `og:description`, `og:locale`, `og:image`, `twitter:image`, `<html lang>`; each must match once in the template.

| post `lang` | `<html lang>` | `og:locale` |
|---|---|---|
| pt | pt-BR | pt_BR |
| en | en | en_US |
| de | de | de_DE |

**The Blog link.** `vite.config.ts` defines `__BLOG_PUBLISHED__` as `command === "build" && readPosts("content/blog").length > 0`; under `vite dev`, Vitest and local Playwright nothing defines it and the Header reads it as false (`typeof __BLOG_PUBLISHED__ !== "undefined" && __BLOG_PUBLISHED__`). So the flag defaults off wherever the build script has not run (pre-mortem hit 48, B11). The proving post is never in `content/blog/`: it is `tests/fixtures/blog/proving-post`, and committed content ships no published post.

**The Function.** `viewer-request.js` (`cloudfront-js-2.0`): drop one trailing slash; the path `/` or a last segment holding a `.` returns the request unchanged; else append `/index.html`. Associated as `viewer-request` on `default_cache_behavior`. A path with no file still falls to the 403/404 error responses, which answer the root document with 200.

**Blog strings** (J3.T4 writes them; `siteChrome.nav.blog` and `siteChrome.blog.*`):

| key | pt | en | de |
|---|---|---|---|
| `nav.blog` | Blog | Blog | Blog |
| `blog.title` | Blog | Blog | Blog |
| `blog.intro` | Notas sobre engenharia de dados e as ferramentas que construo. | Notes on data engineering and the tools I build. | Notizen zu Data Engineering und den Werkzeugen, die ich baue. |
| `blog.empty` | Nenhum post ainda. | No posts yet. | Noch keine Beiträge. |
| `blog.tagsLabel` | Tags | Tags | Tags |
| `blog.filteredBy` | Posts com a tag | Posts tagged | Beiträge mit dem Tag |
| `blog.allPosts` | Todos os posts | All posts | Alle Beiträge |
| `blog.back` | Voltar ao blog | Back to the blog | Zurück zum Blog |

Every key is read by `src/**`; the eight join `CHROME_I18N_KEYS`.

### 2.3 Intl and date literals

Post dates render with `Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" })` over the `YYYY-MM-DD` read as UTC. Measured on Node v22.23.4 (ICU 78.3, CLDR 48.0), which is also the newest 22.x on the Node release index and the version CI's `node-version: "22"` resolves to: `2026-03-09` is `9 de março de 2026` (pt), `March 9, 2026` (en), `9. März 2026` (de); `new Date("2026-03-09T00:00:00Z").toUTCString()` is `Mon, 09 Mar 2026 00:00:00 GMT`. If CI's Node 22 moves and a literal breaks, that is a bug against the locale contract, not a reason to loosen the assert.

### 2.4 Definition of done, E2E and ports

- **Every job's Definition of done** is the repo `verify:` line (`npm --prefix frontend run verify`) plus the test directories its change reaches plus the recipe below, as its job file lists. No step, preflight or gate is added; `lighthouserc.json`, `ci.yml` and `playwright.config.ts` are unchanged; nothing reruns a check the merge already runs. `verify` gains this rc's unit tests and one script run (AC2.6 measures it).
- **Header, layout, i18n, head or home changes also run CI's smoke set**: the nine `pages/*` specs of `playwright.config.ts` (rc-2's lesson). Job 2 changes no served page and runs none.
- **The recipe** (one port per job: Job 1 5101, 2 5102, 3 5103, 4 5104, 5 5105, 6 5106, 7 5107): `verify` has built `frontend/dist`; register the port (`registry.py list`, then `register --port N --project portifolio`); from `frontend/` start `npx vite preview --port N --strictPort` on loopback; run `E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium <spec files>`, or `E2E_SMOKE=1 E2E_BASE_URL=http://localhost:N npx playwright test --project=chromium` for the smoke set; stop the preview by the pid that listens on N, `release --port N`. A port held by another project is replaced by `registry.py next`. `playwright.config.ts` still names 8080 in its `webServer`; the tests use `E2E_BASE_URL` and the config is not changed.
- **A red outside the diff** is listed by name as suspected pre-existing and proven at the merge base before it is called so.
- **Schema.** No job changes `content-schema.mjs` or `projects.ts`; Job 3 runs `schema:check` to prove `v1.json` stays byte-equal.

### 2.5 Hosting: the cache rule, the Function, and the closure check

**Deploy filters (B9).** AWS CLI reference, `aws s3` (https://docs.aws.amazon.com/cli/latest/reference/s3/index.html, "Use of Exclude and Include Filters"): filters are evaluated against the source directory, a later filter takes precedence over an earlier one, `*` matches everything, and with only `--include` nothing changes because everything is included by default. `aws s3 sync` (https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html, `--delete`): "Files that exist in the destination but not in the source are deleted during sync. Note that files excluded by filters are excluded from deletion." Hence `--exclude "*" --include "assets/*"` uploads and deletes inside `assets/` only, and `--exclude "assets/*"` uploads and deletes outside it only. The two sets are disjoint and together cover the bucket, so neither `--delete` touches the other's objects, and an unpublished post's HTML goes with the second. A sync copies a local file when its size differs, it is newer than the object, or the object is absent; the artifact is built in the same run, after the earlier deploy, so files that change header class (`cv.pdf`, the locale JSON, favicons) are re-uploaded once; the stage `curl -I` below proves it. Assets go first so a new page never points at a missing asset.

**The role that applies the Function (B13).** `terraform.yml` applies stage on a push to develop (`terraform-stage-apply`, role `secrets.AWS_ROLE_ARN_STAGE`, line 116) and prod on a push to main (`terraform-prod-apply`, `secrets.AWS_ROLE_ARN`, line 216), in `terraform/envs/{stage,prod}`; `deploy.yml` assumes the same two secrets. `iam.tf` creates `github-actions-portfolio-<env>-deploy` with `sts:AssumeRoleWithWebIdentity` for any ref of the repo and an inline policy of S3 list/get/put/delete on the site bucket, `cloudfront:CreateInvalidation` on the distribution, and the state bucket: no `cloudfront:CreateFunction`, `PublishFunction`, `UpdateDistribution` or `GetDistribution`. The secret values are outside the repo, so which role they name cannot be read here. The `Terraform` workflow's run history (`gh run list`) shows its last success on 2026-05-14; the develop push of 2026-05-23 (run 26322291160) failed at `Terraform Apply`, and the PR plan of 2026-05-24 (run 26351151593) failed; their logs are gone (HTTP 410). If the secret is that deploy role, the apply cannot create the Function, and a role cannot grant itself the permission through the same apply: an operator act, outside every agent's reach. The PLAN adds no `iam.tf` change; the question goes to the main thread (handoff, open question 1), and the first signal is the rc PR's own Terraform plan.

**Closure check, after the rc PR merges into develop** (AC1.1, AC1.2; no credential, no local terraform): wait for the `Deploy` and `Terraform` workflows to succeed, then with `host=https://stage.marco-menezes.com`:

- for each slug of `jq -r '.projectsV2.list[].slug' frontend/public/content/pt.json`, with and without a trailing slash, `curl -si $host/projetos/<slug>` answers 200, `text/html`, and the pt `seo.title` of that project (read with `jq`) is in `<title>`;
- `/` answers 200 with `<title>marco-menezes</title>`; `/nope` answers 200 with the same document;
- one hashed file read from the home page (`curl -s $host/ | grep -o '/assets/[^"]*\.js' | head -1`) answers 200 and `curl -sI` shows `immutable`;
- `curl -sI` of `/projetos/<one slug>`, `/blog/rss.xml`, `/blog/index.json` and `/cv.pdf` shows `cache-control: no-cache`.

The evidence (the deploy run, each result) is collected as rc-2's AC4.7 was. Prod is applied only on the promote PR.

### 2.6 Pre-mortem answers (each H and M hit of the consumer sweep, with the main-thread rulings)

| hit | answer |
|---|---|
| 5 Makefile call sites (H), `.PHONY` and help (M, B12) | J1.T3 |
| 6 the six unread images unnamed (H) | named in AC7.3 and in J1.T2's `W:` |
| 9, 61 `tests/e2e/setup/` and the `tests:` globs (H, B8) | `test(` commits in their own trees: J1.T1, J3.T1, J3.T3, J3.T5 (second commit), J3.T7, J4.T1, T3, T5, T7, J5.T1, T2, J6.T1, T2, J7.T1, T2; no source commit touches a glob |
| 10 `img/`, 49 the `legacy-specs` atom (H, B4) | J1.T2 deletes `img/`; the atom loses `img/**` at closure (pe) |
| 50 `local-servers` and `scripts/build_frontend.sh` (H, B4) | the atom is deleted with its units; `build_frontend.sh` has a reader (`Makefile` `build`), stays, and its source glob moves to `deploy-infrastructure` at closure (pe) |
| 51 deploy atom lacks `deploy.yml` (M, B4) | closure (pe) |
| 12, 13, 14 `seeAllProjects` type, fallback, two typed literals (H) | J3.T5 (R-F pair), J3.T6 |
| 17 `seeAllProjects` required only in TypeScript (M) | J3 runs `schema:check`; the atom states it at closure (pe) |
| 18, 19, 20 `PROSE` sites (H) | J1.T4 |
| 23 the `index.html`-only exclude (H) | J2.T3, the path rule of §2.5 |
| 24 widen the no-cache copy, name the index data (H) | J2.T3; the fixed name is `blog/index.json` (§2.2) |
| 25 `--delete` with excluded HTML (M, B9) | §2.5, two AWS CLI reference pages cited |
| 28, 29, 31 one cache rule, six unhashed SVGs, share-image name (M, B5) | J3.T1, J3.T2; the share image is `share-<hash>.png` under `assets/` (J5.T3) |
| 33 the association (H, B13) | J2.T2 in `default_cache_behavior` |
| 37 the applying role (M, B13) | §2.5; open question 1 |
| 34 the 403/404 mapping | kept; AC1.1's fall-through relies on it |
| 36 a missing hashed asset answers the root document | intake (main-thread ruling), not rc-4 |
| 38 Lighthouse `/projetos/` URLs under `vite preview` (M, B14) | J5's DoD `curl`s each project URL and the unknown route on the preview; the Lighthouse job is the net; `lighthouserc.json` unchanged |
| 39, 40 the two nav asserts (H) | J7.T1, J7.T2 (R-M) |
| 43 the Header flag (H), 48 the flag's default (M, B11) | J7.T3; §2.2 |
| 44 `nav.blog` required, typed literals (H, B2) | J3.T5 |
| 47 the hero selector (H) | J3.T7 |
| 55 `AGENTS.md:33,54` (H) | J1.T3 |
| 57 the README structure (M) | J1.T5 |
| 62 the fetch mock (H, B10) | J6.T1 |
| 63, 64 the parity set and the false `src/**` claim (H, B1) | J3.T3, J3.T4 |
| 66 the count of 10 (M, B3) | the list is 19 entries (1 + 18), recounted in J1's hand-back |
| project pages carry only heads; the copied head's locale (M, B6, B7) | J5.T4: posts carry their own `lang` and `og:locale`; project pages stay pt with the template body |
| orphan ignore lines (58, 4) | folded into J1.T3, net lines negative |

### 2.7 PLAN-stage ADR check

`specs/ADRs/decisions.jsonl` holds no record that rc-4 contradicts. No choice passes the threshold (one-way door, architecturally significant, two genuine options): the build-time script over Vite's output was the as-is review's lightest of three, the Function is ruled by the SPEC, and every file name and key here is reversible in one job. None proposed.

### 2.8 Acceptance map

| AC | tasks |
|---|---|
| AC1.1 | J2.T1, J2.T2 (stage check at closure) |
| AC1.2 | J2.T3, J3.T1, J3.T2, J5.T3 (stage check at closure) |
| AC2.1 | J4.T1, J4.T2 |
| AC2.2 | J4.T1, J4.T2 |
| AC2.3 | J4.T3, J4.T4 |
| AC2.4 | J4.T5, J4.T6, J4.T7, J4.T8 |
| AC2.5 | J4.T1, J4.T3, J4.T4 |
| AC2.6 | J4.T4 |
| AC3.1 | J5.T1, J5.T4 |
| AC3.2 | J5.T1, J5.T4 |
| AC3.3 | J5.T1, J5.T3 |
| AC4.1 | J6.T2, J6.T4 |
| AC4.2 | J6.T1, J6.T3 |
| AC4.3 | J6.T1, J6.T3 |
| AC4.4 | J6.T2, J6.T4 |
| AC4.5 | J3.T3, J3.T4 |
| AC5.1 | J5.T2, J5.T5 |
| AC5.2 | J5.T2, J5.T3 |
| AC6.1 | J3.T4, J3.T5, J7.T1, J7.T3 |
| AC6.2 | J7.T1, J7.T2 |
| AC7.1 | J3.T5, J3.T6 |
| AC7.2 | J3.T7 |
| AC7.3 | J1.T1, J1.T2, J1.T3 |
| AC7.4 | J1.T4 |
| AC7.5 | J1.T5 |
| AC7.6 | every job's Definition of done |

Closure work outside the jobs (the SPEC's Closure section): the `backlog.py exit blog-v1`, the memory pass and the stage evidence above.

## DAG

| job | waits on | wave | `W:` |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/tests/e2e/setup/.gitkeep`, `terraform/_legacy`, `terraform/README.md`, `terraform/terraform.tfvars`, `terraform/terraform.tfvars.example`, `scripts/terraform_manager.sh`, `scripts/check_infrastructure.sh`, `scripts/build_and_serve.sh`, `scripts/server_manager.sh`, `backend`, `frontend/public/images/ai-900.png`, `frontend/public/images/aws_icon.png`, `frontend/public/images/azure_icon.png`, `frontend/public/images/databricks_icon.png`, `frontend/public/images/dp-900.png`, `frontend/public/images/sc-900.png`, `frontend/public/decorators`, `frontend/public/lovable-uploads`, `img`, `Makefile`, `AGENTS.md`, `.gitignore`, `terraform/.gitignore`, `frontend/src/pages/projects/LibraryProjectTemplate.tsx`, `frontend/src/components/projects/ProjectSections.tsx`, `README.md` |
| Job 2 | — | 1 | `frontend/src/lib/cloudfrontRewrite.test.ts`, `terraform/modules/portfolio-static-site/viewer-request.js`, `terraform/modules/portfolio-static-site/cloudfront.tf`, `.github/workflows/deploy.yml` |
| Job 3 | — | 1 | `frontend/src/lib/contentAssets.test.ts`, `frontend/public/assets/projects/*/*.svg`, `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json`, `frontend/src/lib/homeParity.test.ts`, `frontend/scripts/check-i18n-parity.mjs`, `frontend/src/types/content.ts`, `frontend/src/components/portfolio/Portfolio.test.tsx`, `frontend/src/components/portfolio/HeroSection.test.tsx`, `frontend/src/components/portfolio/FeaturedProjects.tsx` |
| Job 4 | — | 1 | `frontend/src/lib/blogPosts.test.ts`, `frontend/tests/fixtures/blog/proving-post/index.md`, `frontend/tests/fixtures/blog/proving-post/shot.png`, `frontend/tests/fixtures/blog/proving-post/clip.mp4`, `frontend/tests/fixtures/blog/proving-post/clip.png`, `frontend/tests/fixtures/blog/second-post/index.md`, `frontend/tests/fixtures/blog/draft-post/index.md`, `frontend/scripts/blog-posts.mjs`, `frontend/src/lib/buildBlog.test.ts`, `frontend/scripts/build-blog.mjs`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/lib/imageSize.test.ts`, `frontend/scripts/image-size.mjs` |
| Job 5 | Job 3, Job 4 | 2 | `frontend/src/lib/blogPages.test.ts`, `frontend/src/lib/blogFeed.test.ts`, `frontend/index.html`, `frontend/public/assets/share-*.png`, `frontend/scripts/build-blog.mjs` |
| Job 6 | Job 3, Job 4 | 2 | `frontend/src/pages/blog/BlogIndexPage.test.tsx`, `frontend/src/test-setup.ts`, `frontend/src/pages/blog/BlogPostPage.test.tsx`, `frontend/src/pages/blog/blogRoutes.test.tsx`, `frontend/src/lib/blogIndex.ts`, `frontend/src/components/blog/PostMeta.tsx`, `frontend/src/pages/blog/BlogIndexPage.tsx`, `frontend/src/pages/blog/BlogPostPage.tsx`, `frontend/src/App.tsx` |
| Job 7 | Job 3, Job 4 | 2 | `frontend/src/components/header/Header.test.tsx`, `frontend/tests/e2e/projects-cluster/nav-projects.spec.ts`, `frontend/src/components/Header.tsx`, `frontend/vite.config.ts`, `frontend/src/vite-env.d.ts` |
