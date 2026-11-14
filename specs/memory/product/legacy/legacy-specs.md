---
slug: legacy-specs
title: Legacy specs
tldr: specs-bkp/ is the pre-canon specs tree kept by specs init; it is reading material only, unread by the site and its gates.
summary: specs-bkp/ holds the specs tree as it stood before the current specs/ canon, the input the first-pass audit reads to fill memory. No build, test, workflow or runtime path reads it.
tags:
  - legacy
  - specs
sources:
  - specs-bkp/**
---

## What it does

Keeps the project's earlier spec documents in the repo for reference.

## Current behavior

- `specs-bkp/` is the specs tree that `specs init` moved aside when it scaffolded the current
  `specs/`: its constitution, foundation, feature specs, memory, backlog, release folders and
  archive, in their own layout.
- It is the input `dd-audit-project`'s first pass reads, beside the code, to fill
  `ARCHITECTURE.md`, `QUALITY.md` and the product atoms.
- Nothing reads it at runtime, in `verify` or in CI; once the first pass has read it, it has no
  reader.

## Boundaries

- The current specs and memory live under `specs/`; the site as it is now: [[resume-home]],
  [[site-chrome]].
