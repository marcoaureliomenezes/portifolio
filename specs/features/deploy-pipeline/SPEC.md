# Feature Spec: deploy-pipeline

> **Status:** [x] Aprovado
> **Owner:** portifolio
> **Tipo:** CI/CD

## Problema

O portfolio precisa de deploy confiavel para `marco-menezes.com`. O repositorio ja tem workflows GitHub Actions, scripts e Terraform, mas a documentacao contem trechos antigos e inconsistentes. Sem uma spec, o pipeline pode ficar fragil ou depender de conhecimento implicito.

## Objetivos

1. Definir o pipeline canonico de build e deploy.
2. Garantir que PR valide build antes de merge.
3. Garantir que push/merge em `main` faca deploy para AWS.
4. Documentar secrets obrigatorios.
5. Documentar rollback e invalidacao CloudFront.

## Fora De Escopo

- Trocar AWS por outro host.
- Criar ambientes staging/dev separados.
- Criar deploy manual como fluxo principal.
- Alterar Terraform sem spec propria de recovery/infra.

## Pipeline Canonico

Pull request para `main`:

- Checkout.
- Setup Node.js.
- `npm ci`.
- `npm run build`.
- Verificacao de `dist/index.html` e assets.

Push ou merge em `main`:

- Checkout.
- Setup Node.js.
- `npm ci`.
- `npm run build`.
- Verificacao de build.
- Configuracao de credenciais AWS via OIDC (`role-to-assume: ${{ secrets.AWS_ROLE_ARN }}`).
- `aws s3 sync frontend/dist/ s3://marco-menezes.com --delete`.
- `aws cloudfront create-invalidation --paths "/*"`.

## Dependencias

Esta feature requer que a seguinte feature esteja implementada antes:

- `security` — OIDC Identity Provider e IAM role devem estar provisionados na conta AWS antes de qualquer deploy.

## Secrets Obrigatorios

- `AWS_ROLE_ARN` — ARN da IAM role com trust policy scoped a `repo:marcoaureliomenezes/portifolio:ref:refs/heads/main` (provisionada pela feature `security`).
- `CLOUDFRONT_DISTRIBUTION_ID`

Credenciais de longa duracao (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) sao proibidas para CI/CD. O unico metodo autorizado e OIDC via `role-to-assume`.

## Assets De Deploy

PDFs de CV sao assets versionados em `frontend/public/cv/` e devem ser incluidos no `aws s3 sync`. O flag `--delete` e permitido pois os PDFs estao na fonte local — nunca devem ser gerenciados manualmente no bucket.

## Requisitos Funcionais

- **FR-001:** PR para `main` deve validar build antes de merge.
- **FR-002:** Deploy de producao deve ocorrer apenas em `main`.
- **FR-003:** Deploy deve usar `npm ci`, nao `npm install`.
- **FR-004:** Deploy deve sincronizar apenas `frontend/dist`.
- **FR-005:** Deploy deve invalidar CloudFront apos sync.
- **FR-006:** Workflow deve falhar se `dist/index.html` nao existir.
- **FR-007:** Secrets devem vir do GitHub Actions, nunca do repo.
- **FR-008:** Documentacao deve refletir o workflow real.

## Requisitos Nao Funcionais

- **NFR-001:** Deploy deve ser rapido e simples.
- **NFR-002:** Logs nao devem expor secrets.
- **NFR-003:** Falha de deploy deve ser visivel no GitHub Actions.
- **NFR-004:** Pipeline deve funcionar sem backend Flask.
- **NFR-005:** Pipeline deve ser compativel com SPA e CloudFront fallback.

## Criterios De Aceite

- `test.yml` e `production-deploy.yml` documentados como fluxo canonico.
- README e docs antigas corrigidas em tarefa futura para remover divergencias.
- Secrets obrigatorios documentados.
- Deploy para S3 e invalidacao CloudFront definidos.
- Rollback manual documentado como reverter commit e redeployar `main`.

## Riscos

- Secrets podem estar ausentes ou antigos.
- Bucket S3 pode ter nome diferente se Terraform driftou.
- CloudFront distribution ID pode ter mudado apos destruicao/recriacao.
- Branch protection pode nao exigir o workflow de teste.
