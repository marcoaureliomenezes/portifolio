# Closure: Release — fe-qual-refactor-v1

> **Status:** Aprovado
> **Release ID:** fe-qual-refactor-v1
> **Owner:** product-engineer
> **Closed:** 2026-05-17

## Summary

Release "qualidade frontend pós-WAVE3" concluiu o saneamento de débitos técnicos do
frontend e o refresh de conteúdo AI emphasis. TypeScript strict mode foi ativado em todo
o projeto com CI gate dedicado; as bridges `Header.tsx`/`Portfolio.tsx` foram colapsadas;
a primitiva `ui/sidebar.tsx` (761 LOC) foi substituída por `<nav>` Tailwind nativa
desbloqueando o cluster Projects v1; 28 strings hardcoded foram externalizadas para o
fluxo `useContent()`; persistência de idioma em `localStorage` foi entregue; dead props
em `RoleCollapsible` removidos; `EmailModal` migrado para design tokens (dark mode fix);
roteamento de CV consolidado em PDF único PT (decisão do operador 2026-05-17); WAVE5 e
WAVE6 atualizaram conteúdo + componentes (RoleSkillBadges, HighlightProjectBlock); e
status checks foram aplicados às branch protections de `main` e `develop` com matriz
completa (`lint`, `build`, `unit-tests`, `e2e`, `lighthouse`, `typecheck`).

As tasks T-FE-QUAL-04 (project layout shell) e T-FE-QUAL-05 (ProjectTabPage unification)
foram explicitamente SUPERSEDED por `projects-cluster-v1` F-P0-12, que já entregou rota
dinâmica + chrome compartilhado em Phase A+B. CLOSURE prossegue conforme SPEC §6
("CLOSURE depende HARD de F-P0-12 entregue").

## Tasks completed

| Task ID | Description | Final commit |
|---------|-------------|--------------|
| T-FE-QUAL-01 | TypeScript hygiene: fix 13 erros de compilação | `5e9fa44` |
| T-FE-QUAL-01b | Enable strict TS flags + cascade-fix all type errors | `4f22b8d` / `020394e` |
| T-FE-QUAL-02 | Bridge collapse: Header.tsx + Portfolio.tsx | `a266ec9` (start) + follow-on |
| T-FE-QUAL-03 | sidebar.tsx replacement por `<nav>` Tailwind | `05862a5` |
| T-FE-QUAL-04 | Project layout shell — SUPERSEDED por F-P0-12 | n/a (no code) |
| T-FE-QUAL-05 | ProjectTabPage unification — SUPERSEDED por F-P0-12 | n/a (no code) |
| T-FE-QUAL-06 | i18n debt: externalizar ~28 strings hardcoded | `277df73` / `cca63ef` |
| T-FE-QUAL-07 | Language persistence em localStorage | `25e57a2` / `517abb6` |
| T-FE-QUAL-08 | RoleCollapsible dead props cleanup | `2d4ad33` / `3754f55` |
| T-FE-QUAL-09 | EmailModal dark mode fix (design tokens) | `f622a5a` / `109f373` |
| T-FE-QUAL-10 | CV PDF routing (single PT PDF for all locales) | `0610994` |
| T-FE-WAVE5 | Content AI emphasis + skillCategoryColors matchers | `dae970e` / `582b0f7` |
| T-FE-WAVE6 | RoleSkillBadges + HighlightProjectBlock | `03d2b8e` / `3b99a91` |
| T-QA-14 | Status checks nas branch protections | `3deff9d` / `bc17af2` |

## Validations

| Description | Command | Evidence |
|-------------|---------|----------|
| TS strict typecheck passa sem erros | `cd frontend && npx tsc --noEmit -p tsconfig.app.json` | commits `4f22b8d`, `020394e` (CI job `typecheck` ativo) |
| `Portfolio.tsx` deletado, `Header.tsx` é thin re-export/inlined | `git log --diff-filter=D -- frontend/src/components/Portfolio.tsx` | git history |
| Nenhuma referência a `ui/sidebar` em produção | `grep -r "ui/sidebar" frontend/src/` retorna vazio | commit `05862a5` |
| F-P0-12 entregue (rota dinâmica + chrome compartilhado) | `git log --oneline -- frontend/src/pages/ProjectDetailPage.tsx frontend/src/components/projects/ProjectsLayoutShell.tsx` | commits `cafc6d8` (shell), `1cf04b5` (delete legacy pages), `9be3b09` (delete legacy types) |
| Zero strings hardcoded de UI nos componentes | npm script + manual i18n inspection | commits `277df73`, `268079d`, `f24bc4a`, `cca63ef` |
| Refresh persiste idioma escolhido | E2E spec `lang-persistence.spec.ts` + unit tests em LanguageProvider | commit `25e57a2` |
| RoleCollapsible sem props mortos | `grep -E "useless|dead" frontend/src/components/portfolio/RoleCollapsible.tsx` retorna vazio | commit `2d4ad33` |
| EmailModal usa design tokens (dark mode OK) | manual smoke + E2E `email-modal-dark-mode.spec.ts` | commit `f622a5a` |
| CV PT serve todos os locales (decisão operador) | locale-conditional URL com PT fallback | commit `41d9290` + `0610994` |
| JSONs PT/EN/DE refletem narrativa AI emphasis | `frontend/src/data/content/{pt,en,de}.json` diff | commits `dae970e`, `5d3d02c` (#25) |
| RoleSkillBadges + HighlightProjectBlock integrados | `git log -- frontend/src/components/portfolio/RoleSkillBadges.tsx HighlightProjectBlock.tsx` | commits `ba5733d`, `03d2b8e` |
| Required status checks ativos em main + develop | GitHub branch protection API | commit `3deff9d ci: gate direct pushes to develop/main with the full check matrix (T-QA-14)` |

## Drifts

### drift-tfeq01-strict-not-flipped

**Description:** T-FE-QUAL-01 foi originalmente fechada `[x]` antes do flip
`strict: true` em `frontend/tsconfig.app.json`. O critério "enable strict" não foi
cumprido pela primeira passada; só os 13 erros explícitos foram corrigidos.

**Resolution:** Aberta T-FE-QUAL-01b para o flip cirúrgico + cascade-fix. Commits
`4f22b8d` e `020394e` entregaram strict mode ativado e CI typecheck gate ativo. AC-FQR-01
ficou consumado por T-FE-QUAL-01 + T-FE-QUAL-01b combinados.

**Memory updates:** nenhum (a quality-bar.html já listava strict typecheck como gate;
release apenas tornou o gate efetivamente bloqueante).

### drift-tfeq04-tfeq05-superseded

**Description:** T-FE-QUAL-04 (`ProjectLayoutShell`) e T-FE-QUAL-05 (`ProjectTabPage`
unification) foram inicialmente declaradas in-release. Durante implementação de
`projects-cluster-v1` (Phase A+B) o problema foi resolvido por uma abordagem diferente:
rota dinâmica `/projetos/:slug` com template dispatch por `kind` + `ProjectsLayoutShell`
compartilhado. Implementar T-FE-QUAL-04/05 separadamente seria retrabalho descartável.

**Resolution:** Ambas as tasks marcadas `[~]` SUPERSEDED com referência cruzada
explícita para `projects-cluster-v1` F-P0-12. SPEC §6 declara dependência HARD: CLOSURE
desta release só se inicia após F-P0-12 entregue. F-P0-12 está delivered (Phase B
completa em commits `cafc6d8`, `1cf04b5`, `9be3b09`).

**Memory updates:** nenhum nesta release — a topologia de rotas foi e será atualizada
em `projects-cluster-v1` CLOSURE.

### drift-tfeq10-single-pt-pdf

**Description:** T-FE-QUAL-10 originalmente especificava versionar `cv-en.pdf` e
`cv-de.pdf`. Em 2026-05-17 o operador decidiu por PDF único PT (`Marco_Menezes_CV.pdf`)
servindo todos os locales, com locale-conditional download URL + PT fallback no JSON.

**Resolution:** Implementação `0610994 feat(cv): single PT PDF serves all locales`. Não
existem assets EN/DE versionados; o `useContent()` retorna a mesma URL para todos os
idiomas. AC-FQR-10 reescrito (in-spec) para refletir a nova realidade.

**Memory updates:** quality-bar.html — adicionada nota sobre PDF único PT (single source
of truth).

## Memory updates

- `specs/memory/architecture.html` — sem mudança: a release não tocou topologia AWS,
  CloudFront, Route53 ou estrutura de camadas. O `useContent()` continua sendo o hook
  canônico (a persistência de idioma é interno ao LanguageProvider, não muda contrato).
- `specs/memory/tech-stack.html` — sem mudança: stack frontend (React+Vite+Tailwind+TS)
  inalterada; nenhuma nova dependência ou versão major bumped.
- `specs/memory/product/quality-bar.html` — atualizada: matriz de required status checks
  expandida (lista explícita: `lint`, `build`, `unit-tests`, `e2e`, `lighthouse`,
  `typecheck`); nota sobre TS strict como gate efetivo.
- `specs/memory/product/index.html` — sem mudança: catálogo permanece com 3 entradas
  (overview, personas, quality-bar). Nenhuma feature visível ao produto foi
  adicionada/removida; AI emphasis é refresh de conteúdo, não nova feature.
- `specs/memory/product/overview.html` — sem mudança: estado do produto é o mesmo
  (SPA estática, 3 abas dedicadas a serem entregues por `projects-cluster-v1`).
- `specs/memory/product/personas.html` — sem mudança: personas (recrutadores +
  comunidade técnica) inalteradas.

## Backlog returns

- `backlog/candidates.md` ← (já presente) `projects-cluster-v1` follow-up: hardening de
  E2E suite via `projects-cluster/` canonical (decisão `dec-e2e-suite-layout.md`).
- `backlog/ideas.md` ← (informal) considerar `prod-go-live-v1` como próximo após
  `projects-cluster-v1` fechar (T-DEVOPS-10..14 + T-QA-15/16 do legacy backlog).

## Archive decision

**MOVE** — release directory will be moved to
`specs/_archive/releases/fe-qual-refactor-v1/` via `git mv` after this CLOSURE.md is
committed and memory updated. ACTIVE.md will be repointed to `projects-cluster-v1` with
`phase: IMPLEMENTATION` (Phase C in progress: T-PC-C-06/07/08/09 open).
