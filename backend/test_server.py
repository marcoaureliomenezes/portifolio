#!/usr/bin/env python3
# DEPRECATED: use preview_server.py --port 8001. Será removido em próxima release.
"""
Servidor Flask simples para testar o build do frontend na porta 8001
"""

import os
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS

PORT = 8001
FRONTEND_DIST = "../frontend/dist"

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    """Serve o index.html"""
    return send_file(os.path.join(FRONTEND_DIST, 'index.html'))

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos do frontend/dist"""
    # Se for um arquivo específico, serve diretamente
    file_path = os.path.join(FRONTEND_DIST, filename)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIST, filename)
    
    # Se não encontrar o arquivo, tenta servir do diretório correspondente
    return send_from_directory(FRONTEND_DIST, filename)

@app.route('/data/<path:filename>')
def serve_data(filename):
    """Serve arquivos JSON de dados"""
    return send_from_directory(os.path.join(FRONTEND_DIST, 'data'), filename)

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve arquivos CSS"""
    return send_from_directory(os.path.join(FRONTEND_DIST, 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve arquivos JavaScript"""
    return send_from_directory(os.path.join(FRONTEND_DIST, 'js'), filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    """Serve imagens"""
    return send_from_directory(os.path.join(FRONTEND_DIST, 'images'), filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve assets"""
    return send_from_directory(os.path.join(FRONTEND_DIST, 'assets'), filename)

if __name__ == '__main__':
    print(f"🧪 Servidor de teste iniciado em http://localhost:{PORT}")
    print(f"📁 Servindo arquivos de: {FRONTEND_DIST}")
    print("🛑 Pressione Ctrl+C para parar")
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False
    )
