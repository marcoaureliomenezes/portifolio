#!/bin/bash

set -e

echo "🚀 Configurando Pipeline de Deploy..."

# Verificar se estamos no repositório correto
if [ ! -d ".git" ]; then
    echo "❌ Este script deve ser executado na raiz do repositório Git"
    exit 1
fi

# Verificar se a pasta frontend existe
if [ ! -d "frontend" ]; then
    echo "❌ Pasta frontend não encontrada"
    exit 1
fi

# Testar build local
echo "🏗️  Testando build local..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado na pasta frontend"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Fazer build de teste
echo "🔨 Fazendo build de teste..."
npm run build

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build falhou - index.html não foi gerado"
    exit 1
fi

echo "✅ Build local bem-sucedido!"

# Voltar para raiz
cd ..

# Criar .gitmessage template
cat > .gitmessage << 'EOF'
# Tipo: Descrição curta (máximo 50 caracteres)
#
# Corpo da mensagem (opcional, máximo 72 caracteres por linha)
#
# Tipos válidos:
# feat: nova funcionalidade
# fix: correção de bug
# docs: documentação
# style: formatação, estilo
# refactor: refatoração de código
# test: testes
# chore: manutenção, build
# deploy: mudanças de deploy
#
# Exemplo:
# feat: adicionar suporte ao idioma alemão
# 
# - Criar arquivo de tradução de.ts
# - Atualizar componente Header com seletor DE
# - Adicionar tipo Deutsch ao SupportedLanguages
EOF

# Configurar template de commit
git config commit.template .gitmessage

echo "✅ Pipeline de deploy configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. 🔐 Configurar secrets no GitHub:"
echo "   Vá em Settings → Secrets and variables → Actions"
echo "   Adicione os seguintes secrets:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - CLOUDFRONT_DISTRIBUTION_ID"
echo ""
echo "2. 🌊 Workflow de uso:"
echo "   - Desenvolva em qualquer branch"
echo "   - Crie PR para main para testar build"
echo "   - Merge/push para main → Deploy automático S3"
echo ""
echo "3. 🛠️  Comandos úteis:"
echo "   - git checkout -b feature/nova-funcionalidade"
echo "   - git add . && git commit"
echo "   - git push origin feature/nova-funcionalidade"
echo "   - Criar PR no GitHub"
echo ""
echo "4. 🚀 Deploy manual (se necessário):"
echo "   - ./scripts/manual-deploy.sh"
