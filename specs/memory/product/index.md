---
slug: index
title: Catálogo de Produtos — portifolio
category: product
tldr: Portfólio técnico vivo de Marco Aurélio Menezes — Data/AI Engineer. SPA estático React sobre CloudFront/S3, em produção no stage e candidato ao go-live.
summary: Índice do produto portifolio. Contém visão atômica, usuários-alvo, catálogo de features em produção e mapa de capacidades. Ponto de entrada para self-pull de atoms de feature específicos.
tags:
  - catalog
  - product
  - index
agent_tier: self-pull
token_estimate: 600
last_updated: "2026-05-17"
release_origin: foundation
---

## Visão atômica

`marco-menezes.com` é o **portfólio técnico vivo** de Marco Aurélio Menezes — Data/AI Engineer. Mensagem central: *"Eu construo sistemas — venha ver."* O portfólio é tanto vitrine profissional quanto demonstração técnica auditável — qualquer visitante pode clicar para ver o repo, a infra (Terraform), os custos reais e as decisões.

Ambiente stage (`stage.marco-menezes.com`) operacional com infra OIDC + CloudFront + ACM provisionada via GitHub Actions. Go-live em produção (`marco-menezes.com`) aguarda release `prod-go-live-v1`.

## Usuários

| Usuário | Descrição |
|---------|-----------|
| Recrutadores | Recrutadores corporativos, tech, hiring managers em primeiro contato. Buscam validação rápida (10–30s) de senioridade, experiência, certificações, contato. |
| Comunidade técnica | Peers de engenharia, recrutadores técnicos avançados, contribuidores open source, alunos curiosos. Buscam evidência verificável de "como esse engenheiro pensa e constrói". |

## Catálogo de features

| Slug | Título | TL;DR |
|------|--------|-------|
| [overview](overview.md) | Product Overview | O que é o portifolio, mensagem central, features P0 entregues e estado atual. |
| [personas](personas.md) | Personas | Recrutadores e comunidade técnica; como o site atende cada um. |
| [quality-bar](quality-bar.md) | Quality Bar | Critérios de "pronto" do P0, Lighthouse, i18n, custo e segurança operacional. |

## Mapa de capacidades

```mermaid
flowchart LR
  Home["Home\n(Hero + Skills + Experience\n+ Education + Certifications)"]
  Projects["Projetos\n(/projetos/*)"]
  Infra["Infra AWS\n(CloudFront + S3 + ACM)"]
  CI["CI/CD\n(GitHub Actions OIDC)"]
  Home --> Projects
  Home --> Infra
  Infra --> CI
```

## Limites conhecidos

- P1 (CMS-lite Lambda Go + Cognito) não implementado — apenas especificado.
- Idioma `de` em modo manutenção — fallback automático para `en` quando chave faltar.
- Go-live em produção (`marco-menezes.com`) aguarda release `prod-go-live-v1`.
- Sem multi-region, WAF, testes de carga/mutação, dashboard de custo em tempo real.
