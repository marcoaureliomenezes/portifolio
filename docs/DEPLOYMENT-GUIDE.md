# 🚀 Guia de Deploy - Portfolio Marco Menezes

Este documento descreve como funciona o sistema de deploy automático do portfolio.

## 📊 Fluxo de Deploy

```
Código Local → Push/PR para main → GitHub Actions → Build → Deploy S3 → Invalidate CloudFront → Site Live
```

## ⚙️ Configuração Inicial

### 1. Executar Script de Setup

```bash
chmod +x scripts/setup-deployment.sh
./scripts/setup-deployment.sh
```

### 2. Configurar Secrets no GitHub

Vá em `Settings → Secrets and variables → Actions` e adicione:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJalrXUt...` |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID da distribuição CloudFront | `E1A2B3C4D5F6G7` |

### 3. Verificar Permissões AWS

O usuário IAM deve ter as seguintes permissões:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::marco-menezes.com",
                "arn:aws:s3:::marco-menezes.com/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🔄 Workflows GitHub Actions

### 1. Test Build (`.github/workflows/test.yml`)

**Trigger**: PR para main
**Ação**: Build de teste para validação

```yaml
Passos:
1. Checkout do código
2. Setup Node.js 18
3. Instalar dependências
4. Build da aplicação
5. Testar integridade do build
```

### 2. Production Deploy (`.github/workflows/production-deploy.yml`)

**Trigger**: Push ou merge para main
**Ação**: Deploy completo para produção

```yaml
Passos:
1. Checkout do código
2. Setup Node.js 18
3. Instalar dependências
4. Build da aplicação
5. Testar build
6. Configurar credenciais AWS
7. Deploy para S3
8. Invalidar cache CloudFront
9. Notificação de sucesso
```

## 🛠️ Comandos e Scripts

### Deploy Automático (Recomendado)

```bash
# Método 1: Push direto
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Método 2: Via Pull Request
git checkout -b feature/nova-funcionalidade
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade
# Criar PR no GitHub → Merge para main
```

### Deploy Manual (Emergência)

```bash
# Configurar credenciais (uma vez)
export AWS_ACCESS_KEY_ID=sua_access_key
export AWS_SECRET_ACCESS_KEY=sua_secret_key
export CLOUDFRONT_DISTRIBUTION_ID=sua_distribution_id

# Executar deploy manual
chmod +x scripts/manual-deploy.sh
./scripts/manual-deploy.sh
```

### Build Local (Teste)

```bash
cd frontend
npm install
npm run build
npm run preview  # Testar localmente
```

## 📊 Monitoramento e Logs

### GitHub Actions
- **Local**: Repositório → Actions tab
- **URL**: https://github.com/marcoaureliomenezes/portifolio/actions

### AWS CloudWatch
- **S3 Logs**: AWS Console → S3 → marco-menezes.com → Properties → Server access logging
- **CloudFront Logs**: AWS Console → CloudFront → Distribution → Logs

### Status do Site
- **Produção**: https://marco-menezes.com
- **Status Page**: https://status.aws.amazon.com/

## 🚨 Troubleshooting

### Build Falhando

```bash
# Limpar cache e reinstalar
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Deploy S3 Falhando

1. **Verificar credenciais AWS**:
   ```bash
   aws sts get-caller-identity
   ```

2. **Verificar permissões do bucket**:
   ```bash
   aws s3 ls s3://marco-menezes.com
   ```

3. **Testar upload manual**:
   ```bash
   aws s3 cp frontend/dist/index.html s3://marco-menezes.com/test.html
   ```

### CloudFront não Atualizando

1. **Verificar invalidação**:
   ```bash
   aws cloudfront list-invalidations --distribution-id SEU_ID
   ```

2. **Criar invalidação manual**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id SEU_ID \
     --paths "/*"
   ```

### GitHub Actions Falhando

1. **Verificar secrets**: Settings → Secrets and variables → Actions
2. **Verificar logs**: Actions tab → Workflow específico
3. **Re-executar workflow**: Actions → Re-run jobs

## 📈 Métricas e Performance

### Build Times
- **Normal**: 1-3 minutos
- **Com cache**: 30-60 segundos

### Deploy Times
- **S3 Upload**: 10-30 segundos
- **CloudFront Invalidation**: 1-5 minutos para propagação

### Monitoramento Contínuo
- **Uptime**: AWS CloudWatch
- **Performance**: Google PageSpeed Insights
- **Logs**: GitHub Actions history

## 🔐 Segurança

### Secrets Management
- ✅ Nunca commitar credenciais AWS
- ✅ Usar GitHub Secrets para credenciais
- ✅ Rotacionar keys periodicamente
- ✅ Princípio do menor privilégio

### Best Practices
- ✅ Branch protection rules
- ✅ Required status checks
- ✅ Automated testing
- ✅ Rollback capability

## 📞 Suporte

Em caso de problemas:

1. **Verificar status AWS**: https://status.aws.amazon.com/
2. **Verificar GitHub Actions**: Repository → Actions
3. **Logs detalhados**: Disponíveis em cada workflow
4. **Deploy manual**: Use o script de emergência

## 🎯 Quick Start

1. **Primeira configuração**:
   ```bash
   ./scripts/setup-deployment.sh
   ```

2. **Configurar secrets no GitHub**

3. **Fazer primeira mudança**:
   ```bash
   echo "# Deploy automático configurado" >> README.md
   git add .
   git commit -m "docs: configurar deploy automático"
   git push origin main
   ```

4. **Verificar deploy**: Actions tab no GitHub
