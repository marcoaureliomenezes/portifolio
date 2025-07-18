#!/bin/bash
# Script de instalação para o Portfólio Marco Menezes

echo "🚀 Configurando ambiente do Portfólio Marco Menezes..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se está na pasta correta
if [ ! -f "index.html" ]; then
    print_error "Execute este script da pasta raiz do projeto (onde está o index.html)"
    exit 1
fi

print_status "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 não encontrado. Instale o Python 3 primeiro."
    exit 1
fi

python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
print_success "Python $python_version encontrado"

# Criar ambiente virtual se não existir
if [ ! -d ".venv" ]; then
    print_status "Criando ambiente virtual..."
    python3 -m venv .venv
    print_success "Ambiente virtual criado"
else
    print_warning "Ambiente virtual já existe"
fi

# Ativar ambiente virtual
print_status "Ativando ambiente virtual..."
source .venv/bin/activate

# Atualizar pip
print_status "Atualizando pip..."
pip install --upgrade pip > /dev/null 2>&1

# Instalar dependências
print_status "Instalando dependências do Flask..."
pip install -r backend/requirements.txt

if [ $? -eq 0 ]; then
    print_success "Dependências instaladas com sucesso!"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

# Verificar instalação
print_status "Verificando instalação..."
python3 -c "import flask; import flask_cors; print('✅ Flask e Flask-CORS instalados corretamente')"

echo ""
echo "🎉 Instalação concluída com sucesso!"
echo ""
echo "📋 Para usar o servidor:"
echo "1. Ative o ambiente virtual:"
echo "   source .venv/bin/activate"
echo ""
echo "2. Inicie o servidor Flask:"
echo "   python3 backend/flask_server.py"
echo ""
echo "3. Ou use o servidor básico (sem dependências):"
echo "   python3 backend/basic_server.py"
echo ""
echo "🌐 O servidor será acessível em:"
echo "   • Desktop: http://localhost:8000"
echo "   • Mobile: http://[SEU_IP_LOCAL]:8000"
echo ""
echo "💡 Para descobrir seu IP local:"
echo "   ip route get 1.1.1.1 | grep -oP 'src \\K\\S+'"
