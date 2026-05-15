#!/bin/bash
# setup-deployment.sh — Verificacao pre-deploy e template de commit
# Uso: bash scripts/setup-deployment.sh
# Pre-requisito: Node.js 20+ instalado.

set -e

echo "Configurando ambiente de desenvolvimento..."

# Verificar se estamos na raiz do repositorio
if [ ! -d ".git" ]; then
    echo "ERRO: Execute este script na raiz do repositorio Git." >&2
    exit 1
fi

# Verificar se a pasta frontend existe
if [ ! -d "frontend" ]; then
    echo "ERRO: Pasta frontend nao encontrada." >&2
    exit 1
fi

# Testar build local
echo "Testando build local..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "ERRO: package.json nao encontrado em frontend/." >&2
    exit 1
fi

# Instalar dependencias se necessario
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

echo "Fazendo build de teste..."
npm run build

if [ ! -f "dist/index.html" ]; then
    echo "ERRO: Build falhou — dist/index.html nao foi gerado." >&2
    exit 1
fi

echo "Build local ok."

cd ..

# Template de commit (Conventional Commits)
cat > .gitmessage << 'EOF'
# Tipo(escopo): descricao curta
#
# Tipos validos: feat, fix, docs, style, refactor, test, chore, ci, perf, build, revert
# Exemplo: feat(header): adicionar seletor de idioma
#
# Corpo opcional (limite 72 chars por linha)
EOF

git config commit.template .gitmessage

echo ""
echo "Setup concluido. Proximos passos:"
echo ""
echo "1. Desenvolvimento local:"
echo "   cd frontend && npm run dev   # Vite HMR em localhost:5173"
echo ""
echo "2. Criar feature branch:"
echo "   git checkout -b feature/<slug>"
echo "   git push origin feature/<slug>"
echo "   # Abrir PR para develop no GitHub"
echo ""
echo "3. Deploy:"
echo "   Merge para develop  -> deploy automatico para stage (stage.marco-menezes.com)"
echo "   Merge para main     -> deploy para prod (aprovacao manual obrigatoria)"
echo ""
echo "Autenticacao AWS e exclusivamente via OIDC no GitHub Actions."
echo "Nenhuma chave estatica necessaria. Vide README.md para detalhes."
