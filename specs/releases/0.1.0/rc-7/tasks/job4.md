# Job 4 — the deploy role under the permissions boundary

Wave 3, waits on nothing (the cap holds it behind Job 3). Paths are relative to the repo root. RED first (T1), then the Terraform (T2). The plan evidence is not a task: it is the promote's `terraform.yml` dispatch (PLAN §2.4 step 3).

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J4.T1 | sr | AC2.2 | `frontend/src/deployRolePolicy.test.ts` | REBUILD, RED: the role block and the policy block each equal one literal |
| J4.T2 | jr | AC2.1, AC2.3, AC5.1 | `terraform/modules/portfolio-static-site/iam.tf` | the two data sources and the `permissions_boundary` attribute |

## Task notes

- **J4.T1.** Replace the four cases (found, statement keys, actions, resources) and the regex collectors. Read `iam.tf`, cut each block as PLAN §2.2 says, and compare with `toBe` against a template literal holding the whole block. The role literal includes the `permissions_boundary` line of PLAN §2.2 (references to the two data sources, no account id), so the test is red today on that one line and green after T2. The policy literal is today's block, unchanged. The commit is `test(J4.T1)`, and its body names the SPEC's ruling ("operator approval of the rc-7 SPEC, AC2.2"): each assert tightens, since any edit to either block turns it red. Revert-check evidence for the reviewer, on a scratch copy of `iam.tf`, each red: the boundary line removed; `"s3:*"` added; a `NotAction` statement added; `Action = local.x`; `Statement = concat(…)`. The hand-back gives the five exit codes.
- **J4.T2.** Add `data "aws_partition" "current" {}` and `data "aws_caller_identity" "current" {}` and the attribute exactly as PLAN §2.2 says; the policy and the trust are unchanged (the J4.T1 literals prove it). Local checks, no AWS: `terraform fmt -check -recursive terraform`, then in `terraform/envs/stage` and in `terraform/envs/prod`, `terraform init -backend=false` and `terraform validate` (plugin cache `.dadaia/tmp/terraform-cache`; `.terraform/` is ignored, `.gitignore:31-32`). Never `plan`, `apply` or `import`. Sweep: `grep -rnE '[0-9]{12}' terraform` prints 0 hits. AC2.3's plan line (`0 to add, 1 to change, 0 to destroy` per environment, role updated in place) is read at the promote and is not claimed here.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directory reached: `frontend/src` (`npx vitest run src/deployRolePolicy.test.ts src/terraformWorkflow.test.ts`).
- The Terraform commands of J4.T2, each with its exit code. No local AWS call of any kind.
- Self-check before hand-back: `git diff <base>...HEAD` shows the policy test rebuilt as literals (no loosened assert, nothing skipped), and `iam.tf` changed by the two data sources and the one attribute only.
