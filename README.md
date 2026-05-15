# Portfolio Marco Menezes

**Engenheiro de Dados | Cloud Specialist**

Portfolio profissional desenvolvido com React/TypeScript, hospedado na AWS via CloudFront + S3, com deploy automatizado via GitHub Actions usando OIDC (sem chaves estaticas).

- **Producao**: https://marco-menezes.com
- **Stage**: https://stage.marco-menezes.com
- **CI/CD**: [GitHub Actions](https://github.com/marcoaureliomenezes/portifolio/actions)

---

## Estrutura do Projeto

```
portifolio/
├── frontend/          # React/TypeScript + Vite
├── terraform/
│   ├── modules/       # Modulo portfolio-static-site (reutilizavel por env)
│   └── envs/
│       ├── stage/     # Infra stage (stage.marco-menezes.com)
│       └── prod/      # Infra prod (marco-menezes.com)
├── .github/
│   └── workflows/
│       ├── ci.yml         # Lint + Build + Testes (todo PR)
│       ├── deploy.yml     # Deploy frontend (push develop/main)
│       └── terraform.yml  # Plan (PR) + Apply (push)
├── scripts/
│   └── bootstrap-oidc.sh  # Bootstrap OIDC inicial (uma unica vez — nao Developer)
└── specs/             # SDD: constitution, foundation, features, TASKS
```

---

## Desenvolvimento Local

```bash
# Frontend
cd frontend/
npm install
npm run dev        # Vite HMR em localhost:5173
npm run build      # Build de producao em dist/
npm run preview    # Servidor local da build
```

**Pre-requisitos**: Node.js 20+. Nenhuma credencial AWS necessaria para desenvolvimento local.

---

## CI/CD

| Trigger | Workflow | O que faz |
|---|---|---|
| Todo PR para `develop` ou `main` | `ci.yml` | Lint, type-check, build, unit tests |
| Push em `develop` | `deploy.yml` | Build + deploy para stage S3 + CloudFront invalidation |
| Push em `main` | `deploy.yml` | Build + deploy para prod (environment gate) |
| Push em `develop` (arquivos `terraform/**`) | `terraform.yml` | `terraform apply` em stage |
| Push em `main` (arquivos `terraform/**`) | `terraform.yml` | `terraform apply` em prod (environment gate) |
| PR para `develop` (arquivos `terraform/**`) | `terraform.yml` | `terraform plan` stage comentado no PR |
| PR para `main` (arquivos `terraform/**`) | `terraform.yml` | `terraform plan` prod comentado no PR |

Autenticacao AWS: **OIDC exclusivamente**. Nenhuma chave estatica em uso.

---

## Infraestrutura AWS

Gerenciada via Terraform em `terraform/envs/{stage,prod}/`.

- **S3**: bucket privado por env (acesso somente via CloudFront OAC)
- **CloudFront**: distribuicao dedicada por env, HTTPS obrigatorio, SPA fallback
- **ACM**: certificado SSL em `us-east-1` (requisito CloudFront)
- **Route53**: registro A ALIAS apontando para CloudFront
- **IAM**: role OIDC por env (`github-actions-portfolio-{stage,prod}-deploy`)

O `terraform apply` e executado **exclusivamente via GitHub Actions** (workflow `terraform.yml`).
Para o bootstrap inicial do OIDC provider, use `scripts/bootstrap-oidc.sh` (Fluxo A via CloudShell ou Fluxo B com `INFRA_SPECIALIST_MODE=1` — vide `specs/features/infra-retomada/SPEC.md §5`).

---

## Specs e Documentacao

- [Spec principal](./specs/SPEC.md) — visao geral do produto
- [Foundation](./specs/foundation/SPEC.md) — principios, governanca, seguranca
- [TASKS](./specs/TASKS.md) — backlog atomico com estado de progresso
- [Infra-retomada](./specs/features/infra-retomada/SPEC.md) — detalhe da pipeline CI/CD

---

**Desenvolvido por Marco Menezes**
