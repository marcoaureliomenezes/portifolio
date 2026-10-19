# Security Spec: portifolio (2.0)

**Status:** Aprovado

> Reescrita atômica em 2026-05-14. A spec antiga (CORS Flask em prod) está em
> `specs/_archive/2026-05-14/security/SPEC.md`. Não há mais Flask em produção; toda menção a
> CORS Flask foi removida.

---

## 1. Escopo

Segurança do Portfólio 2.0:

- **Frontend estático** servido por CloudFront com OAC.
- **Infra terraform** com OIDC GitHub Actions.
- **Git governance** (branch protection, CODEOWNERS, environments).
- **CMS-lite (P1, não implementar)** — auth Cognito + JWT + Lambda Go.

Fora de escopo: WAF, multi-region, IDS, observabilidade ativa de segurança (P2).

## 2. Secrets e credenciais (FR-S01..FR-S04)

- **FR-S01.** Credenciais AWS (access key, secret key) **nunca** existem como long-lived no
  CI. Auth via OIDC com trust `repo:marcoaureliomenezes/portifolio:*`.
- **FR-S02.** `terraform.tfvars` não contém secrets — apenas variáveis públicas. Sem
  `terraform.tfvars.example` necessário no novo layout (tfvars por env já vivem em
  `envs/{stage,prod}/terraform.tfvars`).
- **FR-S03.** Secrets do GitHub são per-environment (não repo-wide), exceto `TF_STATE_BUCKET`
  e `TF_STATE_REGION` (variables, não secrets, sem dado sensível).
- **FR-S04.** OIDC bootstrap role (`github-actions-portfolio-bootstrap` com
  `AdministratorAccess`) é deletada após primeiro apply bem-sucedido. Operação manual
  documentada em F-P0-01.

**Verificação:**
- `aws iam list-attached-role-policies --role-name github-actions-portfolio-bootstrap` →
  empty após delete.
- `gh secret list --env stage` e `gh secret list --env production` → nenhum secret no scope
  repo-wide com credencial AWS.

## 3. Frontend / CloudFront / S3 (FR-S05..FR-S10)

- **FR-S05.** HTTPS obrigatório. Redirect HTTP→HTTPS no CloudFront.
- **FR-S06.** Bucket S3 **privado**: política nega acesso público; acesso apenas via
  CloudFront com **OAC** (Origin Access Control — não OAI legado).
- **FR-S07.** Headers de segurança via CloudFront Response Headers Policy:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://*.amazonaws.com; font-src 'self' data:; frame-ancestors 'none'`
- **FR-S08.** SPA fallback CloudFront (`/*` → `/index.html` com status 200) — não use
  redirect para 403/404 que vaze estrutura S3.
- **FR-S09.** Links externos no frontend têm `target="_blank" rel="noopener noreferrer"`.
  Auditoria automatizada via E2E-09 (Playwright).
- **FR-S10.** URLs sociais reais (LinkedIn, GitHub do operador) — **não** defaults
  `https://linkedin.com` / `https://github.com` (defeito CRITICAL do architect §7).
  Verificação via E2E E2E-09.

## 4. Git governance (FR-S11..FR-S15)

- **FR-S11.** Branch protection ativa em `main`:
  - `required_pull_request_reviews.required_approving_review_count = 1`
  - `dismiss_stale_reviews = true`
  - `require_code_owner_reviews = true`
  - `enforce_admins = true`
  - `required_linear_history = true`
  - `allow_force_pushes = false`
  - `allow_deletions = false`
  - Required status checks: `CI / Lint and type-check`, `CI / Build`, `CI / Unit tests`,
    `CI / E2E`, `CI / Lighthouse`.
- **FR-S12.** Branch protection ativa em `develop`:
  - Mesmas regras de `main`, exceto `enforce_admins = false` e `require_code_owner_reviews`
    opcional. `accessibility (axe)` permitido como warn (não bloqueia).
- **FR-S13.** `.github/CODEOWNERS` presente e referenciado por `require_code_owner_reviews`.
- **FR-S14.** Environment `production` exige reviewer obrigatório (`@marcoaureliomenezes`).
  Sem reviewer configurado, o gate não é real — operador valida via UI antes do go-live.
- **FR-S15.** Sem bypass de hooks (`[skip ci]`, `--no-verify`) em PRs para `main`.

## 5. IAM least-privilege (FR-S16..FR-S20)

- **FR-S16.** Role IAM do GitHub Actions (`github-actions-portfolio-deploy`) tem permissões
  mínimas: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket` apenas no
  bucket do env correspondente; `cloudfront:CreateInvalidation` apenas na distribuição do
  env; `route53:*` apenas no zone ID `Z08547081HT88IACPHZET` para gestão de records via
  terraform.
- **FR-S17.** Sem `Action: "*"` ou `Resource: "*"` na role de produção. Bootstrap role com
  `AdministratorAccess` é exceção temporária e documentada (deletada após primeiro apply).
- **FR-S18.** Trust policy restringe `token.actions.githubusercontent.com:sub` a
  `repo:marcoaureliomenezes/portifolio:*` (string condition). Outras repos não podem assumir
  a role.
- **FR-S19.** Lambda do CMS (P1) tem permissão `s3:PutObject` **apenas** em prefix
  `arn:aws:s3:::<bucket>/content/*`. Sem `s3:GetObject` (leitura é via CloudFront).
- **FR-S20.** `terraform plan` no CI **falha** se introduzir recurso IAM com `*` em actions
  ou em resources sem justificativa registrada como ADR.

## 6. Auth (P1 — CMS-lite, não implementar agora)

- **FR-S21 (P1).** Acesso ao `/admin` exige autenticação via AWS Cognito Hosted UI.
- **FR-S22 (P1).** Cognito User Pool com **TOTP MFA obrigatório** (operador é o único
  usuário; perda de acesso é blast radius 100% — MFA reduz risco).
- **FR-S23 (P1).** API Gateway HTTP API com **JWT authorizer** validando issuer Cognito
  (JWKS endpoint). Lambda recebe claims já validadas.
- **FR-S24 (P1).** Lambda Go valida payload contra JSON Schema antes de gravar (sem
  validação = lixo no bucket = renderização quebrada).
- **FR-S25 (P1).** Versionamento S3 habilitado no bucket — rollback via
  `aws s3api copy-object --copy-source <bucket>?versionId=<old>`. Substitui auditoria
  custom.

## 6b. No local AWS credentials por papel (FR-S29..FR-S31)

A constraint é definida por **papel (persona)**, alinhada com `foundation/SPEC.md §10`.
Dois papéis distintos operam neste projeto, com permissões mutuamente exclusivas:

- **Developer** (papel padrão — 99% das interações com o repo)
- **Infra Specialist** (papel raro — bootstrap inicial e break-glass durante incidentes)

- **FR-S29.** **Developer:** zero credenciais AWS de longo prazo. Nenhum access key,
  secret key ou profile em `~/.aws/credentials` apontando para a conta `016098071081`
  pode existir em ambiente DEV local usado para tarefas de Developer. Toda escrita e
  leitura na conta para o projeto `portifolio` no fluxo de Developer acontece
  **exclusivamente via GitHub Actions OIDC**. **Infra Specialist:** credenciais AWS locais
  são uma exceção autorizada durante bootstrap inicial (T-DEVOPS-02) e durante incidentes
  de break-glass (pipeline quebrado, caminho via CI bloqueado). O escopo é restrito a
  criação do OIDC provider/role e diagnóstico read-only. A justificativa de uso é
  documentada (chat, incident log, ADR) e a operação é auditável via CloudTrail. Detalhes
  e checklist em `foundation/SPEC.md §10.b` e `§10.c`.
- **FR-S30.** **Bootstrap inicial** do OIDC provider (T-DEVOPS-02) pode ocorrer via uma
  das duas opções autorizadas, ambas auditáveis via CloudTrail:
  - **Opção A (preferida):** AWS CloudShell — sessão efêmera dentro do console AWS, sem
    persistência de chaves em disco local. Mantém zero chaves persistidas localmente.
  - **Opção B (autorizada):** máquina local do Infra Specialist com credenciais AWS de
    privilégio IAM. Resultado e idempotência idênticos à Opção A.
  Após o bootstrap, qualquer execução de `terraform`, `aws iam *`, ou `aws s3 *` contra
  recursos do projeto roda **exclusivamente** em workflow GitHub Actions (`terraform.yml`,
  `deploy.yml`, `cleanup-bootstrap.yml`) — não retorna a ser local para nenhum dos dois
  papéis. Vide `foundation/SPEC.md §10` para lista completa de comandos proibidos e
  autorizados.
- **FR-S31.** **Diagnóstico read-only AWS local** (`aws sts get-caller-identity`,
  `aws iam list-*`, `aws s3 ls`, `aws cloudfront list-*`, etc.):
  - **Developer:** proibido. Deve ser executado em CloudShell ou em job CI dedicado.
    Qualquer caminho que permita ler estado AWS local exigiria credenciais válidas, e
    credenciais válidas no fluxo de Developer violam FR-S29.
  - **Infra Specialist em break-glass:** autorizado para troubleshooting quando o pipeline
    está quebrado e o caminho via CI está bloqueado. Após o incidente, a checklist
    de `foundation/SPEC.md §10.c` confirma a restauração do caminho via CI.

**Verificação:**

```bash
# Para o papel Developer: nenhum profile AWS configurado localmente para a conta do projeto
test ! -f ~/.aws/credentials || ! grep -q "016098071081\|portifolio" ~/.aws/credentials

# CloudTrail mostra que toda activity em IAM/S3/CloudFront do projeto vem de:
#   - arn:aws:sts::016098071081:assumed-role/github-actions-portfolio-*/<workflow-run-id>
#     (operações de aplicação via CI — esperado para Developer)
#   - identidade humana via SSO/console (apenas durante bootstrap T-DEVOPS-02 ou em
#     incidentes de break-glass documentados — esperado para Infra Specialist; deve ser
#     raro e justificado retroativamente via checklist em foundation §10.c)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=portifolio-marco-menezes \
  --max-results 20  # executado em CloudShell ou job CI; Infra Specialist pode rodar local
```

## 7. CSP e content-type (FR-S26..FR-S28)

- **FR-S26.** `index.html` é servido com `Content-Type: text/html; charset=utf-8`.
- **FR-S27.** Assets hashed (`/assets/*`) com `Content-Type` automático do `aws s3 sync` +
  `--cache-control "public, max-age=31536000, immutable"`.
- **FR-S28.** JSON estático (P1) com `Content-Type: application/json` e
  `Cache-Control: public, max-age=60, s-maxage=300`.

## 8. Verificação

Comandos read-only para auditoria contínua. **Todos os comandos `aws *` abaixo devem ser
executados em AWS CloudShell ou em job CI dedicado read-only — nunca localmente**
(FR-S29..S31). Comandos `gh` rodam localmente (usam token GitHub, não credencial AWS):

```bash
# Bucket privado
aws s3api get-bucket-policy --bucket marco-menezes.com
aws s3api get-public-access-block --bucket marco-menezes.com

# CloudFront com OAC (não OAI)
aws cloudfront list-distributions \
  --query 'DistributionList.Items[?Aliases.Items[?contains(@, `marco-menezes.com`)]]'

# HSTS + headers
curl -sI https://marco-menezes.com | grep -iE "strict-transport|x-frame|content-security"

# Trust policy OIDC restrita ao repo
aws iam get-role --role-name github-actions-portfolio-deploy \
  --query 'Role.AssumeRolePolicyDocument'

# Branch protection
gh api repos/marcoaureliomenezes/portifolio/branches/main/protection
gh api repos/marcoaureliomenezes/portifolio/branches/develop/protection

# Environment reviewer
gh api repos/marcoaureliomenezes/portifolio/environments/production
```

## 9. Removido vs spec antiga

Itens da spec 1.0 que **não fazem mais parte** desta spec:

- "Backend Flask sanitização de input" — sem Flask em produção; servidor local não é
  superficie de ataque externa.
- "CORS Flask para domínio do frontend" — sem Flask em prod. CORS no API Gateway P1 é
  responsabilidade da spec CMS-lite (e é opcional porque `/admin` está no mesmo domínio).

Conteúdo histórico preservado em `specs/_archive/2026-05-14/security/SPEC.md`.
