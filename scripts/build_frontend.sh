#!/bin/bash

set -e

echo "🏗️  Fazendo build do frontend..."

# Se estivermos na pasta scripts, vamos para a raiz
if [ "$(basename "$PWD")" = "scripts" ]; then
    cd ..
fi

# Verificar se estamos na raiz do projeto
if [ ! -d "frontend" ]; then
    echo "❌ Pasta frontend não encontrada"
    exit 1
fi

# Navegar para o frontend
cd frontend

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    exit 1
fi

# Instalar dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Fazer o build
echo "🔨 Compilando aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build falhou - index.html não foi gerado"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos gerados em: frontend/dist/"
