# Release PLAN — content-json-v1 (archived)

**Status:** Aprovado

## Sequência executada

1. T-CONTENT-01 — migrar `data/content/*.ts` -> `*.json` (F-P0-06).
2. T-CONTENT-02..04 — estrutura placeholder das 3 abas (`dadaia-workspace`,
   `tauan-games`, `Arquitetura`) em PT/EN/DE.
3. T-CONTENT-05 — otimização de assets globais (imagens compactadas, favicons, etc.).
4. T-CONTENT-06 — refresh do conteúdo do LinkedIn nos 3 JSONs + `cv.pdf` PT.

## Dependências

- Pré-requisito: `frontend-refactor-v1` (T-FE-02 entrega `useContent()`).
- Habilita: `quality-gate-v1` (E2E-04 testa fallback de->en).
- Consumido pelos 3 SPECs supporting (aba-dadaia-workspace, aba-tauan-games,
  aba-arquitetura).

## Critérios de fechamento

- Build de `cd frontend && npm run build` consome JSONs sem regressão.
- E2E-04 (`useContent` fallback de->en) passou.
- 3 abas servem placeholder honesto ("Em construção — veja o repo: link") via JSON.
