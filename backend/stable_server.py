#!/usr/bin/env python3
"""
Servidor Flask ULTRA-SIMPLES para porta 8000
Sem auto-reload problemático, apenas serve o frontend
"""

import os
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS

PORT = 8000

app = Flask(__name__)
CORS(app)

# Diretório do frontend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')

@app.route('/')
def index():
    return send_file(os.path.join(FRONTEND_DIR, 'index.html'))

@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory(FRONTEND_DIR, filename)
    except:
        return f"Arquivo não encontrado: {filename}", 404

if __name__ == '__main__':
    print(f"🚀 Servidor rodando em http://localhost:{PORT}")
    print(f"📁 Servindo: {FRONTEND_DIR}")
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False,           # SEM debug para evitar problemas
        use_reloader=False     # SEM reloader automático
    )
