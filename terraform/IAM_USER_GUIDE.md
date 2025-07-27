# Usuário IAM para Manutenção do Portfólio

## Visão Geral

O Terraform criará um usuário IAM dedicado chamado `portifolio-maintainer` com permissões restritas apenas para gerenciar o bucket S3 do portfólio. Este usuário é a única forma segura de fazer upload de arquivos para o bucket.

## Configuração

### 1. Habilitar a criação do usuário

No arquivo `terraform.tfvars`:

```hcl
create_iam_user = true
iam_user_name   = "portifolio-maintainer"
```

### 2. Aplicar a configuração

```bash
cd terraform/
terraform plan
terraform apply
```

### 3. Obter as credenciais

Após a aplicação, você pode ver as credenciais (CUIDADO - são sensíveis):

```bash
# Access Key ID
terraform output iam_access_key_id

# Secret Access Key (sensível)
terraform output -raw iam_secret_access_key
```

## Políticas de Segurança

### Política do Bucket S3

A política do bucket S3 foi configurada com três statements:

1. **Leitura Pública**: Qualquer um pode ler arquivos (necessário para site estático)
2. **Negação de Escrita**: Nega operações de escrita para todos, exceto o usuário `portifolio-maintainer`
3. **Acesso Completo**: Concede acesso completo ao usuário `portifolio-maintainer`

### Políticas do Usuário IAM

O usuário possui duas políticas anexadas:

1. **PortfolioS3ManagementPolicy**: Gerenciamento completo do bucket S3 do portfólio
2. **PortfolioCloudFrontInvalidationPolicy**: Permissão para invalidar cache do CloudFront

## Comandos de Deployment

### Configurar AWS CLI

```bash
# Usando as credenciais do usuário IAM
aws configure set aws_access_key_id <ACCESS_KEY_ID>
aws configure set aws_secret_access_key <SECRET_ACCESS_KEY>
aws configure set default.region us-east-1
```

### Sync do Frontend

```bash
# Fazer build do frontend
cd frontend/
npm run build

# Sync para S3
aws s3 sync ./dist s3://seu-dominio.com --delete

# Invalidar cache do CloudFront
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

## Outputs Importantes

O Terraform fornece vários outputs úteis:

- `iam_user_name`: Nome do usuário IAM
- `iam_user_arn`: ARN do usuário IAM
- `iam_access_key_id`: Access Key ID (sensível)
- `iam_secret_access_key`: Secret Access Key (sensível)
- `deployment_commands`: Comandos prontos para uso

## Segurança

### Boas Práticas

1. **Nunca compartilhe as credenciais**: Use AWS Systems Manager Parameter Store ou AWS Secrets Manager em produção
2. **Rotacione as chaves regularmente**: Crie novas access keys periodicamente
3. **Use perfis do AWS CLI**: Configure perfis separados para diferentes ambientes
4. **Monitor o uso**: Ative CloudTrail para auditoria

### Exemplo de Configuração Segura

Para CI/CD, considere usar:

```yaml
# GitHub Actions secrets
AWS_ACCESS_KEY_ID: ${{ secrets.PORTFOLIO_AWS_ACCESS_KEY_ID }}
AWS_SECRET_ACCESS_KEY: ${{ secrets.PORTFOLIO_AWS_SECRET_ACCESS_KEY }}
```

## Troubleshooting

### Erro de Permissão

Se receber erro de permissão ao fazer upload:

1. Verifique se está usando as credenciais corretas
2. Confirme se o usuário IAM foi criado (`terraform output iam_user_name`)
3. Verifique se as políticas estão anexadas

### Erro de Sync

Se o comando `aws s3 sync` falhar:

1. Verifique se o bucket existe
2. Confirme o nome do bucket (`terraform output website_bucket_name`)
3. Verifique a região AWS configurada

## Desabilitar o Usuário IAM

Para desabilitar a criação do usuário IAM:

```hcl
# terraform.tfvars
create_iam_user = false
```

**Nota**: Isso removerá as restrições de escrita do bucket, permitindo que qualquer usuário AWS com permissões adequadas faça upload.
