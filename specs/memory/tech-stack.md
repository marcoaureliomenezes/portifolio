---
slug: tech-stack
title: Tech Stack
category: core
tldr: React 18 + Vite 7 + TypeScript strict + Tailwind + shadcn podado; infra CloudFront+S3+ACM+Terraform; CI/CD OIDC; testes Vitest+Playwright.
summary: Cataloga linguagens, runtimes, dependências aprovadas (e removidas), ferramentas de teste, infraestrutura AWS, CI/CD com OIDC, Terraform e restrições explícitas do stack. Referência obrigatória antes de propor novas dependências.
tags:
  - tech-stack
  - dependencies
  - languages
  - frontend
  - aws
  - terraform
agent_tier: inject
token_estimate: 800
last_updated: "2026-05-17"
release_origin: frontend-refactor-v1
---

## Frontend (P0 — em produção)

| Componente | Tecnologia | Versão | Decisão |
|------------|-----------|--------|---------|
| Framework | React | 18.3.x | Mantido — refactor, não migração. |
| Linguagem | TypeScript | 5.5.x | Strict habilitado em T-FE-QUAL-01. |
| Build tool | Vite | 7.3.x | Já corrigido em commit `c9aa3d4` (Vite 5 -> 7). |
| CSS | Tailwind CSS | 3.4.x | + `tailwindcss-animate`, `@tailwindcss/typography` (dev). |
| Roteamento | `react-router-dom` | 6.26.x | Lazy-loading por rota para code-splitting. |
| Package manager | **npm** | — | `package-lock.json` é a fonte de verdade. Não usar Bun/yarn/pnpm. |
| UI base | shadcn/ui (podado) | — | 10 componentes mantidos, 37 marcados REMOVE. |
| Tipografia | Inter + JetBrains Mono | via `@fontsource/*` | Zero request externo (decisão visual-identity-v1). |

## shadcn/ui — KEEP vs REMOVE (pós frontend-refactor-v1)

**KEEP (10 componentes):** `button.tsx`, `card.tsx`, `badge.tsx`, `collapsible.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `tooltip.tsx`, `dialog.tsx`, `skeleton.tsx`.

**REMOVE (37 componentes — deletados em frontend-refactor-v1):**
accordion, alert-dialog, alert, aspect-ratio, avatar, breadcrumb, calendar, carousel, chart, checkbox, command, context-menu, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, slider, switch, table, tabs, textarea, toggle, toggle-group, sonner, toaster, toast, sidebar (substituído por `<nav>` Tailwind nativo em T-FE-QUAL-03), input.

**Dependências npm removidas:** `@radix-ui/react-{accordion,alert-dialog,aspect-ratio,avatar,checkbox,context-menu,dropdown-menu,hover-card,menubar,navigation-menu,popover,progress,radio-group,scroll-area,slider,switch,tabs,toast,toggle,toggle-group}`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-hook-form`, `@hookform/resolvers`, `react-resizable-panels`, `recharts`, `vaul`, `zod`, `@tanstack/react-query`, `next-themes`, `lovable-tagger`. Ganho real: ≥ 180KB minified+gz no bundle inicial.

**KEEP obrigatórias (não remover):** `react`, `react-dom`, `react-router-dom`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tailwindcss-animate`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`.

## Testes

| Tipo | Toolchain | Notas |
|------|-----------|-------|
| Unit | **Vitest** + Testing Library + `jsdom` | Collocated (`*.test.tsx` ao lado do componente). |
| E2E | **Playwright** (TypeScript) | 5 projects: chromium, firefox, webkit, mobile-chrome (Pixel 5), mobile-safari (iPhone 13). |
| Acessibilidade E2E | `@axe-core/playwright` | Smoke axe na home + 3 abas (warn em develop, error em main). |
| Lighthouse | `@lhci/cli` ≥ 0.14 | Servidor local via `npm run preview` (porta 4173). |

## Backend (P1 — não implementar agora)

| Componente | Tecnologia | Decisão |
|------------|-----------|---------|
| Linguagem | **Go** 1.23+ | — |
| Plataforma | AWS Lambda | Runtime `provided.al2023`, arch **arm64** (~20% mais barato). |
| HTTP | `net/http` puro + `aws-lambda-go/events.APIGatewayV2HTTPRequest` | **Sem framework** (Chi/Echo/Gin). 1 endpoint apenas. |
| AWS SDK | `aws-sdk-go-v2` | v2 ergonomia moderna + binário menor. |
| Validação | `github.com/santhosh-tekuri/jsonschema/v5` | Sem CGO, draft-7, maduro. |
| Logging | `log/slog` (stdlib desde 1.21) | Zero dep, JSON estruturado nativo. |
| Auth | Cognito JWT validator no API Gateway HTTP API | Lambda só lê claims do contexto. |
| Storage | S3 (mesmo bucket do site, prefix `content/`) | Versionamento via S3 Object Versioning. |

Localização proposta: `backend-go/`. Pasta `backend/` (Flask atual) será arquivada após F-P0-01 — é apenas servidor de dev local, não tem código de produção.

## Infraestrutura AWS

| Serviço | Uso | Notas |
|---------|-----|-------|
| S3 | Hosting + (P1) `content/*.json` | Privado, OAC. Buckets: `stage-portifolio-marco-menezes` e `portifolio-marco-menezes`. |
| CloudFront | CDN + HTTPS + cache | PriceClass_100. Distribuição por env. |
| ACM | Cert SSL para CloudFront | **us-east-1** obrigatório. DNS-validated. |
| Route53 | DNS | Zona existente `Z08547081HT88IACPHZET`. |
| IAM | OIDC provider + role(s) | Trust `repo:marcoaureliomenezes/portifolio:*`. |
| Lambda (P1) | CMS-lite writer | arm64, `provided.al2023`. |
| API Gateway (P1) | HTTP API com JWT authorizer | Cognito User Pool issuer. |
| Cognito (P1) | User Pool + Hosted UI | 1 usuário, TOTP MFA obrigatório. |

**Conta AWS:** `016098071081`. **Região operacional:** `sa-east-1`. **us-east-1:** apenas ACM (requisito CloudFront).

## CI/CD

- **GitHub Actions** com **OIDC** (sem long-lived AWS keys).
- 3 workflows: `ci.yml` (PR gate), `deploy.yml` (build + S3 sync + CF invalidate), `terraform.yml` (plan + apply por env).
- Runners pinados em `ubuntu-24.04` (não `ubuntu-latest`).
- Trust policy: `repo:marcoaureliomenezes/portifolio:*` na role IAM.
- Environments GitHub: `stage` (auto-deploy de develop) e `production` (manual approval em push para main).

## Terraform

- **Versão:** ≥ 1.9.0 (pinada para evitar drift).
- **Provider:** `hashicorp/aws ~> 5.0`.
- **Backend remoto:** `dadaia-s3-bucket-terraform-rm-state` (sa-east-1), keys: `portifolio/stage/terraform.tfstate` e `portifolio/prod/terraform.tfstate`.
- **Layout:** módulo compartilhado em `terraform/modules/portfolio-static-site/`; chamadores por env em `terraform/envs/stage/` e `terraform/envs/prod/`.
- **Rejeitados:** terraform workspaces; prefixos no mesmo state.

## Versões de ferramentas externas

| Ferramenta | Versão |
|------------|--------|
| Node.js (CI + local) | `20` LTS |
| Terraform | ≥ 1.9.0 |
| Go (P1) | 1.23+ |
| Playwright | ≥ 1.44 |
| Vitest | ≥ 1.6 |
| `@lhci/cli` | ≥ 0.14 |
| `@testing-library/react` | ≥ 16 |

## Restrições e proibições

- Não usar Bun, yarn, ou pnpm — apenas npm.
- Não instalar dependências especulativas ("por precaução") — lição `@tanstack/react-query`.
- Não criar credenciais AWS de longo prazo localmente — toda operação de escrita via OIDC + GitHub Actions.
- Sem framework HTTP no backend Go (P1) — `net/http` puro apenas.

## Comandos canônicos

```bash
# Frontend (dentro de frontend/)
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run preview    # preview da build (porta 4173, usado pelo Lighthouse CI)
npm run lint       # ESLint
npm test           # Vitest unit tests
npx playwright test  # E2E tests

# Terraform (dentro de terraform/envs/<env>/)
terraform init
terraform plan
terraform apply
```
