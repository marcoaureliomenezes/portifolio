#!/bin/bash

set -e

echo "🚀 Deploy Manual para S3..."

# Verificar se estamos na raiz do projeto
if [ ! -d "frontend" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se as variáveis AWS estão configuradas
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Credenciais AWS não configuradas"
    echo "💡 Configure as variáveis:"
    echo "   export AWS_ACCESS_KEY_ID=sua_access_key"
    echo "   export AWS_SECRET_ACCESS_KEY=sua_secret_key"
    echo "   export CLOUDFRONT_DISTRIBUTION_ID=sua_distribution_id (opcional)"
    exit 1
fi

# Navegar para frontend
cd frontend

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build
echo "🏗️  Fazendo build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build falhou"
    exit 1
fi

echo "✅ Build concluído"

# Deploy para S3
echo "📤 Enviando arquivos para S3..."
aws s3 sync dist/ s3://marco-menezes.com --delete --exact-timestamps --region sa-east-1

echo "✅ Deploy S3 concluído"

# Invalidar CloudFront se a variável estiver definida
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidando cache CloudFront..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --region us-east-1 \
        --query 'Invalidation.Id' \
        --output text
    echo "✅ Cache CloudFront invalidado"
else
    echo "⚠️  CLOUDFRONT_DISTRIBUTION_ID não configurado - cache não invalidado"
fi

echo ""
echo "🎉 Deploy manual concluído com sucesso!"
echo "🌐 Site: https://marco-menezes.com"
