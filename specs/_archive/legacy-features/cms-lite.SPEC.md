# F-P1-01 — CMS-lite headless

**Status:** Draft — Roadmap (não implementar agora)

> Esta spec captura a visão arquitetural detalhada do CMS-lite (P1) consolidada nos
> reports do ciclo de Retomada. Implementação **não** acontece no P0. A spec existe para
> orientar decisões de P0 que impactam o P1 (especialmente F-P0-06 — JSON estático), e
> para ser refinada quando o operador autorizar o ciclo P1.
>
> O Status permanece Draft até o operador iniciar o ciclo P1 e o PE rodar grill-me
> dedicado.

---

## 1. Contexto e motivação

Operador não quer redeploy para mudar texto (briefing 2.0 §1, D-04). CMS-lite permite
edição via UI web autenticada, com gravação direta em S3 e leitura pública via CloudFront.

Custo adicional projetado: < US$ 0.05/mês (architect §5).

## 2. Topologia (validada pelo architect §5)

```
                         ┌──────────────────────────┐
                         │   AWS Cognito User Pool  │  (1 user pool, 1 user: operador)
                         │   Hosted UI (OAuth2 PKCE)│
                         │   TOTP MFA obrigatório   │
                         └────────────┬─────────────┘
                                      │ JWT (id_token)
                                      ▼
[ Browser ] ──── /admin (React) ────► API Gateway HTTP API
   │                                  │  ──► JWT authorizer (Cognito JWKS)
   │                                  │      └─► Lambda Go arm64
   │                                  │            └─► AWS SDK v2 → S3 PutObject
   │                                  │                                content/{lang}.json
   │
   └──── / (React)  ──► CloudFront ──► S3 (OAC) ──► content/{lang}.json
                                         └────── index.html, assets/*

   Cache-Control:
     /index.html        no-cache
     /assets/*          1y immutable (Vite hashes)
     /content/*.json    60s browser / 300s CloudFront (TTL substitui invalidação ativa)
```

## 3. Ajustes do architect aplicados sobre a proposta PE-03

### 3.1 Bucket único, prefixos lógicos (não 2 buckets)

Reutilizar `portifolio-marco-menezes` (prod) e `stage-portifolio-marco-menezes` (stage),
prefixando `content/`. Vantagens:

- Menos terraform.
- Menos OACs.
- Menos ARNs em IAM (1 policy `s3:PutObject` para prefix `content/*`).
- 1 distribuição CloudFront serve `/` e `/content/*` (não precisa de origem secundária).

Trade-off: raio de blast único (OAC quebrar derruba site E content). Aceitável para
portfólio pessoal.

### 3.2 Cache-Control no JSON, não invalidação ativa

Servir `content/*.json` com `Cache-Control: public, max-age=60, s-maxage=300`. CloudFront
expira em ≤ 5 min após edição. Operador aceita esse SLA editorial.

Vantagens:

- Invalidação grátis (não consome cota 1000/mês).
- Implementação mais simples (sem chamada CloudFront no Lambda — só S3 PutObject).
- Preview pode forçar bypass com `?v=<timestamp>` na chamada do admin.

### 3.3 Versionamento via S3 Object Versioning

Versionamento já habilitado no bucket (vide F-P0-01). Cada PUT cria nova versão. Rollback:

```bash
aws s3api copy-object \
  --copy-source <bucket>?versionId=<old> \
  --bucket <bucket> --key content/<lang>.json
```

Substitui auditoria custom. Para auditoria visual no admin, listar versões via
`s3:ListObjectVersions`.

## 4. Componentes

### 4.1 Frontend `/admin`

- Rota `/admin/*` lazy-loaded em `App.tsx`:
  ```tsx
  <Route path="/admin/*" element={<Suspense fallback={<Loading />}><AdminApp /></Suspense>} />
  ```
- `AdminApp`: SPA dentro da SPA. Login via Cognito Hosted UI (`@aws-amplify/auth` ou
  implementação custom com `oidc-client-ts`).
- Form-based editor com schema validation client-side (JSON Schema gerado de
  `src/types/content.ts`).
- Preview do JSON antes de salvar.
- Lista de versões via `s3:ListObjectVersions`.

### 4.2 API Gateway HTTP API

- 1 rota: `PUT /content/{lang}` (lang ∈ {pt, en, de}).
- JWT authorizer: Cognito JWKS endpoint, issuer `https://cognito-idp.sa-east-1.amazonaws.com/<userPoolId>`.
- CORS: opcional (`/admin` no mesmo domínio que API). Configurar se preview em domínio
  diferente.

### 4.3 Lambda Go arm64 (`provided.al2023`)

Estrutura em `backend-go/` (vide memory/architecture.md §10):

```
backend-go/
├── cmd/cms-writer/main.go
├── internal/
│   ├── config/config.go             # BUCKET_NAME, REGION, CONTENT_PREFIX, ALLOWED_LANGS
│   ├── handler/
│   │   ├── content.go               # PUT /content/{lang}
│   │   ├── content_test.go
│   │   └── errors.go
│   ├── store/
│   │   ├── store.go                 # interface ContentStore
│   │   ├── s3.go                    # aws-sdk-go-v2 implementation
│   │   └── s3_test.go
│   └── schema/
│       ├── validator.go             # santhosh-tekuri/jsonschema/v5
│       └── content.schema.json      # go:embed; gerado de types.ts via CI
├── go.mod
├── go.sum
└── Makefile
```

Decisões:

- HTTP: `net/http` puro + `aws-lambda-go/events.APIGatewayV2HTTPRequest`. Sem framework.
- Auth: JWT authorizer no API Gateway. Lambda lê claims do `event.RequestContext.Authorizer.JWT.Claims`.
- Validação: JSON Schema embedded via `go:embed`.
- Logging: `log/slog` JSON.

### 4.4 Cognito User Pool

- 1 user pool, 1 usuário (operador).
- TOTP MFA **obrigatório** (security FR-S22).
- Hosted UI customizada com logo do portfólio.
- Token expiry: id_token 1h, refresh_token 30d.

### 4.5 Schema JSON

Gerado em CI do frontend antes do build:

```bash
cd frontend
npx ts-json-schema-generator --path src/types/content.ts --type ContentData --out cms/schema/v1.json
```

Commit do schema gerado para que o Lambda o consuma via `go:embed`.

## 5. Critérios de aceite (P1 — quando implementar)

- **A1.** `/admin` requer login Cognito; sem JWT válido redireciona para Hosted UI.
- **A2.** Login com MFA TOTP válido retorna para `/admin` autenticado.
- **A3.** Editor permite alterar campos de `content/<lang>.json` com preview.
- **A4.** Salvar grava no S3 com versionamento; lista de versões visível.
- **A5.** Edição aparece em produção em ≤ 5 min (TTL CloudFront).
- **A6.** Lambda rejeita payload inválido contra schema com HTTP 400 + mensagem clara.
- **A7.** Lambda rejeita JWT inválido com HTTP 401.
- **A8.** Custo adicional vs P0 < US$ 1/mês.
- **A9.** Sem regressão Lighthouse no frontend público (`/admin` é lazy chunk separado).

## 6. Fora de escopo do CMS-lite

- Upload de imagens via admin (P2 — usar S3 console por enquanto).
- WYSIWYG / rich text (operador edita JSON estruturado).
- Workflow de approval (operador é o único usuário — push direto).
- Histórico de comentários por edição (versionamento S3 já cobre).

## 7. Decisões abertas para o ciclo P1

| ID | Pendência | Decisor | Notas |
|---|---|---|---|
| CMS-OPEN-01 | Schema gerado vs manual | Architect + engineer | Default: gerado (ts-json-schema-generator) |
| CMS-OPEN-02 | TOTP exclusive ou TOTP+SMS | Operador | Default arquitetural: TOTP exclusive (sem SMS para reduzir custo + fricção) |
| CMS-OPEN-03 | CORS no API Gateway | Devops | Necessário só se `/admin` migrar para domínio dedicado |
| CMS-OPEN-04 | `internal/audit/` (DynamoDB ou Athena) | Architect | Default: dispensar — versionamento S3 basta |
| CMS-OPEN-05 | `internal/store/local.go` para `make dev` | Engineer | Default: criar — habilita dev local sem AWS |

## 8. Pré-requisitos atendidos no P0

- F-P0-06 — Frontend já lê de JSON. Quando CMS gravar JSON em outro path (CloudFront sobre
  S3 prefix `content/`), basta trocar o corpo do hook `useContent()`.
- F-P0-01 — Bucket S3 com versionamento e OAC já existem.
- Cognito não existe ainda — criado no P1 via terraform.

## 9. Referências

- Architect §§5, 6 — topologia validada + esqueleto Go.
- Briefing 2.0 §5 F-P1-01 + PE-03.
- qa §7 + §11 — esqueleto de teste Go + cenários E2E CMS futuros.
- Security FR-S21..S25 — auth e least-privilege.
