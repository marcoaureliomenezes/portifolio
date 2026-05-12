#!/usr/bin/env python3
"""
preview_server.py — unified local preview server for the portfolio frontend.

Usage:
    python preview_server.py [--port PORT] [--reload]

Options:
    --port PORT   Port to listen on (default: 8000)
    --reload      Enable Flask debug/auto-reload mode (development only)
"""

import argparse
import os

from flask import Flask, send_file, send_from_directory
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
FRONTEND_DIST_DIR = os.path.join(PROJECT_ROOT, 'frontend', 'dist')

app = Flask(__name__)
CORS(app)


@app.route('/')
def index() -> object:
    return send_file(os.path.join(FRONTEND_DIST_DIR, 'index.html'))


@app.route('/<path:filename>')
def serve_static(filename: str) -> object:
    file_path = os.path.join(FRONTEND_DIST_DIR, filename)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIST_DIR, filename)
    # SPA fallback: any route that is not an existing file returns index.html
    return send_file(os.path.join(FRONTEND_DIST_DIR, 'index.html')), 200


def main() -> None:
    parser = argparse.ArgumentParser(description='Portfolio local preview server')
    parser.add_argument(
        '--port',
        type=int,
        default=8000,
        help='Port to listen on (default: 8000)',
    )
    parser.add_argument(
        '--reload',
        action='store_true',
        default=False,
        help='Enable auto-reload (development mode)',
    )
    args = parser.parse_args()

    print(f"Preview server running at http://localhost:{args.port}")
    print(f"Serving: {FRONTEND_DIST_DIR}")
    if args.reload:
        print("Auto-reload enabled")

    app.run(
        host='0.0.0.0',
        port=args.port,
        debug=args.reload,
        use_reloader=args.reload,
    )


if __name__ == '__main__':
    main()
