# SPEC — Release: 0.1.0

**Status:** Draft
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-11-07
**Origin:** operator-demand

---

## Bug window review

**Window:** the records resolved since rc-4 was defined (2026-10-25T22:20Z, `_RELEASE.json`): the seven rc-4 records, the cvUrl hotfix record and the PC-E2E-35 record. `bugs.py status`: 0 open. Each fix was read with `git show --stat --patch`.

| record | fix (HEAD) | what it changed | overfitting check | verdict |
|---|---|---|---|---|
| `layout-shell-title-read-races-the-language-switch` | `8a9e766` | two E2E waits: PC-E2E-35 waits for the title, and `i18n-projects.spec.ts`'s switch waits for the trigger text | no assert loosened. The fix patched 2 of the 13 copies of "open the combobox, click the option", and none of them waits for the loaded locale. `910d269` and `8ce4c64` fixed the same race earlier, so this is its third occurrence. | **REBUILD** by de-duplication: AC5.7 (candidate scope; the registration review ruled the proposed bug record not a bug) |
| `cv-url-rule-admits-a-control-character-after-the-slash` (hotfix) | `56128c4` | one `SiteRelativeUrl` rule replaces the inline `cvUrl` regex | one rule replaces one inline copy. No branch, and no assert changed. Its sibling `HttpUrl` still runs two validators (`.url()` and `.regex()`), and only the pattern is emitted. That is the `b3b14ff` shape, and AC3.2 rebuilds it under the operator's point (7). | KEEP |
| `blog-link-rule-admits-protocol-relative-redirects` | `75cd824` | the link rule delegates to `SiteRelativeUrl` | it deletes a second same-origin decider and adds none | KEEP |
| `blog-media-rule-has-two-copies-and-admits-markdown` | `cbd5fc2` | `isMedia` in the post reader is the one media check, and the build calls it | two copies become one, net 0. The image-name regex moved into `isMedia` without being loosened. | KEEP |
| `post-page-blanks-the-head-before-the-post-resolves` | `ef55fa0` | `PostView` mounts only for a resolved post and alone sets the head | the loading and 404 gates stay, net +2 because a hook cannot be called conditionally. No second path. | KEEP |
| `blog-default-image-read-skips-the-exactly-once-rule` | `f16464b` | one hoisted default-image read, so the head setter's existing check names a missing tag | two inline reads become one | KEEP |
| `blog-media-poster-test-spawns-three-builds-and-times-out` | `6291f55` | one CLI build per case | it changes a test, and no assert is removed: both poster asserts stay, and the png partition is now proven by a second clip in the same build. The jpg-only partition was untested before and after. | KEEP |
| `blog-link-errors-carry-the-marked-report-suffix` | `e7c1c63` | the build calls marked's unwrapped lexer and parser | one call is replaced, net 0 | KEEP |
| `blog-tags-label-unread` | `e48d354` | `PostMeta` renders `siteChrome.blog.tagsLabel` before the tag links | the fix adds one branch (`post.tags.length > 0`, `PostMeta.tsx:16`), and no test holds its empty partition. AC5.1 adds that partition. | KEEP |

`8a9e766` is the only REBUILD; AC5.7 carries it. `bugs.py stats`: 12 resolved and no REBUILD due.

## 1. Problem

The panel's 0.2.0 SPEC (§5) sets this candidate as **gate G**: the portfolio becomes a site the panel manages. Until gate G holds, the panel's portfolio registry entry does not merge, and every portfolio E2E of that release waits. Cross-context ruling: "Eu toco os dois (Recommended)". Read at `25d1dd5` (as-is review, 2026-11-07):

- No SSM parameter names this site's buckets or distributions, so the panel cannot find them.
- The export is draft-07, wrapped in `$ref` + `definitions` (`export-content-schema.mjs`). It is written to `public/content/schema/v1.json`, under `content/*`, which the sync will own.
- The deploy's no-cache sync runs `--delete` over `content/*` and `schema/*` in both jobs (`deploy.yml:83-90`, `:145-152`). After the switch, it would overwrite or delete what the sync writes.
- 8 schema nodes fail the Studio's mapping rule or become read-only fields:
  - `kindLabels.case-study`, an invalid field name;
  - the certification `link`, an `anyOf` of a pattern and `"#"`;
  - 4 hero `media` nodes and 3 section `media` nodes, each a `oneOf` of objects under a property rather than under `items`.

  25 of the 35 top-level keys the locales carry (`siteChrome`, the home labels and more) pass only through `.catchall`, so the Studio has no field for them and a seed-then-sync round trip can drop them.
- `HttpUrl` runs `.url()` and `.regex()`, and only the regex is emitted. The email field emits `format: email` beside zod's own check. zod, Ajv and the Studio can therefore disagree on one value.
- Each locale carries 9 hand-typed version literals beside the two `pypi.version` values: one Try-it pin and 8 facts-link tags across the two library projects. The panel's versions job patches `pypi.version` only.
- Dependabot reads 41 open alerts, all on `frontend/package-lock.json`. `npm audit` reads 43 advisories: 1 critical, 24 high, 17 moderate and 1 low. `zod` is `^4.4.3`. `frontend/bun.lockb` is a stale second lock.
- Each deploy role trusts any ref of the repo (`iam.tf:36`, `StringLike … :*`).
- Four rows left over from rc-4 have no home: the untested tags guard, the second blog-index sort, the false `projects.ts:2-12` docstring, and the untested attribute escaping. The partitions of the site-relative rule are also unpinned.

Operator rulings (main-thread grill handoff `2026-11-07T160500Z`, verbatim answers):

- Infra path → "Role no bootstrap do painel (Recommended)":
  - the panel's bootstrap gets one apply role for this repo, applied once by the operator from the saved plan. Its subject is `<sub_claim_prefix>:environment:infra`;
  - `terraform.yml` is rebuilt as a `workflow_dispatch` apply per environment;
  - its PR, push and destroy-bootstrap jobs are deleted.
- The 11-point summary → "Confirmo (Recommended)":
  1. SSM `/static-sites/<site>/{stage,prod}/{bucket,distribution-id}` in us-east-1;
  2. the 2020-12 schema at `schema/site-content.schema.json`. The deploy writes only that key, by `aws s3 cp`, and the syncs exclude `content/*` and `schema/*`;
  3. `kindLabels` deleted;
  4. the install command and links rendered from `pypi.version`, with an optional `pypi.tagPrefix`. Facts and media stay pinned to their tag;
  5. zod ≥ 4.6.6 and the 41 alerts fixed: the majors `@lhci` 0.16, vitest 5 and react-router-dom 7.18, overrides, and `bun.lockb` deleted;
  6. the OIDC trust narrowed to `:environment:{stage,production}`;
  7. one regex per URL and email field in zod and Ajv, with http and https kept;
  8. the 25 top-level label keys declared, and the nodes the Studio cannot map made mappable;
  9. the bugs fixed;
  10. the promote order: rc-5 in prod before the panel's Studio build, then seed as draft → prod deploy → publish;
  11. after the switch, heads and RSS read the repo JSON as a frozen seed, carried to the panel's 0.2.0 scope edge.

Main-thread rulings and agent defaults (same handoff):

- Point (9): two bugs take hotfix lanes (§5). The registration review (verdict `2026-11-07T171152Z`) ruled the other two not bugs, a product change and a REBUILD demand, so they are candidate scope under point (9): AC5.6 and AC5.7.
- The site-wide schema key is written by one explicit `aws s3 cp`, as the sibling static site's deploy does.
- The gap between the rc-5 promote and the switch is accepted. The build-time readers (`build-blog.mjs:102`, `check-i18n-parity.mjs:36`) keep the repo JSON.
- `media/*/pin.txt` stays. `kindLabels` is deleted as dead content: no reader and no assert.

Glossary:

- `<site>`: the site's registry slug, this repo's name.
- **Published schema**: the panel's term, the JSON Schema 2020-12 at `schema/site-content.schema.json` in each bucket.
- **Studio mapping**: the rule of the panel's 0.2.0 AC2.1, where an invalid field name fails generation and any construct it does not map becomes a read-only field. Its parts:
  - a field name matches `^[A-Za-z_][A-Za-z0-9_]*$`;
  - a `oneOf` with a `const` discriminator maps only as array items.

## 2. Measurable Goals

| # | goal | today | target | source |
|---|---|---|---|---|
| 1 | open Dependabot alerts on this repo, none dismissed | 41 | 0 | AC1.4 |
| 2 | `npm audit` advisories on `frontend/package-lock.json` | 43 | 0 | AC1.2 |
| 3 | SSM parameters naming this site's buckets and distributions | 0 | 4 | AC2.1 |
| 4 | deploy steps that write or delete `content/*` or `schema/*` by sync | 2 per job | 0 | AC2.3 |
| 5 | schema nodes the Studio mapping fails or makes read-only | 8 | 0 | AC3.4 |
| 6 | top-level locale keys the schema does not declare | 25 | 0 | AC3.5 |
| 7 | validators per URL or email field, of which only one is emitted | 2 | 1, emitted | AC3.2 |
| 8 | version literals per locale outside `pypi.version` | 9 | 0 | AC4.2 |

## 3. Non-goals

- The two confirmed bugs. They are fixed in hotfix lanes, not here (§5).
- After the switch, heads and RSS read the repo JSON as a frozen seed. That edge belongs to the panel's 0.2.0 scope (point 11).
- The panel's seed. A note for 0.2.0 rc-2: the seed carries every key AC3.5 declares, the 25 label keys included, or the sync fails the target.
- A Sanity fetch in the build. A slug or SEO change still needs a commit and a deploy (agent default).
- An https-only URL rule. Narrowing it is a product-contract change, and the operator kept http and https (point 7).
- Re-reading the facts at a newer tag, or re-recording media. Both stay pinned to their tag (point 4).
- Merging the two deploy jobs, which needs per-environment secret renames, an operator act.
- Any new gate, CI job, `verify:` step or merge check. Ajv is not added: the parity test compiles the emitted pattern the way Ajv and the Studio do (AC3.2).

## 4. Requirements

Paths are relative to `frontend/` unless they start with `terraform/` or `.github/`. Domain names: the content contract (`scripts/content-schema.mjs`), the one project schema (`src/lib/schemas/projects.ts`), the export, the published schema, the locale, the deploy, the module (`terraform/modules/portfolio-static-site`), stage and prod.

Test levels are rc-4's. A stage check runs after the rc PR merges into develop.

**Wave ranking:**

1. Law, skills, dev loop: none.
2. Shared foundation, in parallel on disjoint files:
   - FR1, the dependencies;
   - FR2, infra and deploy.
3. Features:
   - FR3, the published schema, after FR1's zod;
   - FR4, the version render, after FR3 (both touch the three locales and `projects.ts`);
   - FR5, the carried rows, independent.
4. Promote-facing:
   - the Terraform apply of FR2 through the rebuilt `terraform.yml` (§5);
   - the stage checks;
   - the alert read of AC1.4.

### FR1 — dependencies with no open alert

- **AC1.1** Every `zod` the lock resolves is 4.6.6 or later. Test: integration (`npm ls zod --all` prints no version below 4.6.6).
- **AC1.2** `npm audit` reports 0 vulnerabilities on `frontend/package-lock.json`.
  - The direct majors are taken: `react-router-dom` 7.18 or later, `vitest` and `@vitest/coverage-v8` 5, and `@lhci/cli` 0.16.
  - An `overrides` entry exists only for a transitive package that no direct bump clears.
  - The `verify:` line exits 0.

  Test: integration. The job's hand-back cites `npm audit`'s output and one run of `npm run lighthouse` with its exit code, because no workflow runs `@lhci/cli` on a PR.
- **AC1.3** `frontend/bun.lockb` is gone, and npm's lock is the only one. Test: none, since it is a deletion. The reviewer lists `frontend/`.
- **AC1.4** At the promote, `gh api repos/<owner>/<repo>/dependabot/alerts?state=open --paginate` returns 0 alerts, and no alert was dismissed in this candidate. Test: integration, read at the promote. The read and its time go in the promote record.

### FR2 — the panel finds the site, and the deploy leaves content to the sync

- **AC2.1** The module writes two SSM String parameters per environment in us-east-1, through its `aws.us_east_1` alias: `/static-sites/<site>/<env>/bucket` and `/static-sites/<site>/<env>/distribution-id`. `<env>` is the module's `environment` (`stage`, `prod`). The values come from the module's own bucket and distribution, and no value is typed or printed. Test: integration. For each environment, the plan the rebuilt `terraform.yml` dispatch prints shows the 2 parameter creates and the trust update of AC2.2, with 0 to destroy and 0 to replace. After the apply, the panel's read-only site-admin plan reads the 4 parameters (its registry entry, 0.2.0 rc-2).
- **AC2.2** Each deploy role trusts one subject, by `StringEquals`: the repo's issued `sub_claim_prefix` plus `:environment:stage` for the stage role, and plus `:environment:production` for the prod role. One module local maps the module's `prod` to GitHub's `production`; `stage` maps to itself. The `:*` wildcard and its `StringLike` are gone. Every workflow job that assumes either role declares that environment. Test: integration. The AC2.1 plan shows each trust updated in place. After the apply, the next stage deploy run is green, and the reviewer reads the subject against the issued prefix.
- **AC2.3** In both deploy jobs (stage and prod):
  - neither sync writes or deletes `content/*` or `schema/*`;
  - one `aws s3 cp` writes the committed published schema (AC3.1) to the key `schema/site-content.schema.json`, with `Content-Type: application/json` and `Cache-Control: no-cache`;
  - the rc-4 cache rule and the route upload stay as they are.

  The old `content/schema/v1.json` object stays in each bucket, unread. Test: none local (no AWS credential on a developer machine); the reviewer diffs the two copies. Stage check: `/schema/site-content.schema.json` answers 200 `application/json`, and its `$schema` is 2020-12. `/content/pt.json` still answers 200 with the last uploaded body.

### FR3 — the published schema: one contract that the site, the sync and the Studio read alike

- **AC3.1** The export writes JSON Schema 2020-12 to one committed file, with the root `$schema` `https://json-schema.org/draft/2020-12/schema` and no `$ref`/`definitions` wrapper. That file is what AC2.3 uploads.
  - `public/content/schema/v1.json` and the draft-07 output are gone.
  - `schema:export` and `schema:check` target the new file.
  - The freshness test reads the new file.

  Test: unit. The freshness test is re-pointed, and the root `$schema` is asserted.
- **AC3.2** Each URL field has one rule and so does the email field. `HttpUrl` is one `z.string().regex(…)` with no `.url()`, and it keeps `http` and `https`. The email field is one regex with no `.email()`. Each rule's regex source is the emitted `pattern`, with no `format`. The regex gives the same verdict with and without the `u` flag (Ajv compiles patterns with `u`; the Studio uses `new RegExp`). Test: unit, in `src/lib/schemas/projects.test.ts`. For each partition, zod's verdict equals that of the emitted pattern, compiled both ways:
  - `https://`, `https://exa%20mple.com`, `https://a.b/x y` and `https://a|b` are refused;
  - `javascript:alert(1)` and a `data:` URL are refused;
  - an `http://` URL and the LinkedIn-, GitHub- and Instagram-shaped URLs are accepted;
  - a valid email is accepted; an email without `@` and one with a space are refused.

  No existing refusal turns into an acceptance.
- **AC3.3** Under `SiteRelativeUrl`, a space, `\x00`–`\x08` or `\x7f` after the leading slash is refused, in zod and in the emitted pattern compiled both ways. Test: unit, same file. These are the unpinned partitions of rc-4's intake.
- **AC3.4** Under the Studio mapping, the published schema has no node that fails generation and none that becomes a read-only field:
  - `kindLabels` leaves the schema, the three locales and the type;
  - the certification `link` and the 7 media nodes are made mappable in this repo's schema. The PLAN picks the form, and the site renders the same links and media.

  The panel's mapping rule is unchanged (its 0.2.0 AC2.1 is approved and closed). Tests:
  - unit, a walk over the published schema: every object key matches `^[A-Za-z_][A-Za-z0-9_]*$`, no `anyOf` remains, and every `oneOf` sits directly under `items` with a `const` discriminator on each branch;
  - integration, once, in the job's hand-back: the panel's generator over the published schema reports 0 read-only fields and 0 errors;
  - the three locales parse, and the existing media and certification tests stay green.
- **AC3.5** The schema declares as a property every top-level key that the three locales carry, required where `src/types/content.ts` requires it, plus `schema_version`, `published_at` and `projectsV2`, which the type marks optional and the content contract requires. `.catchall` and the root `additionalProperties` are gone, so an unknown top-level key is stripped like an unknown key anywhere else. Test: unit. The root `properties` keys equal the union of the locales' top-level keys, and `required` equals the type's required keys plus those three, named in the test.

### FR4 — version literals rendered from `pypi.version`

- **AC4.1** A library project may carry `pypi.tagPrefix`, a string; when it is absent, the prefix is empty. In `pypi.installCommand`, a section's `code` and each item's `href`:
  - the template replaces `{version}` with `pypi.version`;
  - it replaces `{tag}` with `tagPrefix` + `pypi.version`.

  Validation reads the raw content; substitution runs only at render. So a placeholder `href` passes AC3.2's URL rule as written: `{` and `}` are admitted in a URL's path and refused in its host. Test: unit. A fixture with both placeholders renders the literal values, and the URL-rule partitions accept `https://h.example/blob/{tag}/x` and refuse `https://{tag}.example/`.
- **AC4.2** In each locale, each library project holds its version only in `pypi.version`. The Try-it pin and every facts-link tag read `{version}` or `{tag}`. Test: unit. Each library block's serialized JSON in each locale holds `pypi.version`'s value exactly once.
- **AC4.3** At today's versions, the rendered pages are unchanged. The rendered install commands, the pin and the 8 facts links equal today's literals, and `media/*/pin.txt` is byte-equal. Every test of a rendered command or link asserts the rendered value, never the raw content: the second library page's E2E install-command compare (`tests/e2e/projects-cluster/`) moves to it under a named ruling. Test: unit (render with the committed content, literals expected); the reviewer diffs `pin.txt`.

### FR5 — rows carried from rc-4 and point (9)

- **AC5.1** A post with no tags shows its date and language tag, and no tags label. Test: unit. This is the missing partition of `PostMeta.tsx:16`, and the reviewer drops the guard and sees it go red.
- **AC5.2** The post reader (`scripts/blog-posts.mjs`) is the one order decider. The blog index renders the posts in the order the index data holds them, and the second sort (`BlogIndexPage.tsx:14`) is deleted. Test: unit, existing: `buildBlog.test.ts:70`, `blogFeed.test.ts:53` and `BlogIndexPage.test.tsx:74` stay green. The reviewer greps `sort(` under `src/pages/blog/` and finds 0 hits.
- **AC5.3** The docstrings state only their unit's contract. `projects.ts:2-12` loses its task, SPEC and constraint ids and its false "only imported by `useContent.ts`" claim. The `.catchall` comment of `content-schema.mjs` and the `export-content-schema.mjs` header follow FR3. Test: none, since these are docs; the reviewer reads them.
- **AC5.4** In a post body, an image `alt` and a link `href` holding `&` and `"` render escaped as `&amp;` and `&quot;`. Test: integration, the build script over a fixture with literal output.
- **AC5.5** The repo `verify:` line exits 0, unchanged, on every job merge and on the rc PR head. Test: the existing suite plus this rc's tests.
- **AC5.6** Post body headings sit under the page title. A Markdown `#` in a post body renders `<h2>`, and each level shifts down one, capped at `<h6>`, so the post page keeps one `h1`, its title. This is a product change with the operator's words on point (9). It replaces today's `#` → `<h1>` rendering, and the assert at `buildBlog.test.ts:99` moves under this AC. Test: unit, with literal output for `#`, `##` and `######`.
- **AC5.7** One E2E language switch. One helper in `tests/e2e/fixtures/` switches the language and returns only once the new locale's content is loaded: `LanguageContext.tsx:224` sets the content after the fetch, while `:243` flips the language at once. Every inline copy of "open the combobox, click the option" goes, and every spec calls the helper. The as-is review counts about 13 copies, and the registration review found that 3 of the 5 cited copies already wait. Ledger evidence: `910d269`, `8ce4c64` and `8a9e766` were each a wait fix on one copy. This is a REBUILD by de-duplication. Test: E2E, the full suite passes. The structural check is a grep for an inline switch outside the helper, which finds 0.

### Replaces

- `kindLabels` in the schema, the type and the three locales (AC3.4).
- `frontend/bun.lockb` (AC1.3).
- The blog index's second sort (AC5.2).
- The draft-07 export at `public/content/schema/v1.json`, served at `content/schema/v1.json`, with its `$ref`/`definitions` wrapper (AC3.1).
- `terraform.yml`'s PR plan, push apply and destroy-bootstrap jobs, through the hotfix lane of `terraform-workflow-cannot-plan-or-apply` (§5).
- The deploy's sync writes and `--delete` over `content/*` and `schema/*` (AC2.3).
- `.url()` in `HttpUrl` and `.email()` in the profile, along with the emitted `format: email` (AC3.2).
- `.catchall` on the content root, and with it the tolerance of unknown top-level keys (AC3.5).
- The 9 hand-typed version literals per locale outside `pypi.version`: one Try-it pin and 8 facts-link tags (AC4.2).
- Each deploy role's `:*` trust wildcard (AC2.2).
- The `#` → `<h1>` rendering of a post body heading, and its assert at `buildBlog.test.ts:99` (AC5.6).
- The inline E2E language-switch copies (AC5.7).
- Two rc-4 statements, broken on purpose: `rc-4/SPEC.md:269`, "`v1.json` stays byte-equal" (AC3.1); and `:126-127`, AC1.2's one upload rule for every file, which gains the `content/*` and `schema/*` exclusions and the schema `cp` (AC2.3).

### Closure

- AC2.3's stage checks are collected after the rc PR merges into develop, along with the deploy run URL. AC2.1 and AC2.2 are proved by the plans and the apply run.
- Memory:
  - `content-contract`: the 2020-12 published schema and its path, one regex per URL and email field, `kindLabels` gone, the declared top-level keys, the version placeholders;
  - `deploy-infrastructure`: the SSM parameters, the narrowed trust, the syncs that exclude `content/*` and `schema/*`, the schema upload, and the rebuilt `terraform.yml` with the panel's apply role;
  - `blog`: one order decider, body headings one level under the title;
  - `e2e-suite`: the one language-switch helper;
  - `library-page`: `pypi.tagPrefix` and the placeholders;
  - ARCHITECTURE Structure: the export path;
  - `memory.py drift` lists no uncovered unit.

## 5. Constraints and risks

**Hotfix lanes before rc-5 merges** (`specs/bugs/AGENTS.md`, Resolution). Two confirmed bugs live in code the work branch already holds, so each is fixed in its own `wt-hotfix` lane and lands on `feature/0.1.0` before rc-5 merges:

- `terraform-workflow-cannot-plan-or-apply`;
- `readme-node-floor-below-what-the-build-needs`.

None of their fixes is an rc-5 AC. **The dependency:** rc-5's Terraform (AC2.1, AC2.2) applies only through the rebuilt `terraform.yml`, a `workflow_dispatch` apply per environment under the `infra` GitHub environment, assuming the panel's apply role for this repo. Operator ruling on 0.2.0, "FR4 vai para o rc-2 (Recommended)": that role, the registry entry and the portfolio E2Es move to the panel's 0.2.0 rc-2. Gate G is met in this order:

1. this rc-5 merges;
2. the panel's rc-2 lands the role;
3. the operator applies the panel's bootstrap and sets the `infra` environment's role-ARN secret, an operator act at that apply;
4. the rebuilt `terraform.yml` applies rc-5's Terraform.

| risk | answer |
|---|---|
| The SSM parameters, the trust and the deploy change reach AWS before the panel's registry entry needs them. | Order of point (10): rc-5 promotes and deploys to prod first. Then the panel's Studio build reads the published schema from the prod bucket. Then seed as draft → prod deploy → publish. |
| Between the rc-5 promote and the switch, an edit to the repo JSON no longer reaches the site, because the deploy stops uploading `content/*`. | Accepted by the switch ruling. The switch follows rc-5's promote. |
| Narrowing the trust breaks a job that assumes a role without declaring an environment. | Every `configure-aws-credentials` use in `deploy.yml` and `terraform.yml` declares one (as-is grep: 7 uses, 7 `environment:` lines). The reviewer re-greps after the hotfix lane rebuilds `terraform.yml`. |
| A major bump changes behaviour: vitest 5 on the jsdom/vite 7 setup, the router v7 future flags, Lighthouse 0.16. | Each major is its own task under `verify:`. The router keeps its imports, all re-exported by v7. AC1.2's Lighthouse run is cited. |
| The FR3 rebuild moves pinned asserts in `contentSchemaExport.test.ts`: `:10`/`:12` (path and wrapper), `:48` (the pattern literal), and `:76-83` (the media `oneOf` location, if AC3.4 moves it). | Each move is a product-contract change the operator confirmed (points 2, 7, 8). The main thread names the ruling in each `test(` commit. The assert's partition is kept, never loosened. |
| A strict URL rule refuses committed content. | The locale-parse test runs the rules on the raw committed content, placeholders included (AC4.1). |
| `WT merge` refuses an implementation commit that touches the repo's `tests:` globs. | Every task touching a test is a `test(` commit in its own tree. |

## 6. Open questions

None for the operator. Main-thread seam: AC3.4 binds the media and `link` nodes to this repo's schema. The as-is review had preferred widening the panel's generator for the media nodes, but that generator's AC is approved and closed.
