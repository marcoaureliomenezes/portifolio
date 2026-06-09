# Release TASKS — projects-cluster-v2

**Status:** Aprovado

> Release ID: `projects-cluster-v2`
> Owner: product-engineer
> Created: 2026-05-28
> Depends on: PLAN.md **Aprovado** ✅

---

## Legenda de status

| Marcador | Significado |
|---|---|
| `[ ]` | Pendente |
| `[-]` | Em execução (reservar antes de escrever) |
| `[x]` | Concluído |

**Regra SDD:** flip `[ ]` → `[-]` ANTES de escrever. Flip `[-]` → `[x]` APÓS concluir.
No máximo um `[-]` por agente ao mesmo tempo.

---

## Fase A — Assets (Operador)

- [x] **T-PC2-A-01** — Produzir cover `rand-engine`
  - Output: `frontend/public/assets/projects/rand-engine/cover.webp` ✅ 47KB
  - `architecture-light.svg` ✅ 9.3KB / `architecture-dark.svg` ✅ 9.1KB
  - Gerado por script PIL com output real do rand-engine (132K rows/s medido)

- [x] **T-PC2-A-02** — Produzir screenshots do workspace panel
  - Output:
    - `frontend/public/assets/projects/dadaia-workspace/workspace-panel-01.webp` ✅ 47.5KB — dadaia panel, aba Spec Context Projects (9 projetos, inclui rand-engine)
    - `frontend/public/assets/projects/dadaia-workspace/workspace-panel-02.webp` ✅ 23.2KB — portfolio dadaia-workspace detail page
  - Capturado via Playwright (dadaia panel em localhost:4999)

---

## Fase C — JSON Content (frontend-engineer)

- [ ] **T-PC2-C-01** — Atualizar bloco `dadaia-workspace` em pt/en/de
  - Agente: `frontend-engineer`
  - Arquivos: `frontend/src/data/content/pt.json`, `en.json`, `de.json`
  - Campos a atualizar (detalhes com valores exatos em PLAN.md §3 T-PC2-C-01):
    - `status[Versão/Version]`: `v0.12.0` → `v0.1.2`
    - `status[Agentes/Agents]`: `5 (...)` → `21`
    - `status[Contextos/Contexts]`: lista antiga → 8 contextos atuais
    - `status[Marco/Milestone]`: descrição desatualizada → `Paridade Codex + orquestração multi-runtime com 21 agentes especializados`
    - `diagram`: `architecture-light.svg` → `workspace-panel-01.webp` _(aguardar T-PC2-A-02)_
    - `diagramAlt`: atualizar em PT/EN/DE _(ver PLAN.md §3 T-PC2-C-01)_
  - AC: `check-i18n-parity.mjs` exit 0; paridade PT/EN/DE completa

- [ ] **T-PC2-C-02** — Adicionar bloco `rand-engine` em pt/en/de
  - Agente: `frontend-engineer`
  - Arquivos: `frontend/src/data/content/pt.json`, `en.json`, `de.json`
  - Inserir após `tauan-games` em `projectsV2.list[]`
  - Blocos JSON completos em PT/EN/DE: ver PLAN.md §3 T-PC2-C-02
  - Verificar se `cta.external` e `cta.externalLabel` estão no schema Zod antes de inserir;
    se ausentes, adicionar ao schema (extensão mínima, conforme Risco §6 do PLAN)
  - Usar cover placeholder se T-PC2-A-01 ainda pendente; finalizar antes do merge
  - AC: `validate-content.mjs` exit 0; card visível em `/projetos`

---

## Fase E — E2E Smoke (qa-engineer)

- [ ] **T-PC2-E-01** — Smoke spec rand-engine
  - Agente: `qa-engineer`
  - Depende de: T-PC2-C-02 `[x]`
  - Arquivo: `frontend/tests/e2e/projects-cluster/rand-engine.spec.ts`
  - Referência: padrão de `project-detail-case-study.spec.ts`
  - Cobertura:
    1. `/projetos` renderiza card com slug `rand-engine`
    2. `/projetos/rand-engine` não retorna 404
    3. Template `case-study` renderiza (hero title, seções, CTA GitHub + PyPI)
    4. Troca de idioma PT → EN mantém `/projetos/rand-engine` sem 404
  - AC: passa em headless; sem flakiness em 3 runs consecutivos

---

## Fase V — Validação CI (qa-engineer)

- [ ] **T-PC2-V-01** — Validação completa pré-merge
  - Agente: `qa-engineer`
  - Depende de: T-PC2-C-01 `[x]`, T-PC2-C-02 `[x]`, T-PC2-E-01 `[x]`, T-PC2-A-01 `[x]`, T-PC2-A-02 `[x]`
  - Checklist:
    - [ ] `node scripts/validate-content.mjs` exit 0
    - [ ] `node scripts/check-i18n-parity.mjs` exit 0
    - [ ] Todos os novos `.webp` ≤ 60KB
    - [ ] SVGs em `rand-engine/` ≤ 50KB (se presentes)
    - [ ] `npx playwright test tests/e2e/projects-cluster/rand-engine.spec.ts` pass
    - [ ] `npx playwright test tests/e2e/projects-cluster/` pass completo (regressão zero)
    - [ ] Lighthouse mobile `/projetos`: Performance ≥ 85
  - AC: todos os itens acima ✅ antes do merge em `develop`

---

## Sumário de ownership

| Task | Agente | Fase | Depende de |
|---|---|---|---|
| T-PC2-A-01 | Operador | A | — |
| T-PC2-A-02 | Operador | A | — |
| T-PC2-C-01 | `frontend-engineer` | C | A-02 (para diagram path) |
| T-PC2-C-02 | `frontend-engineer` | C | A-01 (para cover path no merge) |
| T-PC2-E-01 | `qa-engineer` | E | C-02 |
| T-PC2-V-01 | `qa-engineer` | V | C-01, C-02, E-01, A-01, A-02 |
