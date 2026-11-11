# Job 4 — the test harness: no server over a running site, in-process blog builds

Wave 1, waits on nothing. Paths are relative to the repo root. T1 is the Playwright config. The blog builds are a behaviour in two parts: the REBUILD of the three test files, red because `buildBlog` is not exported yet (T2-T4, each a `test(J4.Tn)` commit), then the one-word export (T5). T3 and T4 follow the helper T2 writes, so T2 merges first.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J4.T1 | jr | AC4.1 | `frontend/playwright.config.ts` | `webServer` is set only when `E2E_BASE_URL` is unset |
| J4.T2 | sr | AC4.2, AC2.6 | `frontend/src/lib/buildBlog.test.ts` | RED: the 13 spawn sites call `buildBlog` in process; the CLI-contract cases keep one spawn each; the absent-root partition stays |
| J4.T3 | jr | AC4.2 | `frontend/src/lib/blogPages.test.ts` | RED: the 9 spawn sites call `buildBlog` |
| J4.T4 | jr | AC4.2 | `frontend/src/lib/blogFeed.test.ts` | RED: the 5 spawn sites call `buildBlog` |
| J4.T5 | jr | AC4.2 | `frontend/scripts/build-blog.mjs` | `buildBlog` is exported; the guarded main is unchanged |

## Task notes

- **J4.T1.** `webServer: process.env.E2E_BASE_URL ? undefined : { … }`, the block as it is today. Net 0 lines. Evidence, two runs from `frontend/`, each with its exit code and test count: `E2E_BASE_URL=http://x.invalid:1 npx playwright test --list` (no server starts; the as-is spike read 780 tests in 30 files) and `env -u E2E_BASE_URL npx playwright test --list` (today's server config loads, the same count). The config is not in the repo's `tests:` globs, so this is an implementation commit.
- **J4.T2.** The helper builds into a temp dist holding `index.html` and calls `buildBlog(postsDir, dist)` with cwd `frontend/` (vitest's). Cases of the CLI's own contract keep one spawn each: stderr text, exit status 1, and "importing build-blog runs nothing" (`:160`). Every other case calls the function, and an error case uses `toThrow` with the CLI's message. The absent-root case at `:138` ("writes [] for an absent one", AC2.6) stays and now calls the function. A case that needs another cwd keeps its spawn. No assert is removed or loosened: each moves from stdout, stderr or a file read after a spawn to the same value read after the call. The commit is red by the missing export.
- **J4.T3, J4.T4.** The same shape, by T2's helper if the file can reach it; a helper shared by import across the three files is allowed only if it already exists, else each file keeps its few lines (no new support file: it is not in `W:`). The SITE import at `blogPages.test.ts:113` stays as is.
- **J4.T5.** `function buildBlog` at `build-blog.mjs:100` becomes `export function buildBlog`. Nothing else changes; the main guard (`:152`) holds, and "importing build-blog runs nothing" stays green.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directory reached: `frontend/src/lib` (`npx vitest run src/lib/buildBlog.test.ts src/lib/blogPages.test.ts src/lib/blogFeed.test.ts src/lib/blogPosts.test.ts`).
- The hand-back gives, per file, the case count and the spawn count before and after (baseline 13, 9, 5 sites; 64 tests across the four spawning files), and the three files' wall time against the 6.41 s four-file baseline, measured by the same `vitest` run on the base and on the job head.
- Sweep: `grep -n 'execFileSync\|spawnSync\|execFile' frontend/src/lib/{buildBlog,blogPages,blogFeed}.test.ts` lists only the CLI-contract cases, each with its title.
- No E2E run is needed: no served page changes; T1's evidence is `--list`.
