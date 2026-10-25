---
slug: site-chrome
title: Shared site chrome
tldr: One header and one footer on every route, one 960 px column with 680 px prose, one type scale, localized chrome strings and <html lang>.
summary: A layout route renders the one header, the one main landmark in the site's 960 px column and the one footer for every page; the project routes add a breadcrumb and back link; chrome text, theme first paint and the document language follow the visitor's locale and stored theme.
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
  - frontend/src/components/projects/__tests__/ProjectsLayoutShell.test.tsx
  - frontend/src/lib/layout.ts
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
selector, and the same footer with the owner's contact links, all in the visitor's language.

## Current behavior

- `SiteLayout` is the layout route of every route in `App.tsx`: one fixed `Header`, one
  `<main id="main-content">` offset by the `--header-h` token (76 px, 64 px from 768 px) that
  holds the page in the site column, then one `<footer>`. No page renders its own header,
  `<main>` or footer.
- `lib/layout.ts` holds `COLUMN`, at most 960 px with 20 px side padding (24 px from `md`), and
  `PROSE`, a 680 px cap. The main column and the footer row use `COLUMN`, so the home and the
  project routes share one width; the hero story and role summaries use `PROSE`, and the library
  page's prose writes the same 680 px cap as its own class.
- Footer: `© <year> <owner>`, the year read from the clock at render, then Email
  (`mailto:` `profile.email`), LinkedIn and GitHub (`profile.linkedinUrl`, `profile.githubUrl`,
  new tab). Its landmark label and link texts come from `siteChrome.footer`; no production
  module under `src/` holds an email or URL literal.
- Header: Resume (`/`) and Projects (`/projetos`) as `NavLink`s; the current one carries
  `aria-current="page"` and an amber underline, and Projects is current on every `/projetos*`
  route. Below `md` the two links sit in a second row under the name, theme and language; there
  is no menu button.
- Chrome strings come from the active locale's `siteChrome` block: nav label and links, theme
  toggle labels, language selector label, breadcrumb label and root, the back link and the
  footer. `siteChrome` is required, so no reader guards it. The games empty state, whose link is
  `profile.githubUrl`, and the 404 text come from the same content file.
- `<html lang>` follows the active locale: `pt-BR` for pt, `en` and `de` otherwise.
- First paint is dark unless the stored theme is `light`; the inline script in `index.html` and
  `useTheme` decide the same way, whatever the OS colour scheme.
- Type scale, the only font sizes the header and project parts use: `text-label` 12 px and
  `text-meta` 13 px (JetBrains Mono), `text-body` 16, `text-item` 17/600, `text-hero` 20/700,
  `text-title` 32/700 and `text-title-sm` 28/700 (Inter). `cn()` merges these steps as font
  sizes. Inter loads at weights 400, 600 and 700 only. Each home section title is a
  `SectionHeading`: an `h2` on `text-label`, uppercase and muted.
- `ProjectsLayoutShell` wraps `/projetos` and `/projetos/:slug` inside the site column: a
  breadcrumb (Projects, then the project's name), the page, and on a project page a back link
  after it.
- One amber accent; no nested card, accordion or stat chip in the project parts.

## Boundaries

- The resume's sections inside the column: [[resume-home]]. The blog is outside this frame;
  the header carries no Blog link and no in-page anchors.
- The library page body: [[library-page]]. Chrome key parity across locales: [[content-contract]].
