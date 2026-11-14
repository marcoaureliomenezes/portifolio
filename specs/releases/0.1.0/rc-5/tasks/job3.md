# Job 3 — blog: one order decider, the heading shift, the missing asserts

Wave 1, waits on nothing. Paths are relative to the repo root. Design: PLAN §2.2 (Heading shift). A behaviour is two tasks, RED then source. T1 is one `test(J3.T1)` commit: two partitions go red (the index keeps the data order; a body `#` renders `<h2>`) and two asserts are hardening that pass at once (the empty-tags partition of `PostMeta.tsx:16`, attribute escaping), each proved by the reviewer reverting the guard or the `escape` call and seeing it go red.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J3.T1 | sr | AC5.1, AC5.2, AC5.4, AC5.6 | `frontend/src/pages/blog/BlogIndexPage.test.tsx`, `frontend/src/pages/blog/BlogPostPage.test.tsx`, `frontend/src/lib/buildBlog.test.ts` | RED: data order kept, `#` renders `<h2>`; hardening: no-tags partition, `&` and `"` escaping |
| J3.T2 | jr | AC5.2 | `frontend/src/pages/blog/BlogIndexPage.tsx` | the page's second sort is deleted |
| J3.T3 | sr | AC5.6 | `frontend/scripts/build-blog.mjs` | a `heading` renderer shifts each level down one, capped at 6 |

## Task notes

- **J3.T1.** (a) `BlogIndexPage.test.tsx`: index data written in non-date order renders in the data order; the existing newest-first case (`:74`) stays. (b) `BlogPostPage.test.tsx`: a post whose `tags` is `[]` shows its date and language tag and no `siteChrome.blog.tagsLabel`. (c) `buildBlog.test.ts`: the assert at `:99` (`<h1>A heading</h1>`) moves to `<h2>`, and a case with `##`, `###` and `######` expects `<h3>`, `<h4>` and `<h6>`; the commit names the main-thread ruling (the `:99` assert moves under AC5.6; the operator confirmed it) and keeps the `#` partition; (d) the same file: a post with `&` and `"` in an image `alt` and in a link `href` renders `&amp;` and `&quot;` in the attribute, literal expected output, built with the file's existing `postWith` helper (no new fixture folder, so the post counts other tests pin do not move).
- **J3.T2.** Remove the sort at `BlogIndexPage.tsx:14`; the posts render in the order `dist/blog/index.json` holds, which the reader (`scripts/blog-posts.mjs`) decides. `grep -rn "sort(" frontend/src/pages/blog` prints nothing.
- **J3.T3.** Add a `heading({ tokens, depth })` entry to the `Marked` renderer in `renderBody`, emitting `<h{min(depth + 1, 6)}>` around `this.parser.parseInline(tokens)` and a newline; no attribute. Net lines: +4 at most, justified by AC5.6 (no existing line carries it). The SPA post page already owns the page's one `h1`.

## Definition of done

`npm --prefix frontend run verify` exits 0; the unit files above; `npx playwright` is not required (no served page layout changes), but the hand-back runs one `node scripts/build-blog.mjs --posts tests/fixtures/blog --dist <scratch dist>` and greps the output of the proving post for `<h1` (0 hits in `body.html`).
