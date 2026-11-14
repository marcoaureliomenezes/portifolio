# Release PLAN — fe-qual-refactor-v1

**Status:** Aprovado

> Plano de implementação do release. Sequenciamento por dependências, janelas de
> paralelismo, gates de aprovação por PR.

---

## 1. Sequência de PRs

```
PR-1  (DONE) T-FE-QUAL-01 (typecheck strict + use-toast.ts delete + CI gate)
              + T-FE-QUAL-02 (Header/Portfolio bridge collapse) — bundled
PR-2  (DONE) T-FE-QUAL-03 sidebar.tsx replacement
PR-3  (DONE) T-FE-QUAL-04 ProjectLayoutShell
PR-4  (IN)   T-FE-QUAL-07 Language persistence
PR-5  (IN)   T-FE-QUAL-08 RoleCollapsible dead props cleanup
PR-6  (IN)   T-FE-QUAL-09 EmailModal dark mode fix
PR-7  (OPEN) T-FE-QUAL-05 ProjectTabPage unification (TauanGames + Architecture)
PR-8  (OPEN) T-FE-QUAL-06 i18n debt (strings -> useContent())
PR-9  (OPEN) T-FE-QUAL-10 CV PDF EN + DE
PR-10 (IN)   T-FE-WAVE5 Content AI emphasis (JSON refresh + types + matchers)
PR-11 (OPEN) T-FE-WAVE6 RoleSkillBadges + HighlightProjectBlock
PR-12 (IN)   T-QA-14 status checks nas branch protections (último — pós-merge dos PRs acima)
```

## 2. Janelas de paralelismo

| Janela | Tasks paralelas | Notas |
|---|---|---|
| Atual (in-progress) | T-FE-QUAL-07, T-FE-QUAL-08, T-FE-QUAL-09, T-FE-WAVE5 | 4 PRs in-flight; QA pareia em review |
| Próxima | T-FE-QUAL-05, T-FE-QUAL-06, T-FE-QUAL-10 | Independentes; podem rodar em sequência ou paralelo |
| Pré-fechamento | T-FE-WAVE6 | Depende de T-FE-WAVE5 (JSON precisa estar atualizado para renderizar badges) |
| Fechamento | T-QA-14 | Depende de todos os checks estarem verdes consistentemente |

## 3. Dependências internas

```
T-FE-QUAL-01 (DONE)
T-FE-QUAL-02 (DONE)
T-FE-QUAL-03 (DONE) <-- bloqueia projects-v1 (futuro)
T-FE-QUAL-04 (DONE)
   |
   v
T-FE-QUAL-05 (OPEN)  <-- consume ProjectLayoutShell + ProjectTabPage

T-FE-WAVE5 (IN)  -->  T-FE-WAVE6 (OPEN)  (hard dep)

T-FE-QUAL-07/08/09 (IN) -- independentes
T-FE-QUAL-06 (OPEN)     -- independente
T-FE-QUAL-10 (OPEN)     -- independente

T-QA-14 (IN)  <-- depende de gates verdes (último)
```

## 4. Riscos

| Risco | Mitigação |
|---|---|
| WAVE5 expandir muito em escopo (operador querer mais copy) | Disciplina: WAVE5 só atualiza JSONs + matchers; WAVE6 é o passo de componentes. |
| T-FE-QUAL-06 surfacing strings escondidas (>28) | Aceitar — escopo amplia mas é trabalho one-shot; PR pode quebrar em sub-PRs se necessário. |
| T-QA-14 quebrar PRs in-flight ao ativar required checks | Aplicar pós-merge de cada PR (não no meio). |

## 5. Gates de fechamento

- Todas as 13 tasks `[x]`.
- AC-FQR-01..13 verificados.
- Update memory atômico em CLOSURE (memory/architecture.html, tech-stack.html,
  product/*.html refletem o estado pós-release).
- Movimento para `_archive/releases/fe-qual-refactor-v1/` via `git mv`.
- `releases/ACTIVE.md` atualizado para apontar à próxima release (candidato:
  `projects-v1` ou `prod-go-live-v1` — operador decide).
