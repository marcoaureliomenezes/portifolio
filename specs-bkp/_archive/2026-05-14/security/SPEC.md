# Security Spec: portifolio

> **Status:** [ ] Draft

## Escopo

Segurança do site de portfólio — frontend estático, backend Flask, pipeline CI/CD e infra Terraform.

## Requisitos de Segurança

### Secrets e Credenciais

- **FR-S01**: Credentials AWS (access key, secret key) nunca commitadas — gerenciadas via GitHub Secrets
- **FR-S02**: `terraform.tfvars` gitignored — template em `terraform.tfvars.example`
- **FR-S03**: IAM user de deploy com permissões mínimas (S3 + CloudFront only)

### Frontend / CloudFront

- **FR-S04**: HTTPS obrigatório via CloudFront — sem acesso direto ao S3 bucket
- **FR-S05**: Bucket S3 privado — acesso apenas via CloudFront OAC/OAI
- **FR-S06**: Headers de segurança configurados no CloudFront (CSP, X-Frame-Options)

### Backend Flask

- **FR-S07**: Sem endpoints que aceitem input não sanitizado
- **FR-S08**: CORS configurado para permitir apenas o domínio do frontend

## Verificação

- `aws s3api get-bucket-acl --bucket <bucket>` confirma bucket privado
- CI/CD não expõe secrets nos logs
- `terraform plan` sem recursos IAM com `*` em actions ou resources
