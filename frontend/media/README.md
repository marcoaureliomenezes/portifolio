# Scene recording (developer tool)

Not part of `verify`, CI or the shipped site. Re-record a scene from nothing with one command:

```bash
frontend/media/capture.sh <project> <scene> <venv-dir>
```

Needs `uv`, `python3`, `node`, `ffmpeg`. `<venv-dir>` must be outside the repo (the script refuses otherwise).
It makes the venv, installs `pin.txt`, runs `<scene>.cmds` in an empty scratch dir with the venv first on `PATH`,
writes `<scene>.cast.json`, then runs `npm --prefix frontend run media:record -- <project> <scene>`.
`NO_RENDER=1` stops after the cast (a text-only transcript, e.g. a page's "Try it" output).
`MEDIA_DIR` overrides the directory that holds `<project>/` (default: this directory).

## Choosing commands

Choose a scene's commands after reading the pinned version's real CLI or API (`--help`, the README at the tag), never from memory.
A command that exits non-zero is still recorded; read the cast before committing it.

## Inputs, `frontend/media/<project>/`

- `pin.txt`: one line, `<pkg>==<version>`.
- `<scene>.cmds`: one command per line, run in order.
- `<scene>.cast.json`: `{ "pin": "<pkg>==<version>", "steps": [ { "cmd": "<text>", "out": "<text>" } ] }`. Real stdout and stderr of the pinned PyPI version, no timing.
- SVG scenes: `<scene>-light.svg`, `<scene>-dark.svg`.

## Cuts

`desktop`: 16:9, 640x360 viewport. `phone`: 4:5, 360x450 viewport. Device scale factor 2, mono text 13 px or larger.
Keep output lines at or under 44 characters for `phone`.

## Output names, `frontend/public/assets/projects/<project>/`

- `<scene>-<cut>-<h>.webm`, `.mp4`, `.webp` (poster); `<h>` is the first 8 hex of that file's own sha256.
- SVG: `<scene>-light-<h>.svg`, `<scene>-dark-<h>.svg`.
- A re-record deletes the scene's previous files first.

## Budgets (`record.mjs` exits non-zero above them)

webm 307200 bytes, mp4 409600, poster 61440, SVG 51200; duration 8 to 12 s at 15 fps; no audio track.
