---
slug: site-chrome
title: Shared site chrome
tldr: One header on every route, one type scale, a 960 px project column with 680 px prose, localized chrome strings and <html lang>.
summary: A layout route renders the one header and the one main landmark for every page; the project routes add a breadcrumb and back link in a 960 px column; chrome text, theme first paint and the document language follow the visitor's locale and stored theme.
tags:
  - site
  - layout
  - i18n
  - design-tokens
sources:
  - frontend/src/App.tsx
  - frontend/src/components/Header.tsx
  - frontend/src/components/header/*
  - frontend/src/components/layout/*
  - frontend/src/components/projects/ProjectsLayoutShell.tsx
  - frontend/src/contexts/LanguageContext.tsx
  - frontend/src/hooks/useTheme.ts
  - frontend/src/pages/NotFound.tsx
  - frontend/src/lib/utils.ts
  - frontend/src/index.css
  - frontend/src/main.tsx
  - frontend/tailwind.config.ts
  - frontend/index.html
  - frontend/tests/e2e/projects-cluster/nav-projects.spec.ts
  - frontend/tests/e2e/projects-cluster/layout-shell.spec.ts
  - frontend/tests/e2e/pages/theme-first-paint.spec.ts
---

## What it does

Every page, the resume, the project index, each project page and the 404, carries the same
header: the owner's name, a Resume link, a Projects link, a theme toggle and a language
selector, all in the visitor's language.

## Current behavior

- `SiteLayout` is the layout route of every route in `App.tsx`: one fixed `Header`, then one
  `<main id="main-content">` offset by the `--header-h` token (76 px, 64 px from 768 px). No page
  renders its own header or `<main>`.
- Header: Resume (`/`) and Projects (`/projetos`) as `NavLink`s; the current one carries
  `aria-current="page"` and an amber underline, and Projects is current on every `/projetos*`
  route. Below `md` the two links sit in a second row under the name, theme and language; there
  is no menu button.
- Chrome strings come from the active locale's `siteChrome` block: nav label and links, theme
  toggle labels, language selector label, breadcrumb label and root, and the back link. The games
  empty state and the 404 text come from the same content file.
- `<html lang>` follows the active locale: `pt-BR` for pt, `en` and `de` otherwise.
- First paint is dark unless the stored theme is `light`; the inline script in `index.html` and
  `useTheme` decide the same way, whatever the OS colour scheme.
- Type scale, the only font sizes the header and project parts use: `text-label` 12 px and
  `text-meta` 13 px (JetBrains Mono), `text-body` 16, `text-item` 17/600, `text-hero` 20/700,
  `text-title` 32/700 and `text-title-sm` 28/700 (Inter). `cn()` merges these steps as font
  sizes. Inter loads at weights 400, 600 and 700 only.
- `ProjectsLayoutShell` wraps `/projetos` and `/projetos/:slug` in one column of at most 960 px:
  a breadcrumb (Projects, then the project's name), the page, and on a project page a back link
  after it. Prose inside a project page is capped at 680 px.
- One amber accent; no nested card, accordion or stat chip in the project parts.

## Boundaries

- The resume's own sections and the blog are outside this frame; the header carries no Blog
  link and no in-page anchors.
- The library page body: [[library-page]]. Chrome key parity across locales: [[content-contract]].
