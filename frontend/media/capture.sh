#!/usr/bin/env bash
# Usage: capture.sh <project> <scene> <venv-dir>   (NO_RENDER=1 skips the record step)
# MEDIA_DIR overrides the directory holding <project>/ (default: this script's directory).
set -euo pipefail

[ "$#" -eq 3 ] || { echo "usage: capture.sh <project> <scene> <venv-dir>" >&2; exit 2; }
project=$1 scene=$2 venv=$3

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
media=${MEDIA_DIR:-$here}
dir=$media/$project

venv=$(python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "$venv")
case "$venv/" in
  "$repo"/*) echo "capture.sh: venv-dir must be outside the repo ($repo)" >&2; exit 2 ;;
esac

pin=$(head -n 1 "$dir/pin.txt")
[ -f "$dir/$scene.cmds" ] || { echo "capture.sh: missing $dir/$scene.cmds" >&2; exit 2; }

uv venv "$venv"
VIRTUAL_ENV=$venv uv pip install "$pin"

scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

# Each command runs in the empty scratch dir, venv first on PATH; stdout+stderr are kept verbatim.
cd "$scratch"
PATH="$venv/bin:$PATH" VIRTUAL_ENV=$venv python3 -c '
import json, subprocess, sys
pin, cmds, out = sys.argv[1:4]
steps = []
for cmd in open(cmds).read().splitlines():
    if not cmd.strip():
        continue
    r = subprocess.run(cmd, shell=True, executable="/bin/bash", text=True,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    steps.append({"cmd": cmd, "out": r.stdout.rstrip("\n")})
with open(out, "w") as f:
    json.dump({"pin": pin, "steps": steps}, f, indent=2, ensure_ascii=False)
    f.write("\n")
' "$pin" "$dir/$scene.cmds" "$dir/$scene.cast.json"

[ "${NO_RENDER:-}" = 1 ] || npm --prefix "$repo/frontend" run media:record -- "$project" "$scene"
