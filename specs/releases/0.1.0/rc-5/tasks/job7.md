# Job 7 — versions rendered from `pypi.version`

Wave 4, waits on Job 6 (same `projects.ts`, locales and `rand-engine.spec.ts`). Paths are relative to the repo root. Design: PLAN §2.2 (Placeholders). Order: RED (T1), the render and schema (T2), then the content (T3), so the pages never show a raw `{tag}`. Tests are `test(J7.Tn)` commits.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J7.T1 | sr | AC4.1, AC4.2, AC4.3 | `frontend/src/lib/libraryRender.test.ts`, `frontend/src/lib/schemas/projects.test.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.test.tsx`, `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts` | RED: placeholders render to literals; one version literal per library block |
| J7.T2 | sr | AC4.1, AC4.3 | `frontend/src/lib/libraryRender.ts`, `frontend/src/lib/schemas/projects.ts`, `frontend/src/pages/projects/LibraryProjectTemplate.tsx`, `frontend/public/schema/site-content.schema.json` | the render function, `pypi.tagPrefix`, the template uses it |
| J7.T3 | jr | AC4.2, AC4.3 | `frontend/public/content/pt.json`, `frontend/public/content/en.json`, `frontend/public/content/de.json` | the 9 literals per locale become placeholders |

## Task notes

- **J7.T1.** `libraryRender.test.ts`: a fixture with `installCommand: "pip install x=={version}"`, a section `code` holding `{version}` and an item `href` `https://h.example/blob/{tag}/p` renders the literal values; with `tagPrefix: "v"` the href holds `v` + the version, and with no prefix the version alone. `projects.test.ts`: `pypi.tagPrefix` is an optional string (a number is refused); in each of the three locales, each library block's serialized JSON holds its `pypi.version` value exactly once (AC4.2). `LibraryProjectTemplate.test.tsx`: the page renders the install command, the Try-it code and the facts links with the literals. `rand-engine.spec.ts:44-46`: the install-command compare asserts the rendered literal, not `pypi.installCommand` read from the file (a named ruling in the commit: AC4.3). The tests at today's versions expect today's literals: the Try-it pin, the 8 facts links and both install commands.
- **J7.T2.** `libraryRender.ts` exports one pure function, `renderLibrary(project)`: `{version}` to `pypi.version`, `{tag}` to `(pypi.tagPrefix ?? "") + pypi.version`, applied to `pypi.installCommand`, every section `code` and every item `href`. No zod import. `LibraryProjectTemplate.tsx` calls it once on the project before it destructures. `projects.ts` adds `tagPrefix: z.string().optional()` inside `pypi`. Re-record the published file. `ProjectCard.tsx` keeps rendering `pypi.version` plain.
- **J7.T3.** Per locale, library one: `@0.4.7` in the Try-it `code` becomes `@{version}`, the four `v0.4.7` facts tags become `{tag}`, and `"tagPrefix": "v"` joins its `pypi` object; library two: its four `0.8.0` tags become `{tag}`, with no `tagPrefix`. `pypi.version` stays the source. `frontend/media/*/pin.txt` is not touched (capture-time pin, byte-equal; the reviewer diffs it).

## Definition of done

`npm --prefix frontend run verify` exits 0; `npm --prefix frontend run schema:check` exits 0; the unit files above. E2E with the PLAN §2.3 recipe (port 5304): `project-detail-library`, `rand-engine`, `library-scenes`, green on chromium. `grep -c` of each library's old version literal in each locale prints 1 (its `pypi.version` line).
