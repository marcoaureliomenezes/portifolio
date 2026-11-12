---
slug: deploy-infrastructure
title: Deploy infrastructure
tldr: One Terraform module serves the site from private S3 via CloudFront per env; Actions deploys over OIDC, hashed assets immutable, the rest no-cache.
summary: terraform/modules/portfolio-static-site is the one topology, called by envs/stage and envs/prod, and names each env's bucket and distribution in SSM for the panel; the terraform workflow is a manual apply per env on the panel's infra role; the deploy workflow uploads the published schema, syncs dist/ under one cache rule, uploads each prerendered route as an extensionless HTML object and invalidates CloudFront; a one-time script creates only the OIDC provider.
tags:
  - infrastructure
  - deploy
  - aws
sources:
  - terraform/**
  - .github/workflows/deploy.yml
  - .github/workflows/terraform.yml
  - frontend/src/terraformWorkflow.test.ts
  - frontend/src/deployRolePolicy.test.ts
  - frontend/src/workflowScripts.test.ts
  - scripts/bootstrap-oidc.sh
  - scripts/setup-deployment.sh
  - scripts/build_frontend.sh
  - Makefile
---

## What it does

The site reaches visitors as static files: the production build sits in a private bucket and
CloudFront serves it over HTTPS at the apex domain (prod) or its `stage` subdomain (stage). A
project page or a post is served from its own HTML, so a crawler reads its own head.

## Current behavior

- `terraform/modules/portfolio-static-site` builds one environment: a private S3 bucket
  (versioning, encryption, public access blocked, noncurrent versions moved at 30 days and
  expired after `backup_retention_days`), CloudFront reading it through an origin access
  control, HTTP redirected to HTTPS, `index.html` as root and as the answer to 403 and 404 (the
  SPA fallback), an ACM certificate in us-east-1 validated by Route53 DNS, A records for the
  domain (plus `www` in prod), and the IAM deploy role GitHub Actions assumes over OIDC to list,
  put, get and delete the bucket's objects and invalidate the distribution, with no access to the
  Terraform state. The deploy role carries the permissions boundary the panel's bootstrap owns,
  the policy named `portifolio-roles-boundary`, its ARN built from the `aws_partition` and
  `aws_caller_identity` data sources, so no account id is written in the repo.
- `src/deployRolePolicy.test.ts` compares the deploy role block and the deploy policy block of
  `iam.tf`, each as one literal: any change inside either block (the boundary line, the trust,
  an action, a statement, a resource, a format-only edit) fails it. It reads only those two
  blocks, so a new IAM resource elsewhere in the module passes it.
- The deploy role trusts one subject by `StringEquals`: the repo's OIDC prefix plus
  `:environment:stage` for stage and `:environment:production` for prod, so only a job bound to
  that GitHub environment assumes it.
- The module writes two SSM String parameters per environment in us-east-1,
  `/static-sites/<site>/<environment>/bucket` and `/static-sites/<site>/<environment>/distribution-id`,
  valued from its own bucket and distribution; `site` defaults to the repo's name. The panel finds
  the site's buckets and distributions through them.
- `terraform/envs/stage` and `terraform/envs/prod` call the module with their environment
  (region sa-east-1, `PriceClass_100`); their S3 state backend is partial, its key injected by
  the workflow. `terraform/` holds only `envs/` and `modules/`.
- `terraform.yml` runs only on a manual dispatch with an `env` input (`stage` or `prod`), in the
  `infra` GitHub environment, assuming the one apply role its `AWS_ROLE_ARN` variable names, which
  the panel's bootstrap owns. Its init reads the state bucket and region as shell variables. It
  runs fmt check, validate and a saved plan, refuses a plan that deletes or replaces anything,
  then applies that plan. A unit test reads the workflow.
- `deploy.yml` runs on a push to `develop` (stage, in the `stage` environment) or `main` (prod,
  behind the `production` environment) that touches `frontend/**` or the workflow. It builds once
  with `npm run build`, which also writes the blog and the prerendered pages ([[blog]]), then for
  the env, each deploy job reading the `S3_BUCKET` and `DOMAIN` variables once into job-level
  `env:` entries and the distribution id into its invalidation step's `env:`; its `run:` scripts
  use them as quoted shell variables and the commit as `$GITHUB_SHA`:
  - uploads the published schema ([[content-contract]]) by `aws s3 cp` to the key
    `schema/site-content.schema.json`, `application/json`, `no-cache`;
  - syncs `dist/assets/**` with `public, max-age=31536000, immutable`, and every other file but
    `schema/*` (root and per-route HTML, the locale content under `content/`, `blog/rss.xml`, the
    blog index data, post media, `cv.pdf`) with `no-cache`, both with `--delete`, so a bucket
    object with no file in `dist/` outside `schema/*` is deleted; the hash-named file rule makes
    the immutable cache safe ([[content-contract]]);
  - uploads each `dist/projetos/<slug>/index.html` and `dist/blog/<slug>/index.html` as the
    extensionless object `projetos/<slug>` or `blog/<slug>`, `text/html; charset=utf-8`,
    `no-cache`, so CloudFront answers `/projetos/<slug>` with that page's own HTML;
  - invalidates `/*`.
- No `run:` script of `ci.yml`, `ci-weekly.yml`, `deploy.yml` or `terraform.yml` holds a
  `${{ }}` expression: a value reaches a script through `env:`. `src/workflowScripts.test.ts`
  reads those four named files as text and fails on such an expression; a workflow file outside
  the four is not read.
- While a deploy runs, and on a trailing-slash path, a route falls back to the SPA shell, which
  renders the same page in the browser. A removed post's object is deleted by the sync and not
  uploaded again.
- `scripts/bootstrap-oidc.sh` runs once, in AWS CloudShell or locally only with
  `INFRA_SPECIALIST_MODE=1`: it creates the account's GitHub OIDC provider when absent and no IAM
  role.
- `make build` runs `scripts/build_frontend.sh`: `npm install` when `node_modules` is absent,
  `npm run build`, and a failure when `dist/index.html` is missing; `make clean` removes
  `frontend/dist`. `scripts/setup-deployment.sh` checks a local `npm run build` produces
  `dist/index.html` and writes a Conventional Commits `.gitmessage` template.

## Boundaries

- No AWS credential lives on a developer machine; every apply and deploy runs in GitHub
  Actions. The apply role belongs to the panel's bootstrap. No Terraform or IAM change is
  needed to serve a new route: the deploy role's object upload suffices. The site served: [[site-chrome]].
