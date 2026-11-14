---
slug: content-contract
title: Content contract
tldr: projects.ts is the one project schema, one regex per URL or email field, site-content.schema.json its 2020-12 export; verify checks locales and assets.
summary: The site's content JSON has one machine contract built on the one project schema that declares every top-level key; verify's unit tests parse the three locale files against it with nothing stripped, keep the published JSON Schema equal to a fresh export and mappable by the panel's Studio, and hold every rule on the files under public/assets.
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
  - frontend/public/schema/**
  - frontend/src/lib/contentSchemaExport.test.ts
  - frontend/src/lib/contentAssets.test.ts
  - frontend/src/lib/homeParity.test.ts
  - frontend/src/lib/resumeContent.test.ts
  - frontend/public/assets/**
  - frontend/public/images/**
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
  carry an `href`. `media` is a list, in a section and in the hero alike; each entry is a video
  (desktop and phone cuts, each with webm, mp4, poster, width and height) or an SVG light/dark
  pair, both with `alt` and an optional `caption`. The project-level `diagram`, `diagramDark` and
  `diagramAlt` serve the meta kind. A project has no `stat` field.
- A library item's `pypi` holds `package`, `version`, an optional string `tagPrefix` and
  `installCommand`. `installCommand`, a section's `code` and an item's `href` may carry the
  placeholders `{version}` and `{tag}`; validation reads the raw content, and the page fills them
  at render ([[library-page]]).
- The locale files and `src/types/content.ts` carry a key only when `src/**` reads it or the
  published schema requires it: `header.viewEmail`, `education.location` and each
  certification's `icon` stay because the schema requires them; the site reads none of the
  three. The projects index holds only `title` and `description`.
- The contract declares every top-level key the three locales carry, each label key a string or
  nested objects of strings, and requires the keys `src/types/content.ts` requires plus
  `schema_version`, `published_at` and `projectsV2`. The parse strips an unknown key, top-level
  or nested, never refuses it.
- Each URL field and the email field is one regex, emitted as the schema's `pattern` with no
  `format`. `HttpUrl` is `^https?://` plus a host of word characters, dots and hyphens, an
  optional port from 1 to 65535 with no leading zero, and a path with no whitespace, so no
  `javascript:` or `data:` link reaches an `<a href>`, and `{` or `}` passes in a path and fails
  in the host. `Email` is one linear regex: one `@`, no whitespace, and after the `@` at least two
  non-empty dot-separated labels, so `a@b..c`, `a@.b.c` and `a@b.c.` are refused; a unit test
  answers a 50 000-character adversarial input in under 50 ms. A certification's `link` is
  `HttpUrl`'s pattern or a bare `#`. A unit test holds, for each partition, zod's verdict equal
  to the emitted pattern's, compiled with and without the `u` flag.
- `SiteRelativeUrl` in `projects.ts` is the one site-relative rule: a path that starts with one
  `/` not followed by `/`, `\`, whitespace or a control character; `cvUrl` is one, and a post's
  links are held to the same rule ([[blog]]).
- `public/schema/site-content.schema.json` is the published schema: the contract as JSON Schema
  2020-12 in input mode, with no `$ref` or `definitions` wrapper (`npm run schema:export`;
  `npm run schema:check` exits 1 on drift). The deploy uploads it ([[deploy-infrastructure]]).
  Unit tests fail when the committed file differs from a fresh export, closes an object with
  `additionalProperties: false`, or breaks the Studio mapping the panel builds its fields from:
  every property name matches `^[A-Za-z_][A-Za-z0-9_]*$`, no `anyOf` remains, and every `oneOf`
  sits directly under `items` with a `const` on each branch.
- A unit test parses `pt.json`, `en.json` and `de.json` against the full contract inside
  `test:run` and requires the parsed value to equal the file, so `verify` fails on a malformed
  locale file and on a key, at any depth, that the contract does not declare.
- `check:i18n-projects` (in `verify`) checks that the three locales carry the same project keys,
  the same `alt` and `caption` presence on each media list entry, index by index, every `siteChrome` key (the footer's, the Blog nav
  label and the blog pages' strings included) and every home label (`earlierLabel`, `detailsOpen`, `detailsClose`, `storyOpen`,
  `storyClose`, `impactLabel`, `seeAllProjects`), non-blank; `CONTENT_DIR` points it at another
  folder, and unit tests run it on a copy missing one key and on a copy whose media list entry
  lacks an optional key the other locales carry.
- A unit test holds the resume data of each locale: the `main` and `minor` experiences by
  company, certifications newest first by `priority` with no level in a name, skill rows in id
  order, the home keys present and no unread label key at any depth.
- `src/lib/contentAssets.test.ts` (in `test:run`) holds the asset rules: every `/assets` path a
  production module, `index.html` or a content file names exists under `public/`; every file
  under `public/assets/projects/` is referenced by a content file; every file under
  `public/assets/` is named `<name>-<first 8 hex of its sha256>.<ext>` (webm, mp4, webp, svg or
  png), so deploy may cache it as immutable; the two library items' media list, read from the
  content's own URLs, holds 32 files: webm at most 300 KB, mp4 400 KB, poster 60 KB, SVG 50 KB;
  mp4 runs 8 to 12 s; no video has an audio track; each cut has its pixel size; an SVG's
  `viewBox` is at most 360 wide with every `font-size` at least 12, and an animated SVG carries a
  `prefers-reduced-motion: reduce` rule.
- Each certification's non-empty `icon` names one of the 9 files under `public/images/`, and
  every one of those files is named; the site renders none of them.

## Boundaries

- The CI build job also caps each built SVG at 50 KB; the unit test is the rule's home inside
  `verify`.
- How the media files are made: [[scene-media]]. Where the content renders: [[library-page]],
  [[site-chrome]], [[resume-home]].
