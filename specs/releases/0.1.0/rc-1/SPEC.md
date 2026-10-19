# SPEC — Release: 0.1.0

**Status:** Approved
**Release ID:** 0.1.0
**Owner:** dd-product-engineer
**Opened:** 2026-10-19
**Origin:** backlog:dadaia-workspace-page-050

---

## Bug window review

**Window:** none. rc-1 is the first candidate of the canonical `specs/`: `specs/bugs/BUGS.jsonl` is absent and `specs/bugs/_archive/bugs_histo.jsonl` is empty (`bugs.py status`: 0 open; `bugs.py stats`: total 0). No fix to judge; no REBUILD work list.

## 1. Problem

The dadaia-workspace page on marco-menezes.com describes 0.1.5: `"version": "0.1.5"`, `"installCommand": "pip install dadaia-workspace"`, "9 core agents", "3 runtimes" (`frontend/public/content/en.json` on `origin/main` `fcc8682`, item `projectsV2.list[0]`). dadaia-workspace 0.5.0 promotes only once a page stating 0.5.0 is live (dadaia-workspace roadmap grill, Q3: "Gate: page live first (Recommended)").

The page cannot be edited on the work branch as it stands. On develop and feature/0.1.0, the dadaia-workspace item already exists as kind `case-study` in `frontend/src/data/content/{pt,en,de}.json:695`. What exists only on main is the `library`-kind item, `public/content/*` and `content-schema.mjs`. main carries three squash commits develop lacks (#28 `38f6305`, #31 `fc4d1f3`, #32 `fcc8682`); they change 152 paths since the merge-base `b99da2a` (`git diff --name-only b99da2a fcc8682`).

The repo has no runnable `verify:` line, so no job of this rc can merge. The line `verify: npm --prefix frontend run verify` lands through the sibling lane `wt-backlog-verify-line`; the `verify` npm script it calls does not exist yet (`frontend/package.json` at `09a8fa7` and `fcc8682`: no `"verify"` key).

Operator rulings this SPEC rests on (`.dadaia/reports/dadaia-workspace/grill/roadmap-050.md`):

- rc-20 Q1, portfolio: "Revive now, parallel job (Recommended)". The page update runs as this context's own job; the operator approves the develop→main prod deploy; the homepage repoint comes in dadaia-workspace rc-21.
- rc-20 Q2, portfolio SDD: "specs init + one backlog lane (Recommended)". The Level 3b audit first pass waits for dadaia-workspace 0.6.0.
- Portfolio foreign specs: "Yes, --replace-foreign (Recommended)". The old `specs/` lives in `specs-bkp/`.
- Portfolio page timing (main thread, by Q3): the copy is written for 0.5.0; stage is live in dadaia-workspace rc-20; the develop→main prod deploy runs in rc-21 right before the dadaia-workspace promote.
- Portfolio develop drift: "Merge main into develop". No history rewrite; product code takes main's side on conflict ("prod is the tested tree"); the canonical `specs/` and `specs-bkp/` are kept; "All gates must pass".
- Portfolio code route (main thread): the back-merge and the page edit run as site `0.1.0/rc-1`, one job. The resolved back-merge is kept for reuse at local tag `tmp-site-backmerge-tree`.
- site verify line: "Mirror CI's fast jobs (Recommended)" — `npm ci`, lint, typecheck, `test:run`, `check:i18n-projects`, build; measured 34 s and 29 s on the back-merged tree, all green (299 tests).
- site verify form (main thread; the operator's steps and cost unchanged): `verify: npm --prefix frontend run verify`; rc-1 Job 1's first task adds the `verify` script chaining the six ruled steps; a `tests:` line lands with it.
- Portfolio backlog lane review (dd-code-reviewer, APPROVED at `09a8fa7`): three LOWs folded here — the case-study kind on develop (§1 above), the pinned source sha (AC3.4), AC (7) outside rc-1 (§3).

## 2. Measurable goals

| # | goal | target | source |
|---|---|---|---|
| 1 | the repo's `verify:` line | exit 0 on every job merge of rc-1 | `dadaia worktree merge` output |
| 2 | main in the work branch | `git merge-base --is-ancestor fcc8682 <rc-1 PR head>` exits 0 | git |
| 3 | stale 0.1.5 claims on the page | 0 hits of `0.1.5`, `pip install`, `9 core agents` (and its pt and de forms) in the item, in all three files | `git grep` on the item at the PR head |
| 4 | stage | `deploy-stage` green on the develop push of the rc-1 PR merge | `gh run list --workflow deploy.yml --branch develop` |

## 3. Non-goals

- The develop→main prod deploy: it is site's promote, run in dadaia-workspace rc-21 right before the dadaia-workspace promote, operator-approved (backlog AC (7), first half).
- The dadaia-workspace homepage repoint (`pyproject.toml` `[tool.poetry.urls]` and the GitHub homepage): dadaia-workspace rc-21's act (backlog AC (7), second half).
- No history rewrite of main or develop; no squash of the back-merge.
- No change to the content schema, `content-schema.mjs`, the page's components, its assets or any other project's item.
- No new CI job or gate; the `verify` script only chains the ruled steps.
- No Level 3b memory first pass (dadaia-workspace 0.6.0, per rc-20 Q2).

## 4. Requirements

Wave ranking, by the pick: (1) law, skills and dev loop: FR1; (2) shared foundation: FR2; (3) features: FR3; (4) promote-facing: AC3.6 at the candidate PR, the backlog exit at closure. One job, Job 1; FR1 is its first task.

### FR1 — the `verify` npm script

- AC1.1 `frontend/package.json` `scripts.verify` is exactly `npm ci && npm run lint && npm run typecheck && npm run test:run && npm run check:i18n-projects && npm run build`, and `npm --prefix frontend run verify` exits 0 on the tree that adds it. Test: no new test — the script is the gate; its exit code at the first job merge is the evidence.
- AC1.2 The `tests:` line of the repo `AGENTS.md` (`AGENTS.md:66`: `frontend/src/*.test.ts frontend/src/*.test.tsx frontend/src/test-setup.ts frontend/tests/*`, from the sibling lane) is on the job's base before the first task merge; met at `d59385f`. Test: none — a precondition the PLAN checks.

### FR2 — main's state in the work branch (back-merge `origin/main`)

- AC2.1 The job's tree holds one true merge commit whose second parent is `fcc8682`; `git merge-base --is-ancestor fcc8682 HEAD` exits 0 and no commit of main or develop is rewritten. Test: none — git ancestry, checked by the reviewer with that command.
- AC2.2 Product code takes main's side: `git diff fcc8682 <merge> -- . ':(exclude)specs' ':(exclude)specs-bkp' ':(exclude)AGENTS.md'` shows only AC1.1's `verify` line in `frontend/package.json`. Test: none — the diff command, run by the reviewer; the reference tree `tmp-site-backmerge-tree` already gives an empty diff outside `specs/` and `specs-bkp/`.
- AC2.3 The canonical specs are kept: `git diff <merge>^1 <merge> -- specs specs-bkp AGENTS.md` is empty. Test: none — the diff command.
- AC2.4 `npm --prefix frontend run verify` exits 0 on the merge commit, and `npm run validate:content` and `npm run schema:check` (both main's) exit 0. Test: the existing suite (unit and integration; 299 tests on the reference tree).

### FR3 — the dadaia-workspace page states 0.5.0 (pt, en, de)

The item is `projectsV2.list` slug `dadaia-workspace`, kind `library`, in `frontend/public/content/{pt,en,de}.json`. AC3.1–AC3.6 are the backlog entry's acceptance (1)–(6) in order.

- AC3.1 The content schema validates: `npm run validate:content` and `npm run schema:check` exit 0. Test: integration (the two existing scripts).
- AC3.2 `npm run check:i18n-projects` exits 0: the three items carry the same keys, section ids and status rows. Test: integration (the existing parity script).
- AC3.3 In all three files: `pypi.version` is `0.5.0`; `pypi.installCommand` is `uvx dadaia-workspace init <dir> --harness <name>`; `links.repo` is `https://github.com/marcoaureliomenezes/dadaia-workspace` and `links.pypi` `https://pypi.org/project/dadaia-workspace/`; the status `Version` row and every install mention in the section bodies agree with them. Test: none — no test pins copy text (root map §1: tests assert behavior); the reviewer greps the three values, three hits each.
- AC3.4 The copy states 0.5.0's features — the multi-harness workspace, SDD, the five roles, `worktree pause` / `resume`, `dadaia export` soft and `--hard`, `init --from`, the install line, the repo and PyPI links — and every claim cites its source. The implementation commit body carries a claim → source table, one row per claim, each source `path@<sha>`, where `<sha>` is one dadaia-workspace `feature/0.5.0` commit and `path` is under `README.md`, `docs/` or `specs/memory/product/`. The version `0.5.0` row cites the roadmap Q3 ruling, since `pyproject.toml:3` reads `0.4.7` on `feature/0.5.0` until the project's release pipeline mints the version. The reviewer checks every row at that sha; the rc-1 closure summary records the sha. Test: none — review against the table.
- AC3.5 lint, typecheck, `test:run` and build exit 0 (the `verify` script), and CI's SVG size gate (`ci.yml` "SVG size gate — project diagrams ≤ 50 KB") is green on the push. Test: the existing suite and CI.
- AC3.6 Stage is live after the rc-1 PR merges into develop: `deploy.yml` job `deploy-stage` is green on that develop push, and the stage page shows `0.5.0` and the `uvx` line. Test: E2E by hand — the job's run URL and one fetch of the stage page, recorded in the closure summary.

### Replaces

- develop's `frontend/src/data/content/{pt,en,de}.json` (the `case-study` item at `:695` included): main deleted that tree; the back-merge takes main's `frontend/public/content/*` and its `library` item (AC2.2).
- The page's 0.1.5 copy: version `0.1.5`, `pip install dadaia-workspace`, "9 core agents", "3 runtimes" (Claude Code, Codex, OpenCode), and `dadaia context bind` as the entry point (AC3.3, AC3.4).

### Closure

- `backlog.py exit dadaia-workspace-page-050 --disposition delivered --release 0.1.0` at the reconcile, its reason naming AC (7) as dadaia-workspace rc-21's.
- The summary records AC3.4's sha, AC3.6's run URL, and that the claim table is re-checked against `feature/0.5.0` before the rc-21 prod deploy.

## 5. Constraints and risks

| risk | answer |
|---|---|
| The back-merge commit touches 152 paths; 34 of them match the `tests:` globs (`git diff --name-only b99da2a fcc8682`, fnmatch, `*` crosses `/`). A task-tree merge refuses an implementation commit that touches the `tests:` globs. | The PLAN names where the back-merge commit lands (which tree, which task kind) so no task merge refuses it. |
| The `verify` script (FR1) lands before the back-merge, so its first run is on develop's tree, unmeasured; the 34 s / 29 s measure is the back-merged tree's. | The PLAN orders FR1 and FR2; a red on develop's tree is the PLAN's to resolve, never a weaker script. |
| `verify:` lands through `wt-backlog-verify-line` in parallel. | Job 1 opens after that lane merges into feature/0.1.0 and the `wt-rc` syncs it. |
| The copy runs ahead of PyPI (0.4.7) until the dadaia-workspace promote. | Stage only in rc-1; prod waits for rc-21, minutes before the promote (timing ruling). |
| The claim sources move on `feature/0.5.0` after rc-1 closes. | AC3.4's pinned sha; the re-check before the rc-21 prod deploy. |

## 6. Open questions

none
