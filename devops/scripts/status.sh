#!/bin/bash

# =====================================================
# SCRIPT DE MONITORAMENTO E STATUS
# =====================================================
# 
# Este script verifica o status da infraestrutura
# e do website, fornecendo informações úteis.
# 
# Uso: ./status.sh [environment]
# =====================================================

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
TERRAFORM_DIR="$PROJECT_ROOT/devops/terraform"

# Função para logging
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

header() {
    echo -e "${CYAN}$1${NC}"
}

# Função para verificar dependências
check_dependencies() {
    local deps_ok=true
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI não encontrado"
        deps_ok=false
    fi
    
    if ! command -v terraform &> /dev/null; then
        error "Terraform não encontrado"
        deps_ok=false
    fi
    
    if ! command -v curl &> /dev/null; then
        warning "curl não encontrado (verificações HTTP limitadas)"
    fi
    
    if ! command -v jq &> /dev/null; then
        warning "jq não encontrado (output JSON limitado)"
    fi
    
    if [[ "$deps_ok" == "false" ]]; then
        exit 1
    fi
}

# Função para obter informações do Terraform
get_terraform_info() {
    header "📋 STATUS DA INFRAESTRUTURA"
    echo ""
    
    cd "$TERRAFORM_DIR"
    
    if [[ ! -f "terraform.tfstate" ]]; then
        error "Estado do Terraform não encontrado"
        echo "   Execute: ./setup.sh para criar a infraestrutura"
        return 1
    fi
    
    # Verificar se o workspace está sincronizado
    if terraform plan -detailed-exitcode &> /dev/null; then
        success "Infraestrutura sincronizada"
    else
        warning "Infraestrutura fora de sincronia"
        echo "   Execute: terraform plan para ver as diferenças"
    fi
    
    # Mostrar outputs principais
    echo ""
    log "Obtendo informações da infraestrutura..."
    
    local website_url=$(terraform output -raw website_url 2>/dev/null || echo "N/A")
    local s3_bucket=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "N/A")
    local cloudfront_id=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "N/A")
    local cloudfront_domain=$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo "N/A")
    
    echo "   Website URL: $website_url"
    echo "   S3 Bucket: $s3_bucket"
    echo "   CloudFront ID: $cloudfront_id"
    echo "   CloudFront Domain: $cloudfront_domain"
    
    # Armazenar para uso posterior
    export WEBSITE_URL="$website_url"
    export S3_BUCKET="$s3_bucket"
    export CLOUDFRONT_ID="$cloudfront_id"
    export CLOUDFRONT_DOMAIN="$cloudfront_domain"
}

# Função para verificar status do S3
check_s3_status() {
    header "🪣 STATUS DO S3"
    echo ""
    
    if [[ "$S3_BUCKET" == "N/A" ]]; then
        error "Bucket S3 não configurado"
        return 1
    fi
    
    # Verificar se o bucket existe
    if aws s3api head-bucket --bucket "$S3_BUCKET" &> /dev/null; then
        success "Bucket $S3_BUCKET existe e é acessível"
        
        # Contar objetos
        local object_count=$(aws s3 ls "s3://$S3_BUCKET" --recursive | wc -l)
        echo "   Objetos no bucket: $object_count"
        
        # Verificar versionamento
        local versioning=$(aws s3api get-bucket-versioning --bucket "$S3_BUCKET" --query 'Status' --output text 2>/dev/null || echo "Disabled")
        echo "   Versionamento: $versioning"
        
        # Verificar tamanho
        local size=$(aws s3 ls "s3://$S3_BUCKET" --recursive --summarize | grep "Total Size" | awk '{print $3 " " $4}' || echo "N/A")
        echo "   Tamanho total: $size"
        
        # Verificar se index.html existe
        if aws s3api head-object --bucket "$S3_BUCKET" --key "index.html" &> /dev/null; then
            success "index.html encontrado"
        else
            warning "index.html não encontrado"
            echo "   Execute: ./deploy.sh para fazer upload dos arquivos"
        fi
    else
        error "Bucket $S3_BUCKET não encontrado ou inacessível"
    fi
}

# Função para verificar status do CloudFront
check_cloudfront_status() {
    header "🌐 STATUS DO CLOUDFRONT"
    echo ""
    
    if [[ "$CLOUDFRONT_ID" == "N/A" ]]; then
        error "CloudFront não configurado"
        return 1
    fi
    
    # Obter informações da distribuição
    local cf_info=$(aws cloudfront get-distribution --id "$CLOUDFRONT_ID" 2>/dev/null || echo "")
    
    if [[ -n "$cf_info" ]]; then
        local status=$(echo "$cf_info" | jq -r '.Distribution.Status' 2>/dev/null || echo "N/A")
        local enabled=$(echo "$cf_info" | jq -r '.Distribution.DistributionConfig.Enabled' 2>/dev/null || echo "N/A")
        local origin_count=$(echo "$cf_info" | jq -r '.Distribution.DistributionConfig.Origins.Items | length' 2>/dev/null || echo "N/A")
        
        echo "   Status: $status"
        echo "   Habilitado: $enabled"
        echo "   Origens: $origin_count"
        echo "   Domain: $CLOUDFRONT_DOMAIN"
        
        if [[ "$status" == "Deployed" ]]; then
            success "CloudFront está operacional"
        else
            warning "CloudFront está em deployment (status: $status)"
        fi
        
        # Verificar invalidações recentes
        local invalidations=$(aws cloudfront list-invalidations --distribution-id "$CLOUDFRONT_ID" --max-items 3 2>/dev/null || echo "")
        if [[ -n "$invalidations" ]]; then
            echo ""
            log "Invalidações recentes:"
            echo "$invalidations" | jq -r '.InvalidationList.Items[]? | "   \(.Id): \(.Status)"' 2>/dev/null || echo "   Nenhuma invalidação encontrada"
        fi
    else
        error "Não foi possível obter informações do CloudFront"
    fi
}

# Função para verificar certificado SSL
check_ssl_status() {
    header "🔒 STATUS DO SSL"
    echo ""
    
    cd "$TERRAFORM_DIR"
    
    local cert_arn=$(terraform output -raw acm_certificate_arn 2>/dev/null || echo "N/A")
    
    if [[ "$cert_arn" != "N/A" ]]; then
        local cert_info=$(aws acm describe-certificate --certificate-arn "$cert_arn" 2>/dev/null || echo "")
        
        if [[ -n "$cert_info" ]]; then
            local status=$(echo "$cert_info" | jq -r '.Certificate.Status' 2>/dev/null || echo "N/A")
            local domain=$(echo "$cert_info" | jq -r '.Certificate.DomainName' 2>/dev/null || echo "N/A")
            local validation=$(echo "$cert_info" | jq -r '.Certificate.DomainValidationOptions[0].ValidationStatus' 2>/dev/null || echo "N/A")
            
            echo "   Domínio: $domain"
            echo "   Status: $status"
            echo "   Validação: $validation"
            
            if [[ "$status" == "ISSUED" ]]; then
                success "Certificado SSL válido e ativo"
            else
                warning "Certificado SSL pendente (status: $status)"
                echo "   A validação pode levar até 30 minutos"
            fi
        else
            error "Não foi possível obter informações do certificado"
        fi
    else
        error "Certificado SSL não encontrado"
    fi
}

# Função para verificar DNS
check_dns_status() {
    header "🌍 STATUS DO DNS"
    echo ""
    
    if [[ "$WEBSITE_URL" == "N/A" ]]; then
        error "URL do website não configurada"
        return 1
    fi
    
    local domain=$(echo "$WEBSITE_URL" | sed 's|https\?://||' | sed 's|/.*||')
    
    # Verificar resolução DNS
    log "Verificando resolução DNS para $domain..."
    
    if command -v dig &> /dev/null; then
        local dns_result=$(dig +short "$domain" 2>/dev/null || echo "")
        if [[ -n "$dns_result" ]]; then
            success "DNS resolvendo para: $dns_result"
        else
            error "DNS não está resolvendo"
        fi
    else
        warning "dig não disponível, pulando verificação DNS detalhada"
    fi
    
    # Verificar registros específicos
    cd "$TERRAFORM_DIR"
    local zone_id=$(terraform output -raw route53_zone_id 2>/dev/null || echo "N/A")
    
    if [[ "$zone_id" != "N/A" ]]; then
        log "Verificando registros no Route53..."
        
        local records=$(aws route53 list-resource-record-sets --hosted-zone-id "$zone_id" --query "ResourceRecordSets[?Name=='$domain.']" 2>/dev/null || echo "")
        
        if [[ -n "$records" ]] && [[ "$records" != "[]" ]]; then
            success "Registros DNS encontrados no Route53"
        else
            warning "Registros DNS não encontrados no Route53"
        fi
    fi
}

# Função para verificar conectividade do website
check_website_connectivity() {
    header "🚀 STATUS DO WEBSITE"
    echo ""
    
    if [[ "$WEBSITE_URL" == "N/A" ]]; then
        error "URL do website não configurada"
        return 1
    fi
    
    if ! command -v curl &> /dev/null; then
        warning "curl não disponível, pulando verificação de conectividade"
        return 0
    fi
    
    log "Testando conectividade com $WEBSITE_URL..."
    
    # Teste básico de conectividade
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" --max-time 10 2>/dev/null || echo "000")
    
    case $response in
        200)
            success "Website acessível (HTTP $response)"
            ;;
        403|404)
            warning "Website retornando erro $response"
            echo "   Pode estar em deployment ou com problemas de configuração"
            ;;
        000)
            error "Website inacessível (timeout ou erro de rede)"
            ;;
        *)
            warning "Website retornando código inesperado: $response"
            ;;
    esac
    
    # Teste HTTPS
    log "Verificando HTTPS..."
    local https_response=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" --max-time 10 2>/dev/null || echo "000")
    
    if [[ "$https_response" == "200" ]]; then
        success "HTTPS funcionando corretamente"
    else
        warning "HTTPS pode ter problemas (código: $https_response)"
    fi
    
    # Verificar redirecionamento HTTP -> HTTPS
    local http_url=$(echo "$WEBSITE_URL" | sed 's/https/http/')
    local redirect_response=$(curl -s -o /dev/null -w "%{http_code}" "$http_url" --max-time 10 2>/dev/null || echo "000")
    
    if [[ "$redirect_response" =~ ^30[12]$ ]]; then
        success "Redirecionamento HTTP -> HTTPS configurado"
    else
        warning "Redirecionamento HTTP -> HTTPS pode não estar funcionando"
    fi
}

# Função para mostrar resumo e recomendações
show_summary() {
    header "📊 RESUMO E RECOMENDAÇÕES"
    echo ""
    
    log "Status geral do portfólio:"
    
    if [[ "$WEBSITE_URL" != "N/A" ]]; then
        echo "   🌐 URL: $WEBSITE_URL"
    fi
    
    echo ""
    log "Próximas ações sugeridas:"
    
    # Verificar se precisa de deploy
    if [[ "$S3_BUCKET" != "N/A" ]]; then
        local last_modified=$(aws s3api head-object --bucket "$S3_BUCKET" --key "index.html" --query 'LastModified' --output text 2>/dev/null || echo "")
        if [[ -z "$last_modified" ]]; then
            echo "   📦 Execute: ./deploy.sh (primeiro deploy)"
        else
            echo "   📦 Último deploy: $last_modified"
            echo "   📦 Para atualizar: ./deploy.sh"
        fi
    fi
    
    # Verificar invalidações pendentes
    if [[ "$CLOUDFRONT_ID" != "N/A" ]]; then
        local pending_invalidations=$(aws cloudfront list-invalidations --distribution-id "$CLOUDFRONT_ID" --query 'InvalidationList.Items[?Status==`InProgress`] | length(@)' --output text 2>/dev/null || echo "0")
        if [[ "$pending_invalidations" -gt 0 ]]; then
            echo "   ⏳ $pending_invalidations invalidação(ões) em progresso"
        fi
    fi
    
    echo ""
    log "Comandos úteis:"
    echo "   ./deploy.sh          # Deploy do frontend"
    echo "   ./status.sh          # Verificar status (este script)"
    echo "   ./destroy.sh         # Destruir infraestrutura (cuidado!)"
}

# Função principal
main() {
    echo ""
    header "🔍 VERIFICAÇÃO DE STATUS DO PORTFÓLIO"
    echo ""
    
    # Parse de argumentos
    ENVIRONMENT=${1:-prod}
    export TF_VAR_environment="$ENVIRONMENT"
    
    log "Environment: $ENVIRONMENT"
    echo ""
    
    # Verificações
    check_dependencies
    
    # Status checks
    get_terraform_info || return 1
    check_s3_status
    check_cloudfront_status
    check_ssl_status
    check_dns_status
    check_website_connectivity
    show_summary
    
    echo ""
    success "Verificação de status concluída!"
    echo ""
}

# Função de ajuda
show_help() {
    cat << EOF
Uso: $0 [OPÇÕES] [ENVIRONMENT]

OPÇÕES:
    -h, --help              Mostrar esta ajuda
    
ENVIRONMENT:
    prod                    Ambiente de produção (padrão)
    staging                 Ambiente de staging
    dev                     Ambiente de desenvolvimento

VERIFICAÇÕES REALIZADAS:
    • Status da infraestrutura Terraform
    • Bucket S3 e conteúdo
    • Distribuição CloudFront
    • Certificado SSL/TLS
    • Resolução DNS
    • Conectividade do website
    • Health checks

EXEMPLOS:
    $0                      Verificar status de produção
    $0 staging              Verificar status de staging
    $0 dev                  Verificar status de desenvolvimento

DEPENDÊNCIAS:
    • AWS CLI configurado
    • Terraform instalado
    • curl (opcional, para testes HTTP)
    • jq (opcional, para parsing JSON)
    • dig (opcional, para verificação DNS)

EOF
}

# Parse de argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            ENVIRONMENT="$1"
            shift
            ;;
    esac
done

# Executar função principal
main "$ENVIRONMENT"
