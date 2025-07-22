#!/bin/bash
# terraform_manager.sh - Script para gerenciar infraestrutura com Terraform
# Uso: ./terraform_manager.sh [init|plan|apply|destroy]

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
TERRAFORM_DIR="../terraform"

# Verificar se o Terraform está instalado
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform não está instalado. Por favor, instale-o primeiro.${NC}"
    exit 1
fi

# Verificar se o diretório terraform existe
if [ ! -d "$TERRAFORM_DIR" ]; then
    echo -e "${RED}❌ Diretório terraform não encontrado: $TERRAFORM_DIR${NC}"
    exit 1
fi

# Função para inicializar o Terraform
terraform_init() {
    echo -e "${GREEN}🔧 Inicializando Terraform...${NC}"
    
    # Primeiro tenta inicializar normalmente
    cd $TERRAFORM_DIR && terraform init -no-color
    
    # Se falhar, tenta com a opção -reconfigure
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Detectada mudança na configuração do backend. Tentando com -reconfigure...${NC}"
        cd $TERRAFORM_DIR && terraform init -reconfigure -no-color
        
        # Se ainda falhar, tenta com a opção -migrate-state
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}⚠️ Tentando com -migrate-state...${NC}"
            cd $TERRAFORM_DIR && terraform init -migrate-state -no-color
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Falha ao inicializar o Terraform${NC}"
                exit 1
            fi
        fi
    fi
    
    echo -e "${GREEN}✅ Terraform inicializado com sucesso${NC}"
}

# Função para criar um plano do Terraform
terraform_plan() {
    echo -e "${GREEN}📝 Criando plano do Terraform...${NC}"
    cd $TERRAFORM_DIR && terraform plan -out=tfplan
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha ao criar o plano do Terraform${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Plano do Terraform criado com sucesso${NC}"
}

# Função para aplicar as mudanças do Terraform
terraform_apply() {
    echo -e "${GREEN}🚀 Aplicando mudanças do Terraform...${NC}"
    
    # Verificar se existe um plano
    if [ -f "$TERRAFORM_DIR/tfplan" ]; then
        cd $TERRAFORM_DIR && terraform apply tfplan
    else
        echo -e "${YELLOW}⚠️ Nenhum plano encontrado, criando um novo...${NC}"
        terraform_plan
        cd $TERRAFORM_DIR && terraform apply tfplan
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha ao aplicar as mudanças do Terraform${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Infraestrutura implantada com sucesso${NC}"
    
    # Mostrar outputs do Terraform
    echo -e "${GREEN}📊 Outputs do Terraform:${NC}"
    cd $TERRAFORM_DIR && terraform output
}

# Função para destruir a infraestrutura
terraform_destroy() {
    echo -e "${RED}⚠️ ATENÇÃO: Você está prestes a destruir toda a infraestrutura!${NC}"
    echo -e "${YELLOW}Digite 'sim' para confirmar:${NC}"
    read -r confirmation
    
    if [ "$confirmation" = "sim" ]; then
        echo -e "${RED}🗑️ Destruindo infraestrutura...${NC}"
        cd $TERRAFORM_DIR && terraform destroy -auto-approve
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Falha ao destruir a infraestrutura${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Infraestrutura destruída com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠️ Operação cancelada${NC}"
        exit 0
    fi
}

# Verificar argumentos
if [ "$#" -lt 1 ]; then
    echo -e "${RED}❌ Uso: $0 [init|plan|apply|destroy]${NC}"
    exit 1
fi

ACTION=$1

case "$ACTION" in
    init)
        terraform_init
        ;;
    plan)
        terraform_init
        terraform_plan
        ;;
    apply)
        terraform_init
        terraform_apply
        ;;
    destroy)
        terraform_init
        terraform_destroy
        ;;
    *)
        echo -e "${RED}❌ Ação desconhecida: $ACTION${NC}"
        echo -e "${YELLOW}Uso: $0 [init|plan|apply|destroy]${NC}"
        exit 1
        ;;
esac

exit 0
