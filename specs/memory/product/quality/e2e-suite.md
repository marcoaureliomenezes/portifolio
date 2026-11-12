---
slug: e2e-suite
title: End-to-end suite
tldr: Playwright runs nine smoke specs on every PR and the full suite weekly, against a local server on port 8080 with the pt-BR locale.
summary: playwright.config.ts picks the smoke set under E2E_SMOKE, else every spec under tests/e2e; CI runs Chromium against vite preview of the built dist, locally five browser projects against the dev server.
tags:
  - quality-assurance
  - e2e
sources:
  - frontend/playwright.config.ts
  - frontend/tests/e2e/fixtures/routes.ts
  - frontend/tests/e2e/fixtures/language.ts
  - .github/workflows/ci.yml
---

## What it does

Real-browser checks that the site loads and its main paths work, before a merge and weekly.

## Current behavior

- `E2E_SMOKE` limits the run to nine specs: health, home, not-found, deep-link,
  post-strict-flip smoke, project tabs, CV download routing, layout and responsive. Without it,
  every `*.spec.ts` under `tests/e2e` runs.
- `ci.yml` runs the smoke set on each PR to `develop` or `main`; `ci-weekly.yml` runs the full suite on a Sunday
  schedule.
- In CI, the weekly run included: Chromium only, which both workflows install by
  `npx playwright install chromium` without the system packages, one retry, four workers,
  `npm run preview` on port 8080 serving the built `dist/`.
  Locally: Chromium, Firefox, WebKit, Pixel 5 and iPhone 12 against `npm run dev`, reusing a
  running server.
- The browser locale is `pt-BR`, so pt is the default language. `E2E_BASE_URL`, when set, is the
  base URL and Playwright starts no server; unset, Playwright starts the server above. Traces are kept on the first retry and screenshots on failure.
- `tests/e2e/fixtures/routes.ts` names the routes the specs visit.
- `tests/e2e/fixtures/language.ts` `switchLanguage` is the one language switch: it opens the
  header's language combobox, picks the option, and returns once the header's first nav link
  shows the chosen locale's `siteChrome.nav.resume`, read from that locale's content file, so
  the new locale's content has loaded. Every spec that switches the language calls it.
- Title asserts compare against literal titles copied from the content: the deep-link spec and
  the library and meta project-detail specs (each page's pt title), the i18n-projects spec (a
  library page's en title after the switch) and the layout-shell spec (the projects index's pt
  title and a library page's pt title). The layout-shell spec also holds two regex asserts on that
  page's title (a name match, and a prefix after the switch to English) and one negative regex.

## Boundaries

- The specs each feature owns are named in that feature's atom, for instance [[resume-home]]
  and [[site-chrome]].
