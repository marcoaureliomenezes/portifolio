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
│       └── terraform.yml  # Apply manual por ambiente (workflow_dispatch)
├── scripts/
│   ├── bootstrap-oidc.sh  # Cria so o OIDC provider do GitHub na conta (uma unica vez — nao Developer)
│   ├── build_frontend.sh
│   └── setup-deployment.sh
└── specs/             # SDD: constitution.md, memory/, releases/, backlog/, bugs/, audits/, ADRs/
```

---

## Desenvolvimento Local

```bash
# Frontend
cd frontend/
npm install
npm run dev        # Vite HMR em localhost:8080
npm run build      # Build de producao em dist/ (inclui blog, RSS e paginas pre-renderizadas)
npm run preview    # Servidor local da build
```

**Blog**: cada post e uma pasta `frontend/content/blog/<slug>/index.md` (front matter + Markdown, midia ao lado). O blog so aparece no build: `npm run build && npm run preview`. O link Blog entra no header quando ha ao menos um post publicado.

**Pre-requisitos**: Node.js na versão de `engines.node` em `frontend/package.json`. Nenhuma credencial AWS necessaria para desenvolvimento local.

---

## CI/CD

| Trigger | Workflow | O que faz |
|---|---|---|
| Todo PR para `develop` ou `main` | `ci.yml` | Lint, type-check, unit tests, i18n parity, build, E2E smoke, Lighthouse |
| Push em `develop` | `deploy.yml` | Build + deploy para stage S3 (inclui o schema publicado `schema/site-content.schema.json`) + CloudFront invalidation |
| Push em `main` | `deploy.yml` | Build + deploy para prod (environment gate; inclui o schema publicado `schema/site-content.schema.json`) |
| Disparo manual (`workflow_dispatch`, input `env`) | `terraform.yml` | fmt, validate, plan, guarda de delete/replace e `terraform apply` no environment `infra` |

Autenticacao AWS: **OIDC exclusivamente**. Nenhuma chave estatica em uso.

---

## Infraestrutura AWS

Gerenciada via Terraform em `terraform/envs/{stage,prod}/`.

- **S3**: bucket privado por env (acesso somente via CloudFront OAC)
- **CloudFront**: distribuicao dedicada por env, HTTPS obrigatorio, SPA fallback
- **ACM**: certificado SSL em `us-east-1` (requisito CloudFront)
- **Route53**: registro A ALIAS apontando para CloudFront
- **IAM**: role OIDC por env (`github-actions-portfolio-{stage,prod}-deploy`), assumida so por um job no environment GitHub do env (`stage`, `production`)
- **SSM** (us-east-1): `/static-sites/<site>/<env>/bucket` e `/static-sites/<site>/<env>/distribution-id`, por onde o painel acha o site

O `terraform apply` e executado **exclusivamente via GitHub Actions** (workflow `terraform.yml`).
O script cria apenas o OIDC provider do GitHub da conta; a role de apply pertence ao bootstrap do painel. Para o provider, use `scripts/bootstrap-oidc.sh` (Fluxo A via CloudShell ou Fluxo B com `INFRA_SPECIALIST_MODE=1`).

---

## Specs e Documentacao

- [Spec principal](./specs/releases/) — SPEC, PLAN e jobs de cada candidato
- [Constitution](./specs/constitution.md) — principios do projeto

---

**Desenvolvido por Marco Menezes**
