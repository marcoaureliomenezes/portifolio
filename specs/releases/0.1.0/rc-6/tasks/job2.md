# Job 2 — pins for unpinned rules

Wave 2, waits on Job 4 (the E2E recipe needs its `webServer` change, PLAN §2.3). Paths are relative to the repo root. Every file here is in the repo's `tests:` globs, so every task is a `test(J2.Tn)` commit. No task has an implementation partner: each pins behaviour that already holds, and each is proved by the reviewer reverting the rule and seeing the case go red (the SPEC names the revert per AC). AC2.6 has no task here: it is pinned at `buildBlog.test.ts:138` and kept by J4.T2.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | sr | AC2.1 | `frontend/src/lib/homeParity.test.ts` | one case: a media item missing an optional key in one locale makes the parity CLI exit non-zero, naming `….media[<i>]` |
| J2.T2 | jr | AC2.2 | `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx` | the install-command assert is `toBe` the full rendered literal |
| J2.T3 | sr | AC2.7 | `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx` | one partition: a scene with no `media` renders no media cell, and its `section` has one child |
| J2.T4 | jr | AC2.3 | `frontend/src/pages/blog/BlogIndexPage.test.tsx` | the case serves the index oldest first, asserts that order, and is retitled |
| J2.T5 | jr | AC2.4 | `frontend/tests/e2e/projects-cluster/nav-projects.spec.ts`, `frontend/tests/e2e/projects-cluster/layout-shell.spec.ts`, `frontend/tests/e2e/pages/language-switch.spec.ts` | the label read moves inside the test, the title reads are web-first, the task id leaves the title |
| J2.T6 | jr | AC2.5 | `frontend/src/lib/contentAssets.test.ts` | a file's name is read with `basename` |

## Task notes

- **J2.T1.** Copy the locales to a temp dir as `homeParity.test.ts` already does, delete one optional key from `media[i]` of one locale only (one that the others carry), run the CLI with `CONTENT_DIR`, and assert the exit status and that the message names that `….media[<i>]` path. Reviewer's revert: remove the `checkMediaListParity` calls (`scripts/check-i18n-parity.mjs:278`, `:317`) and the case goes red.
- **J2.T2.** Read the literal from the fixture the file renders (`pypi.installCommand`), not from a copy of the component's text. `toBe`, not `toContain`.
- **J2.T3.** Next to the one-cell case; a scene fixture with no `media` (neither `richProject` scene lacks it, so build one beside it, not by mutating a shared fixture). Reviewer's revert: render the media cell unconditionally (`LibraryProjectTemplate.tsx:89`) and the case goes red.
- **J2.T4.** The index data holds the posts oldest first; the page renders in that order (rc-5 AC5.2 deleted the page's sort). The title names the index's order. Reviewer's revert: add a sort to the page and the case goes red. Newest-first stays the reader's contract at `buildBlog.test.ts:70`, untouched.
- **J2.T5.** `nav-projects.spec.ts:12`: the file read of the label moves inside the test body. `layout-shell.spec.ts`: every title comparison in the title case is `toHaveTitle` or `expect.poll`; no one-shot `page.title()` compared after a load or a switch (`:132`). `language-switch.spec.ts:60`: the title loses `J4.T1:`. Sweep: `grep -rnE 'J[0-9]+\.T[0-9]+' frontend/tests/e2e` over titles prints 0 hits.
- **J2.T6.** `contentAssets.test.ts:69`: `f.split("/")` becomes `basename(f)` from `node:path`. The existing cases pass.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directories reached: `frontend/src/lib`, `frontend/src/pages`.
- E2E (J2.T5), with the PLAN §2.3 recipe and no wrapper config: `nav-projects`, `layout-shell` and `language-switch`, each green on chromium. The hand-back cites the registry port and its release.
- The hand-back carries, for each of T1, T3 and T4, the reviewer's revert run in a scratch copy and its red result; and the E2E title grep with its count.
