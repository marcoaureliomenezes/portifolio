# 🎯 Portfólio Marco Menezes

**Engenheiro de Dados | Cloud Specialist**

Este é um portfólio profissional moderno e responsivo, desenvolvido com React/TypeScript e hospedado na AWS S3 com deploy automático via GitHub Actions.

🌐 **Site Live**: https://marco-menezes.com  
🚀 **Deploy Automático**: Push para main → GitHub Actions → S3

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
├── 📁 .github/              # CI/CD GitHub Actions
│   ├── workflows/          # Workflows de deploy
│   └── PULL_REQUEST_TEMPLATE.md # Template de PR
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
│   ├── setup-deployment.sh # Configuração inicial do pipeline
│   ├── build_frontend.sh   # Build do frontend
│   ├── build_and_serve.sh  # Build e servidor local
│   ├── check_infrastructure.sh # Verificação do status
│   ├── terraform_manager.sh # Gerenciamento do Terraform
│   └── server_manager.sh   # Gerenciamento do servidor local
│
├── 📁 docs/                 # Documentação
│   └── DEPLOYMENT-GUIDE.md # Guia completo de deploy
│
└── README.md               # Esta documentação
```

```

## 🚀 Deploy Automático (Recomendado)

### ⚙️ Configuração Inicial

1. **Executar configuração automática:**
```bash
./scripts/setup-deployment.sh
```

2. **Configurar secrets no GitHub:**
   - Vá em `Settings → Secrets and variables → Actions`
   - Adicione os secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `CLOUDFRONT_DISTRIBUTION_ID`

### 🔄 Workflow de Deploy

```bash
# Desenvolvimento
git checkout -b feature/nova-funcionalidade
# ... fazer mudanças ...
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# Criar PR no GitHub para main
# Merge PR → Deploy automático para produção! 🚀
```

### 📊 Status do Deploy

- **GitHub Actions**: [Workflows](https://github.com/marcoaureliomenezes/portifolio/actions)
- **Site de Produção**: https://marco-menezes.com
- **Documentação Completa**: [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)

## 💻 Desenvolvimento Local

### 🛠️ Pré-requisitos

- **Node.js** 18+ e npm
- **Python** 3.8+ (para desenvolvimento local)
- **Terraform** 1.0+ (para infraestrutura)
- **AWS CLI** configurado

### 🏃‍♂️ Início Rápido

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

3. **Build local para teste:**
```bash
cd frontend/
npm run build
npm run preview
```

## ☁️ Deploy Manual (Emergência)

Caso precise fazer deploy manual:

## ☁️ Deploy Manual (Emergência)

### 🏗️ Desenvolvimento Local

Para desenvolvimento e testes locais:
```bash
# 1. Criar/atualizar infraestrutura
./scripts/terraform_manager.sh init
./scripts/terraform_manager.sh apply

# 2. Build do frontend
cd frontend/
npm run build

# 3. Testar localmente
make dev
# ou
./scripts/build_and_serve.sh
```

#### Verificar Status
```bash
# Verificar status completo da infraestrutura
./scripts/check_infrastructure.sh
```

### 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `build_frontend.sh` | Build otimizado do frontend |
| `build_and_serve.sh` | Build e servidor local para desenvolvimento |
| `check_infrastructure.sh` | Verificação do status da infraestrutura |
| `terraform_manager.sh` | Gerenciamento do Terraform |
| `server_manager.sh` | Gerenciamento do servidor local |

#### Parâmetros dos Scripts

```bash
# Desenvolvimento local
./scripts/build_and_serve.sh --dev      # Modo desenvolvimento
./scripts/build_and_serve.sh --prod     # Modo produção

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
# Backend (servidor local de desenvolvimento)
python3 backend/stable_server.py

# Bootstrap OIDC (rodar em AWS CloudShell apenas — não local)
bash scripts/bootstrap-oidc.sh
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
2. Deploy automatizado via GitHub Actions
3. Sincronização com S3 e invalidação CloudFront
4. Verificação automática de saúde

## 📚 Documentação

- [Backend](./backend/README.md) - Servidor Flask local
- [Frontend](./frontend/README.md) - Interface e estrutura
- [Specs](./specs/SPEC.md) - SDD: specs, plan e tasks do Portfólio 2.0
- [Terraform](./terraform/) - Infraestrutura AWS (módulos + envs stage/prod)

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
