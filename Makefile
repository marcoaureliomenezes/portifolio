# =====================================================
# MAKEFILE SIMPLES - PORTFÓLIO
# =====================================================

# Cores
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help build clean

# =====================================================
# COMANDOS PRINCIPAIS
# =====================================================

help: ## Mostra esta ajuda
	@echo "$(GREEN)📖 Comandos disponíveis:$(NC)"
	@echo ""
	@echo "$(YELLOW)build$(NC)     - Compila frontend otimizado"
	@echo "$(YELLOW)clean$(NC)     - Limpa arquivos temporários"
	@echo ""
	@echo "$(GREEN)💡 Deploy é feito automaticamente via GitHub Actions$(NC)"

build: ## Compila frontend otimizado
	@cd scripts && ./build_frontend.sh

clean: ## Limpa arquivos temporários
	@echo "$(GREEN)🧹 Limpando...$(NC)"
	@rm -rf frontend/dist
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

.DEFAULT_GOAL := help
