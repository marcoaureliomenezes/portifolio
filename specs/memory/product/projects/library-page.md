---
slug: library-page
title: Library project page layout
tldr: The one library page layout - purpose, install line, hero loop, side-by-side scenes, Try it, Why it exists, facts pinned to a tag.
summary: LibraryProjectTemplate renders a library item in a fixed order from its content alone; scene sections sit text beside media on wide screens, and the facts heading names the library and its pinned version.
tags:
  - projects
  - library
  - layout
sources:
  - frontend/src/pages/projects/LibraryProjectTemplate.tsx
  - frontend/src/components/projects/ProjectSections.tsx
  - frontend/src/components/projects/Block.tsx
  - frontend/src/components/projects/CodeBlock.tsx
  - frontend/tests/e2e/projects-cluster/library-scenes.spec.ts
  - frontend/tests/e2e/projects-cluster/project-detail-library.spec.ts
---

## What it does

Every library item (kind `library`) reads the same way: what it is, how to install it, a short
loop of it working, how it works in scenes, a real example to copy, why it exists, and the facts
behind it, each fact linked to its source.

## Current behavior

- Order, top to bottom: breadcrumb (the shell's), `h1` product name, one-line purpose, meta row
  (version, GitHub, PyPI, and docs when the item has a `links.docs`), install line, hero media,
  "How it works" with the scenes, then the sections `try`, `why` and `facts` in that order, and
  the shell's back link.
- Every heading text comes from the content: the section titles, and `libraryPage.howTitle`,
  `versionLabel`, `linkPypi`, `linkDocs`, `copyLabel` and `copiedLabel` of the active locale.
- A scene is any section whose id is not `try`, `why` or `facts`, in content order. It renders
  its title (an `h3` on the item step), body and media only. From the `md` breakpoint the text
  sits beside the media (columns 1fr and 1.6fr); below it they stack.
- `try`, `why` and `facts` render as flat blocks under a 12 px mono label: body, media, a code
  block, then items as label and value rows, the value linked when the item has an `href`.
- The facts heading reads `<factsTitle> · <product name> <pypi.version>`.
- The install line and the Try it code sit in a code block whose copy button copies exactly the
  text shown and flips to the copied label for 2 s. Copying the install line fires
  `track("project_cta", {action: "copy_install"})`; the GitHub and PyPI links fire
  `project_cta` with `github` and `pypi`.
- Prose is capped at 680 px inside the 960 px project column; no card, accordion or stat chip
  appears.

## Boundaries

- The shell (header, breadcrumb, back link, column) is [[site-chrome]]'s; each video or SVG is
  drawn by [[scene-media]]; the item shape is [[content-contract]]'s.
- The two library items: [[rand-engine-page]] and [[dadaia-workspace-page]].
