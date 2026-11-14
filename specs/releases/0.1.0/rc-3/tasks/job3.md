# Job 3 — one column and one footer

Wave 2, waits on Job 1 (`siteChrome.footer`, `COLUMN`). Paths are relative to the repo root. Rulings: **R-M** (SPEC §1 test moves). The email expectation is derived from the committed locale file (`profile.email`); no address is typed in a test. Port 5103. Definition of done: `npm --prefix frontend run verify`, `npx vitest run src/components/layout src/components/projects`, and the PLAN §2.4 recipe on port 5103: the smoke set plus `projects-cluster/layout-shell.spec.ts` and `projects-cluster/i18n-projects.spec.ts`. Hand back the counts and the diff-read of removed or loosened asserts.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J3.T1 | sr | AC2.1, AC2.2 | `frontend/src/components/layout/SiteLayout.test.tsx` | RED: one `footer` after `main` on `/`, `/projetos`, a project path and the 404, per locale; the column element carries `max-w-[960px]` |
| J3.T2 | sr | AC2.1 | `frontend/src/components/projects/__tests__/ProjectsLayoutShell.test.tsx` | RED: the shell root carries no `max-w-[960px]` and no `mx-auto` |
| J3.T3 | sr | AC2.2 | `frontend/tests/e2e/pages/layout.spec.ts` | T-LAY-07: one `contentinfo` landmark on four routes; the T-LAY-04 and `:219` comments re-pointed (R-M) |
| J3.T4 | sr | AC2.1, AC2.2 | `frontend/src/components/layout/SiteLayout.tsx` | the column wrapper and the footer |
| J3.T5 | jr | AC2.1 | `frontend/src/components/projects/ProjectsLayoutShell.tsx` | the shell drops its own width classes and its `chrome?.` chains |

## Task notes

- **J3.T1.** Fixed clock (`vi.setSystemTime(new Date("2031-03-01"))`): the footer shows `2031`. It shows the `siteChrome.footer.owner` of the locale, an `a[href^="mailto:"]` whose href is `mailto:` plus `profile.email` read from the committed file, and the LinkedIn and GitHub links with the `profile` hrefs, link texts from `siteChrome.footer`. The footer follows `main` in DOM order. The existing "one header, one main" cases stay as they are.
- **J3.T3.** T-LAY-04's comment cites a `pt-16` that `Portfolio` no longer has; it now says the offset is `SiteLayout`'s `main` padding (`--header-h`), the assert (`top > 60`) is unchanged. The `:219` comment names `MobileCollapsibleSection`, which Job 8 deletes; it is reworded to the plain section.
- **J3.T4.** `SiteLayout` wraps `<Outlet />` in `<div className={COLUMN}>` inside `main#main-content` (padding `var(--header-h)` kept) and renders `<footer aria-label={footer.label}>` after it with the same `COLUMN` inside. The year is `new Date().getFullYear()` at render, the one form a fixed-clock test can pin. The 404 and the project shell inherit the column.
- **J3.T5.** The shell root keeps `pb-12 flex flex-col min-h-screen` and loses `mx-auto max-w-[960px] px-5 md:px-6`; the project pages render at the same 960 px as before, from the layout.
