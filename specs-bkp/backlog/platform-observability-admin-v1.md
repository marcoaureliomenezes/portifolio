# Backlog — platform-observability-admin-v1

**Registered:** 2026-05-22
**Refined:** 2026-05-23 (dadaia-grill-me session — todas as decisões fechadas)
**Operator:** Marco Aurelio Menezes
**Status:** Candidate — pronta para SPEC.md por product-engineer

---

## Visão

Um portal central chamado **"Dadaia's Web"** — propriedade do operador (Marco) — onde
os donos dos sites construídos por Marco podem fazer login, consultar analytics e editar
conteúdo dos seus sites **sem necessidade de redeploy**.

Os sites continuam 100% estáticos (S3 + CloudFront). Quando o dono edita um texto no
portal, o backend atualiza o JSON no S3 do site e dispara uma CloudFront Invalidation.
O site reflete a mudança em segundos sem nenhum pipeline de CI/CD.

---

## Repo Central

**Nome:** `dadaia-web`
**Estrutura:** mono-repo (frontend portal + Lambda Go + Terraform)
**Stack:**
- Frontend portal: React 18 + TypeScript + Vite 7 + Tailwind 3
- Backend: Lambda Go arm64 + API Gateway HTTP API
- Auth: AWS Cognito Hosted UI — User Pool único, atributo custom `site_id`
- IaC: Terraform ≥ 1.9, estado em S3
- CI/CD: GitHub Actions + OIDC

---

## Tenants

| Tenant | Site | Status |
|---|---|---|
| Marco (operador / super-admin) | portifolio — marco-menezes.com | Live em produção (pilot) |
| Burrinho | burrinhos-barbe | Specs em draft |
| Gisele (esposa) | lindas-portifolio (psicologia) | Repo criado (privado) |
| Jhony | jhony-trainer (personal trainer) | Repo criado (privado) |

---

## Feature 1 — Engagement Analytics (`analytics-platform-v1`)

### O que é

Sistema de tracking de eventos comportamentais anônimos — sem PII, sem cookies de
identificação persistente. Captura interações significativas em todos os sites tenant
e entrega os eventos em S3 para consumo pelo data platform (Databricks / Athena).

### Eventos a capturar (baseline portfólio)

- CV download click
- Section expand / collapse (Experiência, Educação, Certificações, Skills)
- Certification credential link click
- Thesis link click
- Project CTA clicks
- Language switcher toggle
- Theme toggle
- Page view + referrer + UTM params

### Arquitetura — decisões fechadas

| Decisão | Escolha | Razão |
|---|---|---|
| Tracking | Custom — sem third-party SDK | Operador |
| Destino | AWS S3 (Parquet ou NDJSON) | Operador |
| Reuso | Serviço central multi-tenant (`dadaia-web`) | Operador |
| Ingest endpoint | Lambda Go arm64 + API Gateway HTTP API | FastAPI fora da stack (constitution §2); CF Functions sem async HTTP |
| Batching | `sendBeacon` on unload | Não bloqueia navegação; funciona em fechamento de browser |
| PII / LGPD | Zero PII; session ID em memória (não persistido entre sessões); sem IP; sem cookie de tracking; sem consent banner; apenas cláusula em política de privacidade | Operador |
| S3 partitioning | `site_id / year / month / day / hour / event_type` | Operador |
| Autenticação do ingest | `site_id` público + rate limiting no API Gateway | Evento é anônimo — risco baixo |

### Event schema

```json
{
  "event_id": "uuid-v4",
  "site_id": "portifolio",
  "session_id": "uuid-v4 em memória",
  "event_type": "cv_download | section_expand | ...",
  "path": "/",
  "ts": "ISO 8601",
  "metadata": {}
}
```

---

## Feature 2 — Admin Management Console (`admin-console-v1`)

### O que é

Portal web onde cada dono de site faz login e edita o conteúdo do seu site em tempo
real — sem deploy. O backend escreve o JSON atualizado no S3 do site e invalida o
CloudFront. O site permanece 100% estático.

### Capacidades (baseline portfólio)

- Editar bio, tagline, stats
- Adicionar / editar / remover certificações
- Editar entradas de experiência e educação
- Substituir foto de perfil
- Toggle dark/light como padrão do site
- Publicar / despublicar mudanças (draft → live)

### Arquitetura — decisões fechadas

| Decisão | Escolha | Razão |
|---|---|---|
| Database | DynamoDB | Aurora Serverless v2 ~$15/mês idle viola teto $5/mês (constitution §7) |
| Auth | Cognito User Pool único; 1 user por tenant com atributo `site_id`; Marco = super-admin cross-tenant | Operador |
| Admin UI | Portal separado `dadaia-web` — não /admin em cada site | Operador |
| Content read model | Backend escreve JSON no S3 do site + CloudFront Invalidation; sites permanecem estáticos | Operador |
| Content versioning | Optimistic locking + tabela de histórico no DynamoDB; rollback disponível |  |
| Media storage | S3 (imagens de perfil, badges); CDN CloudFront em frente |  |
| Audit log | Toda edição logada: user, timestamp, diff — para segurança e rollback |  |

---

## Feature 3 — Security Audit (`security-audit-v1`)

Prerequisite para `admin-console-v1`. Pode correr em paralelo com `analytics-platform-v1`.

### Escopo

- Exposição atual CloudFront + origin (superfície DDOS)
- HTTP security headers ausentes (CSP, HSTS, X-Frame-Options, etc.)
- Dependency CVEs (npm audit)
- IaC review (Terraform)
- LGPD compliance gap analysis

**Owner:** security-reviewer + devops-engineer

---

## Release Decomposition

```
∥ security-audit-v1        ← corre em paralelo com analytics; prerequisite para admin
∥ analytics-platform-v1    ← ingest + S3 delivery; risco baixo; não bloqueia por audit
       ↓
   admin-console-v1         ← bloqueado por security-audit-v1; portfólio como pilot tenant
       ↓
   admin-console-v2         ← onboard burrinhos-barbe + gisele + jhony como tenants
```

---

## Agentes Necessários

| Agente | Role |
|---|---|
| `software-architect` | ADR para arquitetura do `dadaia-web`; modelo de tenant no DynamoDB |
| `backend-engineer` | Ingest API Go, Content API Go, auth middleware Cognito |
| `frontend-engineer` | Portal React, event tracking SDK (browser) |
| `devops-engineer` | S3, API Gateway, Lambda, Cognito, CloudFront, CI/CD para `dadaia-web` |
| `security-reviewer` | Feature 3 (security-audit-v1); revisão de auth design |
| `qa-engineer` | E2E test plan para admin CRUD + verificação de entrega de eventos |
| `product-engineer` | SPEC/PLAN/TASKS para cada sub-release |

---

## Activation

Pronto para product-engineer escrever SPECs individuais de `security-audit-v1` e
`analytics-platform-v1`. Criar repo `dadaia-web` no GitHub antes de iniciar.
