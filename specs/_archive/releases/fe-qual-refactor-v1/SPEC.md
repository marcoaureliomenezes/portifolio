# Release SPEC — fe-qual-refactor-v1

**Status:** Aprovado

> Release ativa do sprint atual. Consolida o cluster "qualidade frontend pós-WAVE3" e o
> refresh de conteúdo AI emphasis. Bundle de tasks <code>T-FE-QUAL-01..10</code>,
> <code>T-FE-WAVE5</code>, <code>T-FE-WAVE6</code> e <code>T-QA-14</code>.
> Spec sintetizada na migração 2026-05-17 a partir de tasks pré-existentes e do report
> conjunto software-architect + frontend-engineer (2026-05-16).

---

## 1. Contexto

Pós-WAVE3 (visual-identity-v1 mergeada), uma rodada de revisão profunda
(software-architect + frontend-engineer em 2026-05-16) identificou um cluster coeso de
débitos de qualidade frontend que justificam um sprint dedicado:

1. **TypeScript hygiene** — 13 erros de compilação latentes + `strict: false`; gate de
   tipos ausente no CI.
2. **Camadas bridge desnecessárias** — `Header.tsx` e `Portfolio.tsx` são re-exports
   thin que adicionam cognitive overhead sem benefício.
3. **`sidebar.tsx` shadcn primitiva inflada** (761 LOC + 6 ui/ shadow files) usada para
   um menu que cabe em `<nav>` Tailwind de ~30 LOC.
4. **`ProjectLayoutShell` ausente** — `/projetos/*` reaproveita layout do Header mas não
   tem um shell dedicado.
5. **`ProjectTabPage` usado em 1 de 3 abas** — TauanGamesPage e ArchitecturePage
   permanecem ad-hoc.
6. **i18n debt** — ~28 strings hardcoded em componentes (não passam por `useContent()`).
7. **Language persistence** — preferência de idioma não persiste em `localStorage`.
8. **RoleCollapsible dead props** — props que não consumidores ainda no contrato.
9. **EmailModal dark mode bug** — tokens hardcoded quebram o dark mode.
10. **CV PDF assets EN + DE** — apenas PT está versionado.

Em paralelo, o ciclo de **content AI emphasis** entrou em execução (gaps de conteúdo
identificados pelo operador em 2026-05-15): WAVE5 atualiza JSONs + matchers; WAVE6
adiciona componentes (`RoleSkillBadges` + `HighlightProjectBlock`). Ambas estão
encadeadas e fazem sentido no mesmo release de "qualidade pós-WAVE3".

Finalmente, **T-QA-14** (status checks nas branch protections) está in-progress como
follow-up direto de T-QA-13 — pertence neste release.

## 2. Escopo

Tasks incluídas (origem: `specs/_archive/legacy-root/TASKS.md` Fase 2b + Fase 7):

| ID | Descrição curta | Estado inicial neste release |
|---|---|---|
| T-FE-QUAL-01 | TypeScript hygiene + enable strict + CI gate | `[x]` (concluída) |
| T-FE-QUAL-02 | Bridge collapse: Header.tsx e Portfolio.tsx | `[x]` (concluída) |
| T-FE-QUAL-03 | sidebar.tsx replacement por `<nav>` Tailwind nativa | `[x]` (concluída) |
| T-FE-QUAL-04 | ProjectLayoutShell para `/projetos/*` | `[x]` (concluída) |
| T-FE-QUAL-05 | ProjectTabPage unification: migrar TauanGamesPage + ArchitecturePage | `[ ]` |
| T-FE-QUAL-06 | i18n debt: externalizar ~28 strings hardcoded | `[ ]` |
| T-FE-QUAL-07 | Language persistence em localStorage | `[-]` |
| T-FE-QUAL-08 | RoleCollapsible dead props cleanup | `[-]` |
| T-FE-QUAL-09 | EmailModal dark mode fix (design tokens) | `[-]` |
| T-FE-QUAL-10 | CV PDF assets EN + DE | `[ ]` |
| T-FE-WAVE5 | Content AI emphasis: conteúdo + tipos + skillCategoryColors matchers | `[-]` |
| T-FE-WAVE6 | Content AI emphasis: RoleSkillBadges + HighlightProjectBlock | `[ ]` |
| T-QA-14 | Adicionar status checks às branch protections | `[-]` |

Total: 13 tasks. 4 done historicamente, 5 in-progress, 4 open.

## 3. Decisões herdadas do report 2026-05-16

- **D1 (product-engineer):** sidebar.tsx replacement (T-FE-QUAL-03) é pré-requisito de
  T-FE-PROJ-02 (Projects Index Page) — substituir AGORA evita retrabalho no cluster
  Projects v1 (próximo release candidato).
- **D2 (product-engineer):** bridges Header.tsx/Portfolio.tsx podem ir no mesmo PR de
  T-FE-QUAL-01 ou em PRs separados; ordem livre.

Owner padrão de todas as tasks <code>T-FE-QUAL-*</code> e <code>T-FE-WAVE*</code>:
<code>frontend-engineer</code>. <code>qa-engineer</code> pareia em PR review (Axe + tipos
+ smoke). T-QA-14 é owner <code>devops-engineer</code>.

## 4. Critérios de fechamento da release

- **AC-FQR-01.** `cd frontend && npx tsc --noEmit -p tsconfig.app.json` retorna 0 erros
  e `"strict": true` está em `tsconfig.app.json`. **(consumado em T-FE-QUAL-01)**
- **AC-FQR-02.** `frontend/src/components/Portfolio.tsx` deletado e `Header.tsx` é thin
  re-export ou inlined. **(consumado em T-FE-QUAL-02)**
- **AC-FQR-03.** Nenhuma referência a `ui/sidebar.tsx` em código de produção; menu via
  `<nav>` Tailwind. **(consumado em T-FE-QUAL-03)**
- **AC-FQR-04.** O layout shell para `/projetos/*` foi superseded por
  `projects-cluster-v1` F-P0-12 (rota dinâmica + chrome compartilhado).
  **(T-FE-QUAL-04 — SUPERSEDED; nenhum código a entregar nesta release)**
- **AC-FQR-05.** `TauanGamesPage` e `ArchitecturePage` foram substituídos por
  templates dinâmicos em `projects-cluster-v1` (F-P0-12 §3.2).
  **(T-FE-QUAL-05 — SUPERSEDED; nenhum código a entregar nesta release)**
- **AC-FQR-06.** Zero strings hardcoded de UI em componentes — todas via `useContent()`.
  **(T-FE-QUAL-06 — em aberto)**
- **AC-FQR-07.** Refresh persiste idioma escolhido. **(T-FE-QUAL-07 — in-progress)**
- **AC-FQR-08.** `RoleCollapsible` sem props mortos no contrato. **(T-FE-QUAL-08 —
  in-progress)**
- **AC-FQR-09.** `EmailModal` respeita design tokens (dark mode OK). **(T-FE-QUAL-09 —
  in-progress)**
- **AC-FQR-10.** `cv-en.pdf` e `cv-de.pdf` versionados em `frontend/public/`. **(T-FE-QUAL-10
  — em aberto)**
- **AC-FQR-11.** JSONs PT/EN/DE atualizados com narrativa AI emphasis + tagline +
  skillCategoryColors. **(T-FE-WAVE5 — in-progress)**
- **AC-FQR-12.** `RoleSkillBadges` + `HighlightProjectBlock` renderizam nos cards de
  experiência. **(T-FE-WAVE6 — em aberto)**
- **AC-FQR-13.** Required status checks (`lint`, `build`, `unit-tests`, `e2e`,
  `lighthouse`, `typecheck`) ativos em `main` e `develop`. **(T-QA-14 — in-progress)**

## 5. Out-of-scope deste release

- Toda área de projetos dedicada (`/projetos` index, content model unificado, page
  templates, arch diagrams, link-out tauan-games, i18n parity gate) — clusterizada em
  `backlog/candidates.md` como `projects-v1` (candidato imediato após esta release
  fechar).
- Go-live em produção (T-DEVOPS-10..14, T-QA-15, T-QA-16) — candidato `prod-go-live-v1`
  no backlog.
- CMS-lite P1 — parked em `backlog/backlog-future.md`.

## 6. Dependencies

- **CLOSURE desta release depende HARD de `projects-cluster-v1` F-P0-12 entregue.**
  AC-FQR-04 e AC-FQR-05 são SUPERSEDED por F-P0-12; sem F-P0-12 entregue, ambos os
  ACs ficam "superseded por algo que não existe" e a evidência-triple falha.

## 7. Risks

- **Drift detectado em 2026-05-17 — markers `[x]` fechados sem cumprir AC.**
  T-FE-QUAL-01 marcada DONE com `strict: false` ainda em `frontend/tsconfig.app.json:17-18`;
  T-FE-QUAL-04 marcada DONE com commit `e680ec0` que só editou `specs/TASKS.md` (zero
  código produzido — `ProjectLayoutShell` não existe no filesystem). CLOSURE
  evidence-triple validation falhou em detectar ambos. Mitigação imediata: T-FE-QUAL-01b
  reabre o escopo strict; T-FE-QUAL-04 SUPERSEDED por `projects-cluster-v1` F-P0-12.
  Follow-up meta (não bloqueante): reforçar gate de `dadaia-release-closure`
  (vide refine-specs report 2026-05-17T065653Z §2 Problema #4).

## 8. Specs de apoio

- `supporting/content-ai-emphasis.SPEC.md` — visão detalhada da Fase 7 (WAVE5/WAVE6),
  decisões de conteúdo do operador, matchers de cor de skill.
- Referência cruzada: `_archive/releases/visual-identity-v1/SPEC.md` (base que esta
  release evolui).
