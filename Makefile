# =====================================================
# MAKEFILE SIMPLES - PORTFÓLIO
# =====================================================

# Cores
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help dev stop build clean test-build

# =====================================================
# COMANDOS PRINCIPAIS
# =====================================================

help: ## Mostra esta ajuda
	@echo "$(GREEN)📖 Comandos disponíveis:$(NC)"
	@echo ""
	@echo "$(YELLOW)dev$(NC)       - Inicia servidor local para desenvolvimento"
	@echo "$(YELLOW)stop$(NC)      - Para o servidor local"
	@echo "$(YELLOW)build$(NC)     - Compila frontend otimizado"
	@echo "$(YELLOW)test-build$(NC) - Testa o build localmente"
	@echo "$(YELLOW)clean$(NC)     - Limpa arquivos temporários"
	@echo ""
	@echo "$(GREEN)💡 Deploy é feito automaticamente via GitHub Actions$(NC)"

dev: ## Inicia servidor Flask local
	@cd scripts && ./server_manager.sh start dev

stop: ## Para o servidor Flask local
	@cd scripts && ./server_manager.sh stop

build: ## Compila frontend otimizado
	@cd scripts && ./build_frontend.sh

test-build: build ## Testa o build localmente (porta 8001)
	@echo "$(GREEN)🧪 Testando build com servidor Flask...$(NC)"
	@echo "$(YELLOW)Acesse: http://localhost:8000$(NC)"
	@echo "$(YELLOW)Pressione Ctrl+C para parar$(NC)"
	@cd scripts && ./server_manager.sh start test

clean: ## Limpa arquivos temporários
	@echo "$(GREEN)🧹 Limpando...$(NC)"
	@rm -rf frontend/dist
	@cd scripts && ./server_manager.sh stop
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

.DEFAULT_GOAL := help
