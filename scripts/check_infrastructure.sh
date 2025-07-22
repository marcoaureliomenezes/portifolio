#!/bin/bash
# check_infrastructure.sh - Script para verificar o status da infraestrutura
# Uso: ./check_infrastructure.sh

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

# Função para verificar dependências
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependências...${NC}"
    
    # Verificar Terraform
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform não encontrado${NC}"
        return 1
    fi
    
    # Verificar AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não encontrado${NC}"
        return 1
    fi
    
    # Verificar se está autenticado na AWS
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI não está configurado${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Dependências OK${NC}"
    return 0
}

# Função para verificar estado do Terraform
check_terraform_state() {
    echo -e "${BLUE}🏗️ Verificando estado do Terraform...${NC}"
    
    if [ ! -d "$TERRAFORM_DIR" ]; then
        echo -e "${RED}❌ Diretório terraform não encontrado${NC}"
        return 1
    fi
    
    cd "$TERRAFORM_DIR"
    
    # Verificar se foi inicializado
    if [ ! -d ".terraform" ]; then
        echo -e "${YELLOW}⚠️ Terraform não foi inicializado${NC}"
        echo -e "${BLUE}Execute: ./scripts/terraform_manager.sh init${NC}"
        return 1
    fi
    
    # Verificar se há recursos criados
    if ! terraform state list &> /dev/null; then
        echo -e "${YELLOW}⚠️ Nenhum recurso encontrado no estado do Terraform${NC}"
        echo -e "${BLUE}Execute: ./scripts/terraform_manager.sh plan${NC}"
        echo -e "${BLUE}Execute: ./scripts/terraform_manager.sh apply${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Terraform inicializado e com recursos${NC}"
    
    # Mostrar recursos
    echo -e "${BLUE}📋 Recursos atuais:${NC}"
    terraform state list | sed 's/^/  /'
    
    return 0
}

# Função para verificar bucket S3
check_s3_bucket() {
    echo -e "${BLUE}🪣 Verificando bucket S3...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Obter nome do bucket
    BUCKET_NAME=$(terraform output -raw website_bucket_name 2>/dev/null)
    
    if [ -z "$BUCKET_NAME" ]; then
        echo -e "${YELLOW}⚠️ Não foi possível obter nome do bucket${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Bucket: $BUCKET_NAME${NC}"
    
    # Verificar se bucket existe
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        echo -e "${GREEN}✅ Bucket existe e está acessível${NC}"
        
        # Verificar configuração de website
        if aws s3api get-bucket-website --bucket "$BUCKET_NAME" &>/dev/null; then
            echo -e "${GREEN}✅ Configuração de website habilitada${NC}"
            
            # Obter URL do website
            WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null)
            CUSTOM_DOMAIN_URL=$(terraform output -raw custom_domain_url 2>/dev/null)
            
            if [ -n "$CUSTOM_DOMAIN_URL" ]; then
                echo -e "${BLUE}🌐 URL do domínio customizado: $CUSTOM_DOMAIN_URL${NC}"
            fi
            if [ -n "$WEBSITE_URL" ]; then
                echo -e "${BLUE}🔗 URL direta do S3: $WEBSITE_URL${NC}"
            fi
        else
            echo -e "${RED}❌ Configuração de website não encontrada${NC}"
            return 1
        fi
        
        # Verificar se há arquivos
        FILE_COUNT=$(aws s3 ls "s3://$BUCKET_NAME" --recursive | wc -l)
        echo -e "${BLUE}📁 Arquivos no bucket: $FILE_COUNT${NC}"
        
        if [ "$FILE_COUNT" -eq 0 ]; then
            echo -e "${YELLOW}⚠️ Bucket está vazio - faça o deploy do frontend${NC}"
            echo -e "${BLUE}Execute: ./scripts/deploy_frontend.sh${NC}"
        fi
        
    else
        echo -e "${RED}❌ Bucket não existe ou não está acessível${NC}"
        return 1
    fi
    
    return 0
}

# Função para verificar frontend
check_frontend() {
    echo -e "${BLUE}⚛️ Verificando frontend...${NC}"
    
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    DIST_DIR="$FRONTEND_DIR/dist"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ Diretório frontend não encontrado${NC}"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Verificar package.json
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json não encontrado${NC}"
        return 1
    fi
    
    # Verificar node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️ Dependências não instaladas${NC}"
        echo -e "${BLUE}Execute: cd frontend && npm install${NC}"
        return 1
    fi
    
    # Verificar build
    if [ ! -d "$DIST_DIR" ]; then
        echo -e "${YELLOW}⚠️ Build não encontrado${NC}"
        echo -e "${BLUE}Execute: cd frontend && npm run build${NC}"
        return 1
    fi
    
    # Verificar se index.html existe no build
    if [ ! -f "$DIST_DIR/index.html" ]; then
        echo -e "${RED}❌ index.html não encontrado no build${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Frontend OK${NC}"
    
    # Mostrar estatísticas do build
    BUILD_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
    FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l)
    echo -e "${BLUE}📊 Tamanho do build: $BUILD_SIZE${NC}"
    echo -e "${BLUE}📁 Arquivos no build: $FILE_COUNT${NC}"
    
    return 0
}

# Função para mostrar resumo
show_summary() {
    echo ""
    echo -e "${GREEN}📋 RESUMO DO STATUS${NC}"
    echo "===================="
    
    cd "$TERRAFORM_DIR"
    
    # Informações básicas
    echo -e "${BLUE}Projeto:${NC} $(terraform output -raw website_bucket_name 2>/dev/null | cut -d'-' -f1-2)"
    echo -e "${BLUE}Região:${NC} $(terraform output -raw s3_bucket_region 2>/dev/null)"
    echo -e "${BLUE}Ambiente:${NC} prod"
    
    # URLs
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null)
    CUSTOM_DOMAIN_URL=$(terraform output -raw custom_domain_url 2>/dev/null)
    
    if [ -n "$CUSTOM_DOMAIN_URL" ]; then
        echo -e "${BLUE}Site:${NC} $CUSTOM_DOMAIN_URL"
    fi
    if [ -n "$WEBSITE_URL" ]; then
        echo -e "${BLUE}S3 direto:${NC} $WEBSITE_URL"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 PRÓXIMOS PASSOS SUGERIDOS:${NC}"
    
    # Verificar se infraestrutura está OK
    if terraform state list &> /dev/null && [ -n "$(terraform output -raw website_bucket_name 2>/dev/null)" ]; then
        # Verificar se frontend foi deployado
        BUCKET_NAME=$(terraform output -raw website_bucket_name 2>/dev/null)
        FILE_COUNT=$(aws s3 ls "s3://$BUCKET_NAME" --recursive 2>/dev/null | wc -l)
        
        if [ "$FILE_COUNT" -eq 0 ]; then
            echo -e "${YELLOW}1. Fazer deploy do frontend:${NC} ./scripts/deploy_frontend.sh"
        else
            echo -e "${GREEN}✅ Sistema está funcionando!${NC}"
            echo -e "${YELLOW}- Para atualizar:${NC} ./scripts/deploy_complete.sh"
            echo -e "${YELLOW}- Para forçar rebuild:${NC} ./scripts/deploy_complete.sh --force"
        fi
    else
        echo -e "${YELLOW}1. Inicializar infraestrutura:${NC} ./scripts/terraform_manager.sh init"
        echo -e "${YELLOW}2. Criar recursos:${NC} ./scripts/terraform_manager.sh apply"
        echo -e "${YELLOW}3. Deploy completo:${NC} ./scripts/deploy_complete.sh"
    fi
}

# Função principal
main() {
    echo -e "${GREEN}🔍 VERIFICAÇÃO DE INFRAESTRUTURA${NC}"
    echo "=================================="
    echo ""
    
    # Verificar dependências
    if ! check_dependencies; then
        echo -e "${RED}❌ Falha na verificação de dependências${NC}"
        exit 1
    fi
    echo ""
    
    # Verificar Terraform
    TERRAFORM_OK=true
    if ! check_terraform_state; then
        TERRAFORM_OK=false
    fi
    echo ""
    
    # Verificar S3 (apenas se Terraform estiver OK)
    S3_OK=true
    if [ "$TERRAFORM_OK" = true ]; then
        if ! check_s3_bucket; then
            S3_OK=false
        fi
        echo ""
    fi
    
    # Verificar frontend
    FRONTEND_OK=true
    if ! check_frontend; then
        FRONTEND_OK=false
    fi
    echo ""
    
    # Mostrar resumo
    show_summary
    
    # Status final
    echo ""
    if [ "$TERRAFORM_OK" = true ] && [ "$S3_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
        echo -e "${GREEN}🎉 Tudo está funcionando perfeitamente!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️ Alguns componentes precisam de atenção${NC}"
        exit 1
    fi
}

# Executar função principal
main
