# Job 4 — test pins: literal titles, the CLI from another directory, a literal install command

Wave 1, waits on nothing. Paths are relative to the repo root. One task tree, five `test(` commits, none of which touches source. None has a source task: each pins behaviour that already holds, and the reviewer proves it red on a scratch copy (PLAN §2.3). The E2E tasks (T1-T3) run by the recipe of PLAN §2.3 under the project name `portifolio-j4`; one run of the three files together is enough.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J4.T1 | jr | AC4.1 | `frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts`, `frontend/tests/e2e/pages/deep-link.spec.ts` | the library project page's title is a `toHaveTitle` literal in both specs |
| J4.T2 | jr | AC4.1 | `frontend/tests/e2e/projects-cluster/project-detail-meta.spec.ts` | the meta project page's title is a `toHaveTitle` literal |
| J4.T3 | jr | AC4.2 | `frontend/tests/e2e/projects-cluster/i18n-projects.spec.ts` | the implied non-empty assert (`:106`) leaves |
| J4.T4 | sr | AC4.3 | `frontend/src/lib/buildBlog.test.ts` | one CLI case runs the build from a directory outside `frontend/` |
| J4.T5 | jr | AC4.4, AC6.1 | `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx` | the install command is asserted against its literal |

## Task notes

- **J4.T1.** In `project-detail-library.spec.ts:56-58` and `deep-link.spec.ts:24-25`, delete the `page.title()` read and the non-empty and not-`projetos` asserts, and add `await expect(page).toHaveTitle("<the page's pt seo.title>")`, the literal read from `public/content/pt.json` for that route. Asserts removed: 2 in the first file, 1 in the second. The commit is `test(J4.T1)`, body "AC4.1, operator approval of the rc-8 SPEC", and it lists the removed asserts by `file:line`.
- **J4.T2.** The same in `project-detail-meta.spec.ts:53-55` for the meta project page (2 asserts removed). Commit `test(J4.T2)`.
- **J4.T3.** Delete `i18n-projects.spec.ts:106`, the `(await page.title()).trim().length` assert (1 assert); the literal `toHaveTitle` at `:105` implies it. Commit `test(J4.T3)`, body "AC4.2, operator approval of the rc-8 SPEC".
- **J4.T4.** Add to the `build-blog command line` describe a case that runs `process.execPath` on the absolute `script` path with `--posts <absolute fixtures>` and `--dist <absolute freshDist()>`, with `cwd` a new temp directory outside `frontend/` (`mkdtempSync(join(tmp, "cwd-"))`, as the import case does), and expects status 0 and `existsSync(join(dist, "blog/index.json"))`. Reuse the helpers; add none. Revert evidence in the hand-back, on the scratch copy only: make `build-blog.mjs:106` read `public/content/pt.json` relative to the cwd, run the case and show it red, restore the file, and show `git status --porcelain` empty. The commit is `test(J4.T4)`.
- **J4.T5.** At `LibraryProjectTemplate.test.tsx:401` replace `randEngine.pypi.installCommand` with the literal install command string read from the committed `en.json` for that project. The `process.cwd()` read at `:377` stays (PLAN §2.7). The `randEngine` constant is removed only if nothing else reads it. Revert evidence: edit the install command in a scratch copy of `public/content/en.json`, run the case and show it red. Commit `test(J4.T5)`, body "AC4.4, operator approval of the rc-8 SPEC".

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directories reached: `frontend/src/lib` (`npx vitest run src/lib/buildBlog.test.ts`), `frontend/src/pages/projects` (`npx vitest run src/pages/projects/LibraryProjectTemplate.test.tsx`), and the E2E specs of T1-T3 by the recipe: `tests/e2e/projects-cluster/project-detail-library.spec.ts tests/e2e/projects-cluster/project-detail-meta.spec.ts tests/e2e/pages/deep-link.spec.ts tests/e2e/projects-cluster/i18n-projects.spec.ts`.
- Sweep: `grep -n 'page.title()' frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts frontend/tests/e2e/projects-cluster/project-detail-meta.spec.ts frontend/tests/e2e/pages/deep-link.spec.ts` prints 0 hits.
- Self-check before hand-back: `git diff <base>...HEAD` lists the removed asserts, 6 in all (5 for AC4.1, 1 for AC4.2), each replaced by a literal where AC4.1 says so, and no source file is changed.
