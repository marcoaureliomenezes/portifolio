---
slug: scene-media
title: Scene media pipeline and player
tldr: Scenes recorded from a pinned PyPI version, hash-named under byte budgets, played muted and looped, a still under reduced motion.
summary: A developer tool in frontend/media turns a pinned package's real terminal output into hash-named webm, mp4 and poster cuts, and publishes SVG scene pairs; the Media component plays them in view, picks the cut by width and shows the still when motion is reduced.
tags:
  - media
  - projects
  - accessibility
  - performance
sources:
  - frontend/media/README.md
  - frontend/media/capture.sh
  - frontend/media/record.mjs
  - frontend/media/terminal.html
  - frontend/src/components/projects/Media.tsx
  - frontend/src/components/projects/DiagramAsset.tsx
  - frontend/src/hooks/useMediaQuery.ts
  - frontend/src/hooks/useInView.ts
  - frontend/tests/e2e/projects-cluster/library-scenes.spec.ts
---

## What it does

A library page's moving scenes show the pinned release's real behaviour. A developer re-records
a scene with one command; a visitor gets a muted loop that costs nothing until it scrolls into
view, and a still image when the system asks for reduced motion.

## Current behavior

- Recording, outside `verify` and CI: `frontend/media/capture.sh <project> <scene> <venv-dir>`
  makes a venv outside the repo, installs the line of `<project>/pin.txt`, runs
  `<scene>.cmds` in an empty scratch directory and writes their real output to
  `<scene>.cast.json`, then runs `npm --prefix frontend run media:record -- <project> <scene>`.
  `NO_RENDER=1` stops after the cast. It needs `uv`, `python3`, `node` and `ffmpeg`.
- `record.mjs` draws the cast in `terminal.html` with Playwright Chromium at device scale 2, in
  two cuts: desktop 640x360 CSS px (16:9) and phone 360x450 (4:5), 15 fps, 8 to 12 s; ffmpeg
  encodes webm, mp4 and a webp poster with no audio. `record.mjs svg <project> <scene>`
  publishes a light/dark SVG pair.
- Each output lands in `public/assets/projects/<project>/` as `<scene>-<cut>-<h>.<ext>` or
  `<scene>-<light|dark>-<h>.svg`, `<h>` the first 8 hex of the file's sha256; a re-record deletes
  the scene's previous files. `record.mjs` exits non-zero above the budgets: webm 307200 bytes,
  mp4 409600, poster 61440, SVG 51200.
- `Media` renders a scene in a `<figure>` with its caption. A video picks the desktop cut from
  640 px wide and the phone cut below; it mounts as `<video autoplay muted loop playsinline
  preload="none">` with the poster, width and height, webm then mp4 sources, and the `alt` as
  its accessible name, only once in view. Before that, and always under
  `prefers-reduced-motion: reduce`, it shows the sized poster with the same `alt`. Crossing
  640 px swaps the cut.
- An SVG scene shows its light or dark file by the site's theme class, not the OS scheme; its
  own CSS stops the animation under reduced motion, leaving the complete still.
- The E2E spec checks both library pages at 1440 and 360 px, with and without reduced motion.

## Boundaries

- The rules every committed file must meet are tested in `verify` by [[content-contract]].
- What each scene shows: [[rand-engine-page]], [[dadaia-workspace-page]]; where it sits:
  [[library-page]].
