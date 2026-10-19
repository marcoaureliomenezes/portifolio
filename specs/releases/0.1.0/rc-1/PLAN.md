# PLAN — Release 0.1.0, rc-1

**Status:** Draft
**Owner:** dd-sw-engineer-sr

## 1. As-is review

Ledger slice: `specs/bugs/BUGS.jsonl` is absent and `_archive/bugs_histo.jsonl` is empty, so no unit carries a bug (0 each). History read with `git log` on `fcc8682` and `09a8fa7`.

| unit | today | bugs | verdict | why |
|---|---|---|---|---|
| `frontend/src/data/content/{pt,en,de}.json` (develop, `case-study` item at `:695`) | develop's page content tree | 0 | DELETE | main deleted it (`fc4d1f3`); the page reads `frontend/public/content/*`; the back-merge takes main's side and the tree goes |
| `frontend/public/content/{pt,en,de}.json`, item `projectsV2.list` slug `dadaia-workspace` | main only (4 files, one commit `fc4d1f3`); states 0.1.5, `pip install`, 9 agents, 3 runtimes | 0 | UPDATE | the item's keys, schema and section ids stay; only the values change, so no flag, branch or second path |
| `frontend/package.json` `scripts` | no `verify` key at `09a8fa7` and `fcc8682` | 0 | ADD | no unit carries the job gate; the one new key chains six existing scripts, no new gate or step |
| rest of `frontend/**`, `img/**`, `.gitignore` (113 paths differ between the wt-rc and the reference tree) | develop's pre-#28/#31/#32 product code | 0 | REBUILD | replaced wholesale by main's tested tree through the back-merge (AC2.2); no hand edit |
| `specs/`, `specs-bkp/`, `AGENTS.md` | canonical specs, old specs, lane's `verify:`/`tests:` lines | 0 | KEEP | the merge keeps ours (AC2.3); main's old `specs/` is dropped |
| `frontend/scripts/{validate-content,check-i18n-parity,export-content-schema}.mjs`, `.github/workflows/ci.yml` | main's content gates and CI | 0 | KEEP | consumed as they are by `verify` and AC3.1-3.2; no new CI job |

### 1.1 Authorities

| question | authority | consults | deleted |
|---|---|---|---|
| what the page shows | `frontend/public/content/*.json` | `validate-content.mjs`, `check-i18n-parity.mjs`, `export-content-schema.mjs --check` | `frontend/src/data/content/*.json` (with the back-merge) |
| what the job gate runs | `frontend/package.json` `scripts.verify` | repo `AGENTS.md` `verify:` | none |
| which side wins in the merge | the merge commit's tree (main outside `specs/`, `specs-bkp/`, `AGENTS.md`) | AC2.2 and AC2.3 diff commands | none |

No grammar, format, public name or fix line is deleted or rebuilt, so no consumer pre-mortem applies: the page's JSON keys are unchanged and the content schema is untouched.

## 2. Order and seams

- **Precondition.** Job 1 opens only after `wt-backlog-verify-line` merges into `feature/0.1.0` and `WT sync` moves this `wt-rc` onto it, so `verify:` and `tests:` are on the job's base (AC1.2). Check: `git show HEAD:AGENTS.md | grep -c '^verify:\|^tests:'` is 2.
- **Where the back-merge lands: J1.T1 commits directly in the job's `wt-main`, not in a `wt-task` tree.** The task into `wt-main` runs `_refuse_implementation_tests` over `rev-list <onto>..HEAD` (`_worktree_end.py:256-280`); that range includes main's own commits, each a non-`test(` subject touching `tests:` paths, so line 273-280 refuses (31 paths match). The check is wired only into the `task` row (`_worktree_end.py:433`, table at `:434-440`); the `main` row is `[children, scaffold, *gate]` and the `rc` row `[children, *gate, ledgers]`, none reads the `tests:` globs. The law has no test rule for `wt-main` (`worktrees/AGENTS.md` §2.1 names only the task into `wt-main`). The merge therefore lands as one commit in `wt-main`, is reviewed once with the job at `wt-main` into `wt-rc` (`worktrees/AGENTS.md` §2.2), and later task trees cut from the merged `wt-main` carry only their own commits.
- **Order: back-merge, then the `verify` script, then the page.** `WT merge` of a task runs no `verify:` (`_worktree_end.py:434`), so `verify` first runs at the job's `wt-main` into `wt-rc` merge, on the final tree, which is the measured one (34 s, 29 s, 299 tests on `tmp-site-backmerge-tree`). Landing the script first would put `scripts.verify` in develop's `frontend/package.json`, which the merge then replaces with main's file (AC2.2), losing it. Back-merging first reuses the tag's resolved tree (T1) and adds the script to main's file (T2). The page files exist only after the merge, so T3 and T4 follow it.
- **The script is in the first gated merge.** A gated merge whose tree lacks `scripts.verify` is refused. The job's `wt-main` into `wt-rc` merge is the rc's first gate and its tree holds T2, so the script is present; no earlier merge runs a gate. The script opens with `npm ci` (AC1.1) because a fresh tree has no `node_modules`.
- **Runner config.** `tests:` (`AGENTS.md:66`) counts `playwright.config.ts` and `vitest.config.ts` as source, not tests; no task here is a RED task and none edits runner config, which T1 takes from main.
- **Page edit as its own tasks.** T3 (en) chooses the claims and the one `feature/0.5.0` sha and writes the claim table; T4 (pt, de) mirrors T3's merged file. They share no file with T2.

## DAG

| job | waits on | wave | W: |
|---|---|---|---|
| Job 1 | — | 1 | `frontend/**`, `img/**`, `.gitignore`, `frontend/package.json`, `frontend/public/content/en.json`, `frontend/public/content/pt.json`, `frontend/public/content/de.json` |
