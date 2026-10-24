# Job 8 — the dadaia-workspace page, the contract test, the orphans

Wave 5, waits on Job 5 (its scenes) and Job 7 (the locale files and rand-engine's assets). Paths are relative to the repo root. Order: T1-T2 (DELETE), T3-T4 (RED), then the content. Rulings the `test(...)` commits cite: **R-T** operator test ruling (the two orphan snapshot PNGs go) and **R-M** main-thread assert-move ruling (stale claim literals; none other). Definition of done: `npm --prefix frontend run verify`, `validate:content`, `schema:check`, and local chromium runs of `library-scenes.spec.ts`, `project-detail-library.spec.ts`, `rand-engine.spec.ts`, `index.spec.ts`, `i18n-projects.spec.ts`, `a11y-projects.spec.ts`, reporting counts.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J8.T1 | jr | AC3.2 | `frontend/tests/e2e/pages/email-modal-dark-mode.spec.ts-snapshots/**` | the two orphan PNGs deleted (R-T) |
| J8.T2 | jr | AC3.2, AC3.7 | `frontend/public/assets/projects/dadaia-workspace/architecture-light.svg`, `frontend/public/assets/projects/dadaia-workspace/architecture-dark.svg`, `frontend/public/assets/projects/dadaia-workspace/cover.svg`, `frontend/public/assets/projects/dadaia-workspace/workspace-panel-01.webp`, `frontend/public/assets/projects/dadaia-workspace/workspace-panel-02.webp`, `frontend/public/assets/projects/dadaia-workspace/logo.svg`, `frontend/public/assets/projects/dadaia-workspace/diagram.svg`, the two unreferenced games SVGs under `frontend/public/assets/projects/` (named in the brief) | the seven dadaia-workspace and two games files deleted |
| J8.T3 | sr | AC3.2, AC3.3, AC3.4, AC3.5, AC3.7, AC6.1 | `frontend/src/lib/contentAssets.test.ts` | RED: the content-assets contract test |
| J8.T4 | sr | AC3.6 | `frontend/tests/e2e/projects-cluster/library-scenes.spec.ts` | E2E: the 8 scenes on both pages, 1440 and 360 px, motion and reduced motion |
| J8.T5 | sr | AC5.1, AC5.2, AC5.3, AC5.4, AC5.5 | `frontend/public/content/en.json` | the dadaia-workspace item, en, from the pinned tag |
| J8.T6 | jr | AC5.1, AC5.2, AC5.4 | `frontend/public/content/pt.json` | the item in pt |
| J8.T7 | jr | AC5.1, AC5.2, AC5.4 | `frontend/public/content/de.json` | the item in de |

## The contract test (J8.T3, AC3.2 to AC3.7, the one home for asset rules)

`contentAssets.test.ts` reads the 3 locale files, `public/assets/projects/**`, `src/**` and `index.html`. It asserts, with literal expectations: every `/assets/...` path in the content, in `src/**` and in `index.html` exists under `public/` (AC3.7); every file under `public/assets/projects/` is referenced by a content file (AC3.2); every `rand-engine` and `dadaia-workspace` media file is named `^[a-z0-9-]+-[0-9a-f]{8}\.(webm|mp4|webp|svg)$` and the 8 hex equal the first 8 of the file's sha256; webm <= 307200, mp4 <= 409600, poster <= 61440, svg <= 51200 bytes, mp4 duration 8 to 12 s from `mvhd`, no audio track (no `soun` handler in the mp4, no `A_` audio codec id in the webm) (AC3.3); each svg has `viewBox` width <= 360 and every `font-size` >= 12 (AC3.4); each svg with `@keyframes` or `<animate` carries `prefers-reduced-motion: reduce` (AC3.5). It is RED until the dadaia content lands (T5-T7) and the nine files are gone (T2); it must stay green after. Measure `npm --prefix frontend run test:run` before and after and report the delta; it must not exceed one `verify` run (AC6.1).

## The item (J8.T5)

- **Pin.** `pypi.version` is the PyPI latest on recording day, equal to Job 5's `pin.txt` (`0.4.7` today, git tag `v0.4.7`). `pypi.installCommand` is the one the tag's README documents (`uvx dadaia-workspace init <dir> --harness <name>`, `README.md:62-63`), so PC-E2E-06 keeps its assert and is not edited. The page states only what that PyPI version ships.
- **Fields.** As Job 7: `card.cover` the `init-workspace` desktop poster; `hero.tagline`; `hero.media` the `init-workspace` entry; `meta`; `links` (the Homepage route `/projetos/dadaia-workspace` stays); project-level `diagram*` and `stat` removed.
- **Sections.** Scenes in order: `demand-to-merge` (svg), `gate-refuses` (video), `six-harnesses` (svg); then `try` (`code` = the pin's first command, Job 5's `try-it` cast), `why`, `facts` (items with `href` = `…/blob/v0.4.7/<path>`; the harness list at `README.md:35`; the persona files under `dadaia_workspace/public/agents/` counted from the tag). A role count appears only if read from the tag.
- **Removed text** (AC5.4, 3 locales, scenes included): `0.5.0`, `0.1.5`, `worktree pause`, `worktree resume`, `export --hard`, `init --from`, `context activate`, `5 agent roles`, the four-role diagrams, `workspace-panel-01.webp`. This reverses rc-1's 0.5.0 copy by the SPEC's ruling that the page states only what PyPI serves.
- **AC5.5.** Stage shows `0.4.7` after the rc PR merges into develop: the main thread's act with the evidence of AC4.7; this item is what stage serves.
- **Commit body.** `claim | file:line at v0.4.7`, one row per sentence, fact row and caption.

## Task notes

- **J8.T4.** For `/projetos/rand-engine` and `/projetos/dadaia-workspace` at 1440×900 and 360×800: without reduced motion, each video scene has `muted`, `loop`, `playsinline`, a `poster` with `width` and `height`, and sources webm then mp4, and is mounted only after scrolling it into view; each svg scene is an image that has loaded (`naturalWidth` > 0); each scene has an accessible name equal to its content `alt`; `document.documentElement.scrollWidth` is at most `innerWidth` at 360. With `reducedMotion: 'reduce'` emulation: no `<video>` element exists and each scene shows an image with the same `alt`. The scene count is read from the content, expected 4 per page.
- **J8.T1 / J8.T2.** Pure deletions; `project-detail-games.spec.ts`'s negative slug assert stays untouched and green.
- **J8.T6 / J8.T7.** As Job 7: language-neutral values are byte-identical to en.

## Hand-back evidence

- The AC5.4 grep over the 3 files and `frontend/media/dadaia-workspace`, hit count 0; `git grep -n 'architecture-light\|workspace-panel\|cover.webp' frontend` has no live reference.
- `git ls-files frontend/public/assets/projects | wc -l` and the contract test's green output; the revert check: delete one hashed file's byte and the test goes red.
- Screenshots of both pages at 1440 and 360 px (one 360×800 shot per scene) after a server restart; the "Try it" command run in an empty directory with exit code and output; every facts link opened with its status.
- The `test:run` delta, measured, with its source command.
