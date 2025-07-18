# =====================================================
# MAKEFILE PARA AUTOMAÇÃO DO PORTFÓLIO
# =====================================================
# 
# Este Makefile facilita a execução dos comandos mais
# comuns para gerenciar a infraestrutura e deploy.
# 
# Uso: make <comando>
# =====================================================

.PHONY: help setup deploy status destroy clean validate fmt init plan apply

# Configurações
TERRAFORM_DIR := ./terraform
SCRIPTS_DIR := ./scripts
ENVIRONMENT ?= prod

# Cores para output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# Comando padrão
help: ## Mostrar esta ajuda
	@echo "$(GREEN)🚀 Makefile do Portfólio - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Exemplos:$(NC)"
	@echo "  make setup          # Criar infraestrutura"
	@echo "  make deploy         # Deploy do frontend"
	@echo "  make status         # Verificar status"
	@echo "  make ENVIRONMENT=dev setup  # Setup para dev"

# =====================================================
# COMANDOS PRINCIPAIS
# =====================================================

setup: ## Criar infraestrutura AWS completa
	@echo "$(GREEN)🏗️  Criando infraestrutura ($(ENVIRONMENT))...$(NC)"
	@$(SCRIPTS_DIR)/setup.sh $(ENVIRONMENT)

deploy: ## Deploy do frontend para S3
	@echo "$(GREEN)🚀 Fazendo deploy do frontend ($(ENVIRONMENT))...$(NC)"
	@$(SCRIPTS_DIR)/deploy.sh $(ENVIRONMENT)

status: ## Verificar status da infraestrutura e website
	@echo "$(GREEN)🔍 Verificando status ($(ENVIRONMENT))...$(NC)"
	@$(SCRIPTS_DIR)/status.sh $(ENVIRONMENT)

destroy: ## ⚠️  DESTRUIR infraestrutura (CUIDADO!)
	@echo "$(RED)⚠️  ATENÇÃO: Destruindo infraestrutura ($(ENVIRONMENT))!$(NC)"
	@$(SCRIPTS_DIR)/destroy.sh $(ENVIRONMENT)

# =====================================================
# COMANDOS TERRAFORM DIRETOS
# =====================================================

init: ## Inicializar Terraform
	@echo "$(GREEN)🔧 Inicializando Terraform...$(NC)"
	@cd $(TERRAFORM_DIR) && terraform init

validate: ## Validar configuração Terraform
	@echo "$(GREEN)✅ Validando configuração...$(NC)"
	@cd $(TERRAFORM_DIR) && terraform validate

fmt: ## Formatar código Terraform
	@echo "$(GREEN)🎨 Formatando código...$(NC)"
	@cd $(TERRAFORM_DIR) && terraform fmt -recursive

plan: ## Mostrar plano de execução Terraform
	@echo "$(GREEN)📋 Criando plano de execução...$(NC)"
	@cd $(TERRAFORM_DIR) && terraform plan

apply: ## Aplicar mudanças Terraform
	@echo "$(YELLOW)⚠️  Aplicando mudanças...$(NC)"
	@cd $(TERRAFORM_DIR) && terraform apply

show: ## Mostrar estado atual
	@echo "$(GREEN)📊 Estado atual da infraestrutura:$(NC)"
	@cd $(TERRAFORM_DIR) && terraform show

output: ## Mostrar outputs
	@echo "$(GREEN)📤 Outputs da infraestrutura:$(NC)"
	@cd $(TERRAFORM_DIR) && terraform output

# =====================================================
# COMANDOS DE DESENVOLVIMENTO
# =====================================================

dev-setup: ## Setup para desenvolvimento
	@echo "$(GREEN)🧪 Setup de desenvolvimento...$(NC)"
	@$(SCRIPTS_DIR)/setup.sh dev

dev-deploy: ## Deploy para desenvolvimento
	@echo "$(GREEN)🧪 Deploy de desenvolvimento...$(NC)"
	@$(SCRIPTS_DIR)/deploy.sh dev

dev-destroy: ## Destruir ambiente de desenvolvimento
	@echo "$(YELLOW)🧪 Destruindo ambiente de desenvolvimento...$(NC)"
	@$(SCRIPTS_DIR)/destroy.sh dev

# =====================================================
# COMANDOS DE STAGING
# =====================================================

staging-setup: ## Setup para staging
	@echo "$(GREEN)🎭 Setup de staging...$(NC)"
	@$(SCRIPTS_DIR)/setup.sh staging

staging-deploy: ## Deploy para staging
	@echo "$(GREEN)🎭 Deploy de staging...$(NC)"
	@$(SCRIPTS_DIR)/deploy.sh staging

staging-destroy: ## Destruir ambiente de staging
	@echo "$(YELLOW)🎭 Destruindo ambiente de staging...$(NC)"
	@$(SCRIPTS_DIR)/destroy.sh staging

# =====================================================
# COMANDOS DE MANUTENÇÃO
# =====================================================

clean: ## Limpar arquivos temporários
	@echo "$(GREEN)🧹 Limpando arquivos temporários...$(NC)"
	@cd $(TERRAFORM_DIR) && rm -rf .terraform.lock.hcl terraform.tfplan
	@echo "Arquivos temporários removidos"

clean-all: ## Limpar tudo (incluindo .terraform)
	@echo "$(RED)🧹 Limpando todos os arquivos Terraform...$(NC)"
	@cd $(TERRAFORM_DIR) && rm -rf .terraform .terraform.lock.hcl terraform.tfplan terraform.tfstate.backup*
	@echo "Todos os arquivos temporários removidos"

deps: ## Verificar dependências
	@echo "$(GREEN)🔍 Verificando dependências...$(NC)"
	@command -v aws >/dev/null 2>&1 || { echo "$(RED)❌ AWS CLI não encontrado$(NC)"; exit 1; }
	@command -v terraform >/dev/null 2>&1 || { echo "$(RED)❌ Terraform não encontrado$(NC)"; exit 1; }
	@aws sts get-caller-identity >/dev/null 2>&1 || { echo "$(RED)❌ AWS não configurado$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Todas as dependências OK$(NC)"

config: ## Criar arquivo de configuração exemplo
	@echo "$(GREEN)📝 Criando arquivo de configuração...$(NC)"
	@cd $(TERRAFORM_DIR) && cp terraform.tfvars.example terraform.tfvars || echo "Arquivo já existe"
	@echo "$(YELLOW)📝 Edite $(TERRAFORM_DIR)/terraform.tfvars com suas configurações$(NC)"

# =====================================================
# COMANDOS DE MONITORAMENTO
# =====================================================

logs: ## Mostrar logs recentes
	@echo "$(GREEN)📜 Logs recentes da infraestrutura:$(NC)"
	@$(SCRIPTS_DIR)/status.sh $(ENVIRONMENT) 2>/dev/null | tail -20

watch: ## Monitorar status continuamente
	@echo "$(GREEN)👀 Monitorando status (Ctrl+C para parar)...$(NC)"
	@watch -n 30 'make status ENVIRONMENT=$(ENVIRONMENT)'

# =====================================================
# COMANDOS COMBINADOS
# =====================================================

full-setup: deps config init setup deploy ## Setup completo (deps + config + infra + deploy)
	@echo "$(GREEN)🎉 Setup completo finalizado!$(NC)"

quick-deploy: validate deploy status ## Deploy rápido com verificações
	@echo "$(GREEN)⚡ Deploy rápido finalizado!$(NC)"

# =====================================================
# COMANDOS DE BACKUP
# =====================================================

backup: ## Backup do estado Terraform
	@echo "$(GREEN)💾 Criando backup do estado...$(NC)"
	@cd $(TERRAFORM_DIR) && cp terraform.tfstate terraform.tfstate.backup.$(shell date +%Y%m%d_%H%M%S) 2>/dev/null || echo "Nenhum estado para backup"

restore: ## Lista backups disponíveis
	@echo "$(GREEN)📂 Backups disponíveis:$(NC)"
	@cd $(TERRAFORM_DIR) && ls -la terraform.tfstate.backup.* 2>/dev/null || echo "Nenhum backup encontrado"

# =====================================================
# COMANDOS DE INFORMAÇÃO
# =====================================================

info: ## Mostrar informações do projeto
	@echo "$(GREEN)ℹ️  Informações do Projeto$(NC)"
	@echo ""
	@echo "$(YELLOW)Diretórios:$(NC)"
	@echo "  Terraform: $(TERRAFORM_DIR)"
	@echo "  Scripts:   $(SCRIPTS_DIR)"
	@echo "  Environment: $(ENVIRONMENT)"
	@echo ""
	@echo "$(YELLOW)Arquivos importantes:$(NC)"
	@ls -la $(TERRAFORM_DIR)/*.tf 2>/dev/null || echo "  Nenhum arquivo .tf encontrado"
	@echo ""
	@echo "$(YELLOW)Scripts disponíveis:$(NC)"
	@ls -la $(SCRIPTS_DIR)/*.sh 2>/dev/null || echo "  Nenhum script encontrado"

version: ## Mostrar versões das ferramentas
	@echo "$(GREEN)🔧 Versões das Ferramentas$(NC)"
	@echo ""
	@echo "$(YELLOW)AWS CLI:$(NC)"
	@aws --version 2>/dev/null || echo "  Não instalado"
	@echo ""
	@echo "$(YELLOW)Terraform:$(NC)"
	@terraform version 2>/dev/null || echo "  Não instalado"
	@echo ""
	@echo "$(YELLOW)Make:$(NC)"
	@make --version | head -1 2>/dev/null || echo "  Não instalado"

# =====================================================
# COMANDOS DE TESTE
# =====================================================

test: ## Executar testes básicos
	@echo "$(GREEN)🧪 Executando testes básicos...$(NC)"
	@make deps
	@make validate
	@echo "$(GREEN)✅ Testes básicos passaram$(NC)"

test-full: ## Executar testes completos (cria e destrói env de teste)
	@echo "$(GREEN)🧪 Executando testes completos...$(NC)"
	@make ENVIRONMENT=test setup
	@make ENVIRONMENT=test deploy
	@make ENVIRONMENT=test status
	@make ENVIRONMENT=test destroy
	@echo "$(GREEN)✅ Testes completos passaram$(NC)"

# =====================================================
# DOCUMENTAÇÃO
# =====================================================

docs: ## Abrir documentação
	@echo "$(GREEN)📚 Abrindo documentação...$(NC)"
	@echo "README principal: $(PWD)/README.md"
	@echo "README DevOps: $(PWD)/devops/README.md"
	@echo "README Frontend: $(PWD)/frontend/README.md"
	@echo "README Backend: $(PWD)/backend/README.md"

# Configuração para não interpretar targets como arquivos
.DEFAULT_GOAL := help
