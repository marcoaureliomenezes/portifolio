#!/usr/bin/env python3
"""
🚀 Servidor Flask com Auto-Reload Inteligente
Porta 8000 fixa + auto-reload que funciona sem conflitos
"""

import os
import subprocess
import time
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS

PORT = 8000

def kill_old_servers():
    """Mata servidores antigos na porta 8000"""
    try:
        subprocess.run(['lsof', '-ti:8000'], capture_output=True, text=True)
        result = subprocess.run(['lsof', '-ti:8000'], capture_output=True, text=True)
        if result.stdout.strip():
            subprocess.run(['kill', '-9'] + result.stdout.strip().split(), capture_output=True)
            print("🔄 Servidores antigos finalizados")
            time.sleep(1)
    except:
        pass

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
    # Limpa porta apenas se não estamos no processo de reload
    if not os.environ.get('WERKZEUG_RUN_MAIN'):
        kill_old_servers()
    
    print(f"🚀 Servidor com auto-reload em http://localhost:{PORT}")
    print(f"📁 Servindo: {FRONTEND_DIR}")
    print("🔄 Auto-reload ativado - mudanças em .py serão recarregadas")
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=True,
        use_reloader=True
    )
