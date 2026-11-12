# Job 5 — Lighthouse publishes nothing

Wave 2 (the agent cap, not a dependency), waits on nothing. Paths are relative to the repo root. One task: a deletion, with no RED (the evidence is a run).

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J5.T1 | jr | AC5.1 | `frontend/lighthouserc.json` | DELETE the `upload` block (`:51-53`); `assert` still runs |

## Task notes

- **J5.T1.** Remove the block and the comma before it that JSON then forbids. `autorun.js:143-144` skips the upload without it, and `:137` still runs `assert`. Evidence: one `npm --prefix frontend run lighthouse` after `verify` has built `dist`, with its exit code and output showing no upload line (a failing `assert` is reported as it is, since the run is the job's evidence, not a new gate). Sweep: `grep -rn 'temporary-public-storage' frontend` prints nothing.
- PLAN §2.8 point 1: `.github/workflows/ci.yml:154-176` runs this same command on `pull_request`; the hand-back states the grep, and the job does not touch the workflow.

## Definition of done

- `npm --prefix frontend run verify` exits 0.
- Test directories reached: none.
- The hand-back cites the `npm run lighthouse` run and the sweep.
