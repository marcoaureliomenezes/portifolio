# 🚀 DevOps - Infraestrutura e Automação

Este diretório contém toda a configuração de infraestrutura AWS e scripts de automação para o portfólio.

## 📁 Estrutura

```
devops/
├── terraform/           # Configuração da infraestrutura AWS
│   ├── main.tf         # Configuração principal e providers
│   ├── variables.tf    # Definição de variáveis
│   ├── outputs.tf      # Outputs da infraestrutura
│   ├── s3.tf          # Configuração do bucket S3
│   ├── cloudfront.tf  # Distribuição CloudFront
│   ├── acm.tf         # Certificado SSL/TLS
│   ├── route53.tf     # Configuração DNS
│   └── terraform.tfvars.example  # Exemplo de configuração
├── scripts/            # Scripts de automação
│   ├── setup.sh       # Setup inicial da infraestrutura
│   ├── deploy.sh      # Deploy do frontend
│   ├── status.sh      # Verificação de status
│   └── destroy.sh     # Destruição da infraestrutura
└── README.md          # Este arquivo
```

## 🏗️ Infraestrutura AWS

### Recursos Criados

- **S3 Bucket**: Hospedagem estática com versionamento e logging
- **CloudFront**: CDN global com cache otimizado
- **ACM**: Certificado SSL/TLS automático
- **Route53**: DNS e health checks
- **CloudWatch**: Monitoramento e alertas

### Características

- ✅ HTTPS obrigatório
- ✅ Cache otimizado por tipo de arquivo
- ✅ Versionamento de objetos S3
- ✅ Proteção contra exclusão acidental
- ✅ Logs de acesso
- ✅ Health checks automatizados
- ✅ Redirecionamento WWW
- ✅ Invalidação automática de cache

## 🚀 Início Rápido

### Pré-requisitos

1. **AWS CLI configurado**:
   ```bash
   aws configure
   # Configure suas credenciais AWS
   ```

2. **Terraform instalado**:
   ```bash
   # Ubuntu/Debian
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt update && sudo apt install terraform
   ```

3. **Domínio registrado e configurado no Route53**

### Setup Inicial

1. **Configure as variáveis**:
   ```bash
   cd devops/terraform/
   cp terraform.tfvars.example terraform.tfvars
   # Edite terraform.tfvars com suas configurações
   ```

2. **Crie a infraestrutura**:
   ```bash
   cd ../scripts/
   ./setup.sh
   ```

3. **Faça o primeiro deploy**:
   ```bash
   ./deploy.sh
   ```

4. **Verifique o status**:
   ```bash
   ./status.sh
   ```

## 📋 Scripts Disponíveis

### `setup.sh` - Setup da Infraestrutura

Cria toda a infraestrutura AWS necessária.

```bash
# Setup básico
./setup.sh

# Setup para staging
./setup.sh staging

# Setup sem confirmações (cuidado!)
./setup.sh -y prod
```

**O que faz:**
- Valida pré-requisitos
- Inicializa Terraform
- Cria plano de execução
- Aplica a infraestrutura
- Mostra outputs importantes

### `deploy.sh` - Deploy do Frontend

Sincroniza o frontend com S3 e invalida o cache do CloudFront.

```bash
# Deploy básico
./deploy.sh

# Deploy com aguardo da invalidação
./deploy.sh -w

# Deploy para staging
./deploy.sh staging
```

**O que faz:**
- Sincroniza arquivos com S3
- Define cache headers otimizados
- Cria invalidação do CloudFront
- Verifica a conectividade

### `status.sh` - Verificação de Status

Verifica o status completo da infraestrutura e website.

```bash
# Verificar status
./status.sh

# Status do staging
./status.sh staging
```

**Verificações:**
- Status da infraestrutura Terraform
- Bucket S3 e conteúdo
- Distribuição CloudFront
- Certificado SSL
- Resolução DNS
- Conectividade do website

### `destroy.sh` - Destruição da Infraestrutura

⚠️ **CUIDADO**: Remove toda a infraestrutura AWS.

```bash
# Destruir (com confirmações)
./destroy.sh dev

# Destruir sem confirmações (PERIGOSO!)
./destroy.sh -y dev
```

## ⚙️ Configuração

### Variáveis Principais

Edite `terraform/terraform.tfvars`:

```hcl
# Configuração básica
aws_region   = "us-east-1"
environment  = "prod"
domain_name  = "seudominio.com"
project_name = "seu-portfolio"

# Tags personalizadas
tags = {
  Environment = "prod"
  Project     = "portfolio"
  Owner       = "Seu Nome"
  ManagedBy   = "Terraform"
}
```

### Ambientes

Suporte a múltiplos ambientes:

- **prod**: Produção (padrão)
- **staging**: Staging/homologação
- **dev**: Desenvolvimento

## 🔧 Personalização

### Modificar Cache do CloudFront

Edite `terraform/cloudfront.tf`:

```hcl
default_cache_behavior {
  default_ttl = 3600    # 1 hora
  max_ttl     = 86400   # 24 horas
  # ...
}
```

### Adicionar Novos Recursos

1. Crie um novo arquivo `.tf` em `terraform/`
2. Defina as variáveis necessárias em `variables.tf`
3. Adicione outputs em `outputs.tf`
4. Execute `terraform plan` para validar

### Custom Domain

Para usar um domínio personalizado:

1. Configure o domínio no Route53
2. Atualize `domain_name` em `terraform.tfvars`
3. Execute `./setup.sh`

## 📊 Monitoramento

### Health Checks

Monitoramento automático do website:

- Verificação HTTPS a cada 30 segundos
- Alarme CloudWatch em caso de falha
- Threshold configurável

### Logs

- **S3**: Logs de acesso no bucket de logging
- **CloudFront**: Logs de distribuição (opcional)
- **Route53**: Logs de consultas DNS

### Métricas

Métricas disponíveis no CloudWatch:

- Latência do CloudFront
- Taxa de cache hit/miss
- Códigos de erro HTTP
- Status do health check

## 🔒 Segurança

### Boas Práticas Implementadas

- ✅ HTTPS obrigatório
- ✅ Bucket S3 não público
- ✅ Acesso via CloudFront OAC
- ✅ Headers de segurança
- ✅ Versionamento habilitado
- ✅ Proteção contra exclusão

### Permissões AWS

Permissões mínimas necessárias:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "acm:*",
        "route53:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## � Troubleshooting

### Problemas Comuns

#### Certificado SSL Pendente
```bash
# Verificar status
./status.sh

# Aguardar até 30 minutos para validação automática
```

#### CloudFront não atualizado
```bash
# Forçar invalidação
aws cloudfront create-invalidation \
  --distribution-id SEU_ID \
  --paths "/*"
```

#### DNS não resolvendo
```bash
# Verificar configuração
dig seudominio.com

# Verificar Route53
aws route53 list-hosted-zones
```

#### S3 bucket já existe
```bash
# Verificar buckets existentes
aws s3 ls

# Atualizar nome do bucket em terraform.tfvars
```

### Logs Úteis

```bash
# Logs do Terraform
terraform show

# Status detalhado
./status.sh

# Logs AWS (CloudTrail)
aws logs describe-log-groups
```

## 💰 Custos

### Estimativa Mensal (região us-east-1)

- **S3**: ~$1-5 (dependendo do tráfego)
- **CloudFront**: ~$1-10 (primeiros 1TB gratuitos)
- **Route53**: ~$0.50 por hosted zone
- **ACM**: Gratuito
- **CloudWatch**: ~$0-2

**Total estimado**: $2-18/mês

### Otimização de Custos

- Use `PriceClass_100` no CloudFront
- Configure lifecycle policies no S3
- Delete objetos antigos automaticamente
- Use ambientes separados para dev/staging

## 🤝 Contribuição

Para contribuir com melhorias:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Teste as alterações
4. Submeta um pull request

### Testes

```bash
# Validar Terraform
terraform validate
terraform fmt -check

# Testar em ambiente de dev
./setup.sh dev
./deploy.sh dev
./status.sh dev
./destroy.sh dev
```

## 📚 Recursos Adicionais

- [Documentação do Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/)
- [Route53 Developer Guide](https://docs.aws.amazon.com/route53/)

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Infraestrutura completa AWS
- ✅ Scripts de automação
- ✅ Suporte a múltiplos ambientes
- ✅ Monitoramento e health checks
- ✅ Documentação completa

---

**Criado com ❤️ para automatizar o deployment de portfólios profissionais**
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   ├── modules/
│   │   ├── s3-website/
│   │   ├── cloudfront/
│   │   ├── route53/
│   │   └── lambda/
│   └── shared/
├── scripts/
├── configs/
└── README.md
```

## 🎯 Objetivos

### Infraestrutura AWS:
- ☐ **S3** - Hospedagem estática do site
- ☐ **CloudFront** - CDN global 
- ☐ **Route53** - DNS personalizado
- ☐ **Certificate Manager** - SSL/TLS
- ☐ **Lambda** - APIs serverless (contato, etc.)
- ☐ **API Gateway** - Endpoint management
- ☐ **CloudWatch** - Monitoring e logs

### Ambientes:
- ☐ **Development** - Para testes
- ☐ **Staging** - Homologação  
- ☐ **Production** - Site live

### Automação:
- ☐ **GitHub Actions** - CI/CD pipeline
- ☐ **Terraform Cloud** - State management
- ☐ **Automated deployments** - Push to deploy

## 🔧 Próximos Passos

1. **Definir arquitetura** - Desenhar diagrama da infraestrutura
2. **Criar módulos Terraform** - Componentes reutilizáveis
3. **Setup environments** - Dev, staging, prod
4. **Configure CI/CD** - Automated deployments
5. **Setup monitoring** - CloudWatch + alertas

## 📋 Pré-requisitos

- AWS CLI configurado
- Terraform instalado
- Conta AWS com permissões adequadas
- GitHub repository configurado

---

**Status:** 🚧 Em planejamento - Será desenvolvido na próxima fase
