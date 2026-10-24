---
slug: QUALITY
title: Quality Assurance
tldr: QA principles, test architecture and the gates every change passes.
summary: The Principles section holds the quality principles; the Test architecture and Gates sections describe how the project is verified today.
tags:
  - quality-assurance
  - testing
  - anti-slop
---

## Principles

No principle is recorded yet.

## Test architecture

Size by what a test reaches: SMALL = no process and no real git; MEDIUM =
a subprocess or real git; LARGE = `frontend/tests/e2e`. Test basics: the root `AGENTS.md` map §1.

## Gates

The repo's tracked `verify:` line runs once, at the merge; nothing reruns it before a push.

- `verify: npm --prefix frontend run verify` (`AGENTS.md` `## Gates`): the `verify` script of
  `frontend/package.json` chains `npm ci`, `lint`, `typecheck`, `test:run`,
  `check:i18n-projects` and `build`.
- `tests: frontend/src/*.test.ts frontend/src/*.test.tsx frontend/src/test-setup.ts frontend/tests/*`
  (`AGENTS.md` `## Gates`): the paths a task merge treats as test files.
- Playwright E2E (`npm run test:e2e`) runs only in CI, outside `verify`: the `e2e` job of
  `.github/workflows/ci.yml` runs the smoke set (`E2E_SMOKE=true`) on pull requests to develop
  and main, and the `full-e2e` job of `.github/workflows/ci-weekly.yml` runs the full suite on
  its weekly schedule.

<!-- dadaia:fixed slop-tests -->
### Slop — tests (fixed)
- A test follows the root `AGENTS.md` map §1 test basics; an own module is tested through its interface.
- A test name states current behavior; a tombstone is a test of an absence (removal: root map §1).
- Detection: `dd-code-review` SLOP.md S3.
<!-- /dadaia:fixed slop-tests -->
