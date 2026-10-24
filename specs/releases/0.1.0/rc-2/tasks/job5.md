# Job 5 — dadaia-workspace scenes (transcripts and assets)

Wave 2, waits on Job 2. Disjoint from Job 3 and Job 4. Paths are relative to the repo root. No RED task (AC3.1 developer tool). The page text and wiring are Job 8's. Definition of done: `npm --prefix frontend run verify` plus the checks in Hand-back evidence.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J5.T1 | sr | AC5.1, AC5.2, AC5.3, AC3.1 | `frontend/media/dadaia-workspace/pin.txt`, `frontend/media/dadaia-workspace/init-workspace.cmds`, `frontend/media/dadaia-workspace/init-workspace.cast.json`, `frontend/media/dadaia-workspace/gate-refuses.cmds`, `frontend/media/dadaia-workspace/gate-refuses.cast.json`, `frontend/media/dadaia-workspace/try-it.cmds`, `frontend/media/dadaia-workspace/try-it.cast.json`, `frontend/media/dadaia-workspace/claims.md` | the pin, the real CLI read first, the scripted commands and transcripts, the claim-to-source table |
| J5.T2 | sr | AC5.2, AC3.4, AC3.5 | `frontend/media/dadaia-workspace/demand-to-merge-light.svg`, `frontend/media/dadaia-workspace/demand-to-merge-dark.svg`, `frontend/public/assets/projects/dadaia-workspace/demand-to-merge-*.svg` | animated demand-to-merge flow, pair, published |
| J5.T3 | sr | AC5.2, AC3.4, AC3.5 | `frontend/media/dadaia-workspace/six-harnesses-light.svg`, `frontend/media/dadaia-workspace/six-harnesses-dark.svg`, `frontend/public/assets/projects/dadaia-workspace/six-harnesses-*.svg` | animated one-law-six-harnesses scene, pair, published |
| J5.T4 | jr | AC3.1, AC3.3, AC3.4 | `frontend/public/assets/projects/dadaia-workspace/init-workspace-*`, `frontend/public/assets/projects/dadaia-workspace/gate-refuses-*` | `media:record` run for both video scenes; 12 hashed files committed within the budgets |

## Task notes

- **J5.T1: pin and truth.** The pin is the PyPI `info.version` of `dadaia-workspace` on recording day (0.4.7 on 2026-10-24; its git tag is `v0.4.7`); `repos/dadaia-workspace` HEAD (0.5.0 rc) is unpublished and is never a source. `pin.txt` holds `dadaia-workspace==<version>`. In a throwaway venv under `<workspace>/.dadaia/tmp/` (Python >= 3.12; never in the repo), read the real CLI before any scene text: `dadaia-workspace --help`, `init --help`, `doctor --help`, and the tag's `README.md` (`git -C repos/dadaia-workspace show v0.4.7:README.md`). Scenes: `init-workspace` (the hero loop: the pin README's first command, `uvx dadaia-workspace init <dir> --harness <name>` as the pin documents it, then `doctor`), `gate-refuses` (a real refusal the pin's own hook or verb prints in a fresh workspace, with its `fix:` line, output lines at or under 44 columns). A cast's `cmd` is the command that was executed, character for character. `try-it.cmds` and its cast are the page's "Try it" (the pin's first command in an empty directory), recorded with `NO_RENDER=1`. `claims.md` is `claim | file:line at the tag` for every sentence the four scenes and the example print or draw, the six harnesses (`README.md:35` at the tag) and the persona count (three files under `dadaia_workspace/public/agents/` at the tag; "five roles" is false there) included. If no real refusal is reproducible in an empty directory at the pin, stop and send `[SDD BLOCKED]` to the main thread.
- **J5.T2 / J5.T3: SVG scenes.** Same rules and publishing command as Job 4 (`node frontend/media/record.mjs svg dadaia-workspace <scene>`): `viewBox` at most 360 wide, `font-size` at least 12 units, `prefers-reduced-motion` stop rule, complete still, at most 50 KB, light/dark pair, amber the one accent. The flow draws the pin's demand-to-merge steps from `claims.md` only; the six harnesses are the six the tag's README lists, named as it names them.
- **J5.T4.** `npm --prefix frontend run media:record -- dadaia-workspace init-workspace` and `… gate-refuses`; a budget failure is fixed by shortening the transcript, never by raising the budget.

## Hand-back evidence

- The pin: PyPI `info.version` read that day, `pip show dadaia-workspace` in the venv, `git -C repos/dadaia-workspace rev-parse v0.4.7`.
- One extracted frame per scene (phone cut for the videos, SVGs at 360 px) by path; the printed JSON of `media:record`; sizes against the budgets; sha256 prefix equal to name for every file; the SVG `viewBox`, `font-size` and `prefers-reduced-motion` counts.
- The "Try it" command run in an empty directory with its exit code and output pasted.
- `git grep -n '0\.5\.0\|0\.1\.5\|context activate\|worktree pause\|worktree resume\|export --hard\|init --from' frontend/media/dadaia-workspace` prints nothing.
