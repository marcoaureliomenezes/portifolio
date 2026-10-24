---
specs_pattern_version: 13
gitflow: {"principal": "main", "integration": "develop", "work": "feature/"}
---
# Constitution — portifolio

> **Created:** 2026-10-19

## Purpose

One statement of what this project is for.

## Invariants

1. (State the invariants every release must keep.)

## Exclusions

- (State what this project is not.)

<!-- dadaia:fixed slop-law -->
## Slop — workspace law (fixed)
- Slop is what passes the deletion test without loss: removed, no behavior changes and no decision loses its record.
- A SPEC declares scope, observable criteria and decisions in domain names; past the size `specs/releases/AGENTS.md` recommends, open `rc-<N+1>/`.
- A concept takes a glossary name; a numbered code exists only where a mechanical index reads it (FR, AC, T-).
- Every file has a canonical home and a GC path; summaries, backups, notes and scratch live in `.dadaia/tmp/` or do not exist.
- A branch dies at merge; a candidate exists only with scope that changes behavior.
- Measured by `.dadaia/.venv/bin/dadaia doctor` (FIXED-1/2); detection signals: `dd-code-review` SLOP.md.
<!-- /dadaia:fixed slop-law -->
