---
slug: overview
title: Product Overview
category: product
tldr: O que é o portifolio, mensagem central, features P0 entregues e estado atual pós ciclo de Retomada 2.0.
summary: Estado consolidado do produto portifolio pós ciclo de Retomada 2.0. Descreve a mensagem central, features P0 entregues por release, features P0 em refinamento no backlog, P1 especificado, domínio e estado real de infraestrutura auditado.
tags:
  - product
  - overview
  - features
agent_tier: self-pull
token_estimate: 500
last_updated: "2026-05-17"
release_origin: foundation
---

## Propósito

`marco-menezes.com` é o **portfólio técnico vivo** de Marco Aurélio Menezes — Data/AI Engineer. Atualmente servindo via stage (`stage.marco-menezes.com`) com infra OIDC + CloudFront + ACM provisionada via GitHub Actions. Go-live em produção (`marco-menezes.com`) depende do release `prod-go-live-v1` (candidato no backlog). Zona Route53 (`Z08547081HT88IACPHZET`) preservada do estado anterior; bucket S3 com último build de 2025-07-16 foi importado no Terraform.

A mensagem central evoluiu de "currículo online espelho do LinkedIn" para: **"Eu construo sistemas — venha ver."** O portfólio passa a ser tanto vitrine profissional quanto **demonstração técnica auditável** — qualquer visitante pode clicar para ver o repo, a infra (Terraform), os custos reais e as decisões.

Tagline visual (pós visual-identity-v1 + content-ai-emphasis):
- **PT:** "AI-augmented data engineering em escala"
- **EN:** "AI-augmented data engineering at scale"
- **DE:** "KI-gestütztes Data Engineering im Maßstab"

## Fluxo de uso

1. Visitante acessa `marco-menezes.com` via CloudFront (HTTPS, SPA fallback ativo).
2. Home carrega com Hero + Skills + Experience + Education + Certifications.
3. Recrutador valida senioridade em 10–30s; clica em Download CV ou abre modal de email.
4. Comunidade técnica navega para `/projetos/*` (dadaia-workspace, tauan-games, arquitetura do portfólio).
5. Visitante técnico confirma evidências: links para repos, infra Terraform, custos reais.

## Trigger típico

Recrutador ou engenheiro abre o portfólio para avaliar o perfil técnico de Marco Aurélio Menezes antes de uma entrevista ou contato profissional.

## Diferencial

O portfólio é auditável — não apenas declara competências, mas demonstra através da própria infra (Terraform público), decisões arquiteturais documentadas e projetos reais linkados. A aba "Arquitetura deste portfólio" é meta-evidência: o site explica o próprio site.

## Estado runtime tocado

- `marco-menezes.com` / `stage.marco-menezes.com` — CloudFront distributions.
- S3 buckets: `stage-portifolio-marco-menezes` e `portifolio-marco-menezes`.
- Route53 zone: `Z08547081HT88IACPHZET`.
- GitHub Actions: workflows `ci.yml`, `deploy.yml`, `terraform.yml`.

## Dependências

- Infraestrutura bootstrap (`infra-bootstrap-v1`) — provisionada.
- Frontend refactor (`frontend-refactor-v1`) — concluído.
- Content JSON (`content-json-v1`) — concluído.
- Quality gate (`quality-gate-v1`) — concluído.
- Visual identity (`visual-identity-v1`) — concluído.
- Go-live produção (`prod-go-live-v1`) — backlog/candidates.

---

## Features P0 entregues (estado pós-refator)

| ID | Feature | Release entrega |
|----|---------|----------------|
| F-P0-01 | Retomada da infra estática (stage) | `infra-bootstrap-v1` |
| F-P0-02 | Quality gate (Lighthouse + Playwright + Vitest+RTL) | `quality-gate-v1` |
| F-P0-03 | Aba "dadaia-workspace" | `content-json-v1` |
| F-P0-04 | Aba "tauan-games" | `content-json-v1` |
| F-P0-05 | Aba "Arquitetura deste portfólio" | `content-json-v1` |
| F-P0-06 | Migração de conteúdo `.ts` -> `.json` | `content-json-v1` |
| F-P0-07 | Identidade visual (Amber + Hero memorável) | `visual-identity-v1` |
| F-P0-08 | Content AI emphasis (WAVE5 parcial) | `fe-qual-refactor-v1` (ativa) |

Páginas obrigatórias no go-live: Home + 3 abas de projeto + 404. Estado atual: Home + 3 abas + 404 rodando em stage; produção aguarda `prod-go-live-v1`.

## Features P0 em refinamento (backlog/candidates)

| ID | Feature | Onde está |
|----|---------|-----------|
| F-P0-09 | Projects Content Model (discriminated union por `kind`) | `backlog/candidates.md` — cluster Projects v1 |
| F-P0-10 | Projects Index Page (`/projetos`) | `backlog/candidates.md` |
| F-P0-11 | Nav Projects CTA (Header + Hero 3rd CTA) | `backlog/candidates.md` |
| F-P0-12 | Projects Page Templates (per-kind dispatch) | `backlog/candidates.md` |
| F-P0-13 | Projects Architecture Diagrams (light/dark SVG) | `backlog/candidates.md` |
| F-P0-14 | Tauan Games Link-Out (GH Pages, sem iframe) | `backlog/candidates.md` |
| F-P0-15 | Projects Content i18n Parity (CI gate) | `backlog/candidates.md` |

## Domínio e disponibilidade

- Domínio: `marco-menezes.com` (Route53 zone `Z08547081HT88IACPHZET`).
- Sub-domínios: `www.marco-menezes.com` (prod alias) + `stage.marco-menezes.com` (ambiente stage para validação pré-prod).
- HTTPS obrigatório via CloudFront com ACM (us-east-1).
- Hosting privado S3 (OAC), sem acesso direto público ao bucket.
