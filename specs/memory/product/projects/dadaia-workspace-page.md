---
slug: dadaia-workspace-page
title: dadaia-workspace project page
tldr: The library page for dadaia-workspace, pinned to PyPI 0.4.7 and tag v0.4.7, with a hero loop, three scenes, a pinned Try it and facts from the tag.
summary: The projectsV2 item slug dadaia-workspace, kind library, in the three locale content files; every claim on it states what the pinned PyPI release ships and links its source at the pinned git tag.
tags:
  - projects
  - content
  - library
sources:
  - frontend/public/content/pt.json
  - frontend/public/content/en.json
  - frontend/public/content/de.json
  - frontend/public/assets/projects/dadaia-workspace/*
  - frontend/media/dadaia-workspace/*
  - frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts
---

## What it does

A visitor at `/projetos/dadaia-workspace` sees one command make a workspace, how a demand
reaches a merge, the gate refuse a command, and one law reach six agent harnesses; then a
command to try it and a facts table whose rows each link their source file at the pinned tag.

## Current behavior

- The pin, as the content and `frontend/media/dadaia-workspace/pin.txt` hold it:

  ```text
  pin.txt        dadaia-workspace==0.4.7
  pypi.version   0.4.7
  git tag        v0.4.7
  install line   uvx dadaia-workspace init <dir> --harness <name>
  Try it         uvx dadaia-workspace@0.4.7 init demo --harness claude | tail -n 3
  facts links    <links.repo>/blob/v0.4.7/<path>
  ```

- Hero loop: a recording of `init` for a directory `demo` with the claude harness, the listing
  of the new workspace, and `doctor` exiting 0.
- "How it works" holds three scenes: demand to merge (an animated SVG light/dark pair), the gate
  refuses (a recording of the pre-gate's VENV GUARD refusal, which names the blocked command and
  carries one fix line), and six harnesses (an animated SVG pair: Claude Code, Codex, Kimi Code,
  Cursor, Devin and GitHub Copilot).
- Facts rows: Language (Python ^3.12, `pyproject.toml`), License (MIT, `LICENSE`), Harnesses
  (the six, `README.md`) and Agent roles (3: code reviewer, product engineer, software engineer,
  `dadaia_workspace/public/agents/`).
- The meta row links the GitHub repo and the PyPI page; the item has no docs link, because the
  library's docs URL answers 404.
- The card on `/projetos` uses the hero's desktop poster as its cover.
- The three locale files carry the same keys, media paths and facts rows; text, `alt` and
  `caption` are translated. The `h1` is the product name in every locale; the purpose line is
  localized.
- `frontend/media/dadaia-workspace/claims.md` maps every sentence a scene prints or draws to its
  file and line at the tag.

## Boundaries

- The page states only what the pinned PyPI release ships; verbs and role counts of an
  unpublished branch stay off it. Moving the pin is a re-record of the scenes
  ([[scene-media]]) plus the same edit in the three locale files.
- Page order and layout: [[library-page]]. Content shape and asset rules: [[content-contract]].
