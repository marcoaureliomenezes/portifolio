# Release TASKS — quality-gate-v1 (archived)

**Status:** Aprovado

- [x] T-QA-01 — Setup Vitest + Testing Library + jsdom. Configuração em
  `frontend/vitest.config.ts`, `test-setup.ts`.
- [x] T-QA-02 — Testes unit dos hooks (`useIsMobile`, `useContent`). 100% branches.
- [x] T-QA-03 — Testes unit dos componentes extraídos com lógica condicional real.
  Cobertura >= 60% branches+statements nos extraídos.
- [x] T-QA-04 — Setup Playwright + estrutura `tests/e2e/`. 5 projects: chromium,
  firefox, webkit, mobile-chrome (Pixel 5), mobile-safari (iPhone 13).
- [x] T-QA-05 — E2E-01..E2E-04 (home + i18n). Cobre fallback `de` -> `en`.
- [x] T-QA-06 — E2E-05..E2E-07 (3 abas de projeto).
- [x] T-QA-07 — E2E-08 (404).
- [x] T-QA-08 — E2E-09 (links externos seguros + URLs reais do operador, sem defaults
  fake).
- [x] T-QA-09 — E2E-10..E2E-11 (responsividade desktop + mobile).
- [x] T-QA-10 — E2E-13 (axe a11y smoke) + E2E-15 (deep link em rotas).
- [x] T-QA-11 — `lighthouserc.json` com budgets Performance >= 90, A11y >= 90,
  BP >= 95, SEO >= 90 (mobile).
- [x] T-QA-12 — Jobs `unit-tests`, `e2e`, `lighthouse` no `ci.yml`. Pinados em
  ubuntu-24.04.
- [x] T-QA-13 — Reativados gates Lighthouse + E2E (tech debt do commit `b94b8d0` que
  desativava temporariamente para destravar PRs).
