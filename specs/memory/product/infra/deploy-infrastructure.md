---
slug: deploy-infrastructure
title: Deploy infrastructure
tldr: One Terraform module serves the built site from a private S3 bucket through CloudFront, per env (stage, prod), applied and deployed by GitHub Actions over OIDC.
summary: terraform/modules/portfolio-static-site is the one topology, called by envs/stage and envs/prod; the terraform workflow plans on PRs and applies on push, the deploy workflow syncs dist/ and invalidates CloudFront; a one-time script creates the OIDC provider and a temporary bootstrap role.
tags:
  - infrastructure
  - deploy
  - aws
sources:
  - terraform/**
  - scripts/bootstrap-oidc.sh
  - scripts/setup-deployment.sh
  - scripts/terraform_manager.sh
  - scripts/check_infrastructure.sh
---

## What it does

The site reaches visitors as static files: the production build sits in a private bucket and
CloudFront serves it over HTTPS at the apex domain (prod) or its `stage` subdomain (stage).

## Current behavior

- `terraform/modules/portfolio-static-site` builds one environment: a private S3 bucket
  (versioning, encryption, public access blocked, noncurrent versions moved at 30 days and
  expired after `backup_retention_days`), CloudFront reading it through an origin access
  control, HTTP redirected to HTTPS, `index.html` as root and as the answer to 403 and 404 (the
  SPA fallback), an ACM certificate in us-east-1 validated by Route53 DNS, A records for the
  domain (plus `www` in prod), and the IAM role GitHub Actions assumes over OIDC to put objects
  and invalidate the distribution.
- `terraform/envs/stage` and `terraform/envs/prod` call the module with their environment
  (region sa-east-1, `PriceClass_100`); their S3 state backend is partial, its key injected by
  the workflow.
- `terraform.yml` plans an env on a PR to its branch (`develop` for stage, `main` for prod) and
  applies on push; a manual dispatch deletes the bootstrap role. `deploy.yml` builds the
  frontend, syncs `dist/` to the env's bucket and invalidates CloudFront, stage from `develop`
  and prod from `main` behind the `production` environment.
- `scripts/bootstrap-oidc.sh` runs once, in AWS CloudShell or locally only with
  `INFRA_SPECIALIST_MODE=1`: it creates the GitHub OIDC provider and a temporary bootstrap role
  with administrator access, trusted by this repo, which the first apply supersedes.
- `scripts/setup-deployment.sh` checks a local `npm run build` produces `dist/index.html` and
  writes a Conventional Commits `.gitmessage` template.
- `terraform/_legacy` holds the single-root configuration the module replaced; no env, workflow
  or script references it.
- `scripts/terraform_manager.sh` and `scripts/check_infrastructure.sh` run `terraform` in the
  `terraform/` root, which holds only tfvars files and an empty README and no configuration;
  they also run Terraform and AWS calls from a local machine, which the repo's stop conditions
  forbid.

## Boundaries

- No AWS credential lives on a developer machine; every apply and deploy runs in GitHub
  Actions. The site served: [[site-chrome]].
