#!/bin/bash
# deploy_complete.sh - Script completo para build e deploy do portfólio
# Uso: ./deploy_complete.sh [--init] [--force] [--dry-run]

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

# Flags
INIT_TERRAFORM=false
FORCE_DEPLOY=false
DRY_RUN=false

# Processar argumentos
for arg in "$@"; do
    case $arg in
        --init)
            INIT_TERRAFORM=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Uso: $0 [--init] [--force] [--dry-run]"
            echo ""
            echo "Opções:"
            echo "  --init     Inicializa/reinicializa o Terraform"
            echo "  --force    Force o deploy mesmo se não houver mudanças"
            echo "  --dry-run  Executa sem fazer mudanças reais"
            echo "  --help     Mostra esta ajuda"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Argumento inválido: $arg${NC}"
            echo "Use --help para ver as opções disponíveis"
            exit 1
            ;;
    esac
done

# Função para verificar dependências
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependências...${NC}"
    
    # Verificar Node.js e npm
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Node.js/npm não encontrado. Por favor, instale primeiro.${NC}"
        exit 1
    fi
    
    # Verificar Terraform
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform não encontrado. Por favor, instale primeiro.${NC}"
        exit 1
    fi
    
    # Verificar AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não encontrado. Por favor, instale primeiro.${NC}"
        exit 1
    fi
    
    # Verificar se está autenticado na AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não está configurado. Execute 'aws configure' primeiro.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Todas as dependências estão disponíveis${NC}"
}

# Função para fazer build do frontend
build_frontend() {
    echo -e "${BLUE}🏗️ Fazendo build do frontend...${NC}"
    
    cd "$FRONTEND_DIR" || exit 1
    
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependências...${NC}"
        if [ "$DRY_RUN" = false ]; then
            npm install
        fi
    fi
    
    # Fazer build
    echo -e "${YELLOW}⚙️ Executando build...${NC}"
    if [ "$DRY_RUN" = false ]; then
        npm run build
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro no build do frontend${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Build do frontend concluído${NC}"
}

# Função para gerenciar infraestrutura Terraform
manage_infrastructure() {
    echo -e "${BLUE}🏗️ Gerenciando infraestrutura...${NC}"
    
    cd "$TERRAFORM_DIR" || exit 1
    
    # Inicializar Terraform se solicitado
    if [ "$INIT_TERRAFORM" = true ]; then
        echo -e "${YELLOW}🔧 Inicializando Terraform...${NC}"
        if [ "$DRY_RUN" = false ]; then
            terraform init -reconfigure
        fi
    fi
    
    # Verificar e aplicar mudanças
    echo -e "${YELLOW}📋 Verificando mudanças na infraestrutura...${NC}"
    if [ "$DRY_RUN" = false ]; then
        terraform plan -out=tfplan
        
        # Verificar se há mudanças
        if terraform show -json tfplan | jq -e '.planned_values.root_module.resources | length > 0' > /dev/null 2>&1; then
            echo -e "${YELLOW}📦 Aplicando mudanças na infraestrutura...${NC}"
            terraform apply tfplan
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Erro ao aplicar mudanças na infraestrutura${NC}"
                exit 1
            fi
        else
            echo -e "${GREEN}✅ Nenhuma mudança necessária na infraestrutura${NC}"
        fi
        
        # Limpar arquivo de plan
        rm -f tfplan
    fi
    
    # Obter nome do bucket
    BUCKET_NAME=$(terraform output -raw website_bucket_name 2>/dev/null)
    if [ -z "$BUCKET_NAME" ]; then
        echo -e "${RED}❌ Não foi possível obter o nome do bucket S3${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Infraestrutura pronta. Bucket: $BUCKET_NAME${NC}"
}

# Função para fazer deploy do frontend
deploy_frontend() {
    echo -e "${BLUE}🚀 Fazendo deploy do frontend...${NC}"
    
    # Verificar se o build existe
    if [ ! -d "$DIST_DIR" ]; then
        echo -e "${RED}❌ Diretório de build não encontrado: $DIST_DIR${NC}"
        exit 1
    fi
    
    # Sincronizar com S3
    echo -e "${YELLOW}📤 Sincronizando arquivos com S3...${NC}"
    if [ "$DRY_RUN" = false ]; then
        aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" --delete --exact-timestamps
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro ao fazer deploy para S3${NC}"
            exit 1
        fi
        
        # Obter URLs do website
        WEBSITE_URL=$(cd "$TERRAFORM_DIR" && terraform output -raw website_url 2>/dev/null)
        CUSTOM_DOMAIN_URL=$(cd "$TERRAFORM_DIR" && terraform output -raw custom_domain_url 2>/dev/null)
        
        if [ -n "$CUSTOM_DOMAIN_URL" ]; then
            echo -e "${GREEN}✅ Deploy concluído!${NC}"
            echo -e "${BLUE}🌐 URL do domínio customizado: $CUSTOM_DOMAIN_URL${NC}"
            if [ -n "$WEBSITE_URL" ]; then
                echo -e "${BLUE}🔗 URL direta do S3: $WEBSITE_URL${NC}"
            fi
        elif [ -n "$WEBSITE_URL" ]; then
            echo -e "${GREEN}✅ Deploy concluído!${NC}"
            echo -e "${BLUE}🌐 URL do site: $WEBSITE_URL${NC}"
        else
            echo -e "${GREEN}✅ Deploy concluído!${NC}"
            echo -e "${BLUE}🌐 Bucket: $BUCKET_NAME${NC}"
        fi
    else
        echo -e "${YELLOW}[DRY-RUN] Sincronizaria arquivos com s3://$BUCKET_NAME${NC}"
    fi
}

# Função principal
main() {
    echo -e "${GREEN}🚀 Iniciando deploy completo do portfólio...${NC}"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}⚠️ MODO DRY-RUN ATIVADO - Nenhuma mudança será feita${NC}"
        echo ""
    fi
    
    # Verificar dependências
    check_dependencies
    echo ""
    
    # Build do frontend
    build_frontend
    echo ""
    
    # Gerenciar infraestrutura
    manage_infrastructure
    echo ""
    
    # Deploy do frontend
    deploy_frontend
    echo ""
    
    echo -e "${GREEN}🎉 Deploy completo finalizado com sucesso!${NC}"
}

# Executar função principal
main
