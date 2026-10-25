---
slug: legacy-specs
title: Legacy specs and screenshots
tldr: specs-bkp/ is the pre-canon specs tree kept by specs init and img/ holds site screenshots; both are reading material only, unread by the site and its gates.
summary: specs-bkp/ holds the specs tree as it stood before the current specs/ canon, the input the first-pass audit reads to fill memory; img/ holds phone and desktop screenshots of the site. No build, test, workflow or runtime path reads either.
tags:
  - legacy
  - specs
sources:
  - specs-bkp/**
  - img/**
---

## What it does

Keeps the project's earlier spec documents and screenshots in the repo for reference.

## Current behavior

- `specs-bkp/` is the specs tree that `specs init` moved aside when it scaffolded the current
  `specs/`: its constitution, foundation, feature specs, memory, backlog, release folders and
  archive, in their own layout.
- It is the input `dd-audit-project`'s first pass reads, beside the code, to fill
  `ARCHITECTURE.md`, `QUALITY.md` and the product atoms.
- `img/mobile/` and `img/web/` hold screenshots of the site's pages, phone and desktop; no
  README, doc, spec or code references them.
- Nothing reads either folder at runtime, in `verify` or in CI; once the first pass has read
  `specs-bkp/`, neither has a reader.

## Boundaries

- The current specs and memory live under `specs/`; the site as it is now: [[resume-home]],
  [[site-chrome]].
