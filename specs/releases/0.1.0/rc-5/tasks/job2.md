# Job 2 — infra and deploy: the SSM names, the narrowed trust, the schema key

Wave 1, waits on nothing. Paths are relative to the repo root. Design: PLAN §2.2 (Terraform, Deploy). No task here has a RED: SPEC AC2.1-AC2.3 name an integration plan and a stage check, and no local test can read an IAM trust or an S3 key. The evidence is the validation below, the reviewer's diff of the two deploy jobs, and the promote-facing steps of PLAN §2.4. No `terraform plan` or `apply`, and no AWS call, runs on a developer machine (repo `AGENTS.md` stop condition). Never print or write a bucket name, distribution id or account id.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | sr | AC2.1 | `terraform/modules/portfolio-static-site/ssm.tf`, `terraform/modules/portfolio-static-site/variables.tf` | two SSM String parameters per environment, in us-east-1 |
| J2.T2 | sr | AC2.2 | `terraform/modules/portfolio-static-site/iam.tf`, `terraform/modules/portfolio-static-site/locals.tf` | each deploy role trusts one `environment:` subject |
| J2.T3 | jr | AC2.3 | `.github/workflows/deploy.yml` | both jobs: the syncs leave `content/*` and `schema/*`, one `cp` writes the schema key |

## Task notes

- **J2.T1.** `ssm.tf` has `aws_ssm_parameter.bucket` and `.distribution_id`, `provider = aws.us_east_1`, `name = "/static-sites/${var.site}/${var.environment}/bucket"` and `.../distribution-id`, `type = "String"`, values `aws_s3_bucket.website.bucket` and `aws_cloudfront_distribution.website.id`. `variables.tf` adds `site` (string, the repo name as its default, a validation like the module's others). Model: the sibling site module's `ssm.tf`, which differs only by `for_each` (one environment per stack here). The module already declares `configuration_aliases = [aws.us_east_1]`; `terraform/envs/*` pass it and need no edit.
- **J2.T2.** `locals.tf` adds the issued prefix (`repo:<owner>/<repo>`, as the as-is read of the repo's `sub_claim_prefix` states) and `github_environment = var.environment == "prod" ? "production" : var.environment`. In `iam.tf` the trust condition becomes `StringEquals` on `"token.actions.githubusercontent.com:sub"` with `"${local.oidc_prefix}:environment:${local.github_environment}"`; the `StringLike` block and the `:*` are deleted, the `aud` condition stays. Comment in the file header: the narrowing and why. The reviewer re-greps every `configure-aws-credentials` use for an `environment:` line (as-is: 7 and 7).
- **J2.T3.** In `deploy-stage` and `deploy-prod`: add `--exclude "content/*" --exclude "schema/*"` to the step `Sync everything else to S3 (no-cache)`; after `Configure AWS credentials (OIDC)`, add a step that runs `aws s3 cp dist/schema/site-content.schema.json "s3://${{ vars.S3_BUCKET }}/schema/site-content.schema.json" --content-type application/json --cache-control no-cache`. The file is in `dist/` because `frontend/public/schema/site-content.schema.json` (Job 5) is copied by vite; until Job 5 lands the step would find no file, and both land in one rc PR. The first sync (`assets/*`), the route-upload step and the invalidation do not change. The commit body states the net-lines reason (new behaviour) and that the two jobs stay duplicates.

## Definition of done

From the repo root: `terraform fmt -check -recursive terraform` exits 0; in `terraform/envs/stage` and in `terraform/envs/prod`, `terraform init -backend=false` then `terraform validate` exit 0 (cite the output, masked). For J2.T3: `diff` of the two jobs' changed steps shows the same text, and `git diff` of `.github/workflows/deploy.yml` holds no other change. `npm --prefix frontend run verify` is not reached by this job. The plan and the stage checks are PLAN §2.4.
