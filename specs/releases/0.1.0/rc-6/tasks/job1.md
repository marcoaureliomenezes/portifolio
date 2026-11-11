# Job 1 — the content contract: linear rules, a bounded port, a lossless parse

Wave 1, waits on nothing. Paths are relative to the repo root. Design: PLAN §2.2 (Email, Port, Published schema). DELETE first (T1), then the RED (T2), the implementation (T3), then the read-only consumer check (T4). Every test file here is in the repo's `tests:` globs, so T2 is a `test(J1.T2)` commit.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J1.T1 | jr | AC1.5 | `frontend/scripts/content-schema.mjs` | DELETE the `Consumers:` line of the docstring (`:8`) |
| J1.T2 | sr | AC1.1, AC1.2, AC1.3, AC1.4 | `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/lib/contentSchemaExport.test.ts` | RED: the Email and port partitions, the 50 000-character timing, the moved pin; hardening: the lossless locale parse |
| J1.T3 | jr | AC1.1, AC1.2, AC1.3 | `frontend/src/lib/schemas/projects.ts`, `frontend/public/schema/site-content.schema.json`, `frontend/scripts/content-schema.mjs` | the two regexes of PLAN §2.2, the schema regenerated; owners `projects.test.ts`, `contentSchemaExport.test.ts` |
| J1.T4 | sr | AC6.1 | `frontend/public/schema/site-content.schema.json` | read-only, no commit: the panel's recipe over the committed schema; evidence is the hand-back |

## Task notes

- **J1.T1.** Delete only the `Consumers:` line. Sweep: `grep -rn 'Consumers:' frontend/scripts` prints nothing.
- **J1.T2.** (a) `projects.test.ts`, next to the tables at `:446-462` and `:465` (which stay): Email accepts `a@b.test` and `first.last@sub.example.test`, refuses `a@b..c`, `a@.b.c`, `a@b.c.`, an address with no `@` and one with a space; the timing case runs `a@` + 50 000 `.` + one space and asserts under 50 ms (the bound is 500 times the measured 0.1 ms; a red run is registered, never retried). HttpUrl accepts `https://a.io:1/`, `:80/`, `:65535/` and refuses `:0/`, `:080/`, `:08080/`, `:65536/`, `:99999/`; a URL with no port keeps its verdicts. For every row, zod's verdict equals the verdict of the emitted pattern compiled with and without `u` (the file's existing both-ways helper, rc-5 AC3.2). (b) `contentSchemaExport.test.ts`: the literal at `:90` moves to the PLAN §2.2 pattern, in the same commit, which names the main-thread ruling (the grill record's seam-1 finding plus the operator's approval of the SPEC) and keeps the partition. (c) The locale-parse test (`:146-152`) gains `expect(result.data).toEqual(data)` for `pt`, `en`, `de`. The commit is red on (a) and (b); (c) passes at once and is proved by the reviewer adding `siteChrome.nav.newKey` to a scratch copy of a locale and seeing it go red.
- **J1.T3.** Replace the two regexes in `projects.ts:14-15` with PLAN §2.2's, then `npm --prefix frontend run schema:export`; `git diff --stat` on the published file shows 20 changed lines (19 URL, 1 Email). `content-schema.mjs` is in `W:` only for PLAN §2.8 point 3: if the AC1.4 assert is red on an undeclared committed key, declare it there; otherwise the file is untouched. `projects.ts` carries no other change.
- **J1.T4.** Run after T3 has merged into this job's `wt-main`. The recipe is the panel's 0.2.0 rc-2 J4.T1, run from a scratch twin so that the panel's tree is only read. `<scratch>` is `.dadaia/tmp/dd-sw-engineer-sr/<YYYYMMDD>/studio-check`, `<panel>` the panel's rc-2 `wt-rc`, `<site>` the registry slug, and the npm cache `.dadaia/tmp/npm-cache`.
  1. `git -C <panel> status --porcelain` prints nothing; record it.
  2. Copy `<panel>/frontend/studio/{package.json,package-lock.json,tsconfig.json,src}` into `<scratch>`, then `npm ci` there (the cache set by `npm_config_cache`).
  3. Write `<scratch>/registry.json`: one site with the slug `<site>`, a title, `locales` `["pt","en","de"]`, `environments` `[]`, `sanity` `{projectId: <a lowercase placeholder>, dataset: "production"}`. The check is local; no real id is typed.
  4. `mkdir <scratch>/schemas` and copy this tree's `frontend/public/schema/site-content.schema.json` to `<scratch>/schemas/<site>.json`.
  5. Write `<scratch>/sanity.config.ts` and `sanity.cli.ts` as twins of the panel's `frontend/studio/sanity.config.ts`, reading the registry and `schemas/` with `node:fs` instead of `import.meta.glob`, and `defineCliConfig`'s `api` from the scratch registry. The pre-mortem's twin is `.dadaia/tmp/dd-researcher/20261111/j41/cand/` while its TTL holds.
  6. **Command A**, `typesFor` over `<site>` and the schema; it throws on any construct it cannot map:
     ```
     node <scratch>/typesfor.mjs <scratch> <scratch>/types.json
     ```
     `typesfor.mjs` is: `const { typesFor } = await import(`${dir}/src/schemaFromJson.ts`)`, read `registry.json` and `schemas/<site>.json` from `dir`, `const types = typesFor(registry.sites, { [slug]: schema })`, then print `{slugs, topType, fields, readOnly}` after one walk that counts nodes carrying `name` and `type`, and those with `readOnly`. Exit 0 and the counts are cited (the pre-mortem read 433 fields, 19 read-only, byte-identical types to the base).
  7. **Command B**, from `<scratch>`: `npx sanity schema validate`. Exit 0 and `0 errors` are cited.
  8. Remove `<scratch>`; `git -C <panel> status --porcelain` prints nothing again; record it.
  A construct the generator cannot map ends the job red: the hand-back names it as a `bug-proposal:` against the panel's generator, and nothing else changes here. A difference from 433 and 19 is reported, not failed.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`; `npm --prefix frontend run schema:check` exits 0.
- Test directories reached: `frontend/src/lib` (`npx vitest run src/lib/schemas src/lib/contentSchemaExport.test.ts`) and `frontend/src/pages` (the pages that parse locales).
- Sweeps, each cited with its count: `grep -rn 'Consumers:' frontend/scripts` (0); `grep -rnF '(:\d+)?' frontend/src frontend/scripts frontend/public/schema` (0 hits).
- The hand-back carries the revert-check: with the old regexes restored in a scratch copy, the J1.T2 cases go red; with a nested key added to a scratch locale, the parse case goes red.
- J1.T4's two commands with exit codes and counts, and both `git status --porcelain` records.
