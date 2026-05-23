# Product Memory: portifolio (2.0)

**Status:** Aprovado

## 1. O que é

`marco-menezes.com` é o **portfólio técnico vivo** de Marco Aurélio Menezes — Data/AI Engineer.

Atualmente fora do ar: a topologia AWS (CloudFront + ACM + IAM OIDC) foi destruída
parcialmente em 2025. Os buckets S3 com o último build (2025-07-16) e a zona Route53
(`marco-menezes.com`, Z08547081HT88IACPHZET) **permanecem**. A Retomada 2.0 reconstrói a
infra a partir do terraform e evolui o produto.

## 2. Mensagem central

> "Eu construo sistemas — venha ver."

Substitui a mensagem anterior ("currículo online espelho do LinkedIn"). O portfólio passa a
ser tanto vitrine profissional quanto **demonstração técnica auditável** — qualquer visitante
pode clicar para ver o repo, a infra (terraform), os custos reais e as decisões.

## 3. Persona-alvo (dupla)

| Persona | Como o portfólio atende |
|---|---|
| **Recrutadores** | Home com Hero, Skills, Experience, Education, Certifications. Currículo digital completo, exportável (link para CV). |
| **Comunidade técnica (peers)** | Abas de projeto com código real (`dadaia-workspace`, `tauan-games`) e meta-página explicando a arquitetura do próprio portfólio. |

Os dois públicos coexistem sem conflito: home serve o primeiro; navegação interna serve o
segundo.

## 4. Features

### 4.1 P0 — Escopo desta Retomada (implementar agora)

| ID | Feature | Spec |
|---|---|---|
| F-P0-01 | Retomada da infra estática (S3+CloudFront+ACM+Route53+OIDC, 2 ambientes) | `features/infra-retomada/SPEC.md` |
| F-P0-02 | Quality gate (Lighthouse + Playwright + Vitest+RTL no CI) | `features/quality-gate/SPEC.md` |
| F-P0-03 | Aba "dadaia-workspace" | `features/aba-dadaia-workspace/SPEC.md` |
| F-P0-04 | Aba "tauan-games" | `features/aba-tauan-games/SPEC.md` |
| F-P0-05 | Aba "Arquitetura deste portfólio" (meta-página) | `features/aba-arquitetura/SPEC.md` |
| F-P0-06 | Migração de conteúdo `.ts` → `.json` | `features/content-json/SPEC.md` |

Páginas obrigatórias no go-live: Home + 3 abas de projeto + 404.

### 4.2 P1 — Apenas especificado (não implementar agora)

| ID | Feature | Spec |
|---|---|---|
| F-P1-01 | CMS-lite headless (Cognito + Lambda Go + S3 JSON + CloudFront) | `features/cms-lite/SPEC.md` |
| F-P1-02 | Limpeza de débito técnico residual (storybook opcional, observabilidade) | — (não criar agora) |
| F-P1-03 | Observabilidade básica (CloudWatch dashboard + budget alert) | — (não criar agora) |
| F-P1-04 | Decisão final sobre `de` (manter ou cortar) | — (decidir com dados de tráfego) |

### 4.3 P2 — Fora do escopo (registrado, não roadmap próximo)

Multi-region, CDN secundária, WAF, testes de carga/mutação, snapshot/Chromatic, dashboard de
custo em tempo real, playground interativo de jogos no portfólio.

## 5. Conteúdo das abas (estrutura — copy é do operador)

| Aba | Estrutura padrão |
|---|---|
| **dadaia-workspace** | Hero → "O que é" → "Por que existe" → "Como funciona" (diagrama) → "Status atual" (versão, agentes ativos) → CTA (GitHub + docs). |
| **tauan-games** | Hero → Card por jogo (aero-fighters babylon/godot/unity + tauan-trex). Cada card: screenshot/gif, 1 parágrafo, link para repo, tag de engine. |
| **Arquitetura deste portfólio** | Hero → Diagrama (S3 → CloudFront → ACM → Route53) → Tabela de custos → Decisões arquiteturais resumidas (ADRs/specs) → Link para o repo. |

O **product-engineer** entrega a estrutura/template no Step 3 (placeholders honestos).
O **operador** preenche texto final e imagens (screenshots, gifs, diagramas).

## 6. i18n — política

- **pt** e **en**: first-class. Paridade obrigatória nas 3 abas novas e em toda Home.
- **de**: modo manutenção — conteúdo antigo preservado; abas novas podem ficar somente em
  pt/en, com **fallback automático para `en`** (não `pt`) quando chave faltar em `de`.
  Decisão arquitetural: `useContent()` hook implementa fallback determinístico.
- Decisão final sobre manter ou cortar `de` é P1 (F-P1-04), após observar tráfego real.

## 7. Domínio e disponibilidade

- Domínio: `marco-menezes.com` (Route53 zone `Z08547081HT88IACPHZET`).
- Sub-domínios: `www.marco-menezes.com` (prod alias) + `stage.marco-menezes.com` (ambiente
  stage para validação pré-prod).
- HTTPS obrigatório via CloudFront com ACM (us-east-1).
- Hosting privado S3 (OAC), sem acesso direto público ao bucket.

## 8. Estado real vs spec antiga (drift corrigido)

Spec antiga listava todas as features como "Funcional". Realidade auditada em 2026-05-14:

| Recurso | Status real | Ação |
|---|---|---|
| Zona Route53 `marco-menezes.com` | EXISTE (NS/SOA apenas, sem A/ALIAS) | Reaproveitar; adicionar A/ALIAS em F-P0-01 |
| Bucket S3 `portifolio-marco-menezes` | EXISTE com build 2025-07-16 e orphan policy | Importar no terraform; substituir policy em F-P0-01 |
| CloudFront `E25KHOW8T4PLO3` | DESTRUÍDO | Recriar (nova distribution) em F-P0-01 |
| ACM cert | NÃO EXISTE | Criar em us-east-1 em F-P0-01 |
| IAM OIDC provider + role | NÃO EXISTE | Bootstrap manual + reaplicar em F-P0-01 |
| Branch `ci/oidc-pipelines-compliance` | Não mesclada (2 commits à frente) | Cherry-pick para `develop` em F-P0-01 |

Spec atual reflete este estado real, não a aspiração "funcional".
