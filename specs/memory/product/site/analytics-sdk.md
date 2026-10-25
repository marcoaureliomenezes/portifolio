---
slug: analytics-sdk
title: Analytics SDK
tldr: A vendored dependency-free SDK queues anonymous events per tab session and sends them by sendBeacon when the page hides.
summary: frontend/vendor/analytics-sdk is installed as @dadaia/analytics-sdk; main.tsx calls init with the build's VITE_ANALYTICS_ENDPOINT, and the site's track calls record page views, CV downloads, theme and language switches, role disclosures and project actions.
tags:
  - analytics
  - privacy
sources:
  - frontend/vendor/analytics-sdk/**
  - frontend/src/main.tsx
---

## What it does

The site counts what visitors do without identifying them: no cookie, no user id, one random
id per browser tab session.

## Current behavior

- `@dadaia/analytics-sdk` is a local package (`file:./vendor/analytics-sdk`), shipped as
  built `dist/` plus its TypeScript `src/`, with no runtime dependency.
- `init({ site_id, endpoint })` stores the config, creates the session id (a UUID v4 in
  `sessionStorage` under `dadaia_session_id`, a fresh one per call when storage is blocked) and
  registers the flush listeners once. `track(event_type, metadata)` queues
  `{site_id, session_id, event_type, timestamp, metadata}` once `init` has run.
- The queue flushes as one JSON `sendBeacon` to the endpoint when the document turns hidden or
  on `pagehide`, then empties. No SDK call throws into the host page.
- `main.tsx` calls `init` with `site_id` `portifolio` and `VITE_ANALYTICS_ENDPOINT`, an empty
  string when unset; no workflow sets that variable, and the SDK checks only that `init` ran,
  not that the endpoint is set.
- Events the site sends: `page_view` once when the app mounts, `cv_download`, `theme_toggle`,
  `language_switch`, `section_expand` and `section_collapse` on a role's Details control, and
  `project_cta` from a project card or a library page action.

## Boundaries

- No collector is part of this repo. Where the events start: [[site-chrome]],
  [[resume-home]], [[library-page]].
