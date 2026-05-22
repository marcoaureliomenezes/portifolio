# Release TASKS — portfolio-home-polish-v1

**Status:** Aprovado

> Convenção: `[ ]` OPEN -> `[-]` IN PROGRESS -> `[x]` DONE.
> Máximo 1 item `[-]` por vez, salvo declaração explícita de paralelismo seguro.

## Task list

- [x] T-PHP-01 — Home first fold polish (Header/Hero)
  - Owner: `frontend-engineer`
  - Target: first fold components/layout da home
  - Preconditions: SPEC/PLAN aprovados
  - Done criterion:
    - sem duplicidade visual de foto,
    - copy exata do hero aplicada,
    - título com escala ~50% menor,
    - responsividade validada em mobile/tablet/desktop.
  - Parallelism: bloqueia T-PHP-02

- [x] T-PHP-02 — Reordenação e compactação de Education/Experience/Certifications
  - Owner: `frontend-engineer`
  - Target: seções de conteúdo da home
  - Preconditions: T-PHP-01 `[x]`
  - Done criterion:
    - Education antes de Experience,
    - Education colapsável por padrão,
    - Experience com card uniforme, teaser clamp 3 linhas e expansão,
    - label exata `Santander Brazil - F1rst Digital Services`,
    - Certifications compacta.
  - Parallelism: bloqueia T-PHP-03

- [x] T-PHP-03 — Skills + Projects nav/CTA polish
  - Owner: `frontend-engineer`
  - Target: Skills section e navegação/CTA de projetos
  - Preconditions: T-PHP-02 `[x]`
  - Done criterion:
    - inclusão dos 8 itens de AI/Modern Tooling,
    - label `Personal Projects`,
    - nav/CTA de projetos destacada,
    - affordance de clique clara,
    - conteúdo interno de `/projetos/*` inalterado.
  - Parallelism: bloqueia T-PHP-04

- [-] T-PHP-04 — QA regressão visual/responsiva e critérios finais
  - Owner: `qa-engineer`
  - Target: testes e evidências de aceite
  - Preconditions: T-PHP-03 `[x]`
  - Done criterion:
    - evidência de visual/responsivo aprovada,
    - ordem de seções validada,
    - strings mandatórias validadas,
    - estado default collapsed validado,
    - active projects nav validado,
    - regressão crítica inexistente em home/projetos.
  - Parallelism: último gate para CLOSURE
