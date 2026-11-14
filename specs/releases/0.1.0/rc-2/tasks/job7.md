# Job 7 — the rand-engine page tells the truth

Wave 4, waits on Job 4 (its scenes) and Job 6 (the template). Writes the three locale files, so it runs before Job 8, which also writes them. Paths are relative to the repo root. Order: T1 (test), T2 (DELETE), then the content. Rulings the `test(...)` commit cites: **R-T** operator test ruling (the `0.6.4` literal at `rand-engine.spec.ts:43`) and **R-M** main-thread assert-move ruling (stale claim literals). Definition of done: `npm --prefix frontend run verify` (which runs `check:i18n-projects`), `npm --prefix frontend run validate:content`, `npm --prefix frontend run schema:check`, and local chromium runs of `rand-engine.spec.ts`, `project-detail-library.spec.ts`, `index.spec.ts`, `i18n-projects.spec.ts`, `a11y-projects.spec.ts`, reporting counts.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J7.T1 | sr | AC4.1 | `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts` | RE-E2E-02 reads the expected version from the content item; stale literals gone (R-T, R-M) |
| J7.T2 | jr | AC3.2, AC3.7 | `frontend/public/assets/projects/rand-engine/cover.webp`, `frontend/public/assets/projects/rand-engine/architecture-light.svg`, `frontend/public/assets/projects/rand-engine/architecture-dark.svg` | the three stable-name files deleted |
| J7.T3 | sr | AC4.1, AC4.2, AC4.3, AC4.4, AC4.5, AC4.6, AC4.7 | `frontend/public/content/en.json` | the rand-engine item, en, from the pinned tag |
| J7.T4 | jr | AC4.1, AC4.2, AC4.4, AC4.6 | `frontend/public/content/pt.json` | the item in pt, mirroring en |
| J7.T5 | jr | AC4.1, AC4.2, AC4.4, AC4.6 | `frontend/public/content/de.json` | the item in de, mirroring en |

## The item (J7.T3; shape of Job 3, composition of Job 6)

- **Pin.** `pypi.version` is the PyPI latest read on recording day, equal to Job 4's `pin.txt`; the tag is `0.8.0` (no `v`); `pypi.package` `rand-engine`; `pypi.installCommand` the one the tag's README documents. If the pin moved after Job 4 recorded, stop: Job 4 re-records first (AC4.1: every recording ran that version).
- **Fields.** `card.cover` is the hero loop's desktop poster path (a hashed `.webp`); `card.summary` and `card.tech` rewritten from the tag; `hero.title`, `hero.tagline` (the one-line purpose), `hero.media` (the `spec-to-dataframe` entry printed by Job 4's `media:record`); `links.repo`, `links.pypi`, `links.docs` (the docs root or the API reference only, AC4.5). The project-level `diagram`, `diagramDark`, `diagramAlt` and the `stat` are removed.
- **Sections** (ids fixed by Job 6): three scenes in this order, each `title`, a `body` of two sentences, `media` — `related-tables` (svg pair), `event-stream` (svg pair), `files-in-parts` (the printed video entry) — then `try` (`title`, `code` = Job 4's `try-it.py` byte for byte), `why`, and `facts` whose `items` are `{ label, value, href }` with `href` = `https://github.com/<owner>/rand-engine/blob/0.8.0/<path>`. Scene `alt` and `caption` are written for a reader who cannot see the animation.
- **What may be said.** Everything traces to `frontend/media/rand-engine/claims.md` or to a row read for this task. Version-dependent facts (version, Python and pandas ranges, benchmarks) appear only in the version meta and the facts table, never in prose or scene text. The facts table also carries the language and license rows, read from the tag's `pyproject.toml` (`requires-python`, `license`), each linked to that file at the tag. Performance comes only from `docs/BENCHMARKS.md` at the tag; Spark speed is not featured; a test count or spec count appears only if read from the tag; a Faker comparison only if sourced at the tag (`docs/comparison.md`).
- **Removed text** (AC4.6, none may remain in the item or its scenes, 3 locales): `0.6.4`, `0.6.3`, `DuckDB`, `.generate(`, `partitioned`, `.stream()`, `dict / JSON schema`, `12K`, `132K`, `5.1M`, `494`, `17+`, `20+`.
- **Commit body.** The table `claim | file:line at the tag`, one row per sentence, fact row and scene caption, each source `<path>@0.8.0`.

## Task notes

- **J7.T1.** The expected version comes from reading `public/content/en.json` in the spec (`projectsV2.list` item `slug` `rand-engine`, `pypi.version`) and is compared with `library-version`; the install-command assert (`pip install rand-engine`) is read from the same item. The facts heading shows the same version. `project-section` count and the card kind/install asserts (`:23-24`, `:45`) keep their form. Other asserts do not change.
- **J7.T4 / J7.T5.** Language-neutral values (paths, sizes, `code`, `href`, versions) are byte-identical to en; only `title`, `body`, `alt`, `caption`, `tagline`, `summary`, `seo` and labels are translated. `check:i18n-projects` is the parity check.
- A bare `<tag>` in the docs links is never `main`: every source link is pinned.

## Hand-back evidence

- The AC4.6 grep with its hit count over the 3 files and `frontend/media/rand-engine` (0); `git grep -n 'rand-engine' frontend/public/content` shows no reference to a deleted asset.
- `try-it` text equals Job 4's `try-it.py`: a `diff` printed; the page's printed output equals `try-it.cast.json`'s `out`.
- Screenshots of `/projetos/rand-engine` at 1440 and 360 px (a 360×800 shot of each scene), after a server restart.
- Every facts link opened with its HTTP status; the measured `test:run` is unchanged by this job.
