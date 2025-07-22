#!/bin/bash
# deploy_frontend.sh - Script para fazer deploy do frontend para o bucket S3
# Uso: ./deploy_frontend.sh [nome-do-bucket]

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
DIST_DIR="$FRONTEND_DIR/dist"
S3_BUCKET=${1:-""}

# Função para obter nome do bucket do Terraform
get_bucket_from_terraform() {
    if [ -d "$TERRAFORM_DIR" ]; then
        cd "$TERRAFORM_DIR"
        BUCKET_NAME=$(terraform output -raw website_bucket_name 2>/dev/null)
        if [ -n "$BUCKET_NAME" ]; then
            echo "$BUCKET_NAME"
            return 0
        fi
    fi
    return 1
}

# Função para fazer deploy do frontend
deploy_frontend() {
    echo -e "${GREEN}🚀 Fazendo deploy do frontend para o bucket S3...${NC}"
    
    # Tentar obter bucket do Terraform se não foi especificado
    if [ -z "$S3_BUCKET" ]; then
        echo -e "${BLUE}🔍 Tentando obter nome do bucket do Terraform...${NC}"
        S3_BUCKET=$(get_bucket_from_terraform)
        
        if [ -z "$S3_BUCKET" ]; then
            echo -e "${RED}❌ Nome do bucket não especificado e não foi possível obter do Terraform${NC}"
            echo -e "${YELLOW}Uso: $0 [nome-do-bucket]${NC}"
            echo -e "${YELLOW}Ou execute o Terraform primeiro para criar a infraestrutura${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Bucket encontrado: $S3_BUCKET${NC}"
        fi
    fi
    
    # Verificar se o diretório dist existe
    if [ ! -d "$DIST_DIR" ]; then
        echo -e "${RED}❌ Diretório dist não encontrado: $DIST_DIR${NC}"
        echo -e "${YELLOW}Execute 'npm run build' no diretório frontend primeiro${NC}"
        exit 1
    fi
    
    # Verificar se o AWS CLI está instalado
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não está instalado. Por favor, instale-o primeiro.${NC}"
        exit 1
    fi
    
    # Verificar se está autenticado na AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não está configurado. Execute 'aws configure' primeiro.${NC}"
        exit 1
    fi
    
    # Fazer upload dos arquivos para o bucket S3
    echo -e "${GREEN}📤 Sincronizando arquivos com o bucket S3: $S3_BUCKET${NC}"
    aws s3 sync "$DIST_DIR" "s3://$S3_BUCKET" --delete --exact-timestamps
    
    # Verificar se o upload foi bem-sucedido
    if [ $? -eq 0 ]; then
        # Tentar obter URL do website do Terraform
        WEBSITE_URL=""
        if [ -d "$TERRAFORM_DIR" ]; then
            cd "$TERRAFORM_DIR"
            WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null)
        fi
        
        echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
        
        # Tentar obter URLs do Terraform
        WEBSITE_URL=""
        CUSTOM_DOMAIN_URL=""
        if [ -d "$TERRAFORM_DIR" ]; then
            cd "$TERRAFORM_DIR"
            WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null)
            CUSTOM_DOMAIN_URL=$(terraform output -raw custom_domain_url 2>/dev/null)
        fi
        
        if [ -n "$CUSTOM_DOMAIN_URL" ]; then
            echo -e "${BLUE}🌐 URL do domínio customizado: $CUSTOM_DOMAIN_URL${NC}"
        fi
        
        if [ -n "$WEBSITE_URL" ]; then
            echo -e "${BLUE}🔗 URL direta do S3: $WEBSITE_URL${NC}"
        else
            echo -e "${BLUE}🪣 Bucket: $S3_BUCKET${NC}"
            echo -e "${YELLOW}Para obter as URLs, execute: terraform output${NC}"
        fi
    else
        echo -e "${RED}❌ Erro ao fazer deploy para o bucket S3${NC}"
        exit 1
    fi
}

# Executar a função principal
deploy_frontend
