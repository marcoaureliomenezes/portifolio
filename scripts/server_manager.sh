#!/bin/bash
# server_manager.sh - Script para gerenciar o servidor Flask
# Uso: ./server_manager.sh [start|stop|status] [stable|dev]

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_DIR="../backend"
PID_FILE="${BACKEND_DIR}/.flask.pid"

start_server() {
    local server_type=$1
    
    if [ -f "$PID_FILE" ]; then
        echo -e "${YELLOW}⚠️  Servidor já está em execução (PID: $(cat $PID_FILE))${NC}"
        return 1
    fi
    
    if [ "$server_type" == "dev" ]; then
        echo -e "${GREEN}🚀 Iniciando servidor Flask com auto-reload...${NC}"
        cd $BACKEND_DIR && python auto_reload_server.py & echo $! > .flask.pid
        echo -e "${GREEN}✅ Servidor Flask com auto-reload iniciado na porta 8000${NC}"
    elif [ "$server_type" == "test" ]; then
        echo -e "${GREEN}🧪 Iniciando servidor de teste para frontend/dist...${NC}"
        cd $BACKEND_DIR && python test_server.py & echo $! > .flask.pid
        echo -e "${GREEN}✅ Servidor de teste iniciado na porta 8001${NC}"
        echo -e "${YELLOW}📁 Servindo arquivos de: frontend/dist${NC}"
    else
        echo -e "${GREEN}🚀 Iniciando servidor Flask estável...${NC}"
        cd $BACKEND_DIR && python stable_server.py & echo $! > .flask.pid
        echo -e "${GREEN}✅ Servidor Flask iniciado na porta 8000${NC}"
    fi
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        echo -e "${YELLOW}🚫 Parando servidor Flask...${NC}"
        kill -9 `cat $PID_FILE` 2>/dev/null || true
        rm $PID_FILE
        echo -e "${GREEN}✅ Servidor Flask parado${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhum servidor Flask em execução${NC}"
    fi
}

server_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            echo -e "${GREEN}✅ Servidor Flask está em execução (PID: $PID)${NC}"
            echo -e "${GREEN}🌐 URL: http://localhost:8000${NC}"
        else
            echo -e "${RED}❌ Arquivo PID existe, mas o processo não está rodando${NC}"
            rm $PID_FILE
        fi
    else
        echo -e "${YELLOW}⚠️  Nenhum servidor Flask em execução${NC}"
    fi
}

# Verificar argumentos
if [ "$#" -lt 1 ]; then
    echo -e "${RED}❌ Uso: $0 [start|stop|status] [stable|dev|test]${NC}"
    exit 1
fi

ACTION=$1
SERVER_TYPE=${2:-stable}

case "$ACTION" in
    start)
        start_server $SERVER_TYPE
        ;;
    stop)
        stop_server
        ;;
    status)
        server_status
        ;;
    *)
        echo -e "${RED}❌ Ação desconhecida: $ACTION${NC}"
        echo -e "${YELLOW}Uso: $0 [start|stop|status] [stable|dev|test]${NC}"
        exit 1
        ;;
esac

exit 0
