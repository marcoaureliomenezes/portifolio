# Job 2 — deploy: the cache rule and the route objects

Wave 1, waits on nothing. Paths are relative to the repo root. One file, `.github/workflows/deploy.yml`, both jobs (`deploy-stage`, `deploy-prod`) carrying the same steps. No Terraform, no IAM change, no CloudFront change (SPEC approval, 2026-10-25, "Approve, deploy-only"): the deploy role's `PutObject` suffices. No AWS credential on a developer machine, so nothing here runs against AWS; the evidence is the dry-run listing of T2 and the stage checks of PLAN §2.5 after the rc PR merges. Port 5102 is reserved and unused: no served page changes. Definition of done: `npm --prefix frontend run verify`; no E2E. Hand back the two deploy copies diffed (only the secret names differ), T2's dry-run listing, and the diff-read of removed or loosened asserts (none expected). Cost: no CI job or `verify` step is added; the deploy gains one `aws s3 cp` per prerendered route (4 today). The hand-back states that count; the closure reads the deploy duration against the earlier successful runs (`gh run list`: 43 s and 48 s).

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | jr | AC1.2 | `.github/workflows/deploy.yml` | both jobs: two syncs with disjoint filters |
| J2.T2 | jr | AC1.1 | `.github/workflows/deploy.yml` | both jobs: one upload per prerendered route as an extensionless object |

## Task notes

- **J2.T1.** In each job the steps `Sync static assets to S3 (long-lived cache)` and `Upload index.html (no-cache)` are replaced by two steps, assets first, each with `--delete` and the existing `--exact-timestamps`:
  - `aws s3 sync dist/ s3://<bucket> --delete --exact-timestamps --exclude "*" --include "assets/*" --cache-control "public, max-age=31536000, immutable"`;
  - `aws s3 sync dist/ s3://<bucket> --delete --exact-timestamps --exclude "assets/*" --cache-control "no-cache"`.

  Why this is safe, from the AWS CLI reference (PLAN §2.5): a later filter overrides an earlier one, `*` matches every key including `/`, and "files excluded by filters are excluded from deletion". Each sync deletes only inside its own set. The second sync also uploads `blog/<slug>/index.html` and `projetos/<slug>/index.html` under their file names, harmless and `no-cache`; it deletes any extensionless route key (it has no local file of that name), and T2 re-uploads it in the same job.
- **J2.T2.** After the second sync and before the invalidation, in both jobs one step:

  ```sh
  find dist/blog dist/projetos -mindepth 2 -maxdepth 2 -name index.html | sort | while read -r f; do
    key="${f#dist/}"; key="${key%/index.html}"
    aws s3 cp "$f" "s3://<bucket>/$key" --content-type "text/html; charset=utf-8" --cache-control "no-cache"
  done
  ```

  With no post and no `dist/blog` folder `find` fails on the missing operand; guard with `[ -d ]` or `find ... 2>/dev/null` so the step still exits 0 with zero routes, and say which in the commit body. A removed post's key is deleted by the second sync and not re-uploaded. A trailing-slash path and the moment between the sync's delete and the upload fall to the SPA shell through the existing 403 mapping; that is the SPEC's accepted behaviour. The invalidation, the `if:`, the secrets and the build job are untouched.

  Check, not a gate: run the same `find` over a local `dist` (after `npm run build`, with `node scripts/build-blog.mjs --posts tests/fixtures/blog --dist dist` once Job 4 has landed, else the four project routes alone) with `echo` in place of `aws s3 cp`, printing `key <- file`. Expected today: `projetos/<slug> <- dist/projetos/<slug>/index.html` for each of the 4 slugs of `pt.json`; with the fixture posts also `blog/proving-post` and `blog/second-post`, never `blog/draft-post`. The listing goes in the hand-back; nothing is added to CI or `verify`.
