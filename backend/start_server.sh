#!/bin/bash
# 🚀 Script para iniciar o servidor Flask na porta 8000 com auto-reload
# Mata qualquer processo existente e inicia o servidor limpo

set -e  # Para em caso de erro

echo "🚀 Iniciando Servidor Flask - Portfólio Marco Menezes"
echo "=================================================="

# Navega para o diretório do backend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Mata qualquer processo na porta 8000
echo "🔄 Liberando porta 8000..."
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
    fuser -k 8000/tcp 2>/dev/null || true
else
    echo "⚠️  Comandos lsof/fuser não encontrados, pulando limpeza de porta..."
fi

# Aguarda um pouco para a porta ser liberada
sleep 1

# Verifica se Python3 está disponível
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Python3 não encontrado!"
    echo "💡 Instale o Python3: sudo apt install python3"
    exit 1
fi

# Verifica se pip está disponível
if ! command -v pip3 >/dev/null 2>&1; then
    echo "❌ pip3 não encontrado!"
    echo "💡 Instale o pip: sudo apt install python3-pip"
    exit 1
fi

# Instala dependências se necessário
echo "📦 Verificando dependências..."
if [ -f "requirements.txt" ]; then
    # Detecta se está em ambiente virtual
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        echo "🔧 Ambiente virtual detectado: $VIRTUAL_ENV"
        pip3 install -r requirements.txt --quiet
    else
        pip3 install -r requirements.txt --quiet --user
    fi
    echo "✅ Dependências verificadas!"
else
    echo "⚠️  Arquivo requirements.txt não encontrado"
    echo "📦 Instalando Flask e Flask-CORS..."
    # Detecta se está em ambiente virtual
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        pip3 install Flask Flask-CORS --quiet
    else
        pip3 install Flask Flask-CORS --quiet --user
    fi
fi

echo ""
echo "🚀 Iniciando servidor Flask..."
echo "📌 Porta fixa: 8000"
echo "🔄 Estável e confiável"
echo "📱 Acesso mobile: IP local da máquina"
echo ""

# Inicia o servidor Flask estável
python3 stable_server.py

echo ""
echo "👋 Servidor finalizado!"
