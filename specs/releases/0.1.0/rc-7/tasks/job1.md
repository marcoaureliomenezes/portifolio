# Job 1 — workflows: no expression in a shell script, no apt in the E2E install

Wave 1, waits on nothing. Paths are relative to the repo root. The pin test is a new contract (T1, RED, red by six hits); the workflow edits follow (T2, T3); the install line (T4) has no unit test, its evidence is the rc PR's CI run.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J1.T1 | sr | AC4.1 | `frontend/src/workflowScripts.test.ts` | RED: no `run:` script of any workflow holds `${{` |
| J1.T2 | jr | AC4.1 | `.github/workflows/deploy.yml` | the two distribution ids and the two `github.sha` leave the `run:` scripts |
| J1.T3 | jr | AC4.1 | `.github/workflows/terraform.yml` | the state bucket and region leave the `run:` script |
| J1.T4 | jr | AC4.2, AC5.1 | `.github/workflows/ci.yml` | the E2E install is `npx playwright install chromium` |

## Task notes

- **J1.T1.** Read `.github/workflows/*.yml` from `frontend/src/` (`resolve(__dirname, "../../.github/workflows")`), as `terraformWorkflow.test.ts` does, with no new dependency and no YAML parser. Extract each `run:` script as PLAN §2.2 says. Cases: (1) each of `ci.yml`, `ci-weekly.yml`, `deploy.yml`, `terraform.yml` yields at least one script; (2) the list of `file:line` for every `${{` inside a script `toEqual([])`. Red today with exactly six entries (`deploy.yml` 113, 121, 183, 191; `terraform.yml` 51, 53). The commit is `test(J1.T1)`.
- **J1.T2.** In each deploy job's invalidation step add `env: DISTRIBUTION_ID: ${{ secrets.… }}` (the stage job reads the `_STAGE` secret, the prod job the other) and write `--distribution-id "$DISTRIBUTION_ID"`. In both summary steps `echo "Commit: ${{ github.sha }}"` becomes `echo "Commit: $GITHUB_SHA"`. `with:` inputs and job-level `env:` stay as they are. The secrets keep their names.
- **J1.T3.** The workflow-level `env:` already holds `TF_STATE_BUCKET` and `TF_STATE_REGION`; the init script reads `"$TF_STATE_BUCKET"` and `"$TF_STATE_REGION"`. `src/terraformWorkflow.test.ts` stays green untouched.
- **J1.T4.** One line, `ci.yml:140`. `ci-weekly.yml:36` keeps `--with-deps` (SPEC non-goal). The hand-back cites `grep -n 'with-deps' .github/workflows/*.yml` (one hit, in `ci-weekly.yml`). The fallback, if the rc PR's `CI / E2E` cannot launch Chromium, is channel `chrome` for the CI project in `frontend/playwright.config.ts` and no install step; that is a new task, and the main thread decides it.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directory reached: `frontend/src` (`npx vitest run src/workflowScripts.test.ts src/terraformWorkflow.test.ts`).
- Revert-check for the reviewer: put one `${{ … }}` back into a `run:` script of a scratch copy and see `workflowScripts.test.ts` go red.
- Sweep: `grep -n '\${{' .github/workflows/*.yml` lists only `env:`, `with:`, `if:`, `name:` and `environment:` lines, none inside a `run:` script.
- No local AWS and no live workflow run: the live checks are the rc PR's CI and the promote's dispatches (PLAN §2.4).
