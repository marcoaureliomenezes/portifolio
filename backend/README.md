# Backend — Local Preview Server

This directory contains the local preview server for the portfolio frontend.

## Usage

```bash
# Default: port 8000, no reload
python preview_server.py

# Custom port
python preview_server.py --port 8001

# With auto-reload (development)
python preview_server.py --port 8000 --reload
```

The server:
- Serves `frontend/dist/` as the static root
- Returns `index.html` (HTTP 200) for any route that is not an existing file (SPA fallback)
- Enables CORS for local development

## Setup

```bash
# Create a virtual environment (from the project root)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Build the frontend first
cd frontend && npm ci && npm run build && cd ..

# Start the preview server
python backend/preview_server.py
```

Access at `http://localhost:8000`.

## Deprecated servers

`auto_reload_server.py`, `stable_server.py`, and `test_server.py` are kept for reference
but are superseded by `preview_server.py`. They will be removed in a future release.

## Playwright / testing

Install Playwright browsers separately if running E2E tests:

```bash
pip install playwright
playwright install chromium
```

## Notes

- This server is **local only**. It is not intended for production deployment.
- No Gunicorn or production WSGI server is included — this is a static SPA with no server-side logic.
