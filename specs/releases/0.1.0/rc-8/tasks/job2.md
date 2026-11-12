# Job 2 — the deploy's least privilege

Wave 1, waits on nothing. Paths are relative to the repo root. One task tree, two ordered commits: the test first (T1, red until T2), then the two `.tf` edits (T2). The plan evidence is not a task: it is the promote's `terraform.yml` dispatch (PLAN §2.4 step 3).

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | sr | AC2.2, AC2.3 | `frontend/src/deployRolePolicy.test.ts` | RED: the deploy policy literal loses `s3:PutObjectAcl`; the bucket policy block is a third literal; the module's IAM resource headers are a literal list |
| J2.T2 | jr | AC2.1, AC2.4, AC6.1 | `terraform/modules/portfolio-static-site/iam.tf`, `terraform/modules/portfolio-static-site/s3_policies.tf` | `s3:PutObjectAcl` leaves both policies |

## Task notes

- **J2.T1.** Generalize `block()` to take the file: it reads `iam.tf` and `s3_policies.tf` from the module directory. The role literal is unchanged. The policy literal drops `"s3:PutObjectAcl",` from its action list. The bucket-policy literal is the block of `s3_policies.tf` from `resource "aws_s3_bucket_policy" "website" {` to the next `}` line with `"s3:PutObjectAcl",` removed. The header pin is PLAN §2.2 (the IAM header pin): it lists the `*.tf` files of the directory and matches header lines, with no parser. The commit is `test(J2.T1)` and its body names AC2.2 and AC2.3 and "operator approval of the rc-8 SPEC". Red today: the two literals (two failing cases); the header pin is green and gets its red from the probe. The hand-back lists the probes of PLAN §2.3 for AC2.2 (the action back in each file) and AC2.3 (an `aws_iam_policy` block added to a module file) with the test's exit code, on scratch copies.
- **J2.T2.** Delete `"s3:PutObjectAcl",` at `iam.tf:69` and at `s3_policies.tf:40`; nothing else changes. Local checks, no AWS: `terraform fmt -check -recursive terraform`, then in `terraform/envs/stage` and in `terraform/envs/prod`, `terraform init -backend=false` and `terraform validate`; each exit code is in the hand-back. Never `plan`, `apply` or `import`. Sweep: `grep -rn 'PutObjectAcl' terraform frontend/src` prints 0 hits. AC2.4's plan line (`0 to add, 3 to change, 0 to destroy` per environment) is read at the promote and is not claimed here.

## Definition of done

- `npm --prefix frontend run verify` exits 0; `npm --prefix frontend run typecheck`.
- Test directory reached: `frontend/src` (`npx vitest run src/deployRolePolicy.test.ts src/terraformWorkflow.test.ts`).
- The Terraform commands of J2.T2, each with its exit code. No local AWS call of any kind.
- Self-check before hand-back: `git diff <base>...HEAD` shows the policy test grown by one literal and one list, no loosened or skipped assert (the only removed assert text is the one action line, in a tightening), and the two `.tf` files changed by one line each.
