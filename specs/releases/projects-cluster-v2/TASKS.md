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

> **Revisão rc-2 (2026-06-11, ADRs PC2-R2-01..05):** as fases C/E abaixo são executadas
> com os valores corrigidos do SPEC §5 revisado (dadaia-workspace v0.1.5/9 agentes,
> rand-engine v0.6.4, kind `library` para ambos). Onde o texto original disser
> `case-study`/`v0.1.2`/`21`, prevalece o SPEC revisado. Owner de execução: sessão
> coordenadora (Claude, bound implementation) — `frontend-engineer` plugin indisponível
> como subagente dispatchável neste harness.

## Fase R2-W1 — Hotfix build (CRIT, primeiro)

- [x] **T-PC2-R2-01** — Vendorizar `@dadaia/analytics-sdk` ✅ commit 9c00800 (npm ci + build + tsc verdes)
  - Write set: `frontend/vendor/analytics-sdk/**`, `frontend/package.json`, `frontend/package-lock.json`
  - Copiar src+package.json do pacote (única cópia: node_modules), reapontar para `file:./vendor/analytics-sdk`, regenerar lockfile
  - AC: AC-PC2-R2-01 (`npm ci` + `npm run build` exit 0 em checkout limpo)

## Fase R2-W2 — Higiene de repo

- [x] **T-PC2-R2-02** — Purge de artefatos proibidos + gitignore ✅ commit 651b089
  - Write set: `.gitignore`, deleções (`.worktrees/`, `specs_bkp/`, `frontend/{coverage,playwright-report,test-results,.lighthouseci}/`, `backend/__pycache__/`), commit das deleções `img/*.jpeg`, `specs/backlog/fe-qual-refactor-salvage.md`
  - AC: AC-PC2-R2-07 (working tree limpo)

## Fase R2-W3 — Kind `library` + diagramas

- [x] **T-PC2-R2-03** — Schema + tipos: união de 4 kinds ✅ (+ `diagramDark` opcional na base)
  - Write set: `frontend/src/lib/schemas/projects.ts`, `frontend/src/types/content.ts`, testes do schema
  - `LibraryProjectSchema`: base + `kind:"library"`, `sections`, `pypi:{package,version,installCommand?}`, `links:{repo,pypi,docs?}`, `stat?:{label,value}`
- [x] **T-PC2-R2-04** — `LibraryProjectTemplate` + dispatch ✅
  - Write set: `frontend/src/pages/projects/LibraryProjectTemplate.tsx` (+test), `frontend/src/pages/projects/ProjectDetailPage.tsx`
  - Hero → diagrama → pip-install block (copy-friendly) → seções → stats → links PyPI/GitHub
- [x] **T-PC2-R2-05** — `DiagramAsset` theme-aware + `DiagramCard` i18n ✅ (+ archPage labels ligados no MetaProjectTemplate)
  - Write set: `frontend/src/components/projects/DiagramAsset.tsx`, novo `DiagramCard.tsx` (+tests), `CaseStudyTemplate.tsx`, `MetaProjectTemplate.tsx`, chaves i18n nos 3 JSONs
  - AC: AC-PC2-R2-04, AC-PC2-R2-05

## Fase R2-W4 — Conteúdo + cards (substitui C-01/C-02 onde conflitar)

- [ ] **T-PC2-R2-06** — Conteúdo: rand-engine novo + dadaia-workspace retipado + remoção da chave legacy `projects`
  - Write set: `frontend/src/data/content/{pt,en,de}.json`, `frontend/scripts/validate-content.mjs` (se precisar do novo kind)
  - AC: AC-PC2-01..05 (revisados), AC-PC2-R2-03
- [ ] **T-PC2-R2-07** — `ProjectCard` redesign
  - Write set: `frontend/src/components/projects/ProjectCard.tsx` (+test)
  - Chip de kind, badges tech (≤4), stat de destaque, ícones GitHub/PyPI; AC-PC2-R2-06
- [ ] **T-PC2-R2-08** — Dead code removal
  - Write set: deleções `AppSidebar.tsx`, `ui/sidebar.tsx`, `components/Portfolio.tsx` (inline no Index), `public/assets/projects/portifolio/architecture.svg`
  - AC: AC-PC2-R2-07 (grep-zero)

## Fase R2-W5 — Testes e gates

- [ ] **T-PC2-R2-09** — Deflake `useContent.test.ts` + testes novos componentes
  - AC: AC-PC2-R2-08 (3× verde)
- [ ] **T-PC2-R2-10** — ADR retroativo analytics validado
  - Verificar: 7 eventos `track()` compilam com SDK vendorizado; sem chamadas órfãs
  - AC: ADR-PC2-R2-03 satisfeito (build + grep)

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
  - AC: todos os itens acima ✅ antes do merge em `main` (revisado rc-2, ADR-PC2-R2-04 — PR direto a main; o checklist Lighthouse/E2E completo roda no CI do PR)

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
