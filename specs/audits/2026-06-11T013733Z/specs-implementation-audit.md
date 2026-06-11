# Specs + Implementation Audit — portifolio

**Auditor:** project-auditor
**Date (UTC):** 2026-06-11T01:37:33Z
**Context:** portifolio (session mode READ — ADDITIVE write only)
**HEAD:** `f02dafa` on branch `analytics-platform-v1/phase-d`
**Doctor baseline:** `dadaia specs doctor` — 0 errors / 29 warnings

## Scope

Audited: `specs/` state (ACTIVE.md, active release projects-cluster-v2, memory atoms,
backlog, bugs/forensics), spec↔code drift in `frontend/`, repo hygiene (working tree
artifacts), `backend/*.py`, dead/stale artifacts (`specs_bkp/`, root PLAN/TASKS,
`z_bug_specs.md`, legacy release dirs), doctor warning classes.
Excluded (other agents own): frontend component design quality, CloudFront cost review,
security deep-dive, CI YAML review.

---

## Executive Summary

The active release pointer is fiction: `ACTIVE.md` claims `projects-cluster-v2` in
IMPLEMENTATION, but zero implementation tasks have started since 2026-05-28, while the
actual HEAD branch (`analytics-platform-v1/phase-d`, 168 commits ahead of main) carries
analytics-SDK implementation work that has **no SPEC at all** — only a backlog Candidate.
On top of that, the analytics dependency is a `file:` path to a repo that does not exist
on disk, so `npm install` is broken at HEAD. Repo hygiene is the worst dimension: ~435MB
of forbidden artifact/backup directories sit in the working tree. **Consolidated score: 3.6/10.**

## Compliance Scorecard

| Dimension | Score (1-10) | Drift items | Notes |
|---|---|---|---|
| spec-fidelity | 3 | 2 CRIT, 1 HIGH | Implementation shipped without SPEC (analytics); active release untouched in code |
| memory-truth | 5 | 1 CRIT-adjacent, 3 MED | analytics-sdk dep absent from tech-stack.md; token_estimate drift on 5 atoms; stale `.html` refs |
| task-discipline | 5 | 1 HIGH, 2 MED | A-phase tasks `[x]` with uncommitted outputs; live `[-]` in root TASKS.md outside any release |
| repo-hygiene | 2 | 1 HIGH (7 violations), 2 LOW | 419MB `.worktrees/`, 13MB `.lighthouseci`, coverage/, reports, `__pycache__`, `specs_bkp/`, img drift |
| backend-quality | 3 | 2 MED | 3 near-duplicate Flask dev servers, bare excepts, `kill -9`; memory says they should already be archived |
| **Overall (weighted, floor-capped)** | **3.6** | 14 findings | Floor = repo-hygiene 2 → cap 4; below score floor 5 → recommend remediation release via project-manager |

---

## The branch-name mismatch, explained

Investigated and root-caused:

1. `projects-cluster-v2` was opened 2026-05-23 (commit `2c0369e` "close mobile-redesign-v1,
   open projects-cluster-v2 SPEC") and revised 2026-05-28. Its content tasks were never
   started (evidence below). It is the last *formally opened* SDD release, so the SDD
   onboarding commit `f02dafa` (2026-06-09, "onboard to dadaia-workspace SDD pattern v1")
   wrote `ACTIVE.md` pointing at it.
2. Meanwhile the operator pursued a different initiative: the "Dadaia's Web" analytics/
   observability platform, registered only as a backlog candidate
   (`specs/backlog/platform-observability-admin-v1.md:8` — "Status: Candidate — pronta
   para SPEC.md por product-engineer", grilled 2026-05-23 in commit `86c72ac`). Its
   implementation phase touched this repo: branch `analytics-platform-v1/phase-d`,
   commit `ae9e71f` (2026-05-24) installs `@dadaia/analytics-sdk` and instruments 7
   events across 8 frontend files. "analytics-platform-v1" is evidently the release id
   used in the *sibling* dadaia-web initiative; this repo is its "phase-d" surface — but
   no `specs/releases/analytics-platform-v1/` exists here, and the backlog item never
   matured into a SPEC.
3. Net effect: HEAD = implementation work governed by nothing (backlog ≠ authorization),
   while `ACTIVE.md` = a stalled release whose code was never written. Two releases
   interleaved; the pointer reflects neither reality.

---

## Drift inventory (prioritized findings)

| # | Sev | Dimension | Finding | Evidence |
|---|---|---|---|---|
| F-01 | CRIT | spec-fidelity / memory-truth | `@dadaia/analytics-sdk` is a `file:` dependency on a repo that does not exist — `npm install` is broken at HEAD; dependency is absent from tech-stack memory ("Não instalar dependências especulativas" is its own stated law) | `frontend/package.json:24` → `"file:../../dadaia-web/frontend/sdk"`; `ls repos/dadaia-web/frontend/sdk` → No such file or directory; `specs/memory/tech-stack.md` (no mention of analytics-sdk anywhere) |
| F-02 | CRIT | spec-fidelity | Implementation without approved SPEC: analytics instrumentation (7 events, 8 files) shipped on `analytics-platform-v1/phase-d` with only a backlog Candidate as authority — violates SDD gate discipline (no release dir, no Aprovado SPEC/PLAN/TASKS, no `[-]` reservation) | commit `ae9e71f`; `specs/backlog/platform-observability-admin-v1.md:8`; `specs/releases/` contains no `analytics-platform-v1/` |
| F-03 | HIGH | spec-fidelity | ACTIVE.md claims `projects-cluster-v2` / IMPLEMENTATION but zero implementation exists: pt.json still has `v0.12.0` (AC-PC2-03 wants `v0.1.2`/`21`), no `rand-engine` block in any locale (AC-PC2-01/02), no `tests/e2e/projects-cluster/rand-engine.spec.ts` — release frozen since 2026-05-28 | `specs/releases/ACTIVE.md:1-2`; `frontend/src/data/content/pt.json` (grep: `v0.12.0` present, `rand-engine` absent); `frontend/tests/e2e/projects-cluster/` listing (9 specs, no rand-engine) |
| F-04 | HIGH | repo-hygiene | Forbidden artifact dirs in working tree (workspace law: zero-tolerance): `.worktrees/` **419MB**, `frontend/.lighthouseci` **13MB**, `frontend/coverage/` 1.8MB, `frontend/playwright-report/` 520KB, `frontend/test-results/`, `backend/__pycache__/` (untracked), `specs_bkp/` 1.1MB (untracked) — gitignore is not a licence to create them | `du -sh` outputs; `git status` (`?? backend/__pycache__/`, `?? specs_bkp/`); `.gitignore:55-66` ignores but does not excuse |
| F-05 | HIGH | task-discipline | T-PC2-A-01/A-02 marked `[x]` but their outputs are **untracked** — cover.webp 47KB, SVGs, workspace-panel-01/02.webp exist on disk only; "done" evidence not persisted in git, lost on any clean checkout | `specs/releases/projects-cluster-v2/TASKS.md:27-37`; `git status`: `?? frontend/public/assets/projects/rand-engine/`, `?? .../workspace-panel-01.webp`, `-02.webp` |
| F-06 | MED | task-discipline / spec-consistency | Live PLAN.md + TASKS.md at specs root, outside any release dir — canon forbids live PLAN/TASKS outside `releases/`; root TASKS.md carries an open `[-] T-QA-14` marker (stale since ~2026-05-15, references retired `sdd-spec-gate.sh`) | `specs/PLAN.md:1-3` (`**Status:** Aprovado`); `specs/TASKS.md:17-21` (`- [-] T-QA-14`) |
| F-07 | MED | spec-consistency | `mobile-redesign-v1` is CLOSED (CLOSURE Aprovado, merged PR #28 2026-05-23) but still lives under `releases/`, not `_archive/releases/` — "no closed release outside archive"; dir also lacks SPEC.md/PLAN.md entirely | `specs/releases/mobile-redesign-v1/` (only CLOSURE.md + TASKS.md); `CLOSURE.md:1-8` |
| F-08 | MED | memory-truth | token_estimate drift on 5 atoms (tech-stack 800→≈1202 +50%, overview 500→≈811 +62%, personas 400→≈921 +130%, quality-bar 450→≈911 +102%) plus `architecture.md:14` declares `token_estimate: 0`; all atoms `last_updated: 2026-05-17` — memory not refreshed across 3 subsequent releases | doctor WARN block; `specs/memory/architecture.md:14` |
| F-09 | MED | backend-quality | `backend/` is 3 near-duplicate Flask dev servers (177 LOC total): `stable_server.py` and `auto_reload_server.py` share identical serve logic; bare `except:` swallowing all errors (`stable_server.py:30,34`; `auto_reload_server.py:24`); `kill -9` by port scan (`auto_reload_server.py:21`); `debug=True` (`auto_reload_server.py:63`); duplicated `lsof` call (`auto_reload_server.py:18-19`). Not serving infra — prod is S3+CloudFront. Memory already sentenced it: "Pasta `backend/` (Flask atual) será arquivada após F-P0-01 — é apenas servidor de dev local" (`tech-stack.md:66`) — still present | file:line cites inline |
| F-10 | MED | spec-consistency | `specs_bkp/0→1-20260609T002526Z/` is a full pre-migration snapshot of specs/ (old SPEC/PLAN/TASKS, foundation, _archive) duplicated next to the live tree — stale duplicate source of truth, untracked, and `→` in the dirname is hostile to tooling | `specs_bkp/` listing; `git status` `?? specs_bkp/` |
| F-11 | LOW | memory-truth | Stale `.html` atom references: active SPEC cites `specs/memory/product/personas.html` (atoms are `.md` since markdown migration); `z_bug_specs.md` retains 2026-05-17 forensic entries referencing retired `sdd-spec-gate.sh` v3 with no resolution pass | `specs/releases/projects-cluster-v2/SPEC.md:36`; `specs/z_bug_specs.md:10-22` |
| F-12 | LOW | spec-consistency | 11× SPEC-DOC-027: every release dir (live: `legacy`, `mobile-redesign-v1`, `projects-cluster-v2`; archived: 8) violates `^v<MAJOR>.<MINOR>.<PATCH>$` naming canon — legacy names preserved, doctor warns on every run | doctor output (11 WARN lines) |
| F-13 | LOW | repo-hygiene | `img/` churn: 3 WhatsApp jpegs deleted-but-uncommitted (` D` staged-delete) while new untracked `img/mobile/` (5 jpegs) + `img/web/` (3 png) sit at repo root (752KB) — design-reference photos belong outside the repo or in specs/assets, and the half-done delete is dangling | `git status` D/?? lines; `img/` listing |
| F-14 | INFO | memory-truth | `specs/memory/product/catalog.json` absent — index.md fallback works and doctor accepts it, but every memory-bootstrap takes the degraded path | `specs/memory/product/` listing (4 .md, no catalog.json) |

---

## Dead / stale code

| Artifact | Verdict | Evidence |
|---|---|---|
| `backend/stable_server.py`, `auto_reload_server.py`, `test_server.py` | Dev-only, redundant ×3, already sentenced to archival by memory — stale | `tech-stack.md:66`; F-09 |
| `specs_bkp/0→1-20260609T002526Z/` | Dead duplicate of pre-migration specs tree | F-10 |
| `specs/PLAN.md`, `specs/TASKS.md` (root) | Superseded by release-based SDD; content frozen at 2026-05-15; live `[-]` marker is a fossil | F-06 |
| `specs/releases/legacy/` (top-level SPEC + foundation/) | Migration leftover; non-canon name; not an active authority | F-12; doctor SPEC-DOC-027 |
| `.worktrees/fe-qual-refactor` | 419MB orphan worktree for a release archived since frontend-refactor era | F-04 |
| `frontend/.lighthouseci`, `coverage/`, `playwright-report/`, `test-results/`, `backend/__pycache__/` | Tool artifacts, forbidden in-tree | F-04 |
| `specs/z_bug_specs.md` | Forensic log with unresolved 2026-05-17 entries referencing retired gate scripts | F-11 |

## Spec consistency

- ACTIVE.md → `projects-cluster-v2` exists and SPEC/PLAN/TASKS all carry `**Status:** Aprovado` (structurally valid; doctor 0 errors).
- Phase IMPLEMENTATION is inconsistent with zero started tasks and zero in-flight `[-]` in the release TASKS.md (the only live `[-]` in the whole tree is the root-TASKS fossil, F-06).
- Closed-but-unarchived release (F-07); analytics work orphaned of any release (F-02); backlog item `platform-observability-admin-v1` stuck at Candidate while its implementation partially shipped.
- DEC-PC2-02 (rand-engine diagram) recorded "Aberta — operador decide" but the SVGs already exist on disk — decision de-facto closed, spec not updated (`SPEC.md:153` vs `frontend/public/assets/projects/rand-engine/architecture-*.svg`).

## Recommended actions (priority order — remediation owners, not self-fix)

1. **F-01 (CRIT)** — `project-manager` decide the analytics-sdk fate: either vendor/publish the SDK or revert `ae9e71f`; `software-engineer`/`frontend-engineer [plugin]` executes; `product-engineer` documents the dependency in tech-stack memory if kept.
2. **F-02 (CRIT)** — `project-manager` dispatch `product-engineer` to either author a real `analytics-platform-v1` (or fold into the backlog candidate's SPEC) retroactively governing the shipped work, or formally revert it. ACTIVE.md must then point at the release actually in flight.
3. **F-03/F-05 (HIGH)** — `project-manager` decide: resume projects-cluster-v2 (dispatch implementer for T-PC2-C-01/C-02, commit the Phase-A assets) or mark it deferred and free ACTIVE.md.
4. **F-04 (HIGH)** — operator/`software-engineer`: delete `.worktrees/` (419MB), `.lighthouseci`, `coverage/`, `playwright-report/`, `test-results/`, `__pycache__/`; redirect tool outputs per workspace law; remove `specs_bkp/` after confirming the migration is sound.
5. **F-06/F-07 (MED)** — `product-engineer`: archive root PLAN/TASKS into `_archive/legacy-root/`, move `mobile-redesign-v1` to `_archive/releases/`, close the T-QA-14 fossil.
6. **F-08/F-11/F-14 (MED/LOW)** — `product-engineer` (next DEFINITION/CLOSURE window): refresh token_estimates, fix `.html` refs, generate `catalog.json`, resolve z_bug_specs entries.
7. **F-09 (MED)** — `software-engineer`: archive/delete `backend/` per the standing memory decision (keep at most one dev server, or rely on `npm run preview`).
8. **F-13 (LOW)** — operator: finish the img/ cleanup (commit deletes, relocate reference photos).

**Score floor breach:** repo-hygiene = 2 (< 5) and overall 3.6 (< 5) → per score-floor policy, recommend a dedicated hygiene+governance hotfix release via `project-manager` (auditor never opens releases).

## Evidence sources

No sub-agents dispatched (per operator instruction). All evidence first-party:

- `dadaia specs doctor` (portifolio) — 0 errors / 29 warnings, full WARN transcript consumed
- `git status --short`, `git branch -a`, `git log` (main..analytics-platform-v1/phase-d = 168 commits), `git show ae9e71f --stat`
- Direct reads: ACTIVE.md, projects-cluster-v2 SPEC/PLAN/TASKS, mobile-redesign-v1 TASKS/CLOSURE, legacy/SPEC.md, specs/PLAN.md, specs/TASKS.md, z_bug_specs.md, memory atoms (tech-stack, architecture head, product/index), backlog/platform-observability-admin-v1.md, backend/*.py (all 3), frontend/package.json, content JSON greps, e2e dir listing, asset listings, `du -sh` of artifact dirs
