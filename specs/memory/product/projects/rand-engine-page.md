---
slug: rand-engine-page
title: rand-engine project page
tldr: The library page for rand-engine, pinned to PyPI 0.8.0 and tag 0.8.0, with a hero loop, three scenes, a runnable Try it and facts from the tag.
summary: The projectsV2 item slug rand-engine, kind library, in the three locale content files; its scenes, example and facts state what the pinned PyPI release ships, each fact linked to its source at the pinned git tag.
tags:
  - projects
  - content
  - library
sources:
  - frontend/public/content/pt.json
  - frontend/public/content/en.json
  - frontend/public/content/de.json
  - frontend/public/assets/projects/rand-engine/*
  - frontend/media/rand-engine/*
  - frontend/tests/e2e/projects-cluster/rand-engine.spec.ts
---

## What it does

A visitor at `/projetos/rand-engine` sees a declarative spec turn into a seeded DataFrame, then
how related tables keep their keys, how an event stream runs, and how one save writes a folder
of part files; then a Python example to copy and a facts table whose rows each link their source
file at the pinned tag.

## Current behavior

- The pin, as the content and `frontend/media/rand-engine/pin.txt` hold it:

  ```text
  pin.txt        rand-engine==0.8.0
  pypi.version   0.8.0
  git tag        0.8.0
  install line   pip install rand-engine
  facts links    <links.repo>/blob/0.8.0/<path>
  ```

- Hero loop: a recording of one Python command that builds a `DataGenerator` from a two-column
  spec with a seed and prints a five-row table.
- "How it works" holds three scenes: related tables (an animated SVG light/dark pair,
  `orders.customer_id` as an fk to the `customer_id` pk of `customers`), event streams (an animated SVG pair:
  `stream_dict` yields records whose `event_id` pk never repeats across microbatches), and files
  in parts (a recording: a save with `numFiles` 3 writes a folder of three `part_` files).
- "Try it" is a Python example (`DataGenerator(spec, seed=42).size(1_000).get_df()` over four
  columns) with a copy button; `frontend/media/rand-engine/try-it.py` and its cast hold the same
  code and its real output at the pin.
- Facts rows, each sourced in the library's repo at the tag: Language (Python >=3.10), pandas
  (the range its pyproject declares), License (MIT) and Speed on the CI runner (1,000,000
  integers in 0.006 s, 10,000,000 in 0.041 s, from its benchmarks page).
- The meta row links the GitHub repo, the PyPI page and the docs root.
- The card on `/projetos` uses the hero's desktop poster as its cover.
- The three locale files carry the same keys, media paths and facts rows; text, `alt` and
  `caption` are translated.
- The E2E spec reads the expected version from the content item, never from a literal.
- `frontend/media/rand-engine/claims.md` maps every sentence a scene prints or draws to its file
  and line at the tag.

## Boundaries

- Version-dependent facts sit only in the facts table, never in prose or scene text; Spark speed
  is not featured.
- Moving the pin is a re-record of the scenes ([[scene-media]]) plus the same edit in the three
  locale files.
- Page order and layout: [[library-page]]. Content shape and asset rules: [[content-contract]].
