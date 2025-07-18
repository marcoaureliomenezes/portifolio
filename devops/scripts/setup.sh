#!/bin/bash

# =====================================================
# SCRIPT DE SETUP DA INFRAESTRUTURA
# =====================================================
# 
# Este script automatiza a criação inicial da 
# infraestrutura AWS usando Terraform.
# 
# Uso: ./setup.sh [environment]
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

# Função para verificar configuração
check_configuration() {
    log "Verificando configuração..."
    
    cd "$TERRAFORM_DIR"
    
    # Verificar se terraform.tfvars existe
    if [[ ! -f "terraform.tfvars" ]]; then
        warning "Arquivo terraform.tfvars não encontrado"
        
        if [[ -f "terraform.tfvars.example" ]]; then
            log "Copiando exemplo de configuração..."
            cp terraform.tfvars.example terraform.tfvars
            
            echo ""
            echo "📝 CONFIGURAÇÃO NECESSÁRIA:"
            echo "   Edite o arquivo terraform.tfvars com suas configurações:"
            echo "   - domain_name: seu domínio registrado"
            echo "   - aws_region: região AWS de sua preferência"
            echo ""
            echo "   Arquivo: $TERRAFORM_DIR/terraform.tfvars"
            echo ""
            
            read -p "Pressione ENTER após configurar o arquivo terraform.tfvars..."
        else
            error "Arquivo de exemplo não encontrado"
            exit 1
        fi
    fi
    
    success "Configuração verificada"
}

# Função para inicializar Terraform
terraform_init() {
    log "Inicializando Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Inicializar
    terraform init
    
    success "Terraform inicializado"
}

# Função para validar configuração
terraform_validate() {
    log "Validando configuração do Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Validar sintaxe
    terraform validate
    
    # Formatar código
    terraform fmt -recursive
    
    success "Configuração validada"
}

# Função para planejar alterações
terraform_plan() {
    log "Planejando alterações..."
    
    cd "$TERRAFORM_DIR"
    
    # Criar plano
    terraform plan -out=tfplan
    
    success "Plano criado"
    
    echo ""
    echo "📋 REVISÃO DO PLANO:"
    echo "   Revise as alterações acima antes de aplicar"
    echo "   O plano foi salvo em: tfplan"
    echo ""
    
    if [[ "$SKIP_CONFIRMATION" != "true" ]]; then
        read -p "Deseja aplicar estas alterações? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            warning "Operação cancelada pelo usuário"
            exit 0
        fi
    fi
}

# Função para aplicar alterações
terraform_apply() {
    log "Aplicando alterações..."
    
    cd "$TERRAFORM_DIR"
    
    # Aplicar plano
    terraform apply tfplan
    
    success "Infraestrutura criada com sucesso!"
    
    # Remover arquivo de plano
    rm -f tfplan
}

# Função para mostrar outputs
show_outputs() {
    log "Mostrando informações da infraestrutura..."
    
    cd "$TERRAFORM_DIR"
    
    echo ""
    echo "🏗️  INFRAESTRUTURA CRIADA:"
    terraform output -json | jq -r '
        to_entries[] | 
        "   \(.key): \(.value.value)"
    ' 2>/dev/null || terraform output
    
    echo ""
    success "Setup completado!"
    
    echo ""
    echo "🚀 PRÓXIMOS PASSOS:"
    echo "   1. Aguarde a validação do certificado SSL (pode levar até 30 minutos)"
    echo "   2. Execute o deploy: ./scripts/deploy.sh"
    echo "   3. Acesse seu portfólio pelo domínio configurado"
    echo ""
}

# Função para verificar pré-requisitos AWS
check_aws_prerequisites() {
    log "Verificando pré-requisitos AWS..."
    
    # Obter informações da conta
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region)
    
    log "Conta AWS: $ACCOUNT_ID"
    log "Região: $REGION"
    
    # Verificar se o domínio está no Route53 (opcional)
    if [[ -n "$DOMAIN_NAME" ]]; then
        log "Verificando domínio no Route53..."
        
        if aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN_NAME.']" --output text | grep -q "$DOMAIN_NAME"; then
            success "Domínio $DOMAIN_NAME encontrado no Route53"
        else
            warning "Domínio $DOMAIN_NAME não encontrado no Route53"
            echo "   Certifique-se de que o domínio está configurado no Route53"
            echo "   Ou configure a variável 'domain_name' corretamente"
        fi
    fi
}

# Função principal
main() {
    log "Iniciando setup da infraestrutura..."
    
    # Parse de argumentos
    ENVIRONMENT=${1:-prod}
    export TF_VAR_environment="$ENVIRONMENT"
    
    log "Environment: $ENVIRONMENT"
    
    # Verificações
    check_dependencies
    check_configuration
    check_aws_prerequisites
    
    # Terraform workflow
    terraform_init
    terraform_validate
    terraform_plan
    terraform_apply
    show_outputs
}

# Função de ajuda
show_help() {
    cat << EOF
Uso: $0 [OPÇÕES] [ENVIRONMENT]

OPÇÕES:
    -h, --help              Mostrar esta ajuda
    -y, --yes               Pular confirmações (não recomendado)
    
ENVIRONMENT:
    prod                    Ambiente de produção (padrão)
    staging                 Ambiente de staging
    dev                     Ambiente de desenvolvimento

EXEMPLOS:
    $0                      Setup da infraestrutura de produção
    $0 staging              Setup da infraestrutura de staging
    $0 -y prod              Setup sem confirmações

PRÉ-REQUISITOS:
    - AWS CLI configurado (aws configure)
    - Terraform instalado
    - Domínio registrado e configurado no Route53
    - Arquivo terraform.tfvars configurado

WORKFLOW COMPLETO:
    1. ./setup.sh           # Criar infraestrutura
    2. ./deploy.sh          # Deploy do frontend
    3. Acessar o website    # https://seudominio.com

EOF
}

# Parse de argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -y|--yes)
            SKIP_CONFIRMATION=true
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
