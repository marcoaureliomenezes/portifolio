# 🎯 Portfólio Marco Menezes

**Engenheiro de Dados | Cloud Specialist**

Este é um portfólio profissional moderno e responsivo, desenvolvido com arquitetura limpa e organizada para fácil manutenção e escalabilidade.

## 🗂️ Estrutura do Projeto

```
portifolio/
├── 📁 backend/              # Servidor Flask para desenvolvimento
│   ├── flask_server.py      # Servidor principal
│   ├── requirements.txt     # Dependências Python
│   ├── setup.sh            # Script de instalação
│   └── README.md           # Documentação do backend
│
├── 📁 frontend/             # Interface do usuário
│   ├── index.html          # Página principal
│   ├── 📁 css/             # Estilos organizados e modulares
│   ├── 📁 js/              # JavaScript
│   ├── 📁 images/          # Imagens e ícones
│   ├── 📁 assets/          # Recursos (CV, etc.)
│   ├── 📁 data/            # Dados estruturados (JSON)
│   └── README.md           # Documentação do frontend
│
├── 📁 devops/              # Infraestrutura e automação AWS
│   ├── 📁 terraform/       # Configuração da infraestrutura
│   ├── 📁 scripts/         # Scripts de deploy e automação
│   ├── Makefile           # Comandos automatizados
│   └── README.md          # Documentação do DevOps
│
├── 📁 .venv/               # Ambiente virtual Python
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Esta documentação
```

## 🚀 Início Rápido

### 💻 Desenvolvimento Local

1. **Clone e Configure:**
```bash
git clone <repository-url>
cd portifolio

# Instalação automática
./backend/setup.sh
```

2. **Inicie o Servidor:**
```bash
# Ativar ambiente virtual
source .venv/bin/activate

# Iniciar servidor Flask
python backend/flask_server.py
```

3. **Acesse o portfólio:**
```
http://localhost:8000
```

### ☁️ Deploy em Produção (AWS)

1. **Configure o DevOps:**
```bash
cd devops/

# Configure suas credenciais AWS
aws configure

# Configure as variáveis
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edite terraform.tfvars com seu domínio
```

2. **Deploy com Makefile:**
```bash
# Setup completo (infraestrutura + deploy)
make full-setup

# Ou manualmente:
make setup    # Criar infraestrutura
make deploy   # Deploy do frontend
make status   # Verificar status
```

3. **Acesse seu portfólio:**
```
https://seudominio.com
```

## 🛠️ Comandos Disponíveis

### Makefile (DevOps)
```bash
make help           # Listar todos os comandos
make setup          # Criar infraestrutura AWS
make deploy         # Deploy do frontend
make status         # Verificar status
make destroy        # Destruir infraestrutura (cuidado!)
```

### Scripts Diretos
```bash
# Backend
./backend/setup.sh               # Instalar dependências
python backend/flask_server.py  # Servidor local

# DevOps
./devops/scripts/setup.sh        # Setup da infraestrutura
./devops/scripts/deploy.sh       # Deploy do frontend
./devops/scripts/status.sh       # Status da infraestrutura
./devops/scripts/destroy.sh      # Destruir (cuidado!)
```
python3 backend/flask_server.py
```

### 3. **Acesse:**
- **Desktop:** `http://localhost:8000`
- **Mobile:** `http://[SEU_IP_LOCAL]:8000`

## 🏗️ Infraestrutura AWS

### Recursos Implementados
- **S3**: Hospedagem estática com versionamento
- **CloudFront**: CDN global com cache otimizado
- **ACM**: Certificado SSL/TLS automático
- **Route53**: DNS e health checks
- **CloudWatch**: Monitoramento e alertas

### Características
- ✅ HTTPS obrigatório
- ✅ Cache otimizado por tipo de arquivo
- ✅ Versionamento de objetos S3
- ✅ Proteção contra exclusão acidental
- ✅ Logs de acesso e monitoramento
- ✅ Deploy automatizado
- ✅ Invalidação automática de cache

## 📊 Tecnologias

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modulares e responsivos
- **JavaScript** - Interatividade e dinamismo
- **JSON** - Dados estruturados

### Backend (Desenvolvimento)
- **Flask** - Servidor web Python
- **Python 3.8+** - Linguagem de programação

### DevOps/Infraestrutura
- **Terraform** - Infraestrutura como código
- **AWS** - Plataforma de nuvem
- **Bash** - Scripts de automação
- **Make** - Automação de tarefas

## 🔒 Segurança

- HTTPS obrigatório em produção
- Bucket S3 não público (acesso via CloudFront)
- Versionamento habilitado
- Proteção contra exclusão acidental
- Headers de segurança configurados

## 📈 Performance

- CDN global via CloudFront
- Cache otimizado por tipo de arquivo
- Compressão automática
- Imagens otimizadas
- CSS/JS minificados

## 🚀 Deploy

### Ambientes Suportados
- **dev**: Desenvolvimento
- **staging**: Homologação
- **prod**: Produção (padrão)

### Workflow de Deploy
1. Desenvolvimento local com Flask
2. Deploy automatizado para S3
3. Invalidação do cache CloudFront
4. Verificação automática de saúde

## 📚 Documentação

- [Backend](./backend/README.md) - Servidor Flask
- [Frontend](./frontend/README.md) - Interface e estrutura
- [DevOps](./devops/README.md) - Infraestrutura e automação

## 🎯 Objetivos do Projeto

- ✅ Portfólio profissional moderno
- ✅ Arquitetura escalável e maintível
- ✅ Infraestrutura de produção robusta
- ✅ Deploy automatizado
- ✅ Monitoramento e observabilidade
- ✅ Documentação completa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Teste suas alterações
4. Submeta um pull request

## 📝 Licença

Este projeto está sob licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ por Marco Menezes | Engenheiro de Dados**
