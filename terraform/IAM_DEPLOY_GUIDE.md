# Guia de Deploy com IAM User - GitHub Actions

## Usuário IAM: portifolio-maintainer

Este guia explica como usar o usuário IAM criado pelo Terraform para deployment automatizado via GitHub Actions.

## 🔒 Princípio de Privilégios Mínimos

O usuário `portifolio-maintainer` foi criado seguindo o princípio de **privilégios mínimos**, com apenas as permissões essenciais para deploy:

### Permissões S3 (Mínimas):
- ✅ `s3:ListBucket` - Listar conteúdo do bucket (necessário para sync)
- ✅ `s3:PutObject` - Upload de arquivos
- ✅ `s3:PutObjectAcl` - Definir ACL dos objetos 
- ✅ `s3:DeleteObject` - Deletar arquivos antigos (necessário para --delete no sync)

### Permissões CloudFront (Opcional):
- ✅ `cloudfront:CreateInvalidation` - Invalidar cache após deploy

### ❌ Permissões NÃO incluídas (por segurança):
- ❌ `s3:GetBucketPolicy` - Visualizar políticas do bucket
- ❌ `s3:PutBucketPolicy` - Modificar políticas do bucket
- ❌ `s3:GetObject` - Baixar arquivos existentes
- ❌ `s3:GetObjectVersion` - Acessar versões de objetos
- ❌ `s3:DeleteObjectVersion` - Deletar versões específicas
- ❌ Qualquer permissão administrativa

## 🔐 Configuração no GitHub

### 1. Criar Access Key via AWS Console

Após aplicar o Terraform, acesse o AWS Console:

1. **AWS Console** → **IAM** → **Users** → **portifolio-maintainer**
2. Clique na aba **Security credentials**
3. Clique em **Create access key**
4. Escolha **Application running outside AWS**
5. Clique em **Create access key**
6. **⚠️ IMPORTANTE**: Copie e salve as credenciais imediatamente - você não poderá vê-las novamente!

### 2. Configurar GitHub Secrets

No seu repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

```
AWS_ACCESS_KEY_ID=<access_key_criada_no_console>
AWS_SECRET_ACCESS_KEY=<secret_key_criada_no_console>
AWS_REGION=us-east-1
S3_BUCKET_NAME=<nome_do_bucket>
CLOUDFRONT_DISTRIBUTION_ID=<id_da_distribuicao>
```

**Dica**: Use `terraform output` para obter os valores do bucket e distribution ID:
```bash
terraform output s3_bucket_name
terraform output cloudfront_distribution_id
```

### 3. Exemplo de GitHub Action

```yaml
name: Deploy Portfolio

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build
      run: |
        cd frontend
        npm run build
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
    
    - name: Deploy to S3
      run: |
        aws s3 sync frontend/dist s3://${{ secrets.S3_BUCKET_NAME }} --delete
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## 🛡️ Segurança da Bucket Policy

O bucket S3 tem uma **resource policy** que:

1. **Permite leitura pública** para servir o site
2. **Nega escrita para todos**, exceto o usuário `portifolio-maintainer`
3. **Permite escrita apenas** para o usuário IAM específico

Isso significa que mesmo se outras credenciais AWS forem comprometidas, elas não poderão modificar o conteúdo do seu site.

## 🔄 Comandos Manuais (se necessário)

Se precisar fazer deploy manual:

```bash
# Configurar credenciais (uma vez)
aws configure set aws_access_key_id <ACCESS_KEY>
aws configure set aws_secret_access_key <SECRET_KEY>
aws configure set default.region us-east-1

# Deploy
aws s3 sync frontend/dist s3://your-bucket-name --delete

# Invalidar cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## ⚠️ Importantes Considerações de Segurança

1. **Rotacione as credenciais regularmente**
2. **Use apenas em GitHub Secrets** - nunca commite credenciais no código
3. **Monitore o uso via CloudTrail** 
4. **Considere usar IAM Roles** com OIDC em vez de credenciais estáticas (mais seguro)

## 📊 Monitoramento

Para monitorar atividade do usuário:

```bash
# Ver logs de CloudTrail
aws logs filter-log-events --log-group-name CloudTrail/Portfolio --filter-pattern "portifolio-maintainer"

# Ver objetos no bucket
aws s3 ls s3://your-bucket-name --recursive
```
