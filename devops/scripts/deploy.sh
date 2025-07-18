#!/bin/bash

# =====================================================
# SCRIPT DE DEPLOYMENT DO PORTFÓLIO
# =====================================================
# 
# Este script automatiza o deployment do frontend
# para AWS S3 e invalida o cache do CloudFront.
# 
# Uso: ./deploy.sh [environment]
# =====================================================

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
TERRAFORM_DIR="$PROJECT_ROOT/devops/terraform"

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Verificar AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI não encontrado. Instale com: pip install awscli"
        exit 1
    fi
    
    # Verificar Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform não encontrado. Instale: https://developer.hashicorp.com/terraform/downloads"
        exit 1
    fi
    
    # Verificar se está autenticado na AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        error "Não autenticado na AWS. Configure com: aws configure"
        exit 1
    fi
    
    success "Todas as dependências estão OK"
}

# Função para obter outputs do Terraform
get_terraform_outputs() {
    log "Obtendo configurações do Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Verificar se a infraestrutura foi criada
    if ! terraform show &> /dev/null; then
        error "Infraestrutura não encontrada. Execute: terraform apply"
        exit 1
    fi
    
    # Obter outputs
    S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
    
    if [[ -z "$S3_BUCKET" || -z "$CLOUDFRONT_ID" ]]; then
        error "Não foi possível obter as configurações do Terraform"
        exit 1
    fi
    
    success "Configurações obtidas: Bucket=$S3_BUCKET, CloudFront=$CLOUDFRONT_ID"
}

# Função para sincronizar arquivos com S3
sync_to_s3() {
    log "Sincronizando arquivos com S3..."
    
    cd "$FRONTEND_DIR"
    
    # Verificar se o diretório frontend existe
    if [[ ! -d "$FRONTEND_DIR" ]]; then
        error "Diretório frontend não encontrado: $FRONTEND_DIR"
        exit 1
    fi
    
    # Sync com configurações otimizadas
    aws s3 sync . "s3://$S3_BUCKET" \
        --delete \
        --exact-timestamps \
        --exclude "*.DS_Store" \
        --exclude "README.md" \
        --exclude ".git*" \
        --cache-control "text/html:max-age=300,no-cache" \
        --cache-control "text/css:max-age=31536000" \
        --cache-control "application/javascript:max-age=31536000" \
        --cache-control "image/*:max-age=31536000" \
        --cache-control "application/pdf:max-age=86400"
    
    success "Arquivos sincronizados com S3"
}

# Função para invalidar cache do CloudFront
invalidate_cloudfront() {
    log "Invalidando cache do CloudFront..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    success "Invalidação criada: $INVALIDATION_ID"
    
    # Aguardar invalidação (opcional)
    if [[ "$WAIT_FOR_INVALIDATION" == "true" ]]; then
        log "Aguardando invalidação completar..."
        aws cloudfront wait invalidation-completed \
            --distribution-id "$CLOUDFRONT_ID" \
            --id "$INVALIDATION_ID"
        success "Invalidação completada"
    else
        warning "Invalidação pode levar alguns minutos para completar"
    fi
}

# Função para verificar o deployment
verify_deployment() {
    log "Verificando deployment..."
    
    if [[ -n "$WEBSITE_URL" ]]; then
        log "Testando conectividade com $WEBSITE_URL"
        
        # Teste simples de conectividade
        if curl -s -f "$WEBSITE_URL" > /dev/null; then
            success "Website acessível em: $WEBSITE_URL"
        else
            warning "Website pode levar alguns minutos para ficar disponível"
        fi
    fi
}

# Função principal
main() {
    log "Iniciando deployment do portfólio..."
    
    # Parse de argumentos
    ENVIRONMENT=${1:-prod}
    export TF_VAR_environment="$ENVIRONMENT"
    
    log "Environment: $ENVIRONMENT"
    
    # Verificações
    check_dependencies
    get_terraform_outputs
    
    # Deployment
    sync_to_s3
    invalidate_cloudfront
    verify_deployment
    
    success "Deployment completado com sucesso!"
    
    if [[ -n "$WEBSITE_URL" ]]; then
        echo ""
        echo "🚀 Seu portfólio está disponível em: $WEBSITE_URL"
        echo ""
    fi
}

# Ajuda
show_help() {
    cat << EOF
Uso: $0 [OPÇÕES] [ENVIRONMENT]

OPÇÕES:
    -h, --help              Mostrar esta ajuda
    -w, --wait              Aguardar invalidação do CloudFront completar
    
ENVIRONMENT:
    prod                    Ambiente de produção (padrão)
    staging                 Ambiente de staging
    dev                     Ambiente de desenvolvimento

EXEMPLOS:
    $0                      Deploy para produção
    $0 staging              Deploy para staging
    $0 -w prod              Deploy para produção e aguardar invalidação

REQUISITOS:
    - AWS CLI configurado
    - Terraform configurado
    - Infraestrutura criada (terraform apply)

EOF
}

# Parse de argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -w|--wait)
            WAIT_FOR_INVALIDATION=true
            shift
            ;;
        *)
            ENVIRONMENT="$1"
            shift
            ;;
    esac
done

# Executar função principal
main "$ENVIRONMENT"
