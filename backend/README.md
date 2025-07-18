# 🚀 Backend - Servidor Flask

Este diretório contém o servidor Flask para desenvolvimento local do portfólio.

## 📁 Estrutura

```
backend/
├── stable_server.py     # 🎯 Servidor estável porta 8000 (RECOMENDADO)
├── auto_reload_server.py # 🔄 Servidor com auto-reload inteligente
├── start_server.sh      # 🚀 Script para iniciar servidor automaticamente
├── setup.sh            # 📦 Script de instalação de dependências
├── requirements.txt     # 📋 Dependências Python
└── README.md           # 📚 Esta documentação
```

## ⚡ Instalação Rápida

### Método 1: Servidor Estável (Recomendado)
```bash
# Servidor simples e confiável na porta 8000
cd backend/
python3 stable_server.py
```

### Método 2: Servidor com Auto-Reload
```bash
# Servidor com hot-reload para desenvolvimento
cd backend/
python3 auto_reload_server.py
```

### Método 3: Script Automático
```bash
# Na pasta backend/
./start_server.sh
```

### Método 4: Setup Manual
```bash
# 1. Criar ambiente virtual (na raiz do projeto)
python3 -m venv .venv
source .venv/bin/activate

# 2. Instalar dependências
pip install -r backend/requirements.txt

# 3. Iniciar servidor
python3 backend/stable_server.py
```

## 🖥️ Servidor Flask

### Características:
- ✅ **Porta fixa 8000** - SEMPRE usa porta 8000 (mata processos antigos)
- ✅ **Auto-reload ativado** - Recarrega automaticamente quando arquivos mudam (hot-reload)
- ✅ **CORS habilitado** - Funciona com desenvolvimento frontend
- ✅ **Servir arquivos estáticos** - HTML, CSS, JS, imagens
- ✅ **Acesso via rede local** - Testável no mobile
- ✅ **Logs coloridos** - Debug fácil
- ✅ **Tratamento de erros** - 404 amigável
- ✅ **Limpeza automática de porta** - Mata processos conflitantes

### Uso:
```bash
# MÉTODO RECOMENDADO: Script automático
./backend/start_server.sh

# OU: Servidor estável (uso geral)
python3 backend/stable_server.py

# OU: Servidor com auto-reload (desenvolvimento)
python3 backend/auto_reload_server.py
```

## 🎯 Qual Servidor Usar?

### 📋 Servidores Disponíveis:

| Servidor | Quando Usar | Características |
|----------|-------------|-----------------|
| **stable_server.py** | Uso geral, apresentações, produção local | ✅ Ultra-estável, sem reload, porta 8000 fixa |
| **auto_reload_server.py** | Desenvolvimento ativo com mudanças frequentes | ✅ Auto-reload inteligente, porta 8000 fixa |

### 🚀 Recomendação:
- **Para uso geral**: `python3 stable_server.py`
- **Para desenvolvimento**: `python3 auto_reload_server.py`

## 🌐 Acesso

### Desktop:
- `http://localhost:8000` ← **SEMPRE porta 8000**

### Mobile (rede local):
- `http://[SEU_IP_LOCAL]:8000`
- Para descobrir IP: `ip route get 1.1.1.1 | grep -oP 'src \\K\\S+'`
- **Exemplo**: `http://192.168.1.50:8000`

## 🔧 Dependências

```
flask>=2.3.0           # Framework web principal
flask-cors>=4.0.0      # CORS para desenvolvimento  
requests>=2.31.0       # Para futuras APIs
gunicorn>=21.0.0       # Servidor de produção
watchdog>=3.0.0        # Auto-reload (desenvolvimento)
```

## � Auto-Reload (Hot-Reload)

O servidor está configurado com **auto-reload ativado**:
- ✅ Recarrega automaticamente quando arquivos `.py` mudam
- ✅ Monitora arquivos HTML, CSS, JS do frontend  
- ✅ Logs mostram quando reload acontece
- ✅ Não perde estado do debug

## �🚨 Solução de Problemas

### Porta 8000 em uso:
```bash
# O servidor automaticamente mata processos conflitantes
# Mas se necessário, faça manualmente:
lsof -ti:8000 | xargs kill -9

# Ou use o script que já faz isso:
./backend/start_server.sh
```

### Módulo não encontrado:
```bash
# Verificar ambiente virtual
which python3
pip list

# Reinstalar
pip install -r backend/requirements.txt
```

### Firewall bloqueando:
```bash
# Permitir porta no Ubuntu
sudo ufw allow 8000/tcp
sudo ufw status
```

## 📊 Logs

O servidor mostra logs coloridos com:
- 🚀 Status de inicialização
- 📁 Pasta sendo servida  
- 🌐 URLs de acesso (local + rede)
- 📱 Instrução para mobile
- ⚡ Requisições HTTP

## 🔄 Desenvolvimento

### Hot Reload:
O Flask está configurado com `debug=True` para recarregar automaticamente ao alterar arquivos Python.

### Estrutura de Pastas:
```
portifolio/
├── backend/           # Este diretório (LIMPO E ORGANIZADO)
│   ├── stable_server.py       # 🎯 Servidor principal
│   ├── auto_reload_server.py  # 🔄 Servidor com hot-reload
│   ├── start_server.sh        # 🚀 Script de inicialização
│   ├── setup.sh               # 📦 Script de setup
│   ├── requirements.txt       # 📋 Dependências
│   └── README.md              # 📚 Documentação
├── frontend/          # Arquivos servidos
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   └── data/
└── .venv/            # Ambiente virtual
```

## 🚀 Deploy

Para produção, use Gunicorn:
```bash
# Instalar gunicorn (já no requirements.txt)
pip install gunicorn

# Rodar com gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:8000 flask_server:app
```
