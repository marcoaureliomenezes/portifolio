# Backlog — candidates

Features previously specified that are queued to come back as releases once
`fe-qual-refactor-v1` closes. Each entry lists the archived SPEC source so it can be
revived via `git mv` into a new `releases/<id>/`.

| Candidate | Source SPEC | Wave / Cluster | Status |
|---|---|---|---|
| CMS-lite | `_archive/legacy-features/cms-lite.SPEC.md` | Content authoring | Queued (`cms-lite-v1`) |
| projects-cluster-v1 | consolidated SPEC at `releases/projects-cluster-v1/SPEC.md` | Projects | **MOVED-TO-RELEASE** 2026-05-17 (Stage 3 synthesis from 7 archived F-P0-09..F-P0-15 SPECs in `_archive/legacy-features/projects-cluster/`; SPEC + PLAN + TASKS all `**Status:** Aprovado`) |
| projects-cluster-v2 | TBD (no source SPEC yet) | Projects | **Deferred** — expansion of projects showcase to 3 additional projects: `dadaia-bots`, `dd-chain-explorer`, `burrinhos-barbe`. Architectural ceiling for hand-authored JSON sits around 6 projects (per software-architect §Q3 review 2026-05-17T062729Z); requires dynamic-i18n-import (delivered in `projects-cluster-v1` AC-PC-06) plus editorial curation. To be planned after `projects-cluster-v1` closes and real discovery-funnel evidence is collected. |
| portfolio-external-link-monitor-v1 | TBD (no source SPEC yet) | Operations | **Deferred** — weekly scheduled GitHub Action (`cron: '0 6 * * 1'`) that `curl -I`'s each `playUrl` in `tauan-games.items` and posts to GH Issues on 4xx/5xx; ~20 LOC. Addresses Architect MEDIUM-3 finding from 2026-05-17 review (`tauan-games` GH Pages link-out unmonitored). |

## Selection rule

When `fe-qual-refactor-v1` reaches `phase: closure`, pick the next bundle from this
list and:

1. Decide the release id (a single cluster bundle ⇒ one release, e.g.
   `projects-cluster-v1`; or per-feature ⇒ multiple releases).
2. `git mv _archive/legacy-features/<source>.SPEC.md releases/<id>/SPEC.md` (or
   synthesize a fresh SPEC from multiple sources, as was done for `projects-cluster-v1`).
3. Synthesize `releases/<id>/PLAN.md` and `releases/<id>/TASKS.md`.
4. Update `releases/ACTIVE.md` once approved.
5. Mark the candidate row here as **MOVED-TO-RELEASE** with link to the new SPEC (or
   remove and move to `backlog-future.md` if the bundle is sliced and only part picks up).

## Note on tasks vs candidates

The 5 currently in-flight tasks (`T-QA-14`, `T-FE-WAVE5`, `T-FE-QUAL-07/08/09`) live
inside `releases/fe-qual-refactor-v1/TASKS.md`, not here. This file lists feature
candidates, not pending tasks.

## Note on projects-cluster-v1 origin

The 7 archived source SPECs (`projects-content-model`, `projects-index-page`,
`nav-projects-cta`, `projects-page-templates`, `projects-architecture-diagrams`,
`tauan-games-link-out`, `projects-content-i18n-parity` — F-P0-09..F-P0-15) under
`_archive/legacy-features/projects-cluster/` were consolidated into a single
release SPEC at `releases/projects-cluster-v1/SPEC.md` on 2026-05-17 via the
Stage 1–3 SDD discovery pipeline. The 7 archived files remain in `_archive/` as
historical reference. Pipeline reports under
`.dadaia/reports/portifolio/{product-engineer,frontend-engineer,software-architect}/`
(timestamps `2026-05-17T0339*Z`, `2026-05-17T0619*Z`, `2026-05-17T0627*Z`, `2026-05-17T0639*Z`).
