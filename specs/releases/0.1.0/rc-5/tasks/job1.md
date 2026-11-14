# Job 1 — dependencies with no open alert

Wave 1, waits on nothing. Paths are relative to the repo root. Facts: PLAN §1 (dependencies row) and §2.3. Behaviour here is a version state, proved by `npm audit` and `verify`; no repo test can read a version floor, so no task is a RED. Order: the majors first (T2-T4), the in-range refresh and overrides last (T5), because an override is justified only for what no direct bump clears.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J1.T1 | jr | AC1.3 | `frontend/bun.lockb` | the stale second lock is deleted |
| J1.T2 | sr | AC1.2 | `frontend/package.json`, `frontend/package-lock.json`, `frontend/src/App.tsx` | `react-router-dom` to `^7.18` |
| J1.T3 | sr | AC1.2 | `frontend/package.json`, `frontend/package-lock.json`, `frontend/vitest.config.ts`, `frontend/src/test-setup.ts` | `vitest` and `@vitest/coverage-v8` to 5 |
| J1.T4 | sr | AC1.2 | `frontend/package.json`, `frontend/package-lock.json` | `@lhci/cli` to 0.16, one `npm run lighthouse` |
| J1.T5 | sr | AC1.1, AC1.2, AC1.4 | `frontend/package.json`, `frontend/package-lock.json` | `zod` `^4.6.7`, `npm audit fix`, scoped overrides |

## Task notes

- **J1.T1.** `git rm frontend/bun.lockb`. Reviewer lists `frontend/`: one lock, `package-lock.json`.
- **J1.T2.** The site imports `BrowserRouter`, `MemoryRouter`, `Routes`, `Route`, `Link`, `NavLink`, `Outlet`, `useParams`, `useLocation` and `useSearchParams` from `react-router-dom`; v7 re-exports all of them on React 18. `App.tsx` is in `W:` only if v7 forces a change there (its `BrowserRouter` use); a v7 future-flag warning in the tests is read, not silenced. Evidence: the unit tests that import the router stay green.
- **J1.T3.** `@vitest/coverage-v8` stays, at 5: `npm run test:coverage` uses it here. If vitest 5 forces a change in `src/test-setup.ts` (a file of the repo's `tests:` globs), that edit is its own `test(J1.T3)` commit naming the main-thread ruling; `vitest.config.ts` and the lock are the implementation commit. A red the bump causes is fixed at its cause in the setup, never by skipping a test.
- **J1.T4.** `@lhci/cli` 0.16 requires Node `>=22.19.0`. The hand-back cites one `npm run lighthouse` and its exit code (no workflow runs `@lhci/cli` on a PR). It leaves `lighthouserc.json` unchanged; if 0.16 refuses the config, the hand-back returns that as a finding.
- **J1.T5.** Raise the `zod` floor to `^4.6.7` (GHSA-mrhx-c7xc-m3w5), run `npm audit fix` for the in-range lock refresh, then add an `overrides` entry only for a package still flagged. The as-is scratch run needed three: `get-uri > basic-ftp ^6.2.1`, `@typescript-eslint/typescript-estree > minimatch ^11.0.1`, `@tailwindcss/typography > postcss-selector-parser ^6.1.5`; use the nested form (`pkg: { dep: range }`), never an exact global pin. A withdrawn advisory (`braces`) that GitHub keeps open is reported, never dismissed.

## Definition of done

`npm --prefix frontend run verify` exits 0; the unit tests under `frontend/src/` that import the router; `npm audit --prefix frontend` prints `found 0 vulnerabilities`; `npm ls zod --all --prefix frontend` prints no version below 4.6.6; the J1.T4 lighthouse exit code. The hand-back cites each output.
