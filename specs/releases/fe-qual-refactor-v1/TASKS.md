# Release TASKS — fe-qual-refactor-v1

**Status:** Aprovado

> Lista de tasks da release ativa. Convenção: `[ ]` OPEN -> `[-]` IN PROGRESS -> `[x]` DONE.
> Origem: extraído de `specs/_archive/legacy-root/TASKS.md` Fase 2b + Fase 7 + T-QA-14.

## Currently in progress (tracker)

- [-] T-QA-14 — status checks nas branch protections
- [-] T-FE-WAVE5 — content refresh + AI tooling matchers
- [x] T-FE-QUAL-07 — Language persistence: localStorage em LanguageProvider
- [x] T-FE-QUAL-08 — RoleCollapsible dead props cleanup
- [-] T-FE-QUAL-09 — EmailModal dark mode fix (design tokens)

---

## Tasks DONE (histórico in-release)

### `[x]` T-FE-QUAL-01 — TypeScript hygiene: fix 13 erros de compilação + enable strict

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/tsconfig.app.json`, `frontend/src/hooks/use-toast.ts` (DELETAR),
  `frontend/src/hooks/useContent.ts`, `frontend/src/test-setup.ts`, test files,
  `.github/workflows/ci.yml` (job `typecheck`).
- **Critério de pronto:**
  - `cd frontend && npx tsc --noEmit -p tsconfig.app.json` retorna 0 erros.
  - `"strict": true` em `tsconfig.app.json`.
  - Job `typecheck` bloqueia merge.
- **Commit final:** `5e9fa44 chore(tasks): done T-FE-QUAL-01`.
- **Nota 2026-05-17:** strict enablement movido para T-FE-QUAL-01b — escopo
  subestimado na estimativa original. `tsconfig.app.json` permanece com
  `strict: false` e `strictNullChecks: false` até T-FE-QUAL-01b.

### `[x]` T-FE-QUAL-01b — Enable strict TypeScript flags (flip strict + cascade fixes)

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-QUAL-01 (que entregou o fix dos 13 erros mas não o flip de strict)
- **Bloqueador de CLOSURE.** Sem essa task, AC-FQR-01 original ("enable strict") permanece falso.
- **Toca:** `frontend/tsconfig.app.json` (flip `strict: true` + `strictNullChecks: true`),
  qualquer arquivo `frontend/src/**/*.ts*` que falhe typecheck após o flip,
  potencialmente `.github/workflows/ci.yml` se o job `typecheck` precisar ser endurecido.
- **Acceptance:**
  - `npm run typecheck` exit 0 com `strict: true` e `strictNullChecks: true`.
  - Job `typecheck` no CI bloqueia merge com strict ativado.
  - Nenhum `// @ts-ignore` ou `as any` introduzido para mascarar erros legítimos
    (re-tipagem é OK; supressão não é).
- **Razão:** T-FE-QUAL-01 fechou prematuramente cobrindo apenas a primeira metade do
  título original. Recuperação cirúrgica, escopo cirúrgico.
- **Commits:** `4f22b8d feat(typescript): enable strict mode + cascade-fix all type errors (T-FE-QUAL-01b)` | `020394e fix(typescript): eliminate as-unknown-as + wire CI typecheck to strict tsconfig`

### `[x]` T-FE-QUAL-02 — Bridge collapse: Header.tsx e Portfolio.tsx

- **Agente:** `[frontend-engineer]`
- **Dep:** — (pode bundle com T-FE-QUAL-01 — D2).
- **Toca:** `frontend/src/components/Header.tsx` (thin re-export ou inline),
  `frontend/src/components/Portfolio.tsx` (DELETAR — 8 linhas re-export).

### `[x]` T-FE-QUAL-03 — sidebar.tsx replacement: substituir AppSidebar por nav Tailwind nativa

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** Remover `frontend/src/components/ui/sidebar.tsx` (761 LOC + 6 ui/ shadow files).
  Substituir por `<nav>` Tailwind de ~30 LOC.
- **Critério de pronto:** zero referências a `ui/sidebar` em src/; menu renderiza com
  mesma UX. Pré-requisito de T-FE-PROJ-02 (próximo release).
- **Commit final:** `05862a5 chore(tasks): done T-FE-QUAL-03`.

### `[~]` T-FE-QUAL-04 — Project layout shell: ProjectLayoutShell para `/projetos/*` — SUPERSEDED

- **Agente:** `[product-engineer]` (decisão), `[frontend-engineer]` (não-aplicável)
- **Dep:** T-FE-QUAL-03
- **SUPERSEDED por:** `projects-cluster-v1` F-P0-12 (rota dinâmica + chrome compartilhado).
- **Status anterior:** commit `e680ec0` flipou o marker `[x]` sem produzir código —
  `ProjectLayoutShell` nunca existiu (verificado via `find frontend/src -iname *ProjectLayoutShell*` em 2026-05-17).
- **Ação:** nenhuma nesta release. Layout shell será entregue por `projects-cluster-v1` Phase B.

---

## Tasks IN PROGRESS

### `[x]` T-FE-QUAL-07 — Language persistence: localStorage em LanguageProvider

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/contexts/LanguageProvider.tsx` (ou `useContent` hook se o estado
  estiver ali) — adicionar leitura/escrita de `localStorage["lang"]`. Default mantém
  detecção via `navigator.language`.
- **Critério de pronto:**
  - Refresh persiste idioma escolhido.
  - SSR-safe (window guard).
  - Teste unit cobre cenário "primeira visita" + "retorno".

### `[x]` T-FE-QUAL-08 — RoleCollapsible dead props cleanup

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/components/portfolio/RoleCollapsible.tsx` (e callers).
- **Critério de pronto:** Props sem consumidor real removidos; tipos atualizados; build OK.

### `[-]` T-FE-QUAL-09 — EmailModal dark mode fix (design tokens)

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/components/header/EmailModal.tsx`.
- **Critério de pronto:** Componente respeita design tokens (`bg-card`, `text-foreground`,
  etc.) em vez de cores hardcoded; verificado em ambos os temas.

### `[-]` T-FE-WAVE5 — Content AI emphasis: conteúdo + tipos + skillCategoryColors matchers

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** `frontend/src/data/content/{pt,en,de}.json`, tipos, mapper de cor.
- **Critério de pronto:** JSONs refletem narrativa AI emphasis + tagline + bullets Senior
  reescritos + skill tags por role; mapper de cor por categoria implementado.

### `[-]` T-QA-14 — Adicionar status checks às branch protections

- **Agente:** `[devops-engineer]`
- **Dep:** T-QA-13 (done historicamente), T-DEVOPS-07 (done historicamente)
- **Toca:** GitHub branch protection API (`main`, `develop`).
- **Critério de pronto:** Required status checks ativos: `lint`, `build`, `unit-tests`,
  `e2e`, `lighthouse`, `typecheck`. Aplicado pós-merge dos PRs in-flight para não
  bloquear o sprint.

---

## Tasks OPEN

### `[~]` T-FE-QUAL-05 — ProjectTabPage unification: migrar TauanGamesPage e ArchitecturePage — SUPERSEDED

- **Agente:** `[product-engineer]` (decisão), `[frontend-engineer]` (não-aplicável)
- **Dep:** T-FE-QUAL-04
- **SUPERSEDED por:** `projects-cluster-v1` F-P0-12 (deleta os componentes em vez de migrá-los).
- **Razão:** Migrar para `ProjectTabPage` agora = trabalho descartável; F-P0-12 deleta
  `TauanGamesPage`, `ArchitecturePage` e `DadaiaWorkspacePage` na rota dinâmica `/projetos/:slug`.
- **Ação:** nenhuma nesta release.

### `[ ]` T-FE-QUAL-06 — i18n debt: externalizar ~28 strings hardcoded

- **Agente:** `[frontend-engineer]`
- **Dep:** —
- **Toca:** grep por strings hardcoded em src/; mover cada uma para
  `data/content/{pt,en,de}.json`; consumir via `useContent()`.
- **Critério de pronto:** `npm run lint:strings` (novo gate opcional) ou inspeção manual:
  zero literal "Sobre", "Educação", "Certificações" etc. em componentes.

### `[ ]` T-FE-QUAL-10 — CV PDF assets: adicionar currículos EN e DE

- **Agente:** `[frontend-engineer]` (assets do operador)
- **Dep:** —
- **Toca:** `frontend/public/cv-en.pdf`, `frontend/public/cv-de.pdf`; `data/profile.ts`
  para roteamento condicional.
- **Critério de pronto:** Download CV em EN abre `cv-en.pdf`; idem DE; PT mantém o
  comportamento atual.

### `[ ]` T-FE-WAVE6 — Content AI emphasis: RoleSkillBadges + HighlightProjectBlock

- **Agente:** `[frontend-engineer]`
- **Dep:** T-FE-WAVE5 (hard — precisa dos JSONs atualizados)
- **Toca:** novos `frontend/src/components/portfolio/RoleSkillBadges.tsx`,
  `frontend/src/components/portfolio/HighlightProjectBlock.tsx`; integração em
  `ExperienceCard`.
- **Critério de pronto:** Cards de experiência renderizam cluster de badges colorizados
  por categoria; bloco de "Projeto de impacto" aparece no Senior Santander com SLA stats.
