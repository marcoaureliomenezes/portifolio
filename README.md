# 🎯 Portfólio Marco Menezes

**Engenheiro de Dados | Cloud Specialist**

Este é um portfólio profissional moderno e responsivo, desenvolvido com React/TypeScript e hospedado na AWS S3.

## 🗂️ Estrutura do Projeto

```
portifolio/
├── 📁 frontend/             # Interface React/TypeScript
│   ├── src/                # Código fonte
│   ├── public/             # Arquivos públicos
│   ├── dist/               # Build de produção
│   ├── package.json        # Dependências e scripts
│   └── README.md           # Documentação do frontend
│
├── 📁 backend/              # Servidor Flask para desenvolvimento local
│   ├── stable_server.py    # Servidor de produção
│   ├── auto_reload_server.py # Servidor de desenvolvimento
│   ├── requirements.txt    # Dependências Python
│   └── README.md           # Documentação do backend
│
├── 📁 terraform/            # Infraestrutura AWS
│   ├── main.tf             # Configuração principal
│   ├── s3.tf               # Bucket S3 para hospedagem
│   ├── variables.tf        # Variáveis do Terraform
│   ├── outputs.tf          # Outputs da infraestrutura
│   └── terraform.tfvars    # Configurações específicas
│
├── 📁 scripts/              # Scripts de automação
│   ├── deploy_complete.sh  # Deploy completo (build + infraestrutura + deploy)
│   ├── deploy_frontend.sh  # Deploy apenas do frontend
│   ├── check_infrastructure.sh # Verificação do status
│   └── terraform_manager.sh # Gerenciamento do Terraform
│
└── README.md               # Esta documentação
│
├── 📁 .venv/               # Ambiente virtual Python
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Esta documentação
```

```

## 🚀 Início Rápido

### � Pré-requisitos

- **Node.js** 18+ e npm
- **Python** 3.8+ (para desenvolvimento local)
- **Terraform** 1.0+
- **AWS CLI** configurado
- Conta AWS com permissões S3

### 💻 Desenvolvimento Local

1. **Instalar dependências do frontend:**
```bash
cd frontend/
npm install
```

2. **Executar em modo desenvolvimento:**
```bash
# Frontend (React + Vite)
npm run dev

# OU servidor Flask local
cd ../backend/
python stable_server.py
```

3. **Build do frontend:**
```bash
cd frontend/
npm run build
```

### ☁️ Deploy para AWS S3

#### Opção 1: Deploy Completo (Recomendado)
```bash
# Deploy completo: build + infraestrutura + deploy
./scripts/deploy_complete.sh

# Primeira vez (inicializar Terraform)
./scripts/deploy_complete.sh --init
```

#### Opção 2: Deploy por Etapas
```bash
# 1. Criar/atualizar infraestrutura
./scripts/terraform_manager.sh init
./scripts/terraform_manager.sh apply

# 2. Build do frontend
cd frontend/
npm run build

# 3. Deploy para S3
./scripts/deploy_frontend.sh
```

#### Verificar Status
```bash
# Verificar status completo da infraestrutura
./scripts/check_infrastructure.sh
```

### 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `deploy_complete.sh` | Deploy completo (build + infraestrutura + S3) |
| `deploy_frontend.sh` | Deploy apenas do frontend para S3 |
| `check_infrastructure.sh` | Verificação do status da infraestrutura |
| `terraform_manager.sh` | Gerenciamento do Terraform |

#### Parâmetros dos Scripts

```bash
# Deploy completo com opções
./scripts/deploy_complete.sh --init      # Inicializar Terraform
./scripts/deploy_complete.sh --force     # Forçar rebuild
./scripts/deploy_complete.sh --dry-run   # Simular sem executar

# Terraform
./scripts/terraform_manager.sh init      # Inicializar
./scripts/terraform_manager.sh plan      # Planejar mudanças
./scripts/terraform_manager.sh apply     # Aplicar mudanças
./scripts/terraform_manager.sh destroy   # Destruir recursos
```

### ⚙️ Configuração

#### Terraform Variables
Edite `terraform/terraform.tfvars`:
```hcl
aws_region   = "sa-east-1"        # Região AWS
environment  = "prod"             # Ambiente
project_name = "marco-portfolio"  # Nome do projeto
```

#### Personalização do Frontend
- **Conteúdo**: Edite arquivos em `frontend/src/`
- **Estilos**: Customize Tailwind CSS em `frontend/tailwind.config.ts`
- **Componentes**: Adicione componentes em `frontend/src/components/`
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
