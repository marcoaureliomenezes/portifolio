---
slug: local-servers
title: Local Flask servers
tldr: backend/ holds Flask servers that serve frontend/dist on localhost; scripts start them; nothing in CI, deploy or the frontend uses them.
summary: Three Flask scripts serve the built frontend with an index.html fallback on ports 8000 or 8001, started by hand or by build_and_serve.sh and server_manager.sh; production is the static site, and Vite's own dev and preview servers cover local work.
tags:
  - dev-tooling
  - backend
sources:
  - backend/**
  - scripts/build_and_serve.sh
  - scripts/build_frontend.sh
  - scripts/server_manager.sh
---

## What it does

A developer can serve the production build from a local Python server instead of Vite.

## Current behavior

- `backend/stable_server.py` serves `frontend/dist` on port 8000: a file when it exists, else
  `index.html`. `auto_reload_server.py` does the same after killing an old server on 8000;
  `test_server.py` serves the build on 8001 with extra static routes. CORS is open.
- `scripts/build_frontend.sh` runs `npm install` when needed and `npm run build`;
  `scripts/build_and_serve.sh` builds, then starts the stable or the auto-reload server;
  `scripts/server_manager.sh` starts, stops or reports one of them through a pid file.
- `backend/requirements.txt` lists Flask, Flask-CORS and three optional packages;
  `backend/README.md` also names a `start_server.sh` and a `setup.sh` that the folder lacks.
- No workflow, deploy step, test or frontend module calls these servers; the repo `AGENTS.md`
  names `stable_server.py` as a dev command. The frontend's own `npm run dev` and
  `npm run preview` serve on port 8080.

## Boundaries

- Production has no server process: [[deploy-infrastructure]].
