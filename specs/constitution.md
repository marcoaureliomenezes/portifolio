---
specs_pattern_version: 1
---
# Constitution: portifolio (2.0)

**Status:** Aprovado

> Leis imutáveis do Portfólio 2.0. Todo agente de IA trabalhando neste projeto DEVE seguir
> estas regras. Nunca implemente sem um SPEC.md aprovado. Nunca avance de fase sem aprovação
> humana explícita.
>
> Reescrita em 2026-05-14 a partir dos 5 reports de Retomada (vide
> `specs/_archive/2026-05-14/README.md`). Versão anterior (Draft, Flask + Bun) arquivada.

---

## 1. Propósito do Projeto

`marco-menezes.com` é o **portfólio técnico vivo** de Marco Aurélio Menezes — Data/AI Engineer.

> "Eu construo sistemas — venha ver."

Não é currículo online (espelho do LinkedIn). É demonstração pública e auditável de:

- Experiência profissional, certificações e skills (continuação do AS-IS).
- Projetos pessoais publicáveis: **dadaia-workspace** (ecossistema SDD agente),
  **tauan-games** (jogos com o filho), e a **própria arquitetura deste portfólio** (meta-página
  com infra, custos, decisões).
- Roadmap evolutivo (P1): CMS-lite headless para que o operador edite texto sem redeploy.

Persona-alvo: **recrutadores** + **comunidade técnica** (peers que avaliam código real).

## 2. Stack Tecnológica (oficial, sem drift)

| Camada | Tecnologia | Notas |
|---|---|---|
| Frontend | React 18 + TypeScript 5 + Vite 7 | **Refator** mantido — não migrar para Next.js/Astro (vide architect §2). |
| Package manager | **npm** | `package-lock.json` é a fonte de verdade. Não usar Bun, yarn ou pnpm. |
| UI | Tailwind CSS 3 + shadcn/ui podado (10 componentes mantidos) | 37 componentes shadcn marcados REMOVE (vide architect §4). |
| Roteamento | `react-router-dom@6` | SPA com `/`, `/projetos/*`, `/404`. |
| i18n | `pt` e `en` first-class; `de` em manutenção (fallback **en**) | Conteúdo migra para JSON (F-P0-06). |
| Testes unit | Vitest + Testing Library + jsdom | Cobertura conforme qa §6.1. |
| Testes E2E | **Playwright** (TypeScript) | Toolchain confirmada pelo qa §3.1. |
| Lighthouse | `@lhci/cli` integrado ao CI | Budgets em quality-gate. |
| Backend (P1, não-P0) | **Go** em **Lambda arm64 (`provided.al2023`)** + API Gateway HTTP API | `net/http` puro, sem framework. AWS SDK v2. Validação JSON Schema. |
| Infra | AWS (S3 privado com OAC + CloudFront + ACM us-east-1 + Route53) | 2 ambientes AWS: **stage** e **prod**. Dev é local. |
| IaC | **Terraform** ≥ 1.9, backend remoto S3 | State: `dadaia-s3-bucket-terraform-rm-state/portifolio/{stage,prod}/terraform.tfstate` (sa-east-1). |
| CI/CD | GitHub Actions com **OIDC** | Sem long-lived AWS keys. |
| Auth (P1) | AWS Cognito Hosted UI (1 usuário: operador) com TOTP MFA | Apenas para `/admin` do CMS-lite. |

**Não está na stack:**

- Flask em produção (servidor de dev existe localmente; não é produção).
- Bun, yarn, pnpm (apenas npm).
- next-themes, @tanstack/react-query, recharts, vaul, cmdk, embla, react-day-picker,
  react-hook-form, input-otp, react-resizable-panels (todos REMOVE — vide architect §4).
- Multi-region, WAF, observabilidade ativa (P2, fora do escopo da Retomada).

## 3. Princípios de Desenvolvimento

1. **Frontend-first.** O site deve carregar **sem** depender de backend (mesmo o futuro Lambda).
   O CMS-lite (P1) apenas escreve JSON; a leitura permanece estática via CloudFront.
2. **100% SSG/estático em S3+CloudFront.** Toda rota (`/`, `/projetos/*`, `/404`) entrega o
   mesmo `index.html` com hydration React Router. Sem SSR.
3. **Infra é código.** Toda infra AWS via Terraform. Nada via console em produção.
   Bootstrap manual (OIDC provider + bootstrap role) é exceção registrada — descartada após
   primeiro apply.
4. **Imagens otimizadas.** Cada asset público ≤ 200KB, formato WebP/AVIF preferido, com
   `loading="lazy"` quando below the fold.
5. **Lighthouse é gate de merge.** Performance ≥ 90, Accessibility ≥ 90, Best-Practices ≥ 95,
   SEO ≥ 90. Mobile e desktop. Não relaxar budget — corrigir o débito.
6. **Acessibilidade não é negociável.** Modais usam Radix Dialog (focus trap, ARIA, ESC).
   Sections têm `aria-labelledby`. Nav semântica com `<nav aria-label>`. Links externos têm
   `target="_blank" rel="noopener noreferrer"`.
7. **Custo total alvo: < US$ 5/mês** (P0). Teto duro: US$ 10/mês com alerta SNS.
8. **Git flow:** `main` (prod) ← `develop` (stage) ← `feature/*` e `fix/*`. Hotfix `hotfix/*`
   sai de `main`. Branch protection obrigatória em `main` e `develop`.
9. **Princípio do desperdício zero.** Não bundle dependências sem uso (vide architect §4
   CRITICAL — bundle arrastando 30+ deps órfãs).
10. **Atomicidade de specs.** Spec evolui por reescrita atômica, não por anexo. Versões
    antigas vão para `specs/_archive/<YYYY-MM-DD>/`.

## 4. Fluxo SDD

```
SPEC.md [Aprovado] → PLAN.md [Aprovado] → TASKS.md [Aprovado] → Implementação
```

Cada seta requer aprovação humana explícita (`**Status:** Aprovado`). Não há exceção
automática. Implementação sem spec aprovada é violação da SDD hard rule.

## 5. Domínio e Ambientes

| Env | Branch | Domain | Aliases | TF state |
|---|---|---|---|---|
| dev | qualquer feature/* | `localhost:8080` | — | n/a (Vite dev) |
| stage | `develop` | `stage.marco-menezes.com` | — | `portifolio/stage/terraform.tfstate` |
| prod | `main` | `marco-menezes.com` | `www.marco-menezes.com` | `portifolio/prod/terraform.tfstate` |

Conta AWS: `016098071081`. Região operacional dos buckets: `sa-east-1`. ACM em `us-east-1`
(requisito CloudFront).

## 6. Domínio exclusivo de agentes

| Domínio | Agente proprietário |
|---|---|
| `specs/` (todas as specs, plans, tasks) | **product-engineer** (único autorizado a escrever) |
| `frontend/`, `backend-go/` (futuro), testes | **software-engineer** (implementação), **qa-engineer** (testes) |
| `terraform/`, `.github/workflows/`, OIDC | **devops-engineer** |
| Auditoria, decomposição, ADRs | **software-architect** |
| Código de jogo (não aplicável aqui — vive em `repos/tauan-games/`) | **game-developer** |

`product-engineer` nunca implementa código. `software-engineer` nunca modifica specs.

## 7. Estrutura do Repositório

```
portifolio/
├── frontend/                          ← React + Vite (refator P0)
│   ├── src/
│   │   ├── components/
│   │   │   ├── portfolio/             ← decomposição de Portfolio.tsx
│   │   │   ├── header/                ← decomposição de Header.tsx
│   │   │   ├── ui/                    ← shadcn podado (10 componentes)
│   │   │   └── pages/
│   │   ├── hooks/
│   │   ├── data/
│   │   │   └── content/               ← .json após F-P0-06 (P0)
│   │   └── routes.ts                  ← tabela de rotas centralizada
│   ├── public/
│   │   └── content/                   ← .json estático (lido em runtime — F-P0-06)
│   ├── tests/
│   │   └── e2e/                       ← Playwright
│   ├── playwright.config.ts
│   ├── vitest.config.ts
│   └── lighthouserc.json
├── backend-go/                        ← P1 — Lambda CMS (não criar agora)
│   └── cmd/, internal/, go.mod
├── terraform/
│   ├── modules/portfolio-static-site/ ← módulo compartilhado
│   └── envs/{stage,prod}/             ← chamadores com tfvars próprios
├── .github/
│   ├── workflows/                     ← ci.yml, deploy.yml, terraform.yml
│   └── CODEOWNERS
├── specs/
│   ├── constitution.md                ← este arquivo
│   ├── memory/{architecture.md, product.md, tech-stack.md}
│   ├── foundation/SPEC.md
│   ├── SPEC.md                        ← top-level (escopo P0 consolidado)
│   ├── security/SPEC.md
│   ├── features/
│   │   ├── infra-retomada/SPEC.md     (F-P0-01)
│   │   ├── quality-gate/SPEC.md       (F-P0-02)
│   │   ├── aba-dadaia-workspace/SPEC.md (F-P0-03)
│   │   ├── aba-tauan-games/SPEC.md    (F-P0-04)
│   │   ├── aba-arquitetura/SPEC.md    (F-P0-05)
│   │   ├── content-json/SPEC.md       (F-P0-06)
│   │   └── cms-lite/SPEC.md           (P1 — roadmap, não implementar)
│   ├── PLAN.md
│   ├── TASKS.md
│   └── _archive/2026-05-14/           ← specs 1.0 arquivadas
├── Makefile
└── README.md
```

`backend/` Flask atual permanece **somente para servidor de desenvolvimento local**.
Será arquivado/removido como parte de F-P0-01.

## 8. Decisões fechadas e referências

- **D-01 a D-07** + **PE-01 a PE-08**: vide briefing 2.0
  (`.dadaia/reports/portifolio/product-engineer/2026-05-14T032348Z-portifolio-2.0.md`).
- **Veredito architect:** CONDITIONAL (3 defeitos críticos a corrigir em P0 — vide
  quality-gate/SPEC.md).
- **Veredito devops:** topologia 2 ambientes AWS, OIDC com trust `repo:marcoaureliomenezes/portifolio:*`,
  custo projetado < US$ 1/mês.
- **Veredito qa:** Playwright + Vitest + LHCI, gate de merge bloqueante para todos os 4 budgets.
