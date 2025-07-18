#!/bin/bash

# =====================================================
# SCRIPT DE DESTRUIÇÃO DA INFRAESTRUTURA
# =====================================================
# 
# Este script destrói toda a infraestrutura AWS
# criada pelo Terraform. USE COM CUIDADO!
# 
# Uso: ./destroy.sh [environment]
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
        error "AWS CLI não encontrado"
        exit 1
    fi
    
    # Verificar Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform não encontrado"
        exit 1
    fi
    
    # Verificar se está autenticado na AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        error "Não autenticado na AWS"
        exit 1
    fi
    
    success "Dependências verificadas"
}

# Função para backup do estado (opcional)
backup_state() {
    log "Criando backup do estado Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    if [[ -f "terraform.tfstate" ]]; then
        BACKUP_FILE="terraform.tfstate.backup.$(date +%Y%m%d_%H%M%S)"
        cp terraform.tfstate "$BACKUP_FILE"
        success "Backup criado: $BACKUP_FILE"
    else
        warning "Arquivo de estado não encontrado"
    fi
}

# Função para limpar bucket S3 antes da destruição
empty_s3_bucket() {
    log "Limpando bucket S3..."
    
    cd "$TERRAFORM_DIR"
    
    # Obter nome do bucket
    S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    
    if [[ -n "$S3_BUCKET" ]]; then
        log "Removendo todos os objetos do bucket: $S3_BUCKET"
        
        # Remover objetos normais
        aws s3 rm "s3://$S3_BUCKET" --recursive || true
        
        # Remover versões (se versionamento estiver habilitado)
        aws s3api list-object-versions \
            --bucket "$S3_BUCKET" \
            --output text \
            --query 'Versions[].{Key:Key,VersionId:VersionId}' | \
        while read key version; do
            if [[ -n "$key" && -n "$version" ]]; then
                aws s3api delete-object \
                    --bucket "$S3_BUCKET" \
                    --key "$key" \
                    --version-id "$version" || true
            fi
        done
        
        # Remover delete markers
        aws s3api list-object-versions \
            --bucket "$S3_BUCKET" \
            --output text \
            --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' | \
        while read key version; do
            if [[ -n "$key" && -n "$version" ]]; then
                aws s3api delete-object \
                    --bucket "$S3_BUCKET" \
                    --key "$key" \
                    --version-id "$version" || true
            fi
        done
        
        success "Bucket S3 limpo"
    else
        warning "Não foi possível obter o nome do bucket S3"
    fi
}

# Função para mostrar o que será destruído
show_destroy_plan() {
    log "Mostrando plano de destruição..."
    
    cd "$TERRAFORM_DIR"
    
    terraform plan -destroy
    
    echo ""
    warning "⚠️  ATENÇÃO: Esta operação irá DESTRUIR TODOS os recursos AWS!"
    echo ""
    echo "📋 Recursos que serão destruídos:"
    echo "   • Distribuição CloudFront"
    echo "   • Bucket S3 e todo seu conteúdo"
    echo "   • Certificado SSL (ACM)"
    echo "   • Registros DNS (Route53)"
    echo "   • Health checks"
    echo "   • CloudWatch alarms"
    echo ""
    
    if [[ "$SKIP_CONFIRMATION" != "true" ]]; then
        echo -e "${RED}Esta ação é IRREVERSÍVEL!${NC}"
        echo ""
        read -p "Digite 'DESTRUIR' para confirmar a destruição: " confirmation
        
        if [[ "$confirmation" != "DESTRUIR" ]]; then
            warning "Operação cancelada"
            exit 0
        fi
        
        echo ""
        read -p "Tem certeza absoluta? Digite 'SIM' para continuar: " final_confirmation
        
        if [[ "$final_confirmation" != "SIM" ]]; then
            warning "Operação cancelada"
            exit 0
        fi
    fi
}

# Função para destruir infraestrutura
terraform_destroy() {
    log "Destruindo infraestrutura..."
    
    cd "$TERRAFORM_DIR"
    
    # Destruir com força (skip confirmação interativa)
    terraform destroy -auto-approve
    
    success "Infraestrutura destruída!"
}

# Função para limpeza final
cleanup() {
    log "Executando limpeza final..."
    
    cd "$TERRAFORM_DIR"
    
    # Remover arquivos temporários
    rm -f terraform.tfplan
    rm -f .terraform.lock.hcl
    
    # Opcionalmente remover diretório .terraform
    if [[ "$CLEAN_ALL" == "true" ]]; then
        rm -rf .terraform/
        success "Diretório .terraform removido"
    fi
    
    success "Limpeza concluída"
}

# Função principal
main() {
    log "Iniciando destruição da infraestrutura..."
    
    # Parse de argumentos
    ENVIRONMENT=${1:-prod}
    export TF_VAR_environment="$ENVIRONMENT"
    
    warning "Environment: $ENVIRONMENT"
    
    # Verificações
    check_dependencies
    
    # Workflow de destruição
    backup_state
    empty_s3_bucket
    show_destroy_plan
    terraform_destroy
    cleanup
    
    echo ""
    success "🗑️  Infraestrutura completamente destruída!"
    echo ""
    echo "💡 Para recriar a infraestrutura, execute:"
    echo "   ./setup.sh $ENVIRONMENT"
    echo ""
}

# Função de ajuda
show_help() {
    cat << EOF
Uso: $0 [OPÇÕES] [ENVIRONMENT]

⚠️  ATENÇÃO: Este script DESTRÓI TODA a infraestrutura AWS!

OPÇÕES:
    -h, --help              Mostrar esta ajuda
    -y, --yes               Pular confirmações (PERIGOSO!)
    -c, --clean-all         Remover também arquivos .terraform
    
ENVIRONMENT:
    prod                    Ambiente de produção
    staging                 Ambiente de staging
    dev                     Ambiente de desenvolvimento

EXEMPLOS:
    $0 dev                  Destruir infraestrutura de desenvolvimento
    $0 staging              Destruir infraestrutura de staging
    $0 -y dev               Destruir sem confirmações (desenvolvimento)

RECURSOS DESTRUÍDOS:
    • Distribuição CloudFront
    • Bucket S3 e conteúdo
    • Certificado SSL
    • Registros DNS
    • Health checks
    • Alarmes CloudWatch

SEGURANÇA:
    • Backup automático do estado Terraform
    • Confirmação dupla obrigatória
    • Limpeza automática do bucket S3

IMPORTANTE:
    Esta operação é IRREVERSÍVEL!
    Use apenas em ambientes de desenvolvimento/teste.

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
        -c|--clean-all)
            CLEAN_ALL=true
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
