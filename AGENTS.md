# portifolio — Repo Context

> This file is loaded by Claude Code, OpenCode, and Codex when working in this repo.
> Complements the workspace-root `AGENTS.md` with repo-domain knowledge.
> Edit this file directly — it is NOT lib-originated and will not be overwritten by `dadaia public install`.

---

## Repo Purpose

Portfólio profissional `marco-menezes.com` (Marco Aurélio — Data/AI Engineer). Site estático React/Vite + Tailwind hospedado em S3 + CloudFront. Em retomada via ciclo SDD Portfólio 2.0 (P0: site estático + 3 abas de projeto; P1: CMS-lite headless em Go serverless).

## Spec Structure

Specs vivem sob `specs/`. Carregar nesta ordem antes de qualquer mudança:

1. `specs/constitution.md` — princípios
2. `specs/SPEC.md` — escopo Portfólio 2.0 (P0 + roadmap)
3. `specs/foundation/SPEC.md` — Git flow, branch protection, OIDC, CT-01..CT-04
4. `specs/memory/architecture.md` — decomposição alvo + esqueleto Go P1
5. `specs/features/<feature>/SPEC.md` — feature específica
6. `specs/PLAN.md` + `specs/TASKS.md` — sequência e tarefas atômicas

Approval marker: `**Status:** Aprovado` no header da spec é requisito para implementação.

## Repo-Specific Stop Conditions

- **Sem credenciais AWS locais** (`specs/foundation/SPEC.md §10`): proibido `terraform apply/plan/import` local, `aws iam *` local, `aws s3 cp` para prod local. Toda interação AWS via GitHub Actions OIDC; bootstrap único em AWS CloudShell.
- **Specs só pelo product-engineer**: nenhum outro agente modifica `specs/` (workspace rule).
- **Game code não se aplica aqui** (este repo não tem código de jogo).

## Key Paths

- `frontend/` — React 18 + Vite 7 + Tailwind + shadcn (refator em andamento — vide `specs/memory/tech-stack.md` §2 KEEP/REMOVE)
- `backend/` — Flask local apenas (servidor de dev). Backend de produção: Go serverless (Lambda + API Gateway) — P1.
- `terraform/modules/portfolio-static-site/` — módulo compartilhado da topologia AWS
- `terraform/envs/{stage,prod}/` — chamadas do módulo por ambiente
- `.github/workflows/{ci,deploy,terraform}.yml` — pipeline OIDC (2 envs)
- `scripts/bootstrap-oidc.sh` — bootstrap único do OIDC provider (CloudShell apenas)
- `specs/` — SDD do Portfólio 2.0
- `.dadaia/reports/portifolio/` — reports do ciclo de retomada (discovery + 4 especialistas)

## Key Commands

```bash
# Frontend dev
cd frontend && npm ci && npm run dev   # http://localhost:8080

# Frontend build
cd frontend && npm run build

# E2E (após T-QA-04 mesclada)
cd frontend && npm run test:e2e

# Backend dev (servidor local — não usado em produção)
python3 backend/stable_server.py

# Bootstrap AWS (rodar em AWS CloudShell — NÃO local)
bash scripts/bootstrap-oidc.sh
```
