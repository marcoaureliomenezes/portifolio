# Backlog — agent orchestration

Multi-agent coordination notes specific to this repo. Lives here (not in foundation)
because orchestration evolves faster than the foundation contract.

## Active release: `fe-qual-refactor-v1`

| Sub-domain | Authority | Touches |
|---|---|---|
| Frontend code (`frontend/**`) | `frontend-engineer` | React/TS/Vite refactor, Tailwind nav, design tokens |
| CI / branch protection (`.github/**`) | `devops-engineer` | `T-QA-14` status checks, typecheck job |
| Tests (`frontend/tests/**`, Playwright, Lighthouse) | `qa-engineer` | E2E + perf budgets after refactor |
| Specs (`specs/**`) | `product-engineer` | This file, release SPEC/PLAN/TASKS evolution |
| ADRs / architecture audit | `software-architect` | Read-only review of frontend layering post-refactor |

## Coordination protocol

1. `frontend-engineer` claims a task by flipping `[ ]` → `[-]` in
   `releases/fe-qual-refactor-v1/TASKS.md`.
2. PRs include one task ID per branch (e.g. `feat/t-fe-qual-07-language-persistence`).
3. `qa-engineer` blocks the merge if the task's acceptance criteria lack an E2E
   assertion.
4. `devops-engineer` owns the `T-QA-14` status-check matrix and is the only agent
   that edits `.github/workflows/`.
5. On release closure: `product-engineer` runs the CLOSURE memory-write workaround
   (see `z_bug_specs.md` A) and `git mv releases/fe-qual-refactor-v1`
   `_archive/releases/`.

## Hand-offs that need operator approval

- Branch protection rule changes (only operator merges to `main` / `develop` after
  protections lock).
- AWS resource creation outside `terraform/` (forbidden — `FR-FOUND-01`).
- Spec promotion from `backlog/candidates.md` → `releases/`.

## Open coordination questions

- Should `release/visual-identity-go-live` branch (pushed but not merged) become its
  own active release in parallel with `fe-qual-refactor-v1`, or be folded in? Operator
  decision pending; current default = folded in.
