# Arquivo: Specs Portfólio 1.0 (pré-Retomada 2.0)

> **Data de arquivamento:** 2026-05-14
> **Motivo:** Reescrita completa das specs no Step 3 da Retomada do Portfólio 2.0.
> **Responsável:** product-engineer (dadaia)

## O que está aqui

Versões anteriores das specs SDD do portfólio antes da reescrita 2.0:

| Arquivo arquivado | Substituído por |
|---|---|
| `constitution.md` | `specs/constitution.md` (2.0) |
| `memory/product.md` | `specs/memory/product.md` (2.0) |
| `memory/tech-stack.md` | `specs/memory/tech-stack.md` (2.0) |
| `security/SPEC.md` | `specs/security/SPEC.md` (2.0) |

## Por que o conteúdo foi substituído (não apenas editado)

A reescrita corrige drifts severos entre as specs antigas e a realidade implementada,
e introduz o produto TO-BE 2.0 (portfólio técnico vivo, não currículo online).

Drifts corrigidos (vide briefing 2.0 §9 Q9, C1-C5):

- **C1** — Stack dizia "Bun (frontend)"; package-lock.json real é npm.
- **C2** — Backend descrito como Flask em produção; decisão D-02 é Go serverless (Lambda).
- **C3** — Tech-stack dizia "Estado local terraform (sem remote backend)"; AS-IS confirma backend remoto S3 ativo.
- **C4** — Security spec mencionava CORS para Flask em prod; sem backend Flask em produção é dead spec.
- **C5** — Product memory listava features como "Funcional"; site **não está no ar** (CloudFront destruído).

## Reports do ciclo de Retomada que motivaram a reescrita

Os 5 reports do ciclo vivem em `.dadaia/reports/portifolio/`:

1. `discovery/2026-05-14T032141Z-review-portifolio-as-is.md` — Inventário AS-IS consolidado.
2. `product-engineer/2026-05-14T032348Z-portifolio-2.0.md` — Briefing 2.0 (visão de produto + features P0/P1).
3. `software-architect/2026-05-14T032827Z-review.md` — Auditoria frontend + decomposição alvo + podagem shadcn + topologia CMS-lite + esqueleto Go.
4. `devops-engineer/2026-05-14T032921Z-pipeline-spec.md` — Topologia stage/prod, terraform envs, OIDC, branch protection, workflows, custos.
5. `qa-engineer/2026-05-14T032934Z-test-architecture.md` — Pirâmide de testes, Playwright, Lighthouse CI, Vitest+RTL, gate de merge.

## Convenção de arquivamento

Sempre que uma reescrita atômica de spec for necessária, o conteúdo antigo é copiado
para `specs/_archive/<YYYY-MM-DD>/<mesmo-caminho-relativo>/`, preservando histórico
auditável fora de `git log` (que continua sendo a fonte primária de mudança incremental).
