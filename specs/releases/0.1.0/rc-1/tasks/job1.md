# Job 1 — back-merge main, the `verify` script, the 0.5.0 page

Wave 1, waits on nothing in this rc; opens after the precondition of PLAN §2 (`wt-backlog-verify-line` merged and synced). Tasks run in order T1, T2, T3, T4: T2 touches the file T1 replaces, T3 and T4 need the page files T1 brings. No RED-test task: every AC here is a git/command check or the existing suite (SPEC §4), and none adds a behaviour.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J1.T1 | sr | AC2.1, AC2.2, AC2.3, AC2.4 | `frontend/**`, `img/**`, `.gitignore` | one true merge commit in `wt-main` itself, second parent `fcc8682` |
| J1.T2 | jr | AC1.1 | `frontend/package.json` | `scripts.verify` added; owner test: none (the gate) |
| J1.T3 | sr | AC3.1, AC3.3, AC3.4, AC3.5 | `frontend/public/content/en.json` | the en item states 0.5.0; commit body carries the claim table |
| J1.T4 | jr | AC3.1, AC3.2, AC3.3, AC3.5 | `frontend/public/content/pt.json`, `frontend/public/content/de.json` | pt and de mirror the merged en item |

AC3.6 (stage live) is the main thread's act after the rc-1 PR merges; it has no task.

## J1.T1 — back-merge

Commit directly in the job's `wt-main` (reason: PLAN §2). Subject `chore(J1.T1): back-merge origin/main fcc8682`; the body names the paths by group and why (`frontend/**`, `img/**`, `.gitignore`: main's tested tree).

Recipe, reusing the resolved tree of tag `tmp-site-backmerge-tree`:
1. `git merge -s ours --no-commit fcc8682`
2. `git checkout tmp-site-backmerge-tree -- frontend img .gitignore`, then `git rm -r -q --cached` and remove each path under `frontend img` present in `HEAD` and absent from the tag (`git diff --name-only --diff-filter=A tmp-site-backmerge-tree HEAD -- frontend img .gitignore`).
3. `git diff fcc8682 -- . ':(exclude)specs' ':(exclude)specs-bkp' ':(exclude)AGENTS.md'` must be empty, then commit.

Checks before hand-back (all from SPEC §4): `git merge-base --is-ancestor fcc8682 HEAD` exits 0; `git diff HEAD^1 HEAD -- specs specs-bkp AGENTS.md` is empty; `npm --prefix frontend ci` then `npm --prefix frontend run lint`, `typecheck`, `test:run` (299 tests), `check:i18n-projects`, `build`, `validate:content`, `schema:check` exit 0.

## J1.T2 — `verify` script

In `frontend/package.json` add to `scripts`, after `schema:check`, the key `"verify"` with the exact value `npm ci && npm run lint && npm run typecheck && npm run test:run && npm run check:i18n-projects && npm run build`. Nothing else changes. Check: `npm --prefix frontend run verify` exits 0.

## J1.T3 — en page copy

Item `projectsV2.list` slug `dadaia-workspace` of `frontend/public/content/en.json`. Keys, section ids and the status row labels' count stay as they are; only values change.

- `pypi.version` `0.5.0`; `pypi.installCommand` `uvx dadaia-workspace init <dir> --harness <name>`; `links.repo` and `links.pypi` as in SPEC AC3.3; the status `Version` row `v0.5.0 (PyPI)`; every install mention in the bodies is the `uvx` line, `pip install` and `dadaia context bind` as the entry point are gone.
- Replace "9 core agents" and "3 runtimes" (card summary, `stat`, `how`, status rows) with 0.5.0's facts: the multi-harness workspace, SDD, the five roles, `worktree pause` / `resume`, `dadaia export` soft and `--hard`, `init --from`.
- Sources: read `README.md`, `docs/` and `specs/memory/product/` of `<workspace>/repos/dadaia-workspace` at one `feature/0.5.0` commit `<sha>`, read with `git show <sha>:<path>`. The `0.5.0` version claim cites the roadmap Q3 ruling (`pyproject.toml:3` reads `0.4.7`).
- The commit body holds the table `claim | source`, one row per claim, each source `path@<sha>`; the same `<sha>` in every row.
- Checks: `npm run validate:content`, `npm run schema:check`, the SVG size gate untouched (no asset edited), `git grep -n '0\.1\.5\|pip install\|9 core agents'` on the file prints nothing.

## J1.T4 — pt and de page copy

Mirror the merged T3 item into `pt.json` and `de.json`: identical keys, section ids, status row count, `pypi.*` and `links.*` values byte for byte; translate only the human text, keep command and flag names (`uvx`, `worktree pause`, `export --hard`, `init --from`) untranslated. pt and de forms of the stale claims (`9 agentes`, `3 runtimes`, `pip install`, `9 Kern-Agenten`, `0.1.5`) must not remain.

Checks: `npm run check:i18n-projects`, `validate:content`, `schema:check` exit 0; `git grep -n '0\.1\.5\|pip install'` on the two files prints nothing; the three values of AC3.3 hit three times each across the three files; then `npm --prefix frontend run verify` exits 0.
