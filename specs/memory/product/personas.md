---
slug: personas
title: Personas
category: product
tldr: Recrutadores (validação 10–30s) e comunidade técnica (evidência verificável) — dois públicos num único site sem fragmentação.
summary: Descreve os dois públicos-alvo do portfólio (recrutadores e comunidade técnica), como o site atende cada persona, a divisão de trabalho no conteúdo das abas e a narrativa de AI-augmented engineering.
tags:
  - product
  - personas
  - users
agent_tier: self-pull
token_estimate: 400
last_updated: "2026-05-17"
release_origin: foundation
---

## Propósito

O portfólio atende dois públicos distintos com um único site, sem fragmentação. A Home serve recrutadores; a navegação interna (`/projetos/*`) serve a comunidade técnica. Esses dois caminhos não competem — recrutadores raramente clicam nas abas de projeto técnico, e a comunidade técnica passa rapidamente pela Home para chegar nos projetos.

## Fluxo de uso

1. Recrutador abre o site — Hero com avatar + tagline + 2 CTAs (Download CV, Ver experiência).
2. Recrutador rola para Skills, Experience, Education, Certifications; abre modal de email.
3. Engenheiro/peer chega na Home, vai direto para `/projetos/*` pelas abas de projeto.
4. Engenheiro lê dadaia-workspace (O que é → Por que → Como funciona → Status → CTA GitHub).
5. Engenheiro verifica evidências: repo público, infra Terraform, custos reais, ADRs.

## Trigger típico

Recrutador acessa antes de uma entrevista; engenheiro acessa para verificar a competência técnica real do autor antes de colaborar ou contratar.

## Diferencial

Um único site serve dois públicos opostos sem conflito de atenção. A arquitetura de rotas (`/projetos/<slug>`) garante deep-links para conteúdo técnico sem sobrepor a experiência de recrutadores na Home.

## Estado runtime tocado

- Home (`/`): Hero, Skills, Experience, Education, Certifications.
- Projetos (`/projetos/dadaia-workspace`, `/projetos/tauan-games`, `/projetos/arquitetura`).
- Email modal (Radix Dialog), Download CV (`cv.pdf` por idioma).

## Dependências

- visual-identity-v1 — Hero memorável com tagline definida.
- content-json-v1 — estrutura das abas com placeholders honestos.
- fe-qual-refactor-v1 (ativa) — content AI emphasis (WAVE5 parcial).

---

## Persona 1 — Recrutadores

**Quem:** recrutadores corporativos, recrutadores tech, hiring managers em primeiro contato.

**O que procuram:** validação rápida (10–30s) de senioridade, experiência, certificações, contato. Padrão LinkedIn esperado.

**Como o site atende:**
- Hero memorável com tagline (decisão visual-identity-v1) + avatar + 2 CTAs (`Download CV` + `Ver experiência`).
- Seções Skills, Experience, Education, Certifications acessíveis pelo scroll inicial.
- Currículo digital exportável: link para `cv.pdf` nos 3 idiomas (PT já versionado em T-CONTENT-06; EN e DE são T-FE-QUAL-10).
- Email modal acessível (Radix Dialog) + LinkedIn/GitHub URLs reais (validadas em E2E-09).

## Persona 2 — Comunidade técnica

**Quem:** peers de engenharia, recrutadores técnicos avançados, contribuidores open source futuros, alunos curiosos.

**O que procuram:** evidência verificável de "como esse engenheiro pensa e constrói". Links para repos, decisões arquiteturais, infra real, custos reais.

**Como o site atende:**
- **Aba `dadaia-workspace`**: estrutura "O que é → Por que existe → Como funciona (diagrama) → Status atual (versão, agentes ativos) → CTA GitHub + docs". Captura o workspace agentic do operador.
- **Aba `tauan-games`**: card por jogo (Aero Strike Three.js + tauan-trex Phaser). Cada card: screenshot/gif, 1 parágrafo, link para repo, tag de engine.
- **Aba "Arquitetura deste portfólio"**: meta-página com diagrama (S3 → CloudFront → ACM → Route53), tabela de custos reais, ADRs/specs públicos, link para o repo do próprio site.

## Divisão de trabalho — conteúdo das abas

O **product-engineer** entrega a estrutura/template com placeholders honestos (implementado em `content-json-v1` tasks T-CONTENT-02..04). O **operador** preenche texto final e imagens conforme cada aba amadurece.

| Aba | Estrutura padrão |
|-----|-----------------|
| **dadaia-workspace** | Hero → "O que é" → "Por que existe" → "Como funciona" (diagrama) → "Status atual" → CTA (GitHub + docs). |
| **tauan-games** | Hero → Card por jogo. Cada card: screenshot/gif, 1 parágrafo, link para repo, tag de engine. |
| **Arquitetura deste portfólio** | Hero → Diagrama → Tabela de custos → Decisões arquiteturais → Link para repo. |

## Narrativa pós content-ai-emphasis (parcial — WAVE5)

A revisão pós visual-identity-v1 identificou 4 gaps de conteúdo críticos para o posicionamento técnico do operador:

1. **AI tooling experience invisível** — Copilot, Devin, Windsurf, Claude Code, Codex, Opencode, Openclaw, Hermes. Migração SAS → Azure + Databricks conduzida solo via AI tooling com SLA reduzido de 12 para 2 meses.
2. **Roles sem skills tags** — cards de experiência precisam de cluster de badges colorizados por categoria.
3. **Senior bullets específicos demais** — comunicar liderança técnica e impacto, não responsabilidades operacionais.
4. **Projeto de impacto sem destaque** — SAS → Cloud precisa de espaço visual próprio.

WAVE5 está in-progress na release ativa `fe-qual-refactor-v1`; WAVE6 (RoleSkillBadges + HighlightProjectBlock) é candidato imediato no backlog.
