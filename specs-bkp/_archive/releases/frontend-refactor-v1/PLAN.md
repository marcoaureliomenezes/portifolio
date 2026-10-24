# Release PLAN — frontend-refactor-v1 (archived)

**Status:** Aprovado

## Sequência executada

1. T-FE-01 (podagem) — primeiro, para reduzir surface antes de mexer em código.
2. T-FE-02 (useContent + LanguageProvider) — base do DIP; viabiliza T-FE-06.
3. T-FE-03 + T-FE-04 (decomposição) — em paralelo (PRs separados).
4. T-FE-05 (Radix Dialog), T-FE-06 (URLs sociais), T-FE-07 (ARIA) — paralelos.
5. T-FE-08 (routes.ts) + T-FE-09 (ProjectTabPage) — pré-requisito de F-P0-03/04/05.
6. T-FE-10 (housekeeping) — fechamento.

## Dependências externas

- Quality gate (`quality-gate-v1`) — paralela, mas testes só ficam significativos
  depois do refactor (componentes precisam estar extraídos para serem testados).
- Migração JSON (`content-json-v1`) — paralela; useContent é pré-requisito.

## Critérios de fechamento

Todos os 10 tasks `[x]`. Bundle snapshot antes/depois committado em `specs/_archive/`
ou no commit log.
