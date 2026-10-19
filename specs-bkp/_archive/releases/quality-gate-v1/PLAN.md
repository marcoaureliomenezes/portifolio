# Release PLAN — quality-gate-v1 (archived)

**Status:** Aprovado

## Sequência executada

1. T-QA-01 — setup Vitest + Testing Library + jsdom.
2. T-QA-02 — testes unit dos hooks (`useIsMobile`, `useContent`).
3. T-QA-03 — testes unit dos componentes extraídos com lógica.
4. T-QA-04 — setup Playwright + estrutura de diretórios.
5. T-QA-05..10 — implementar E2E-01..E2E-13 (home + i18n + 3 abas + 404 + links +
   responsividade + axe + deep link).
6. T-QA-11 — configurar Lighthouse CI (`lighthouserc.json`).
7. T-QA-12 — wiring dos jobs `unit-tests`, `e2e`, `lighthouse` no `ci.yml`.
8. T-QA-13 — reativar gates Lighthouse + E2E (fechar tech debt `b94b8d0`).

## Dependências

- Pré-requisito: `frontend-refactor-v1` (componentes extraídos precisam existir para
  ter sentido testar).
- Pré-requisito: `content-json-v1` (E2E-04 testa fallback de idioma).
- Habilita: T-QA-14 (status checks como required em branch protection — moveu para
  `fe-qual-refactor-v1`).

## Critérios de fechamento

- 12 cenários E2E + axe smoke em 3 abas passam consistentemente em CI.
- LHCI configurado com budgets de Lighthouse Performance/A11y/BP/SEO.
- Jobs `unit-tests`, `e2e`, `lighthouse` rodam em PRs.
