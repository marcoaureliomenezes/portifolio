# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-10-25
**Origin:** backlog:blog-v1

---

## Bug window review

**Window:** the whole history (`specs/audits/_archive/audits_histo.jsonl` is empty). rc-3 judged rc-2's eight records KEEP and none had a child bug in rc-3, so they leave; `ci-never-runs-the-checks-develop-requires` left at rc-3. Judged here: the one record resolved since rc-3 was defined. `bugs.py status`: 0 open.

| record | fix (HEAD) | what it changed | overfitting check | verdict |
|---|---|---|---|---|
| `analytics-beacons-the-page-without-an-endpoint` | `338a964` (RED test `a92e349`, `src/lib/analyticsBeacon.test.ts`) | `init` returns before storing a config with an empty endpoint; the vendored SDK's source and its committed dist (esm, umd) change in lockstep, +3/−1 | one guard at the SDK's single entry, which every caller passes through; no test value special-cased, no assert changed, no second path. The dist is still hand-edited beside its source: the vendored-SDK build script stays in the backlog (§3) | **KEEP** |

No fix is judged REBUILD. `bugs.py stats`: 10 resolved; no rc-3 task caused a bug.

## 1. Problem

Operator words (backlog `blog-v1`, 2026-10-24): "I also want another session called blog. Where I'll write some articles."; "We need 3 parts, we have my resume, we have my personal projects, and we will have my personal blog". Rulings recorded there: posts are Markdown in this repo, one folder per post (text, images, moving images); the build writes real HTML per post and per project page with title, description and share image, plus an RSS feed ("Markdown in repo, static HTML"); one language per post, chosen by the author, listed in every locale with a language tag ("One per post, your choice"); v1 = index, post page, tags, RSS; the Blog nav item appears once the first post exists.

As-is review (`feature/0.1.0` @ `977c54e`, read-only):

- Every route serves one static head (`frontend/index.html:6-19`): title `marco-menezes`, a pt description, no `og:image`, so the large share card is empty. The project heads exist only client-side (`useDocumentSeo.ts:25-37`); a crawler that runs no script never sees them.
- `vite build` emits one `dist/index.html`; no per-route HTML, no feed, no Markdown parser.
- CloudFront serves `/` only by `default_root_object` (`cloudfront.tf:23`) and answers every miss with the root document (`:48-57`), so a file at `/blog/x/index.html` is never served at `/blog/x`.
- Deploy gives every file except the root `index.html` a one-year immutable cache (`deploy.yml:77-85`, copied at `:124-132`).
- The header has two links and no "appears once a post exists" mechanism (`Header.tsx:30-33`); two tests pin that: `src/components/header/Header.test.tsx:97` and `tests/e2e/projects-cluster/nav-projects.spec.ts:24`.

Operator rulings (grill 2026-10-25, verbatim answers):

- First post → "No post yet (Recommended)". rc-4 ships the blog machinery, proved by a test-only fixture post. The Blog link stays hidden until the operator commits a first post folder.
- Default share image → "Generated from the site (Recommended)". One committed 1200×630 image in the site's style: dark background, one amber accent, the owner's public name and title. Every head without its own image uses it; a post's front-matter `image` overrides it.
- Summary → "Confirm (Recommended)":
  - a build-time Node script over Vite's `dist` writes real HTML per post and per project page, with no new runtime dependency;
  - a CloudFront Function appends `/index.html` to extensionless routes, applied by CI to stage and prod;
  - deploy stops the immutable cache on HTML and `rss.xml` (widened by the ruling below);
  - `marked` is the one build-only devDependency;
  - front matter is validated with zod;
  - clips play muted and looped, with controls and no autoplay;
  - the Blog link comes from a build-time flag;
  - project-page heads are in pt;
  - tags filter the index at `/blog?tag=x`;
  - the two nav asserts move under a ruling named in their `test(...)` commit.
- Denylisted names → "Public on portfolio (Recommended)". This is already met: the content ships both names today (main-thread ruling 2026-10-25, §3).

Main-thread pick of the rc-3 carried intake (lightest), in scope:

- the two memory-truth fixes;
- `seeAllProjects` required;
- the hero one-column selector;
- the files with no reader;
- `PROSE` where 680 px is hand-written;
- the README structure line.

The rest goes to §3.

Main-thread rulings on this SPEC's draft (2026-10-25), each accepted as written here:

- The cache rule is structural: `assets/**` immutable, every other file `no-cache` (AC1.2). This replaces an exclusion list. The locale JSON is already fetched with `cache: "no-cache"` (`LanguageContext.tsx:42`), so it is never stale; no bug.
- Raw HTML in a post renders escaped, and link schemes are limited (AC2.3).
- A clip's poster sits beside it and sizes it (AC2.4).
- The language tag is the uppercased `lang` code (AC4.2).
- Blog strings sit under `siteChrome` (AC4.5).
- No CI E2E test over a published post this rc (§3).
- Absolute URLs use the production origin (§4).
- The `resume-home` tldr is narrowed in text (Closure).

## 2. Measurable Goals

| # | goal | today | target | source |
|---|---|---|---|---|
| 1 | routes whose served HTML carries their own title, description and share image | 0 | 4 project pages + every published post | AC3.1, AC3.2 |
| 2 | share card image in the served head | none | the default image on every head, a post's own when set | AC3.3, AC5.2 |
| 3 | stage serves `/projetos/<slug>` from its own HTML file | no | yes, all 4 | AC1.1 |
| 4 | per-route HTML or feed cached a year in browsers | — | 0 files | AC1.2 |
| 5 | Blog link on the committed content | absent | absent (no published post) | AC6.1 |
| 6 | files and folders with no reader (§4 FR7 list) | 10 | 0 | AC7.3 |

## 3. Non-goals

- A first published post: the operator writes it after rc-4.
- A CI E2E spec over a published post. The CI build serves only committed content, which holds no post. It goes to the intake once the first post lands.
- Hydration: the prerendered body is replaced on mount (`createRoot`, `LanguageContext.tsx:226-229`).
- Per-locale project heads, `hreflang`, a sitemap, real 404 status codes, per-tag pages, syntax highlighting, a copy button, and a dev-server preview of posts (the blog is previewed with `npm run build && npm run preview`).
- A per-project share image or any new content-schema field.
- Byte budgets on post media.
- The other hard-coded hero strings and the `featuredProjectsTitle` fallback. The `resume-home` tldr is narrowed instead (Closure).
- `SkillsSection.test.tsx` keeps its runtime-composed skill name until the dadaia-workspace library offers a per-repo denylist scope.
- To the backlog: the npm-audit dependency bump, the vendored-SDK build script, the `specs-bkp/` deletion (after the first pass and the library upgrade).
- Any new gate, CI job, `verify:` step, merge check or `lighthouserc.json` change.

## 4. Requirements

Paths are relative to `frontend/` unless they start with `terraform/` or `.github/`. Domain names: a post, its front matter, the blog index, the post page, the build script, the share image, `siteChrome`, `project.seo`, the locale, stage and prod.

The site origin in every absolute URL is the production origin, `https://marco-menezes.com` (`README.md:7`). Stage and prod deploy one build.

**Wave ranking:**

1. Law, skills, dev loop: none.
2. Shared foundation:
   - FR1, hosting;
   - FR2, the post contract and the build script.
3. Features, in parallel on disjoint files once FR2 lands:
   - FR3, prerendered heads;
   - FR4, the blog pages;
   - FR5, the RSS feed and the share image;
   - FR6, the nav;
   - FR7, the carried items, independent of FR2.
4. Promote-facing: the stage checks of AC1.1 and AC1.2, and the backlog exit.

### FR1 — hosting serves each route's own HTML, never cached a year

- **AC1.1** One CloudFront Function (viewer request), in `terraform/modules/portfolio-static-site`, rewrites a path:
  - an extensionless path other than `/` gets `/index.html` appended, with one trailing slash dropped first: `/projetos/rand-engine` and `/projetos/rand-engine/` both read `projetos/rand-engine/index.html`;
  - `/` and any path with a file extension pass unchanged;
  - a path with no file falls through to today's 403/404 answer: the root document with 200.

  `terraform.yml` applies it to stage, then to prod, unchanged. Test: none local, since no AWS credential is allowed on a developer machine; the PR's Terraform plan shows the change. Check on stage after the rc PR merges into develop and both workflows succeed (`curl`, no credential):
  - each of the 4 project routes, with and without the trailing slash, answers 200 `text/html` with that project's pt `seo.title` in `<title>`;
  - `/` answers 200 with the root document;
  - `/nope` answers 200 with the root document;
  - one hashed `/assets/` file answers 200.
- **AC1.2** Both deploy jobs (stage and prod) carry one rule, with `--delete` kept:
  - `dist/assets/**` is uploaded with `public, max-age=31536000, immutable`. This is Vite's hashed output plus the hash-named media under `assets/projects/**`;
  - every other file is uploaded with `no-cache`. This covers the root and per-route HTML, `blog/rss.xml`, the blog index data, post media and `cv.pdf`.

  Every file under `assets/` is content-hashed (`<name>-<first 8 hex of its sha256>.<ext>`), as `scene-media` already requires of the scene media. Today 6 SVGs under `public/assets/projects/` (the games and portifolio covers and the two architecture diagrams) carry plain names. They are renamed to hash names, with their references in the three locales following. The asset contract test's naming rule (`contentAssets.test.ts`) then holds for every file under `public/assets/`. Test: unit (the naming rule, hardened in its home); the reviewer diffs the two deploy copies. Check on stage after deploy, with `curl -I`:
  - one hashed asset shows `immutable`;
  - one project page, `/blog/rss.xml` and `/cv.pdf` show `no-cache`.

### FR2 — the post contract and the build script

- **AC2.1** A post is one folder, `content/blog/<slug>/index.md`, with its media beside it. `<slug>` matches `^[a-z0-9]+(-[a-z0-9]+)*$`. Raw Markdown is never published under `dist/`. Test: integration (the build script over a fixture folder).
- **AC2.2** The front matter is the leading `---` block of flat `key: value` lines, validated by zod:
  - `title`, non-blank;
  - `description`, non-blank;
  - `date`, `YYYY-MM-DD`;
  - `lang`, one of `pt`, `en`, `de`;
  - `tags`, a comma list of slugs, possibly empty;
  - optional `image`, a file in the post folder;
  - optional `draft`, `true` or `false`.

  An unknown key, a missing field or a bad value fails the build. The error names the post folder and the field. A `draft: true` post is not published: it gets no page, index entry or feed item, and does not count for the Blog link. Test: integration (one fixture per failure, literal messages expected).
- **AC2.3** `marked` renders the body; it is a devDependency and absent from the client bundle. Rendering rules:
  - raw HTML in Markdown renders as escaped text;
  - a link target is `http(s)://`, a site-relative path or a `#` anchor, and any other scheme fails the build (the lesson of `content-urls-accept-script-schemes`);
  - a code block is a plain escaped `<pre><code>`.

  Test: integration (fixture lines with `<script>`, `javascript:` and a fence, literal output expected). The reviewer greps the built JS for `marked`: 0 hits.
- **AC2.4** Post media is copied to the post's output folder under its own name; AC1.2 serves it `no-cache`:
  - `![alt](a.png|jpg|webp|svg)` becomes an `<img>` with `alt`, `width` and `height` read from the file;
  - `![alt](clip.mp4|webm)` becomes `<video muted loop playsinline controls preload="none">`, with no `autoplay`, `aria-label` set to the alt, and the poster image of the same base name beside it, whose size gives the width and height (the lesson of `media-empty-box-layout-shift`);
  - an empty alt, a missing file or a clip without a poster fails the build.

  Test: integration (literal attributes; no `autoplay` attribute).
- **AC2.5** The proving post is a fixture under the tests' tree, read by passing its folder to the build script. Today's committed `content/blog/` holds no published post. Test: integration; the reviewer lists `content/blog/`.
- **AC2.6** `npm run build` runs the build script after `vite build`. The `verify:` line's text is unchanged. The FR2 hand-back states the build time measured before and after the change. Test: the existing `verify`.

### FR3 — the served HTML of posts and project pages

- **AC3.1** Each published post gets `dist/blog/<slug>/index.html`, made from `dist/index.html`. Its head:
  - `<title>` and `og:title` are the post title;
  - `meta description` and `og:description` are its description;
  - `og:image` is the absolute URL of its `image`, else of the default share image;
  - `<html lang>` is the post's `lang`.

  Its body puts the rendered post in an `<article lang>` inside `#root`, with the built scripts kept. Test: integration (fixture, literals).
- **AC3.2** Each of the 4 project pages gets `dist/projetos/<slug>/index.html`, whose head carries title, description, `og:title` and `og:description` from `pt.json`'s `project.seo` (the default locale), plus the default share image. Its body is the root document's. `useDocumentSeo` stays the runtime reader of the same fields. Test: integration (the committed `pt.json`, the 4 literal titles).
- **AC3.3** The root `index.html` head adds the default share image as `og:image` (absolute) and one `<link rel="alternate" type="application/rss+xml">` to `/blog/rss.xml`. Test: integration.

### FR4 — the blog pages

- **AC4.1** `/blog` and `/blog/:slug` are lazy routes under `SiteLayout`, outside the projects shell, present whether or not a post exists. Test: unit (the router renders each).
- **AC4.2** The blog index lists every published post, newest first. Each entry shows:
  - its title, linked to the post;
  - its date in the visitor's locale (`Intl.DateTimeFormat`);
  - its description;
  - a language tag, the post's `lang` code uppercased, carrying the `lang` attribute;
  - its tags.

  The list is the same in pt, en and de; a post is never hidden by the visitor's locale. Test: unit (two fixture posts in two languages, rendered in each locale, literals).
- **AC4.3** `/blog?tag=x` lists only the posts tagged `x`, and an unknown tag lists none. Each tag on the index and the post page links to it, and the filter shows a link back to `/blog`. Test: unit.
- **AC4.4** `/blog/:slug` shows the post's title, date, language tag, tags and the body the build rendered, in an `<article lang>`. `useDocumentSeo` sets its title and description. An unknown slug renders the 404 page. Test: unit.
- **AC4.5** Every blog UI string, the nav label included, sits under `siteChrome` in the three locales. The existing parity check therefore covers it, and `homeParity`/`resumeContent` see each key read by `src/**`. Test: unit plus `check:i18n-projects`.

### FR5 — the RSS feed and the share image

- **AC5.1** The build writes `dist/blog/rss.xml`, RSS 2.0 and well-formed even with no post. The channel links `/blog`. Each published post is one `<item>`, newest first, carrying:
  - title;
  - absolute link and `guid`;
  - an RFC 822 `pubDate`;
  - description;
  - one `<category>` per tag;
  - `dc:language`.

  Test: integration (parse the fixture's feed, literals).
- **AC5.2** The default share image is one 1200×630 PNG under `public/`, committed once, in the site's style: dark background, one amber accent, the owner's public name and title. No generator script is kept; the commit body says how it was made. Test: integration (the file's pixel size; every head of AC3.1-AC3.3 names it unless overridden). Visual: the operator views it.

### FR6 — the Blog link

- **AC6.1** The header shows Blog after Projects, with `aria-current` on `/blog*`, exactly when the build publishes at least one post. A build-time constant carries that fact, read from the build script's own published-post list (one decider). On the committed content the link is absent. Test: unit (both partitions).
- **AC6.2** Test ruling **R-M** (main thread, grill 2026-10-25, on the operator's "Confirm"), named in each `test(...)` commit:
  - `Header.test.tsx:97` narrows its no-Blog-link assert to the no-published-post partition; its anchor and menu-button asserts stay;
  - PC-E2E-17's count at `nav-projects.spec.ts:24` becomes Resume and Projects, plus Blog exactly when the blog index data lists a post.

  Both still hold on the committed content. Test: unit and E2E (full suite).

### FR7 — rc-3 carried items

- **AC7.1** `seeAllProjects` is required in `ContentData`; `FeaturedProjects` reads it with no fallback, and "Ver todos os projetos" leaves `src/**`. Test: unit (typecheck, `FeaturedProjects.test`).
- **AC7.2** The hero one-column assert (`HeroSection.test.tsx:188`) selects the union of its earlier and current selectors: `[class*='grid-cols-2'], [class*='md:grid-cols'], [class*='lg:grid-cols'], [class*='lg:']`. This tightens it, so no ruling is needed. Test: unit; the reviewer adds `md:grid-cols-2` to the hero and sees it red.
- **AC7.3** These leave the repo, with no reader in code, CI, tests or content:
  - `terraform/_legacy/`;
  - the `terraform/` root `README.md`, `terraform.tfvars` and `terraform.tfvars.example`;
  - `scripts/terraform_manager.sh` and `scripts/check_infrastructure.sh`;
  - `backend/`;
  - `scripts/build_and_serve.sh` and `scripts/server_manager.sh`;
  - the 6 files under `public/images/` that no content, code or test names;
  - `public/decorators/`;
  - `public/lovable-uploads/`;
  - `tests/e2e/setup/`;
  - `img/`.

  Their consumers change in the same job:
  - the `Makefile` targets that call `server_manager.sh` (`dev`, `stop`, `test-build`, and `clean`'s stop line) go;
  - the repo `AGENTS.md` lines naming `backend/` (`:33`, `:54`) go.

  Test: none (deletion); the reviewer greps each path (0 hits outside `specs/`), and `verify` stays green.
- **AC7.4** The 680 px prose cap is read from `PROSE` (`lib/layout.ts:6`) at `LibraryProjectTemplate.tsx:47,82` and `ProjectSections.tsx:27`. `max-w-[680px]` appears only in `layout.ts`. Test: unit (existing); the reviewer greps.
- **AC7.5** The README structure block names only folders that exist; its `specs/` line describes today's tree. Test: none (docs); the reviewer reads it.
- **AC7.6** The repo `verify:` line exits 0 on every job merge and on the rc PR head, unchanged. Test: the existing suite plus this rc's tests.

### Replaces

- One static head for every route: posts and project pages get their own (AC3.1, AC3.2).
- The empty large share card (AC3.3, AC5.2).
- CloudFront answering every extensionless route with the root document (AC1.1).
- The one-year immutable cache on every file but the root `index.html`, and the 6 plain-named SVGs under `assets/` (AC1.2).
- The header's "never a Blog link" and PC-E2E-17's fixed count of 2 (AC6.2).
- The optional `seeAllProjects` and its pt fallback (AC7.1).
- The hero test's `lg:`-only selector (AC7.2).
- The unread terraform root, legacy config, Flask servers and their scripts, unread images and folders, and the Makefile server targets (AC7.3).
- Three hand-written 680 px caps (AC7.4).
- The stale README structure line (AC7.5).

### Closure

- `backlog.py exit blog-v1 --disposition delivered --release 0.1.0` at the reconcile. The summary says the Blog link waits for the operator's first post.
- AC1.1 and AC1.2 stage evidence (the deploy run URL and each `curl` result) is collected after the rc PR merges into develop, as rc-2's AC4.7 was.
- Memory:
  - a `blog` atom: the post contract, the build script, pages, feed and nav flag;
  - `site-chrome` loses "the header carries no Blog link" and gains the conditional link;
  - `deploy-infrastructure` gains the Function and the cache rule, and loses `_legacy` and the two scripts;
  - `content-contract` loses `decorators`/`lovable-uploads` and the unread images, states `seeAllProjects` required, and extends the hash-name rule to every file under `public/assets/`;
  - `local-servers` leaves, `build_frontend.sh` moving to an atom that covers it;
  - `e2e-suite` loses `tests/e2e/setup`;
  - the `resume-home` tldr is narrowed to "numbers derived from content, labels from the locale";
  - `memory.py drift` lists no uncovered unit.

## 5. Constraints and risks

| risk | answer |
|---|---|
| A broken rewrite breaks every route, and only stage can prove it. | AC1.1's stage checks run before any promote to prod. Prod applies only on the promote PR. |
| Without AC1.2, per-route HTML and the feed are cached a year (`deploy.yml:80,127`). | FR1 lands in wave 2, with the first job that emits HTML. The two deploy copies change in one commit, and the 6 renames ride with them. |
| A plain-named file under `assets/` would be served stale for a year after an edit. | AC1.2 holds every file under `public/assets/` to the hash-name rule in `verify`. |
| The prerendered body flashes blank until the locale loads (`createRoot`). | Accepted for v1 (§3); crawlers read the full HTML. |
| A post's language differs from the UI locale. | `<article lang>` carries the post's, and `<html lang>` follows the UI after mount (AC3.1, AC4.4). |
| `smoke-e2e-encodes-the-pre-rc2-header`: a smoke spec bound to the header broke CI after merge. | No smoke spec counts nav links. The smoke set grows by zero, and PC-E2E-17 is full-suite only (AC6.2). |
| The content schema carries a resolved fix chain (4 records). | Posts never enter it; `v1.json` stays byte-equal. |
| The build script adds time to `verify` (its last step is `build`). | AC2.6 measures it against the build before the change. The `verify:` text is unchanged. |
| AC7.3 deletes files that the `Makefile` and the repo `AGENTS.md` name. | The same job edits both consumers. The reviewer's grep is the check. |

## 6. Open questions

None.
