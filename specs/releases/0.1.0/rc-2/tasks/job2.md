# Job 2 — the recording pipeline (developer tool)

Wave 1, waits on nothing; beside Job 1 (no shared file). Paths are relative to the repo root. No RED task: AC3.1 is a developer tool with no test (SPEC); its output is judged by Job 8's contract test and by the frames each scene job attaches. Nothing here joins `verify`, CI, `package.json` dependencies or the Lighthouse config. `frontend/media/` is outside `public/` and `src/`, so Vite ships none of it; ESLint (`**/*.{ts,tsx}`) and `tsc` (`src`) do not read it. Definition of done: `npm --prefix frontend run verify` plus the self-test below.

| task | who | AC | `W:` | outcome |
|---|---|---|---|---|
| J2.T1 | sr | AC3.1, AC3.4 | `frontend/media/terminal.html` | a static page that draws a cast at 360 CSS px, driven by `render(t)` |
| J2.T2 | sr | AC3.1, AC3.3, AC3.4 | `frontend/media/record.mjs`, `frontend/package.json` | frames, encodes, hashes and names the outputs; script `media:record` |
| J2.T3 | sr | AC3.1 | `frontend/media/capture.sh`, `frontend/media/README.md` | scripted capture of the pinned PyPI version, then the record step; the one re-record command, documented |

## The contracts the three tasks share

- **Cast** (`frontend/media/<project>/<scene>.cast.json`): `{ "pin": "<pkg>==<version>", "steps": [ { "cmd": "<text>", "out": "<text>" } ] }`. The text is the real output of the pinned PyPI version; it carries no timing, so no wall clock exists in the pipeline.
- **Project inputs** (`frontend/media/<project>/`): `pin.txt` (one line, `<pkg>==<version>`), `<scene>.cmds` (the commands, one per line, run in order in an empty scratch directory), `<scene>.cast.json`, and for an SVG scene `<scene>-light.svg` and `<scene>-dark.svg`.
- **Cuts.** Two per video scene. `desktop` is 16:9, a 640×360 viewport. `phone` is 4:5, a 360×450 viewport. Both render at device scale factor 2; terminal text is 13 px mono or larger in both, so a scene is never shown below 1:1 at 360 px. Columns per cut are the cast's line width budget: the `.cmds` author keeps output lines at or under 44 characters for `phone`.
- **Output names** (in `frontend/public/assets/projects/<project>/`): `<scene>-<cut>-<h>.webm`, `<scene>-<cut>-<h>.mp4`, `<scene>-<cut>-<h>.webp` (poster), where `<h>` is the first 8 hex of that file's own sha256 (webm and mp4 differ, so their names differ). An SVG scene writes `<scene>-light-<h>.svg` and `<scene>-dark-<h>.svg`. A re-record deletes the scene's previous files first, so nothing is orphaned.
- **Budgets** (`record.mjs` exits non-zero above them): webm 307200 bytes, mp4 409600, poster 61440, SVG 51200; duration 8 to 12 s at 15 fps; `-an`, no audio track.

## Task notes

- **J2.T1.** `terminal.html?cut=phone|desktop` loads the cast from `window.__CAST__` (set by `record.mjs` through `page.addInitScript`). `window.render(t)` draws the state at second `t`: each `cmd` types at 24 characters per second, each `out` line then appears at 10 lines per second, the last state holds. `window.duration` returns the total seconds, which `record.mjs` clamps to 8..12 by holding the last state. Dark palette, one amber prompt colour, fixed pixel font size, `overflow: hidden`, no scrollbars.
- **J2.T2.** `node media/record.mjs <project> <scene> [--cut desktop|phone] [--out <dir>]` (default: both cuts, `--out` the public project directory). It opens `terminal.html` in Playwright chromium (already a devDependency), steps `render(t)` at 15 fps into a temp directory under `os.tmpdir()`, runs `ffmpeg` for VP9 webm, H.264 `yuv420p` `+faststart` mp4, and a webp poster from the last frame, then hashes and renames them. `node media/record.mjs svg <project> <scene>` copies the two source SVGs under their hashed names. It prints one JSON object per cut, `{ "webm", "mp4", "poster", "width", "height" }` (public paths, width and height in CSS px), for the content JSON. `package.json` gains exactly `"media:record": "node media/record.mjs"`.
- **J2.T3.** `capture.sh <project> <scene> <venv-dir>` refuses a `<venv-dir>` inside the repo, makes the venv with `uv venv`, installs the line in `pin.txt` with `uv pip install`, runs the scene's `.cmds` in an empty scratch directory with that venv first on `PATH`, writes the cast, and ends with `npm --prefix frontend run media:record -- <project> <scene>`, unless `NO_RENDER=1` (a text-only transcript such as a page's "Try it" output). That one command re-records a scene from nothing. `README.md` documents it, the cast and name contracts above, the budgets, and the rule that a scene's commands are chosen after reading the pinned version's real CLI or API (`--help`, the README at the tag), never from memory.

## Hand-back evidence

- Self-test, not committed: a 3-step throwaway cast under `.dadaia/tmp/` run through `record.mjs --out <tmp dir>` for both cuts: the printed JSON, the file sizes against the budgets, the hash of each file equal to its name, and one extracted frame per cut.
- `ffmpeg -i <file>` shows no audio stream; `capture.sh` with an in-repo `<venv-dir>` exits non-zero.
- `git status --porcelain` of the repo prints nothing outside the W set (the venv and frames live outside the repo).
