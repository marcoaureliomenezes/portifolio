# Job 2 — test hygiene: no cwd change, no duplicate case, no one-shot title, one parity pin

Wave 1, waits on nothing. Paths are relative to the repo root. Every task is a `test(J2.Tn)` commit. None has a source task: the behaviour under each already holds.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | jr | AC3.1 | `frontend/src/lib/buildBlog.test.ts`, `frontend/src/lib/blogPages.test.ts`, `frontend/src/lib/blogFeed.test.ts` | the three module-scope `process.chdir(frontend)` lines leave |
| J2.T2 | jr | AC3.2 | `frontend/src/pages/blog/BlogIndexPage.test.tsx` | the duplicate order case (`:83-88`) leaves |
| J2.T3 | jr | AC3.3 | `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts` | PC-E2E-35 compares each title with a literal |
| J2.T4 | sr | AC3.4, AC5.1 | `frontend/src/lib/homeParity.test.ts` | one case pins the parity check's section-media call |

## Task notes

- **J2.T1.** Delete `process.chdir(frontend)` at `buildBlog.test.ts:16`, `blogPages.test.ts:13`, `blogFeed.test.ts:15`. Keep the `frontend` constant where the file uses it elsewhere; remove it only if nothing else reads it. A case that needs another root passes it as an argument, never by changing the cwd. Evidence: each file alone from `frontend/` (`npx vitest run src/lib/<file>`) and under `verify`; the case counts before and after are equal.
- **J2.T2.** Delete the case "renders the index in the order the data holds, not by date" and its one assert. Its `it.each` sibling (`:70-81`) serves the same fixture in pt, en and de and asserts the same hrefs. The commit body names "operator approval of the rc-7 SPEC, AC3.2". The reviewer adds a date sort to the page and sees the `it.each` go red.
- **J2.T3.** Read the project page's pt title and the projects index's pt title from `public/content/pt.json`, then use them as literals: `toHaveTitle(<index pt title>)` replaces `not.toHaveTitle(titlePT)` at `:124`, and the project page's pt title replaces `toHaveTitle(titlePT)` at `:128`; the `const titlePT = await page.title()` read at `:120` goes. The two regex asserts at `:118-119` and the English assert after the switch stay. Each assert tightens (a literal for a read). The commit body names "operator approval of the rc-7 SPEC, AC3.3". Run the spec by the E2E recipe (PLAN §2.3) under the project name `portifolio-j2` and hand back the command, the exit code and the test count.
- **J2.T4.** The case goes beside `homeParity.test.ts:54-59` and reuses its way of running the parity CLI. It copies the locales to a temp directory, deletes one optional key (`alt` or `caption`) from one locale's `sections[<s>].media[<i>]` that the other locales carry, runs the check, and expects a non-zero exit and a line naming that locale and the `.sections[<s>].media[<i>]` path. The partition: the same copy unchanged exits 0 (the existing case already covers it; do not duplicate). Revert-check evidence in the hand-back: removing the call at `scripts/check-i18n-parity.mjs:317` alone turns the new case red (run it, restore it, show both exit codes). The source file is not in `W:` and is restored byte for byte.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directories reached: `frontend/src/lib`, `frontend/src/pages/blog`, `frontend/tests/e2e/projects-cluster` (J2.T3 only, by the recipe).
- Sweep: `grep -rn 'process.chdir' frontend/src frontend/tests` prints 0 hits; `grep -n 'page.title()' frontend/tests/e2e/projects-cluster/layout-shell.spec.ts` prints 0 hits.
- Self-check before hand-back: `git diff <base>...HEAD` shows only the removals AC3.1-AC3.3 name and the added case of J2.T4.
