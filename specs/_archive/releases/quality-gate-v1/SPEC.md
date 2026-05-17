# F-P0-02 — Quality Gate (Lighthouse + Playwright + Vitest+RTL)

**Status:** Aprovado

## 1. Contexto

O portfólio AS-IS tem **zero testes** (nem E2E, nem unit) e nenhum gate Lighthouse no CI.
A qualidade do site depende inteiramente de inspeção manual a cada release — não é
sustentável. Esta feature instala o gate completo no CI, com toolchain decidida pelo
qa-engineer.

Input principal: `.dadaia/reports/portifolio/qa-engineer/2026-05-14T032934Z-test-architecture.md`.

## 2. Objetivo

Garantir que toda PR para `main` (e `develop`) seja bloqueada se:

1. Lighthouse Performance/Accessibility/Best-Practices/SEO regredirem abaixo do budget.
2. Cenários E2E críticos quebrarem.
3. Componentes com lógica condicional perderem cobertura unit mínima.

E que defeitos CRITICAL do architect virem critérios de aceite **verificados por máquina**
(não dependentes de inspeção humana).

## 3. Toolchain

| Camada | Toolchain | Versão mínima |
|---|---|---|
| Unit | Vitest + Testing Library + jsdom | `vitest ≥ 1.6`, `@testing-library/react ≥ 16` |
| E2E | **Playwright** (TypeScript) | `@playwright/test ≥ 1.44` |
| Accessibility E2E | `@axe-core/playwright` | — |
| Lighthouse | `@lhci/cli` | `≥ 0.14` |

Rejeitados: Cypress (não suporta WebKit nativamente, viewport mobile com plugin pago),
WebdriverIO (sem ROI sem legado Selenium).

## 4. Suite E2E mínima (12 cenários + 3 recomendados)

Detalhes em qa §4. Resumo:

| ID | Cenário | Arquivo | Bloqueia merge `main`? |
|---|---|---|---|
| E2E-01 | Home carrega + Hero visível | `tests/e2e/pages/home.spec.ts` | Sim |
| E2E-02 | Troca pt → en | `tests/e2e/pages/language-switch.spec.ts` | Sim |
| E2E-03 | Troca en → pt (round-trip) | `tests/e2e/pages/language-switch.spec.ts` | Sim |
| E2E-04 | Fallback `de` → `en` para conteúdo novo | `tests/e2e/pages/language-switch.spec.ts` | Sim |
| E2E-05 | Aba dadaia-workspace abre + tem conteúdo | `tests/e2e/pages/project-tabs.spec.ts` | Sim |
| E2E-06 | Aba tauan-games abre + ≥ 2 cards | `tests/e2e/pages/project-tabs.spec.ts` | Sim |
| E2E-07 | Aba arquitetura abre + diagrama + custos | `tests/e2e/pages/project-tabs.spec.ts` | Sim |
| E2E-08 | 404 renderiza para rota inválida | `tests/e2e/pages/not-found.spec.ts` | Sim |
| E2E-09 | Links externos têm `target=_blank rel=noopener` E **URLs reais do operador** (não defaults `https://linkedin.com`) | `tests/e2e/pages/external-links.spec.ts` | Sim |
| E2E-10 | Responsividade mobile (375×667) sem overflow | `tests/e2e/pages/responsive.spec.ts` | Sim |
| E2E-11 | Responsividade desktop (1280×800) | `tests/e2e/pages/responsive.spec.ts` | Sim |
| E2E-12 | Smoke Lighthouse (em job separado) | — | Sim (vide §5) |
| E2E-13 | Smoke axe (home + 3 abas) — `wcag2a` + `wcag2aa` | `tests/e2e/pages/a11y.spec.ts` | Warn em develop, Sim em main |
| E2E-14 | Navegação por teclado (Tab + focus visível) | `tests/e2e/pages/keyboard.spec.ts` | Warn em develop, Sim em main |
| E2E-15 | Deep link `/projetos/dadaia-workspace` (CloudFront SPA fallback) | `tests/e2e/pages/deep-link.spec.ts` | Sim |

`playwright.config.ts` roda 5 projects: chromium, firefox, webkit, mobile-chrome (Pixel 5),
mobile-safari (iPhone 13). Em CI: `workers: 2`, `retries: 1`.

## 5. Lighthouse CI

`lighthouserc.json` na raiz de `frontend/` (vide qa §5.1). Budgets por URL:

| URL | Performance | Accessibility | Best-Practices | SEO | Modo |
|---|---|---|---|---|---|
| `/` | ≥ 0.90 | ≥ 0.90 | ≥ 0.95 | ≥ 0.90 | error |
| `/projetos/dadaia-workspace` | ≥ 0.90 | ≥ 0.90 | ≥ 0.95 | ≥ 0.90 | error |
| `/projetos/tauan-games` | ≥ 0.90 | ≥ 0.90 | ≥ 0.95 | ≥ 0.90 | error |
| `/projetos/portifolio` (ou `/arquitetura`) | ≥ 0.90 | ≥ 0.90 | ≥ 0.95 | ≥ 0.90 | error |
| `/qualquer-rota-invalida` (404) | ≥ 0.85 | ≥ 0.90 | ≥ 0.95 | ≥ 0.80 | warn em Perf/SEO, error em A11y/BP |

Métricas adicionais:

- `largest-contentful-paint`: error se > 2500ms
- `cumulative-layout-shift`: error se > 0.1
- `first-contentful-paint`: warn se > 2000ms
- `total-blocking-time`: warn se > 300ms
- `interactive`: warn se > 3500ms

Lighthouse roda em job separado (`CI / Lighthouse`) com `npm run preview` (porta 4173)
servindo o build. Em CI mobile-first (default LHCI); desktop como segundo run em warn.

## 6. Cobertura unit (vitest)

Detalhes em qa §6. Resumo:

| Categoria | Cobertura mínima (branches+statements) |
|---|---|
| Componentes extraídos com lógica (Hero, Skills, Experience, Certifications, ProjectTab, Header) | ≥ 60% |
| Hooks customizados (`useIsMobile`, `useContent`) | 100% |
| `getContent` / `content/index` | 100% (incluindo fallback de→en) |
| Componentes shadcn/ui (`src/components/ui/`) | 0% obrigatório (excluído de coverage) |
| Páginas (`Index.tsx`, `NotFound.tsx`, `App.tsx`) | 0% obrigatório (coberto via E2E) |

Sem threshold global — coverage por categoria é o contrato (evita padding com testes de
shadcn).

Setup: collocated (`*.test.tsx` ao lado do componente). `vitest.config.ts` em `frontend/`
exclui `src/components/ui/**` da coverage.

## 7. Critérios de aceite

- **A1.** PR para `main` é bloqueado se qualquer um dos 12 cenários E2E falhar.
- **A2.** PR para `main` é bloqueado se qualquer budget Lighthouse cair abaixo do alvo
  (vide §5).
- **A3.** PR para `main` é bloqueado se cobertura unit cair abaixo da matriz em §6.
- **A4.** Cenário E2E-09 verifica que `linkedinUrl` e `githubUrl` apontam para o perfil
  real do operador — **não** para `https://linkedin.com` ou `https://github.com`. Resolve
  defeito CRITICAL do architect §7.
- **A5.** Cenário E2E-04 verifica que conteúdo das abas novas em `de` cai em `en`
  (não em `pt`) — resolve conflito PE-08.
- **A6.** Modais (image, email) usam `dialog.tsx` (Radix Dialog). Cenário de teste unit
  (`Header.test.tsx`) verifica:
  - ESC fecha modal.
  - Foco retorna ao botão trigger.
  - `role="dialog"` e `aria-modal="true"` presentes.
  - Resolve defeito CRITICAL do architect §7.
- **A7.** Lista de `data-testid` dos componentes pós-decomposição é estável e documentada
  (vide architect §9 — lista canônica entregue junto com PR de decomposição).
- **A8.** Lighthouse roda em job separado `CI / Lighthouse` com `needs: build`.
- **A9.** Smoke E2E pós-deploy (E2E-01, E2E-08, E2E-09) roda contra `vars.DEPLOY_URL`
  do environment (stage ou production). Falha do smoke marca o deploy como failed.
- **A10.** Zero bypass (`[skip ci]`, `--no-verify`) aceito em PRs para `main`.

## 8. Estrutura de diretórios

```
frontend/
├── src/
│   ├── components/
│   │   ├── portfolio/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HeroSection.test.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── ExperienceSection.test.tsx
│   │   │   ...
│   │   ├── header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ...
│   │   └── ui/                       # excluído de coverage
│   └── hooks/
│       ├── use-mobile.tsx
│       └── use-mobile.test.tsx
├── tests/
│   └── e2e/
│       ├── fixtures/
│       │   └── routes.ts
│       ├── pages/
│       │   ├── home.spec.ts
│       │   ├── language-switch.spec.ts
│       │   ├── project-tabs.spec.ts
│       │   ├── not-found.spec.ts
│       │   ├── external-links.spec.ts
│       │   ├── responsive.spec.ts
│       │   ├── a11y.spec.ts
│       │   ├── keyboard.spec.ts
│       │   └── deep-link.spec.ts
│       └── setup/global-setup.ts
├── playwright.config.ts
├── vitest.config.ts
└── lighthouserc.json
```

## 9. Required status checks (`main`)

| Status check | Workflow | Job name |
|---|---|---|
| `CI / Lint and type-check` | `ci.yml` | `lint` |
| `CI / Build` | `ci.yml` | `build` |
| `CI / Unit tests` | `ci.yml` | `unit-tests` |
| `CI / E2E` | `ci.yml` | `e2e` |
| `CI / Lighthouse` | `ci.yml` | `lighthouse` |

Em `develop`, mesmo conjunto mas `e2e accessibility (axe)` em warn-only durante a fase de
implementação dos refatores. Antes do go-live em prod, todos devem estar em error.

## 10. Fora de escopo (P2)

- Testes de carga, mutação, snapshot/Chromatic.
- Coverage report no PR comment (LHCI app token é opcional — pode ser adicionado depois).
- Testes do Lambda Go P1 — esqueleto em qa §7, implementação no ciclo P1.

## 11. Pré-requisitos

- Decomposição de `Portfolio.tsx` e `Header.tsx` (T-FE-01..T-FE-09) — testes assumem os
  componentes extraídos. Suite unit é entregue **junto com** o componente extraído.
- F-P0-06 (JSON) — testes de fallback de idioma assumem `useContent()` operacional.
- Suite E2E que toca abas (E2E-05..E2E-07) só vira gate de merge quando F-P0-03/04/05
  estiverem implementadas. Antes disso roda em warn ou skip explícito.

## 12. Referências

- qa report inteiro — toolchain, cenários, configurações.
- architect §9 — `data-testid` recomendados, lista de componentes que merecem unit.
- devops §11 — pendências de wiring no CI (LHCI token, ubuntu-latest, playwright deps).
