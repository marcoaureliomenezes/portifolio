---
slug: content-contract
title: Content contract
tldr: projects.ts is the one project schema, links are http(s), v1.json its input-mode export; verify parses the locales, checks key parity and every asset.
summary: The site's content JSON has one machine contract built on the one project schema; verify's unit tests parse the three locale files against it, keep the exported JSON Schema equal to a fresh export, and hold every rule on the files under public/assets.
tags:
  - content
  - schema
  - i18n
  - assets
sources:
  - frontend/src/lib/schemas/projects.ts
  - frontend/src/lib/schemas/projects.test.ts
  - frontend/src/types/content.ts
  - frontend/scripts/content-schema.mjs
  - frontend/scripts/export-content-schema.mjs
  - frontend/scripts/check-i18n-parity.mjs
  - frontend/public/content/schema/v1.json
  - frontend/src/lib/contentSchemaExport.test.ts
  - frontend/src/lib/contentAssets.test.ts
  - frontend/src/lib/homeParity.test.ts
  - frontend/src/lib/resumeContent.test.ts
  - frontend/public/assets/projects/**
  - frontend/public/images/**
  - frontend/public/decorators/**
  - frontend/public/lovable-uploads/**
---

## What it does

The pt, en and de content files, fetched at runtime, are held to one contract: their shape, the
safety of every link, key parity between locales, and the existence, names and budgets of every
asset they point to. A break fails `verify`.

## Current behavior

- `src/lib/schemas/projects.ts` is the one definition of a project: a union on `kind` (`library`,
  `meta`, `games`, `case-study`). `src/types/content.ts` re-exports its types through `z.infer`,
  and `scripts/content-schema.mjs` imports it into the full content contract.
- A section holds `id`, `title` and optional `body`, `media`, `code` and `items`; an item may
  carry an `href`. `media` is a video (desktop and phone cuts, each with webm, mp4, poster, width
  and height) or an SVG light/dark pair, both with `alt` and an optional `caption`; the hero may
  carry `media`. The project-level `diagram`, `diagramDark` and `diagramAlt` serve the meta kind.
  A project has no `stat` field.
- The locale files and `src/types/content.ts` carry a key only when `src/**` reads it or the
  published `v1.json` holds it: `header.viewEmail`, `education.location` and each
  certification's `icon` stay because the schema requires them, and the optional
  `projectsV2.index.kindLabels` stays for the schema's outside readers; the site reads none of
  the four. `profile` is
  required in both the schema and the type; `siteChrome`, `heroStatsSuffix` (`years`, `certs`)
  and the home labels are required in the type and pass the schema as tolerated label keys.
- Every link field is `HttpUrl` (`^https?://`), so no `javascript:` or `data:` link reaches an
  `<a href>`; `cvUrl` is a same-origin path. Unknown top-level label keys are tolerated; unknown keys inside
  a structured object are stripped, never refused.
- `public/content/schema/v1.json` is the JSON Schema export of the contract in input mode
  (`npm run schema:export`); a unit test fails when the committed file differs from a fresh
  export, or when it closes an object with `additionalProperties: false`.
- A unit test parses `pt.json`, `en.json` and `de.json` against the full contract inside
  `test:run`, so `verify` fails on a malformed locale file.
- `check:i18n-projects` (in `verify`) checks that the three locales carry the same project keys,
  the same media `alt` and `caption` presence, every `siteChrome` key (the footer's included)
  and every home label (`earlierLabel`, `detailsOpen`, `detailsClose`, `storyOpen`,
  `storyClose`, `impactLabel`, `seeAllProjects`), non-blank; `CONTENT_DIR` points it at another
  folder, and a unit test runs it on a copy missing one key.
- A unit test holds the resume data of each locale: the `main` and `minor` experiences by
  company, certifications newest first by `priority` with no level in a name, skill rows in id
  order, the home keys present and no unread label key at any depth.
- `src/lib/contentAssets.test.ts` (in `test:run`) holds the asset rules: every `/assets` path a
  production module, `index.html` or a content file names exists under `public/`; every file
  under `public/assets/projects/` is referenced by a content file; the two library items' media
  list, read from the content's own URLs, holds 32 files; each is named
  `<scene>-<first 8 hex of its sha256>.<ext>`; webm at most 300 KB, mp4 400 KB, poster 60 KB,
  SVG 50 KB; mp4 runs 8 to 12 s; no video has an audio track; each cut has its pixel size; an
  SVG's `viewBox` is at most 360 wide with every `font-size` at least 12, and an animated SVG
  carries a `prefers-reduced-motion: reduce` rule.

- Static files under `public/` outside the asset rules: each certification's `icon` names a
  file under `public/images/` (9 of its 15 files), which the site does not render; the other 6
  images, the two SVGs in `public/decorators/` and the three PNGs in `public/lovable-uploads/`
  have no reader in code, content or tests.

## Boundaries

- The CI build job also caps each built SVG at 50 KB; the unit test is the rule's home inside
  `verify`.
- How the media files are made: [[scene-media]]. Where the content renders: [[library-page]],
  [[site-chrome]], [[resume-home]].
