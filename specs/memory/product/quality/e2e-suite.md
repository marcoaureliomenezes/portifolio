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
  - frontend/tests/e2e/setup/.gitkeep
---

## What it does

Real-browser checks that the site loads and its main paths work, before a merge and weekly.

## Current behavior

- `E2E_SMOKE` limits the run to nine specs: health, home, not-found, deep-link,
  post-strict-flip smoke, project tabs, CV download routing, layout and responsive. Without it,
  every `*.spec.ts` under `tests/e2e` runs.
- `ci.yml` runs the smoke set on each PR to `develop` or `main`; `ci-weekly.yml` runs the full suite on a Sunday
  schedule.
- In CI: Chromium only, one retry, four workers, `npm run preview` on port 8080 serving the
  built `dist/`. Locally: Chromium, Firefox, WebKit, Pixel 5 and iPhone 12 against
  `npm run dev`, reusing a running server.
- The browser locale is `pt-BR`, so pt is the default language; `E2E_BASE_URL` overrides the
  base URL. Traces are kept on the first retry and screenshots on failure.
- `tests/e2e/fixtures/routes.ts` names the routes the specs visit; `tests/e2e/setup/` holds only
  a `.gitkeep`, and no config or spec reads it.

## Boundaries

- The specs each feature owns are named in that feature's atom, for instance [[resume-home]]
  and [[site-chrome]].
