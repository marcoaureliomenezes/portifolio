# Job 3 — the projects index has its own document title

Wave 1, waits on nothing. Paths are relative to the repo root. One task tree, three ordered commits: RED unit test (T1), the page (T2), then the E2E literal (T3). No content key, schema or parity entry changes.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J3.T1 | sr | AC3.1 | `frontend/src/pages/projects/ProjectsIndexPage.test.tsx` | RED: one `it.each` over pt, en, de asserts `document.title` against the locale's index title |
| J3.T2 | jr | AC3.1 | `frontend/src/pages/projects/ProjectsIndexPage.tsx` | the page calls `useDocumentSeo` with the index title and description |
| J3.T3 | jr | AC3.2, AC6.1 | `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts` | the `/projetos` title assert is the literal `"Projetos"` |

## Task notes

- **J3.T1.** The file's `useContent` mock returns one fixed index (pt). Make the mocked index follow the locale of the case (a table of `pt: "Projetos"`, `en: "Projects"`, `de: "Projekte"` with their descriptions), keep the existing pt cases as they are, and add `it.each` over the three locales asserting `document.title` toBe the literal after render. The test leaves the `process.cwd()` read at `:64` alone. The commit is `test(J3.T1)`, red today because the page sets no title. The probe of PLAN §2.3 (the hook call removed) is the same red; no further probe is needed.
- **J3.T2.** In `ProjectsIndexPage.tsx` add `import { useDocumentSeo } from "@/hooks/useDocumentSeo"` and, next to the `index` destructuring, `useDocumentSeo({ title: index.title, description: index.description })`, as `BlogIndexPage.tsx:14` does. The schema requires both keys, so no fallback is written; if the type allows `undefined` for the description, report it instead of adding `?? ""`. The JSX is unchanged. The hook's cleanup restores the previous title when the page unmounts.
- **J3.T3.** At `layout-shell.spec.ts:123` replace the `toHaveTitle` of the site-default title with `toHaveTitle("Projetos")` and correct the comment at `:121` (the index now sets its own title; the document no longer keeps the site default). Lines `:118-119` and `:127-131` stay. The commit is `test(J3.T3)` and its body names AC3.2 and "operator approval of the rc-8 SPEC". Run the spec by the E2E recipe (PLAN §2.3) under the project name `portifolio-j3`, with the spec path `tests/e2e/projects-cluster/layout-shell.spec.ts`, and hand back the command, the exit code and the test count.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directories reached: `frontend/src/pages/projects`, `frontend/src/components` (`npx vitest run src/pages/projects src/components/projects`), and the E2E spec of J3.T3 by the recipe.
- Sweep: `grep -n "toHaveTitle" frontend/tests/e2e/projects-cluster/layout-shell.spec.ts` shows the index assert as `"Projetos"` and no site-default literal.
- Self-check before hand-back: `git diff <base>...HEAD` shows one title literal moved (AC3.2), no removed or skipped assert, and `ProjectsIndexPage.tsx` grown by the import and one call.
