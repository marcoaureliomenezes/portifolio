# PLAN — Portfólio 2.0 (P0)

**Status:** Aprovado

> Plano de implementação do escopo P0. Sequência ordenada por dependências; tarefas
> atômicas e paralelizáveis estão em `TASKS.md`.

---

## 1. Visão geral da sequência

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FASE 0 — Pre-bootstrap (humano, sem AWS creds locais)                            │
│   • Git: criar develop, cherry-pick ci/oidc-pipelines-compliance                 │
│   • Repo: scripts/bootstrap-oidc.sh versionado (T-DEVOPS-02a)                    │
│   • AWS CloudShell: rodar bootstrap-oidc.sh (OIDC provider + bootstrap role)     │
│   • GitHub: environments stage/production, secrets temporários (gh CLI local)    │
└────────────────┬─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FASE 1 — Terraform restructure + Stage infra                                     │
│   • Reorg terraform/{modules,envs/stage,envs/prod}                               │
│   • Workflows ci/deploy/terraform reescritos                                     │
│   • Branch protection + CODEOWNERS                                               │
│   • Stage apply: nova infra zero-state                                           │
│   • Trocar secrets stage para role OIDC final                                    │
└────────────────┬─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FASE 2 — Refator do Frontend (paralelo a Fase 3)                                 │
│   • Podagem shadcn + remover deps órfãs (T-FE-01)                                │
│   • useContent() + LanguageProvider (T-FE-02)                                    │
│   • Decomposição Portfolio.tsx + Header.tsx (T-FE-03..T-FE-09)                  │
│   • Substituir modais inline por Radix Dialog (T-FE-10)                          │
│   • URLs sociais reais via data/profile.ts (T-FE-11)                             │
│   • Landmarks ARIA + acessibilidade (T-FE-12)                                    │
│   • Dynamic import por idioma (T-FE-13)                                          │
│   • Tabela routes.ts centralizada (T-FE-14)                                      │
│   • ProjectTabPage extraído (T-FE-15)                                            │
└────────────────┬─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FASE 3 — Migração JSON (F-P0-06) + Conteúdo das abas                             │
│   • Migrar .ts → .json (T-CONTENT-01)                                            │
│   • Estrutura placeholder das 3 abas em pt/en (T-CONTENT-02..T-CONTENT-05)       │
│   • Assets otimizados (T-CONTENT-06)                                             │
└────────────────┬─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FASE 4 — Quality gate (qa-engineer)                                              │
│   • Vitest + RTL setup + testes unit (T-QA-01..T-QA-03)                         │
│   • Playwright suite E2E (T-QA-04..T-QA-12)                                      │
│   • LHCI configurado + budgets (T-QA-13)                                         │
│   • Wired no ci.yml (T-DEVOPS-04)                                                │
└────────────────┬─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FASE 5 — Prod infra + Go-live                                                    │
│   • Import bucket prod no terraform state (T-DEVOPS-05)                          │
│   • Prod apply (orphan policy substituída no apply) (T-DEVOPS-06)               │
│   • Atualizar secrets prod com outputs (T-DEVOPS-07)                             │
│   • Bootstrap role deletada (T-DEVOPS-08)                                        │
│   • Primeiro deploy via push develop → main (T-DEVOPS-09)                        │
│   • Smoke E2E pós-deploy passa em prod (T-QA-14)                                 │
│   • Validar Lighthouse em prod (T-QA-15)                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Mapa dependências entre features

| De → Para | Tipo | Notas |
|---|---|---|
| F-P0-01 (infra) → F-P0-06 (JSON) | Soft | JSON pode ser implementado em paralelo com infra; deploy só após ambas. |
| F-P0-06 (JSON) → F-P0-03/04/05 (abas) | Hard | Abas dependem de `useContent()` e da estrutura JSON estar pronta. |
| Refator frontend → F-P0-02 (testes) | Hard | Testes assumem componentes extraídos; unit é collocated. |
| F-P0-01 (infra stage) → F-P0-02 (CI Lighthouse) | Soft | Lighthouse pode rodar sem stage (em CI), mas smoke pós-deploy precisa do stage. |
| F-P0-01 (infra prod) → Go-live | Hard | Sem prod infra, sem go-live. |
| Todas as features P0 → Go-live | Hard | Critério A1-A10 em SPEC.md raiz. |

## 3. Janelas de paralelismo

Tarefas paralelizáveis (devops + frontend + qa atuam ao mesmo tempo):

| Janela | Agentes paralelos |
|---|---|
| Fase 1 + Fase 2 (após Pre-bootstrap) | devops monta terraform; software-engineer refatora frontend; qa prepara setup Vitest e Playwright scaffolding |
| Fase 3 + Fase 4 | software-engineer migra JSON e adiciona conteúdo das abas; qa escreve testes unit para componentes extraídos |
| Fase 5 | devops aplica prod; qa valida via smoke pós-deploy |

## 4. Riscos cruzados e mitigações

| Risco | Fase | Mitigação |
|---|---|---|
| Lighthouse < 90 no estado atual (bundle inflado, god-component) | 4 | Concluir refator (Fase 2) **antes** de medir Lighthouse final. Não relaxar budget. |
| Conflito durante import do bucket prod (orphan policy) | 5 | Aceitar substituição via terraform (Option A — devops §7 passo 17). |
| ACM cert validation timeout | 1 e 5 | `timeouts { create = "10m" }` + re-run idempotente. |
| Branch `ci/oidc-pipelines-compliance` divergir de develop | 0 | Cherry-pick explícito; deletar branch antiga após. |
| Conteúdo das abas atrasa (operador preencher copy) | 3 | Lançar com placeholder honesto ("em construção — veja o repo: [link]"); critério A1 das abas exige conteúdo não-vazio mas operador pode usar "Em breve" inicial. |
| Defeito CRITICAL URLs sociais default | 2 | T-FE-11 obrigatória; E2E-09 bloqueia merge. |
| Defeito CRITICAL modais sem Dialog | 2 | T-FE-10 obrigatória; teste unit verifica ARIA + ESC. |
| Bundle inflado pós-podagem (regressão) | 2 | Métrica de bundle em `T-FE-01` (snapshot antes/depois). |
| Operador tentar `terraform apply` local "para destravar" um job CI quebrado | 0, 1, 5 | Foundation §10 + security FR-S29 documentam proibição; ausência de `~/.aws/credentials` no DEV torna o comando inoperante. Operador corrige via PR e re-roda o job CI. |

## 5. Gates de aprovação humana entre fases

| Gate | Critério mínimo |
|---|---|
| Antes Fase 1 | Operador confirma OIDC provider e bootstrap role criados via AWS CloudShell (T-DEVOPS-02), com script `scripts/bootstrap-oidc.sh` versionado em `develop` (T-DEVOPS-02a). Nenhuma credencial AWS local foi usada. |
| Antes Fase 2 | Terraform stage apply bem-sucedido; stage URL responde 200. |
| Antes Fase 3 | Refator frontend completou T-FE-01..T-FE-09 (smoke build local OK). |
| Antes Fase 4 | F-P0-06 implementada (Fase 3 done) e testável (smoke unit roda local). |
| Antes Fase 5 | Quality gate verde em stage (Lighthouse + E2E + axe). |
| Go-live prod | Smoke E2E pós-deploy prod passou; A1-A10 do SPEC.md raiz verificados. |

## 6. Estratégia de rollback

| Fase | Como reverter |
|---|---|
| 1 (infra stage) | `terraform destroy` em `envs/stage/` **via job CI dedicado** (`terraform.yml` `workflow_dispatch` com input `action=destroy`); sem impacto em prod. **Proibido** rodar `terraform destroy` localmente (foundation §10). |
| 2 (refator frontend) | `git revert` do PR; testes asseguram que estado pré-refator continua funcional. |
| 5 (prod) | Re-deploy do build anterior **via workflow `deploy.yml`** apontando para artefato versionado (`actions/upload-artifact` ou commit SHA anterior) + CloudFront invalidation via mesmo workflow. Em caso extremo: `terraform apply` com vars do estado anterior **via job CI** (state versionado no bucket). **Proibido** rodar `aws s3 sync` / `aws cloudfront create-invalidation` / `terraform apply` localmente (foundation §10). |

## 7. Marcos observáveis

| Marco | Verificação |
|---|---|
| M1 — Stage no ar | `curl -I https://stage.marco-menezes.com` → 200, CloudFront, HSTS. |
| M2 — Refator validado | `wc -l src/components/Portfolio.tsx` ≤ 80 linhas; bundle gz baixou ≥ 100KB. |
| M3 — JSON funcional | `useContent()` roda; troca pt↔en sem regressão; fallback de→en testado. |
| M4 — Quality gate verde | CI passa todos os 5 status checks em PR `develop → main`. |
| M5 — Prod no ar | `curl -I https://marco-menezes.com` → 200; Lighthouse mobile ≥ 90/90/95/90. |

## 8. Cronograma indicativo (estimativa, não compromisso)

| Fase | Duração estimada (single operator) | Notas |
|---|---|---|
| 0 (pre-bootstrap) | 1-2h | manualidade do operador; bootstrap em AWS CloudShell (sem AWS creds locais) |
| 1 (terraform + stage) | 1-2 dias | revisão de plan crítica |
| 2 (refator frontend) | 2-3 dias | maior bloco de trabalho |
| 3 (JSON + conteúdo) | 1-2 dias | dependende de operador preencher copy |
| 4 (testes) | 1-2 dias | unit + E2E + LHCI |
| 5 (prod + go-live) | meio dia | maior risco é ACM cert validation |

Total estimado: **8-12 dias úteis**, com bloqueios de operador para preencher copy nas abas.

## 9. Próximo passo formal

Após aprovação deste PLAN, o operador autoriza início de `TASKS.md` (Fase 0 → T-DEVOPS-01).
Cada tarefa é independentemente assignável conforme matriz de dependências em TASKS.md.
