# Claims at the pin

Pin: `dadaia-workspace==0.4.7`, git tag `v0.4.7` (`2d1f4351a46c8081f488a055d36c89abc20f6af9`). Every row is `claim | file:line at the tag` (`git show v0.4.7:<file>`). Nothing here reads the repo's unpublished HEAD.

| claim | file:line at the tag |
|---|---|
| The install line is `uvx dadaia-workspace init <dir> --harness <name>`; the one CLI has two names, `dadaia` and `dadaia-workspace` | `README.md:59-61`, `README.md:63` |
| `init <dir> --harness <name>` works on an empty directory | `README.md:63-64` |
| `init` provisions `.dadaia/.venv`, the `.dadaia/` zones, `.agents/skills` and the named harness's projection | `README.md:64-66` |
| `init` stages and installs the public assets, the one writer of every hook wiring | `README.md:66-68` |
| The init scene's `Harness: claude` line | `dadaia_workspace/cli/commands/init.py:96` |
| `init` closes with three notes, the last: `dadaia context create <name> --main-repo <slug> --url <url>` makes the first project (the "Try it" tail) | `dadaia_workspace/cli/commands/init.py:25-32` |
| After init the directory holds `.agents`, `AGENTS.md`, `.claude`, `.dadaia` (the `ls -A` output): the root `AGENTS.md` map and the harness projection | `README.md:99-101`, `README.md:64-66` |
| `doctor` is the one instance validator; it exits 1 only when a section fails, so a fresh workspace prints nothing and exits 0 | `README.md:79-81`, `dadaia_workspace/cli/commands/doctor.py:363-364` |
| `doctor` findings are `<CODE> <verdict> <message>`, each error with one `fix: <command>` line | `README.md:80-81` |
| The gate is one PreToolUse pre-gate: root whitelist, venv guard, SDD gate, first block wins | `README.md:107-108` |
| It blocks a `dadaia`, `pip` or `python -m dadaia_workspace` run outside `.dadaia/.venv/bin/` | `README.md:108-110` |
| Every BLOCK carries exactly one `fix:` line | `README.md:113` |
| The hook the workspace wires is `dadaia_workspace.hooks.pre_gate` | `dadaia_workspace/infrastructure/runtime_config.py:206` |
| The refusal text `[VENV GUARD] This command must run from the workspace venv`, the blocked command and `fix: <corrected command>` | `dadaia_workspace/hooks/venv_guard.py:146-153` |
| The refusal header `[VENV GUARD] This command must run from the workspace venv (.dadaia/.venv/bin/). Blocked:`, then the blocked command on its own line | `dadaia_workspace/hooks/venv_guard.py:146-151` |
| The hook reads the tool call as JSON on stdin and prints the refusal | `dadaia_workspace/hooks/pre_gate.py:70-72` |
| Six entry harnesses: Claude Code, Codex, Kimi Code, Cursor, Devin and GitHub Copilot | `README.md:35-36` |
| `init --harness` takes one of `claude, codex, kimi-code, cursor, devin, copilot` | `dadaia_workspace/cli/commands/init.py:50` (rendered by `init --help` at the pin) |
| The law is authored once; Codex, Kimi Code, Cursor, Devin and GitHub Copilot read `.agents/skills` natively; Claude Code reaches skills and personas through per-entry symlinks | `README.md:101-103` |
| A harness differs only in serialization (event names, hook file, answer shape) | `README.md:103-105` |
| Three personas ship: `dd-code-reviewer`, `dd-product-engineer`, `dd-software-engineer` (three files; "five roles" is false at the tag) | `git ls-tree v0.4.7:dadaia_workspace/public/agents/` |
| Demand-to-merge flow: a picked set, a grill, SPEC, PLAN and TASKS, one reserved task at a time, `[x]` only after the reviewer's `APPROVED`, then closure (memory reconciliation, disposition sweep, the `feature -> develop` merge) | `README.md:117-119` |
| A bug is proposed to the operator, registered after confirmation, then fixed with a RED test | `README.md:121-123` |
| Completed work leaves as a `handoff-v1` record validated by `dadaia reports validate` | `README.md:123-124` |

## What the casts print

- `init-workspace`: `Harness: claude`; the four entries of the new directory; `exit 0` from `doctor` (silent, clean).
- `gate-refuses`: the pre-gate's refusal for a Bash call `dadaia doctor`, verbatim except its `(pytest/ruff/mypy …)` note line: header, blocked command, `fix: .dadaia/.venv/bin/dadaia doctor` (`venv_guard.py:146-153`). The hook is fed the tool-call JSON a harness sends; only `tool_name` and `tool_input.command` are given.
- `try-it`: the last three lines `init` prints, then the new directory. The page's command is `uvx dadaia-workspace init demo --harness claude` (`README.md:60`); the cast runs the pinned venv's `dadaia-workspace`, the same entry point, so a re-record never drifts to a later release.
