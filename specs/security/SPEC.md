# Security Spec: portifolio

> **Status:** [x] Aprovado
> **Owner:** portifolio
> **Escopo:** frontend estatico, CI/CD, AWS hosting e tooling local

## Problema

O portfolio e um site publico associado a uma identidade profissional. Erros de seguranca podem expor credenciais AWS, permitir alteracoes indevidas no deploy, quebrar HTTPS, vazar dados pessoais ou tornar a infraestrutura dificil de recuperar.

## Objetivos

1. Garantir que producao use HTTPS via CloudFront.
2. Manter bucket S3 protegido contra escrita/leitura indevida.
3. Garantir que credenciais AWS nunca sejam versionadas.
4. Controlar deploy por GitHub Actions e secrets.
5. Manter Terraform como fonte de verdade da infraestrutura.
6. Reduzir superficie de ataque do tooling local Flask.

## Fora De Escopo

- Area autenticada.
- Pagamentos.
- Banco de dados.
- Coleta de dados sensiveis de visitantes.
- Backend produtivo com API publica.

## Requisitos Funcionais

- **FR-S01:** Credenciais AWS devem existir apenas em GitHub Secrets, variaveis locais ou cofres externos, nunca no Git.
- **FR-S02:** `terraform/terraform.tfvars` e arquivos de state local devem permanecer gitignored.
- **FR-S03:** GitHub Actions deve autenticar na AWS exclusivamente via OIDC (`id-token: write`) — credenciais de longa duracao (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) sao proibidas para CI/CD.
- **FR-S11:** Um OIDC Identity Provider deve ser provisionado na conta AWS para `token.actions.githubusercontent.com`.
- **FR-S12:** Uma IAM role deve ser criada com trust policy scoped a `repo:marcoaureliomenezes/portifolio:ref:refs/heads/main`. A role deve ter permissoes minimas: escrita no bucket S3 `marco-menezes.com` e invalidacao de CloudFront. Nenhum wildcard de recurso.
- **FR-S13:** O ARN da IAM role deve ser armazenado como GitHub Secret `AWS_ROLE_ARN` e nunca versionado.
- **FR-S04:** CloudFront deve servir `marco-menezes.com` com TLS valido.
- **FR-S05:** S3 deve ser acessado pelo publico apenas via CloudFront/OAC, nao como bucket publico aberto.
- **FR-S06:** CloudFront deve redirecionar HTTP para HTTPS.
- **FR-S07:** Terraform deve declarar recursos de S3, CloudFront, ACM, Route 53 e IAM necessarios para recovery.
- **FR-S08:** Scripts locais nao devem imprimir secrets.
- **FR-S09:** Flask local deve ser tratado como ferramenta de desenvolvimento e nao exposto como dependencia de producao.
- **FR-S10:** Links externos publicos devem usar `target="_blank"` com `rel="noopener noreferrer"` quando aplicavel.

## Requisitos Nao Funcionais

- **NFR-S01:** Deploy deve ser reproduzivel sem passos manuais ocultos, exceto criacao/rotacao de secrets.
- **NFR-S02:** Falhas de CI devem impedir deploy de build quebrado.
- **NFR-S03:** Politicas IAM devem evitar wildcard amplo quando recursos especificos forem conhecidos.
- **NFR-S04:** O site deve continuar acessivel sem backend.
- **NFR-S05:** Alteracoes de infra devem passar por `terraform plan` antes de `apply`.
- **NFR-S06:** Nenhuma credencial de longa duracao deve existir como secret de CI/CD. OIDC e o unico mecanismo autorizado para autenticacao AWS em pipelines.

## Dependencias Desta Spec

A feature `deploy-pipeline` depende desta spec: a IAM role OIDC (FR-S11, FR-S12, FR-S13) deve estar provisionada antes que o pipeline de deploy possa ser implementado.

## Verificacao

Checklist esperado:

- `npm run build` gera `frontend/dist/index.html`.
- GitHub Actions nao expoe secrets em logs.
- `terraform plan` nao mostra destruicao inesperada.
- `aws sts get-caller-identity` confirma conta AWS correta antes de operacoes.
- `curl -I https://marco-menezes.com` retorna HTTPS funcional.
- Bucket S3 nao permite listagem publica direta.
- CloudFront invalidation ocorre apos deploy.

## Riscos Conhecidos

- O ambiente local atual nao possui Terraform CLI nem AWS CLI.
- O dominio em `terraform.tfvars.example` diverge do dominio canonico.
- Security headers ainda nao foram verificados contra a distribuicao real.
- Politicas IAM precisam ser revisadas contra o Terraform atual antes de aprovacao.
