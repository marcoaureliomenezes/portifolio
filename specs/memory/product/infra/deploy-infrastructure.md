---
slug: deploy-infrastructure
title: Deploy infrastructure
tldr: One Terraform module serves the site from private S3 via CloudFront per env; Actions deploys over OIDC, hashed assets immutable, the rest no-cache.
summary: terraform/modules/portfolio-static-site is the one topology, called by envs/stage and envs/prod; the terraform workflow plans on PRs and applies on push; the deploy workflow syncs dist/ under one cache rule, uploads each prerendered route as an extensionless HTML object and invalidates CloudFront; a one-time script creates the OIDC provider and a temporary bootstrap role.
tags:
  - infrastructure
  - deploy
  - aws
sources:
  - terraform/**
  - .github/workflows/deploy.yml
  - .github/workflows/terraform.yml
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
  domain (plus `www` in prod), and the IAM role GitHub Actions assumes over OIDC to put objects
  and invalidate the distribution.
- `terraform/envs/stage` and `terraform/envs/prod` call the module with their environment
  (region sa-east-1, `PriceClass_100`); their S3 state backend is partial, its key injected by
  the workflow. `terraform/` holds only `envs/` and `modules/`.
- `terraform.yml` plans an env on a PR to its branch (`develop` for stage, `main` for prod) and
  applies on push; a manual dispatch deletes the bootstrap role.
- `deploy.yml` runs on a push to `develop` (stage) or `main` (prod, behind the `production`
  environment) that touches `frontend/**` or the workflow. It builds once with `npm run build`,
  which also writes the blog and the prerendered pages ([[blog]]), then for the env:
  - syncs `dist/assets/**` with `public, max-age=31536000, immutable`, and every other file
    (root and per-route HTML, `blog/rss.xml`, the blog index data, post media, `cv.pdf`) with
    `no-cache`, both with `--delete`; the hash-named file rule makes the immutable cache safe
    ([[content-contract]]);
  - uploads each `dist/projetos/<slug>/index.html` and `dist/blog/<slug>/index.html` as the
    extensionless object `projetos/<slug>` or `blog/<slug>`, `text/html; charset=utf-8`,
    `no-cache`, so CloudFront answers `/projetos/<slug>` with that page's own HTML;
  - invalidates `/*`.
- While a deploy runs, and on a trailing-slash path, a route falls back to the SPA shell, which
  renders the same page in the browser. A removed post's object is deleted by the sync and not
  uploaded again.
- `scripts/bootstrap-oidc.sh` runs once, in AWS CloudShell or locally only with
  `INFRA_SPECIALIST_MODE=1`: it creates the GitHub OIDC provider and a temporary bootstrap role
  with administrator access, trusted by this repo, which the first apply supersedes.
- `make build` runs `scripts/build_frontend.sh`: `npm install` when `node_modules` is absent,
  `npm run build`, and a failure when `dist/index.html` is missing; `make clean` removes
  `frontend/dist`. `scripts/setup-deployment.sh` checks a local `npm run build` produces
  `dist/index.html` and writes a Conventional Commits `.gitmessage` template.

## Boundaries

- No AWS credential lives on a developer machine; every apply and deploy runs in GitHub
  Actions. No Terraform or IAM change is needed to serve a new route: the deploy role's object
  upload suffices. The site served: [[site-chrome]].
