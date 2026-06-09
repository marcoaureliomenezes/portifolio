---
slug: quality-bar
title: Quality Bar
category: product
tldr: Critérios de "pronto" do P0 — Lighthouse ≥ 90, Playwright E2E, branch protection, custo < US$ 5/mês, OIDC-only AWS, i18n pt+en first-class.
summary: Define os critérios globais de "pronto" (A1..A11), budgets Lighthouse por página, política i18n (pt/en first-class, de modo manutenção), meta de custo e invariantes de segurança operacional CT-01..CT-04.
tags:
  - product
  - quality-bar
  - acceptance-criteria
  - lighthouse
  - i18n
  - security
agent_tier: self-pull
token_estimate: 450
last_updated: "2026-05-17"
release_origin: quality-gate-v1
---

## Propósito

Define o padrão mínimo de qualidade que o portfólio deve atingir e manter em produção. Serve como gate de merge e critério de aceite para qualquer release que toque a apresentação ou infra do portfólio.

## Fluxo de uso

1. Implementador conclui task e executa suite CI local (lint, build, typecheck, unit-tests, e2e, lighthouse).
2. CI gate no PR verifica todos os required status checks antes de permitir merge.
3. Merge para `main` dispara deploy automático com aprovação manual no environment `production`.
4. Após deploy, smoke test valida A1..A11.

## Trigger típico

Qualquer PR que toque código frontend, conteúdo JSON ou infra Terraform.

## Diferencial

Gates automatizados garantem que regressões de performance, acessibilidade, custo ou segurança operacional nunca cheguem a produção sem sinal explícito.

## Estado runtime tocado

- `.github/workflows/ci.yml` — PR gate com required status checks.
- `frontend/tsconfig.app.json` — `strict: true` obrigatório.
- `frontend/playwright.config.ts` — 5 projects de E2E.
- Environments GitHub: `stage` (auto-deploy), `production` (manual approval).

## Dependências

- quality-gate-v1 — suite Playwright + Lighthouse CI instalada.
- frontend-refactor-v1 — shadcn podado, modais com Radix Dialog.
- content-json-v1 — conteúdo todo em JSON.

---

## Critérios globais de "pronto" (A1..A11)

- **A1.** Site servindo `https://marco-menezes.com` e `https://www.marco-menezes.com` com cert ACM válido (F-P0-01).
- **A2.** Site servindo `https://stage.marco-menezes.com` com cert ACM válido.
- **A3.** Lighthouse Performance ≥ 90, Accessibility ≥ 90, Best-Practices ≥ 95, SEO ≥ 90 (mobile e desktop) em home + 3 abas + 404 (com budget relaxado em 404).
- **A4.** Suite Playwright completa passando: 12 cenários E2E mínimos (E2E-01..E2E-12) + smoke axe nas 3 abas.
- **A5.** Unit tests (Vitest+RTL) cobrindo componentes com lógica condicional real (≥ 60% branches+statements) + 100% nos hooks customizados.
- **A6.** Branch protection ativa em `main` e `develop` com matriz completa de required status checks: `lint`, `build`, `unit-tests`, `e2e`, `lighthouse`, `typecheck`. `typecheck` roda em modo TS strict (`strict: true` em `frontend/tsconfig.app.json`); environment `production` exige aprovação manual.
- **A7.** Custo mensal projetado < US$ 5/mês.
- **A8.** Deploy via push para `main` completa em ≤ 6 min com invalidation CloudFront.
- **A9.** Conteúdo todo em JSON (não mais em `.ts` constants).
- **A10.** Os 3 defeitos CRITICAL do architect são resolvidos: URLs sociais reais (não defaults fake), modais com Radix Dialog, bundle sem deps órfãs.
- **A11.** Nenhuma operação AWS (apply, import, IAM de aplicação, S3) foi executada localmente fora da janela autorizada de bootstrap (CT-01..CT-04). CloudTrail mostra 99%+ das ações com principal `arn:aws:sts::016098071081:assumed-role/github-actions-portfolio-*/<workflow-run-id>`.

## Lighthouse — alvos e budgets

| Página | Performance | A11y | BP | SEO |
|--------|------------|------|----|-----|
| Home (`/`) | ≥ 90 | ≥ 90 | ≥ 95 | ≥ 90 |
| Abas `/projetos/*` | ≥ 90 | ≥ 90 | ≥ 95 | ≥ 90 |
| 404 | ≥ 80 (budget relaxado) | ≥ 90 | ≥ 95 | — |

Medido em mobile (default Lighthouse CI) e desktop. Mobile é gate de merge; desktop é observado mas não bloqueia.

## i18n — política de idiomas

- **pt** e **en**: first-class. Paridade obrigatória nas 3 abas novas e em toda Home.
- **de**: modo manutenção — conteúdo antigo preservado; abas novas podem ficar somente em pt/en, com **fallback automático para `en`** (não `pt`) quando chave faltar em `de`.
- Decisão arquitetural: `useContent()` hook implementa fallback determinístico.
- Decisão final sobre manter ou cortar `de` é P1 (F-P1-04), após observar tráfego real.

## Custo

Alvo: **< US$ 5/mês** em estado estacionário.

- CloudFront PriceClass_100 (sufficient).
- S3: buckets pequenos (~50MB), classe Standard.
- ACM: gratuito.
- Route53: $0.50/hosted zone/mês.
- Lambda + API Gateway (P1): < $1/mês com tráfego de portfólio.

## Segurança operacional (CT-01..CT-04)

- **CT-01:** nenhuma credencial AWS de longo prazo no DEV local — toda escrita via OIDC.
- **CT-02:** `terraform apply`, `terraform destroy`, `aws iam create-*`/`delete-*` de recursos de aplicação, `aws s3 cp`/`sync` — exclusivamente em workflow GitHub Actions.
- **CT-03:** `gh` CLI permitido local — não é credencial AWS.
- **CT-04:** diagnóstico read-only AWS — CloudShell ou job CI dedicado para Developer; para Infra Specialist em break-glass, autorizado localmente com justificativa.
