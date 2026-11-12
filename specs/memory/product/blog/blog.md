---
slug: blog
title: Blog
tldr: Markdown post folders become per-post HTML, an index and an RSS feed at build time; project heads are prerendered; the Blog link shows once a post is published.
summary: build-blog.mjs runs after vite build; blog-posts.mjs is the one decider of a published post and of the post order; /blog lists every published post in every locale with a language tag and tag filter, /blog/:slug shows the body the build rendered; the root head carries the default share image and the feed link.
tags:
  - blog
  - content
  - seo
sources:
  - frontend/scripts/blog-posts.mjs
  - frontend/scripts/build-blog.mjs
  - frontend/scripts/image-size.mjs
  - frontend/src/lib/blogIndex.ts
  - frontend/src/lib/blog*.test.ts
  - frontend/src/lib/buildBlog.test.ts
  - frontend/src/lib/imageSize.test.ts
  - frontend/src/components/blog/**
  - frontend/src/pages/blog/**
  - frontend/tests/fixtures/blog/**
  - frontend/public/assets/share-*.png
  - frontend/vite.config.ts
  - frontend/src/vite-env.d.ts
---

## What it does

The owner writes a post as a Markdown folder in the repo; the site publishes it at
`/blog/<slug>` with its own title, description and share image in the served HTML, lists it at
`/blog` for every visitor whatever their language, and announces it in an RSS feed. The project
pages get their own served heads from the same build.

## Current behavior

- A post is `frontend/content/blog/<slug>/index.md` with its media beside it; `<slug>` matches
  `^[a-z0-9]+(-[a-z0-9]+)*$`. The committed content holds no post, so the blog index is empty
  and the Blog link absent.
- Front matter is the leading `---` block of flat `key: value` lines, checked by zod: `title`
  and `description` non-blank, `date` a real `YYYY-MM-DD`, `lang` one of `pt`, `en`, `de`, `tags`
  a comma list of slugs (possibly empty), optional `image` (a png, jpg, webp or svg file in the
  folder) and optional `draft` (`true` or `false`). An unknown key, a missing field or a bad value
  fails the build with `<slug>: <field>: <message>`.
- `scripts/blog-posts.mjs` `readPosts` is the one decider of "published": it validates every
  folder, drafts included, drops `draft: true` posts and orders the rest newest first (ties by
  slug); it is the one order decider, and the index data, the feed and the blog index keep its
  order. A draft gets no page, index entry or feed item and does not count for the Blog link.
- `npm run build` runs `vite build`, then `scripts/build-blog.mjs`, whose `--posts` and
  `--dist` default to `content/blog` and `dist` under the directory it runs in. It also exports
  `buildBlog(postsDir, dist)`; importing it runs nothing. The build finds
  `public/content/pt.json` from the script's own location, whatever the working directory.
  `marked`, a devDependency absent from the client bundle, renders the body: raw HTML renders
  as escaped text; a body heading sits one level under the post title, so `#` renders `<h2>`,
  each level shifts down one and `######` stays `<h6>`, and the post page
  keeps one `h1`; a code block is a plain escaped `<pre><code>`; `&` and `"` in an image `alt` or
  a link `href` render as `&amp;` and `&quot;`; a link
  must be `http(s)://`, `SiteRelativeUrl` ([[content-contract]]) or a `#` anchor, else the build
  fails naming the post and the link.
- Media: `![alt](x.png|jpg|webp|svg)` becomes an `<img>` with its alt and the width and height
  read from the file (`scripts/image-size.mjs`); `![alt](x.mp4|webm)` becomes a muted, looped,
  `playsinline` `<video>` with controls, `preload="none"`, no autoplay, `aria-label` from the alt
  and the same-named webp, png or jpg poster beside it giving its size. An empty alt, a missing
  file or a clip without a poster fails the build. Each referenced file and the `image` are
  copied to `dist/blog/<slug>/` under their own names.
- Output under `dist/`: `blog/index.json` (slug, title, description, date, lang and tags of each
  published post), `blog/<slug>/body.html`, `blog/<slug>/index.html`, `blog/rss.xml` and
  `projetos/<slug>/index.html` for each project; raw Markdown is never published.
- Served heads: a post's `index.html` is the built root document with its own `<title>`,
  description, `og:title`, `og:description`, `og:image` and `twitter:image` (its `image` as an
  absolute URL on `https://marco-menezes.com`, else the default share image), `<html lang>` and
  `og:locale` from its `lang` (`pt-BR`/`pt_BR`, `en`/`en_US`, `de`/`de_DE`), and the rendered
  post in an `<article lang>` inside `#root`, replaced when the app mounts. Each project page's
  head carries the title and description of its `project.seo` in `pt.json`, the default share
  image and pt as its language; `useDocumentSeo` still sets the same fields in the browser.
- The root `index.html` names the default share image, `public/assets/share-<hash>.png`
  (1200×630, dark with one amber accent, the owner's name and title), as `og:image` and
  `twitter:image`, and links `/blog/rss.xml` as its RSS alternate.
- `blog/rss.xml` is RSS 2.0, well formed with no post: the channel is titled
  `<owner> — <blog title>` from `pt.json`'s `siteChrome`, links `/blog`, and has one item per
  published post, newest first, with title, absolute link and the same `guid`, an RFC 822
  `pubDate`, description, one `<category>` per tag and `dc:language`.
- `/blog` and `/blog/:slug` are lazy routes, present whether or not a post exists; both read
  `/blog/index.json` (no-cache), and a failed fetch reads as no post. The index lists every
  published post in every locale, in the order the index data holds them, with no sort of its
  own: the title linked to the post, the description,
  the date in the visitor's locale (`Intl.DateTimeFormat`), the post's `lang` code uppercased in
  an element carrying that `lang`, and its tags after the locale's `siteChrome.blog.tagsLabel`
  (no label when it has none). `/blog?tag=x` lists only the posts tagged `x`
  (none for an unknown tag) with a link back to `/blog`; every tag links to its filter. The
  empty index shows the locale's `siteChrome.blog.empty` text.
- `/blog/:slug` shows a back link, the title, the same meta line and the body from
  `body.html` in an `<article lang>` styled by the Tailwind typography plugin, within `PROSE`;
  `useDocumentSeo` sets its title and description. An unknown slug, or a body that fails to
  load, renders the 404 page.
- `vite.config.ts` defines `__BLOG_PUBLISHED__` as true only on `vite build` with at least one
  published post under `content/blog`; the header reads it ([[site-chrome]]).
- The tests read three fixture posts under `tests/fixtures/blog/` (a proving post with an image
  and a clip, a second post, a draft) by calling `buildBlog` in process on that folder; only the
  CLI's own contract spawns the script: exit 0 with an empty stderr, a failure's exit status 1
  with its message on stderr, a build run from a directory outside `frontend/` with absolute
  `--posts` and `--dist`, and an import that runs nothing.

## Boundaries

- One language per post, chosen by its author; the list never hides a post by the visitor's
  locale. No per-tag page, sitemap, `hreflang`, syntax highlighting or dev-server preview: a post
  is previewed with `npm run build && npm run preview`.
- Every blog string sits under `siteChrome` and its parity is [[content-contract]]'s. Hosting,
  cache and the extensionless route objects: [[deploy-infrastructure]].
