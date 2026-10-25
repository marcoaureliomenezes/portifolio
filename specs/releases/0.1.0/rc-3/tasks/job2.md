# Job 2 — dead links in the README and the repo AGENTS

Wave 1, waits on nothing, disjoint from Job 1. Paths are relative to the repo root. One docs task; the repo `AGENTS.md` `## Gates` block (the `verify:` and `tests:` lines) is not touched. Definition of done: `npm --prefix frontend run verify` (no E2E: no home element changes). Hand back the counts and the diff-read of removed or loosened asserts.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | jr | AC7.6 | `README.md`, `AGENTS.md` | every `specs/` link names an existing path; the CI row names what `ci.yml` runs; the dev-server port is 8080 |

## Task notes

- **J2.T1.** `README.md` links `./specs/SPEC.md`, `./specs/foundation/SPEC.md`, `./specs/TASKS.md` and `./specs/features/infra-retomada/SPEC.md`; the repo `AGENTS.md` "Spec Structure" lists the same dead paths plus `specs/memory/architecture.md`, `specs/memory/tech-stack.md`, `specs/PLAN.md`. Replace each with the existing path that carries the same content: `specs/constitution.md`, `specs/memory/ARCHITECTURE.md`, `specs/memory/QUALITY.md`, `specs/releases/`, `specs/AGENTS.md`; drop a line that has no successor. The CI row lists what `.github/workflows/ci.yml` runs (lint, type-check, unit tests, i18n parity, build, E2E smoke, Lighthouse); `localhost:5173` becomes `localhost:8080` (`vite.config.ts` fixes 8080). Evidence in the hand-back: the list of links before and after, each opened.
