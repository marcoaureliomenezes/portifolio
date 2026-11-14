# Job 1 — workflows, line endings: a parsed pin test, a lean weekly install, `.gitattributes`

Wave 1, waits on nothing. Paths are relative to the repo root. One task tree, four ordered commits (PLAN §2.1): the dependency is declared first (T1), then the pin test is rebuilt on it (T2, a `test(` commit), then the weekly install (T3) and `.gitattributes` (T4).

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J1.T1 | jr | AC1.1 | `frontend/package.json`, `frontend/package-lock.json` | `yaml` is declared in `devDependencies` at the version the lock holds |
| J1.T2 | sr | AC1.1 | `frontend/src/workflowScripts.test.ts` | REBUILD: the pin test parses the `.github/workflows/` listing with `yaml` |
| J1.T3 | jr | AC1.2 | `.github/workflows/ci-weekly.yml`, `frontend/playwright.config.ts` | the weekly run installs Chromium alone, without system packages |
| J1.T4 | jr | AC5.1, AC6.1 | `.gitattributes` | `* text=auto eol=lf` at the repo root |

## Task notes

- **J1.T1.** Add `"yaml": "^2.9.0"` to `frontend/package.json` `devDependencies`, between `vitest` and `zod`. Regenerate the lock with `npm install --package-lock-only --ignore-scripts` from `frontend/` (cache `.dadaia/tmp/npm-cache`). The expected diff of `package-lock.json` is the one root `devDependencies` line; the as-is review measured exactly that on a scratch copy. If the lock moves anything else, stop and report. The commit is `chore(J1.T1)`.
- **J1.T2.** The contract is PLAN §2.2 (the workflow pin). Replace the fixed list and the regex extractor with `parseDocument` from `yaml`; delete `scripts()` and the `"\n"` split. Cases: the listing holds at least one file; each file parses with no errors and yields at least one script; the labels `file:job/step` of every script holding `${{` `toEqual([])`. The commit is `test(J1.T2)` and its body names AC1.1 and "operator approval of the rc-8 SPEC". It is green on today's workflows. The red proof is the five scratch probes of PLAN §2.3 (`run: | # c`, `run: |2-`, plain multi-line, a fifth file `extra.yaml`, and one plain `${{` in a block): the hand-back lists each probe with the exit code of the test, restores the scratch, and shows `git status --porcelain` empty.
- **J1.T3.** In `ci-weekly.yml`: the job name (`:15`) becomes `Full E2E — Chromium`, the step name (`:34`) `Install Playwright (Chromium)`, and `:36` `npx playwright install chromium`. In `playwright.config.ts` the comment at `:36-37` reads that CI, the weekly run included, runs Chromium alone and that the five-browser matrix is local. The config logic is unchanged. `ci.yml` is not in `W:`. Local evidence: `grep -n 'webkit\|with-deps' .github/workflows/ci-weekly.yml` prints 0 hits, and `grep -rn 'WebKit' .github` prints 0 hits. The live check (one weekly dispatch, green) is the promote's (PLAN §2.4); nothing is pushed here.
- **J1.T4.** The file holds that one line. Evidence: `git ls-files --eol` shows `attr/text=auto eol=lf` for every path after the commit, with no content changed; and a clone of the task tree made with `git -c core.autocrlf=true clone` into a temp directory shows `deployRolePolicy.test.ts`, `terraformWorkflow.test.ts` and `workflowScripts.test.ts` as `w/lf` in `git ls-files --eol`. Remove the temp directory.

## Definition of done

- `npm --prefix frontend run verify` exits 0 (its `npm ci` proves the lock); `npm --prefix frontend run typecheck`.
- Test directory reached: `frontend/src` (`npx vitest run src/workflowScripts.test.ts src/terraformWorkflow.test.ts src/deployRolePolicy.test.ts`).
- Self-check before hand-back: `git diff <base>...HEAD` shows no removed or skipped assert besides the replaced scanner, and the lock diff is the single root line.
- No local AWS, no live workflow run.
