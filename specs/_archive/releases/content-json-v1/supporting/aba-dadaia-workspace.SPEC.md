# F-P0-03 — Aba "dadaia-workspace"

**Status:** Aprovado

## 1. Contexto

Aba de projeto que apresenta o ecossistema agente SDD `dadaia-workspace` — projeto vivo do
operador. Demonstra à comunidade técnica o tipo de sistema que ele constrói, complementa o
currículo da Home.

## 2. Objetivo

Entregar página `/projetos/dadaia-workspace` com estrutura SEO-friendly, conteúdo em pt+en
(de opcional com fallback en), placeholder honesto para texto/imagens que o operador
preenche pós-estrutura.

## 3. Rota e estrutura

- **Rota:** `/projetos/dadaia-workspace`
- **Componente:** `pages/projects/DadaiaWorkspacePage.tsx` (instância de
  `ProjectTabPage` — vide architect §3 #20).
- **Estrutura padrão:**
  1. Hero: logo/título + 1 linha de pitch.
  2. "O que é" — 1-2 parágrafos.
  3. "Por que existe" — motivação.
  4. "Como funciona" — diagrama (SVG ou PNG) + texto explicativo.
  5. "Status atual" — versão, número de agentes ativos, último marco.
  6. CTA — botão para GitHub repo + link para docs internas (se existirem).

## 4. Conteúdo (placeholders entregues pelo PE; copy real do operador)

JSON shape em `public/content/<lang>.json` (F-P0-06):

```json
{
  "projects": {
    "dadaia-workspace": {
      "hero": {
        "title": "dadaia-workspace",
        "tagline": "<1-line pitch — operador preenche>",
        "logo": "/assets/projects/dadaia-workspace/logo.svg"
      },
      "sections": [
        { "id": "what", "title": "O que é", "body": "<operador preenche>" },
        { "id": "why",  "title": "Por que existe", "body": "<operador preenche>" },
        { "id": "how",  "title": "Como funciona", "body": "<operador preenche>", "diagram": "/assets/projects/dadaia-workspace/diagram.svg" },
        { "id": "status", "title": "Status atual", "items": [
          { "label": "Versão", "value": "<operador preenche>" },
          { "label": "Agentes ativos", "value": "<operador preenche>" }
        ]}
      ],
      "cta": {
        "github": "https://github.com/marcoaureliomenezes/dadaia-workspace",
        "docs": "<opcional>"
      },
      "seo": {
        "title": "dadaia-workspace — Marco Menezes",
        "description": "Ecossistema agente SDD para spec-driven development."
      }
    }
  }
}
```

## 5. Critérios de aceite

- **A1.** Rota `/projetos/dadaia-workspace` existe em `routes.ts` e renderiza
  `DadaiaWorkspacePage`.
- **A2.** Página tem `<h1>` único e visível (cenário E2E-05).
- **A3.** Página aparece no menu/navegação principal (`AppSidebar` ou nav header).
- **A4.** Meta-tags SEO: `<title>`, `<meta name="description">`, `<meta property="og:*">`
  configurados (via `react-helmet-async` ou approach do architect — vide PLAN).
- **A5.** Link de CTA para GitHub tem `target="_blank" rel="noopener noreferrer"` e href
  contendo `github.com/marcoaureliomenezes/dadaia-workspace` (verificado por E2E-05).
- **A6.** Conteúdo em `pt` e `en` é paridade (ambos com texto preenchido pelo operador
  antes do go-live).
- **A7.** Conteúdo em `de` é fallback para `en` (testado por E2E-04).
- **A8.** Lighthouse Performance/Accessibility/Best-Practices/SEO ≥ budget na rota.
- **A9.** Imagens (logo, diagram) ≤ 200KB cada, formato WebP/AVIF preferido (constitution §3).
- **A10.** Componente `ProjectTabPage` reutilizado entre F-P0-03/04/05 (sem duplicação).

## 6. Fora de escopo

- Demo interativa do `dadaia-workspace` no portfólio.
- Playground embedded.
- Iframe de docs externas.

## 7. Dependências

- `useContent()` hook (T-FE-02) — para carregamento do JSON.
- Refator de `Portfolio.tsx` (não bloqueia — abas são páginas separadas).
- `ProjectTabPage` extraído (T-FE-15).
- `routes.ts` centralizada (T-FE-14).
- F-P0-06 implementada — JSON estático lido em runtime/build-time.

## 8. Decisões fechadas

- **D-PROJ-01.** Conteúdo de copy é do operador (PE-05); PE entrega a estrutura/template
  e placeholders honestos.
- **D-PROJ-02.** Pasta de assets: `frontend/public/assets/projects/dadaia-workspace/`.
- **D-PROJ-03.** Diagrama é estático (SVG ou PNG otimizado). Não use Mermaid runtime.

## 9. Referências

- Briefing 2.0 §4 F-P0-03.
- Architect §3 #20-#21 (`ProjectTabPage`, `ProjectsIndex`).
- qa §4 E2E-05.
