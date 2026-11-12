# Job 3 — the deploy role and the deploy workflow

Wave 1, waits on nothing. Paths are relative to the repo root. DELETE (T1) first, then the REBUILD of the policy test (T2), then the workflow and the README (T3, T4). Terraform, workflow and README tasks have no RED: their ACs are proved by the greps below, the local `terraform validate` and the stage check (PLAN §2.4). `deployRolePolicy.test.ts` is in the repo's `tests:` globs, so T2 is a `test(J3.T2)` commit.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J3.T1 | jr | AC3.2 | `terraform/modules/portfolio-static-site/iam.tf` | DELETE `data "aws_caller_identity" "current"` (`:11`) |
| J3.T2 | sr | AC3.1 | `frontend/src/deployRolePolicy.test.ts` | REBUILD: the forbidden-word assert becomes an allowlist of actions and resources |
| J3.T3 | jr | AC3.3 | `.github/workflows/deploy.yml` | each deploy job reads `vars.S3_BUCKET` and `vars.DOMAIN` once in `env:`; the `run:` scripts use quoted shell variables |
| J3.T4 | jr | AC3.4 | `README.md` | the prod row of the CI/CD table names the published schema upload, as the stage row does |

## Task notes

- **J3.T1.** Delete the one data block. Sweep: `grep -rn aws_caller_identity terraform` prints nothing.
- **J3.T2.** Keep the file's slice of the `aws_iam_role_policy.github_actions_deploy` block. Assert two literals: the sorted set of granted actions equals `cloudfront:CreateInvalidation`, `s3:DeleteObject`, `s3:GetObject`, `s3:ListBucket`, `s3:PutObject`, `s3:PutObjectAcl`; the block's `Resource` expressions equal the bucket ARN, the bucket ARN with `/*`, and the distribution ARN. The forbidden-word assert at `:16` goes in this commit, which names AC3.1 and the ruling (the SPEC's approval). The case passes at once on today's policy; the reviewer adds `"s3:*"` to a scratch copy of `iam.tf` and sees it go red. A state grant must also fail: its action or its resource leaves the set.
- **J3.T3.** In `deploy-stage` and `deploy-prod`, a job-level `env:` with the bucket and the domain, each `${{ vars.… }}` once; every `run:` script reads `"$BUCKET"` and `"$DOMAIN"` (names are the job's own choice, the same in both jobs). Sweep: `grep -n '\${{ vars\.' .github/workflows/deploy.yml` hits only `env:` lines. Net lines grow by 4 to 6; the reason is CWE-78 (an expression's text reaches the shell). The two-job shape stays (SPEC §3).
- **J3.T4.** One cell: read the stage row and write the prod row's equivalent. No other line moves.

## Definition of done

- `npm --prefix frontend run verify` exits 0.
- Test directory reached: `frontend/src` (`npx vitest run src/deployRolePolicy.test.ts`).
- From the repo root, without any credential: `terraform fmt -check -recursive terraform`; in each of `terraform/envs/stage` and `terraform/envs/prod`, `terraform init -backend=false` then `terraform validate`. Skip a step only when `terraform` is not installed, and say so. No `plan`, no `apply`, no AWS call (the repo `AGENTS.md` stop condition).
- The hand-back cites the two greps with their counts, the `"s3:*"` revert run, and the diff stat of `deploy.yml`.
- The stage check of AC3.3 is not the job's: the main thread collects it after the rc PR merges (PLAN §2.4).
