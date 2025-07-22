#!/bin/bash
# build_and_serve.sh - Script completo para build e servir o frontend
# Uso: ./build_and_serve.sh [--dev|--prod]

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"

# Variáveis de modo
DEV_MODE=false
PROD_MODE=false

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}🚀 Script de Build e Serve do Frontend TypeScript/React${NC}"
    echo ""
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "Opções:"
    echo "  --dev       Executa em modo desenvolvimento (auto-reload)"
    echo "  --prod      Executa em modo produção (servidor estável)"
    echo "  --help      Mostra esta ajuda"
    echo ""
    echo "Se nenhuma opção for especificada, pergunta ao usuário."
}

# Função para fazer build do frontend
build_frontend() {
    echo -e "${GREEN}🔨 Fazendo build do frontend...${NC}"
    
    cd "$FRONTEND_DIR" || {
        echo -e "${RED}❌ Erro: Não foi possível acessar o diretório do frontend${NC}"
        exit 1
    }
    
    # Verificar se npm está instalado
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Erro: npm não está instalado${NC}"
        exit 1
    fi
    
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependências...${NC}"
        npm install
    fi
    
    # Fazer o build
    echo -e "${GREEN}🔨 Executando build do Vite...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
    else
        echo -e "${RED}❌ Erro durante o build${NC}"
        exit 1
    fi
}

# Função para iniciar servidor de desenvolvimento
start_dev_server() {
    echo -e "${YELLOW}🔄 Iniciando servidor em modo desenvolvimento...${NC}"
    echo -e "${BLUE}   • Auto-reload ativado${NC}"
    echo -e "${BLUE}   • Debug habilitado${NC}"
    echo -e "${BLUE}   • Porta: 8000${NC}"
    echo ""
    
    cd "$PROJECT_DIR" || exit 1
    python3 "$BACKEND_DIR/auto_reload_server.py"
}

# Função para iniciar servidor de produção
start_prod_server() {
    echo -e "${GREEN}🚀 Iniciando servidor em modo produção...${NC}"
    echo -e "${BLUE}   • Servidor estável${NC}"
    echo -e "${BLUE}   • Debug desabilitado${NC}"
    echo -e "${BLUE}   • Porta: 8000${NC}"
    echo ""
    
    cd "$PROJECT_DIR" || exit 1
    python3 "$BACKEND_DIR/stable_server.py"
}

# Função para perguntar ao usuário o modo
ask_mode() {
    echo -e "${YELLOW}🤔 Qual modo você deseja usar?${NC}"
    echo "1) Desenvolvimento (auto-reload, debug)"
    echo "2) Produção (estável, sem debug)"
    echo ""
    read -p "Escolha (1 ou 2): " choice
    
    case $choice in
        1)
            DEV_MODE=true
            ;;
        2)
            PROD_MODE=true
            ;;
        *)
            echo -e "${RED}❌ Opção inválida. Usando modo desenvolvimento por padrão.${NC}"
            DEV_MODE=true
            ;;
    esac
}

# Função principal
main() {
    echo -e "${BLUE}🚀 Build e Serve do Frontend TypeScript/React${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    
    # Parse de argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dev)
                DEV_MODE=true
                shift
                ;;
            --prod)
                PROD_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opção desconhecida: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Se nenhum modo foi especificado, perguntar
    if [ "$DEV_MODE" = false ] && [ "$PROD_MODE" = false ]; then
        ask_mode
    fi
    
    # Verificar se ambos os modos foram especificados
    if [ "$DEV_MODE" = true ] && [ "$PROD_MODE" = true ]; then
        echo -e "${RED}❌ Erro: Não é possível usar --dev e --prod ao mesmo tempo${NC}"
        exit 1
    fi
    
    # Fazer build do frontend
    build_frontend
    
    echo ""
    echo -e "${GREEN}✅ Build concluído! Iniciando servidor...${NC}"
    echo ""
    
    # Iniciar servidor apropriado
    if [ "$DEV_MODE" = true ]; then
        start_dev_server
    else
        start_prod_server
    fi
}

# Executar apenas se o script for chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
