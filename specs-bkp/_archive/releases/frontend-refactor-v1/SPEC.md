# Release SPEC — frontend-refactor-v1 (archived)

**Status:** Aprovado

> Release encerrada. Sintetizada na migração 2026-05-17 a partir de tasks
> `T-FE-01..10` que não tinham 1:1 com uma feature SPEC dedicada.
>
> Cobre o refator transversal do frontend antes das features serem mensuráveis em
> Lighthouse >= 90 — vide `_archive/legacy-root/SPEC.md §3`.

---

## 1. Contexto

Pós-AS-IS (2026-05-14) o frontend estava com God-Components (`Portfolio.tsx` 1007 LOC,
`Header.tsx` 540 LOC), 37 componentes shadcn órfãos arrastando 30+ deps npm, modais
inline sem Radix Dialog, URLs sociais default fake, prop-drilling de `language`. 3 dos
defeitos eram CRITICAL no report do software-architect.

## 2. Escopo

10 tasks (T-FE-01..10) executadas em sequência ou em PRs paralelos por
`software-engineer` (no momento; depois renomeado para `frontend-engineer`).

| Task | Entrega |
|---|---|
| T-FE-01 | Podagem shadcn (37 REMOVE) + remoção de 30+ deps npm órfãs. Ganho >= 180KB gz. |
| T-FE-02 | Hook `useContent()` + `LanguageProvider` (DIP — única fonte de conteúdo) |
| T-FE-03 | Refactor `Header.tsx`: 540 -> &le; 80 LOC orquestrador + 7 componentes filhos |
| T-FE-04 | Refactor `Portfolio.tsx`: 1007 -> &le; 80 LOC orquestrador + 12 componentes filhos |
| T-FE-05 | Modais inline -> Radix Dialog (`dialog.tsx`); focus trap, ESC, ARIA |
| T-FE-06 | URLs sociais centralizadas em `data/profile.ts` (remove defaults fake) |
| T-FE-07 | Landmarks ARIA: `aria-labelledby`, `<nav aria-label>`, `aria-current="location"` |
| T-FE-08 | Tabela `routes.ts` centralizada |
| T-FE-09 | `ProjectTabPage` extraído (layout genérico das abas) |
| T-FE-10 | Housekeeping: `App.css`, `.flask.pid`, scripts vazios, `AGENTS.md`, `z_prompts.md`, README links |

## 3. Critérios de fechamento (atendidos)

- `Portfolio.tsx` orquestrador &le; 80 linhas (era 1007).
- `Header.tsx` orquestrador &le; 80 linhas (era 540).
- Zero referências a `https://linkedin.com` / `https://github.com` default (E2E-09 gate
  passou).
- Zero componente sem `dialog.tsx` em modais (E2E-13 axe smoke passou).
- Bundle gz reduzido >= 100KB (medido pelo bundle snapshot em T-FE-01).
- Anti-patterns proibidos formalizados em `memory/architecture.html §anti-patterns`.

## 4. Decisões herdadas

- React 18.3.x mantido (refactor, não migração). Vite 7.3.x.
- Single-component + Tailwind responsive (sem duplicação desktop/mobile).
- `useState` local nos componentes de interação (RoleCollapsible).
