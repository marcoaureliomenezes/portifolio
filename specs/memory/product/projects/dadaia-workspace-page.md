---
slug: dadaia-workspace-page
title: dadaia-workspace project page
tldr: The portfolio's library-kind page for dadaia-workspace, in pt, en and de, stating its PyPI version, install line and links.
summary: The projectsV2 item slug dadaia-workspace, kind library, in the three locale content files; it describes the library to a visitor and points to its GitHub repo and PyPI page.
tags:
  - projects
  - content
  - library
sources:
  - frontend/public/content/pt.json
  - frontend/public/content/en.json
  - frontend/public/content/de.json
  - frontend/public/assets/projects/dadaia-workspace/*
---

## What it does

A visitor opening the dadaia-workspace project reads what the library is, why it exists and how
it works, with a status table, an architecture diagram and links to the GitHub repo and the PyPI
page.

## Current behavior

- The item is `projectsV2.list` slug `dadaia-workspace`, kind `library`, in
  `frontend/public/content/{pt,en,de}.json`; the three files carry the same keys, section ids
  (`what`, `why`, `how`, `status`) and status rows, and only the human text is translated.
- `pypi.version` and the status `Version` row state the library version; `pypi.installCommand` is
  `uvx dadaia-workspace init <dir> --harness <name>`, rendered in the install block that the
  Playwright test `frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts` asserts;
  `links.repo` and `links.pypi` point to `github.com/marcoaureliomenezes/dadaia-workspace` and
  `pypi.org/project/dadaia-workspace`.
- The copy names the five agent roles, the six harnesses, the document-driven lifecycle, the
  pre-tool gate, per-task worktrees with `worktree pause` and `resume`, `dadaia export` (with
  `--hard`) and `init --from`.
- Images come from `frontend/public/assets/projects/dadaia-workspace/`.

## Boundaries

- Covers this one item; the other project items share the same content files and are not
  described here.
