# Foundation SPEC: portifolio (2.0)

**Status:** Aprovado

> Spec foundational do projeto `portifolio`. Define fundações invariantes: governança Git,
> domínios de agente, processos SDD. Mudar este arquivo requer revisão do operador.

---

## 1. Governança de branch e Git flow

| Branch | Propósito | Origem | Destino | Proteção |
|---|---|---|---|---|
| `main` | Produção (`marco-menezes.com`) | — | — | Bloqueada: PR + 1 approval + CODEOWNERS + checks verdes + linear history; admin enforcement. |
| `develop` | Stage (`stage.marco-menezes.com`) | `main` (inicial) | `main` via PR | PR + 1 approval + checks verdes + linear history. |
| `feature/*`, `fix/*` | Trabalho em curso | `develop` | `develop` via PR | — |
| `hotfix/*` | Correção urgente em prod | `main` | `main` + cherry-pick para `develop` | — |

Hooks/policies:

- `allow_force_pushes=false`, `allow_deletions=false` em `main` e `develop`.
- `require_code_owner_reviews=true` em `main`.
- `enforce_admins=true` em `main` (operador também passa pela proteção).
- Squash-or-rebase merge obrigatório (sem merge commits).
- Signed commits **não** enforced no P0 (registrado para reavaliar quando o projeto ganhar
  contribuidores além do operador).

## 2. CODEOWNERS

```
*                           @marcoaureliomenezes
terraform/                  @marcoaureliomenezes
.github/                    @marcoaureliomenezes
frontend/src/               @marcoaureliomenezes
frontend/public/            @marcoaureliomenezes
specs/                      @marcoaureliomenezes
backend-go/                 @marcoaureliomenezes
```

Para repositório solo, CODEOWNERS serve para acionar `require_code_owner_reviews`
explicitamente e documentar ownership.

## 3. Environments GitHub

| Environment | Branch policy | Reviewers obrigatórios | Mapeado a |
|---|---|---|---|
| `stage` | `develop` apenas | Nenhum | AWS stage infra |
| `production` | `main` apenas | `@marcoaureliomenezes` (operador) | AWS prod infra |

## 4. Secrets e Variables por environment

| Tipo | Nome | Env | Origem |
|---|---|---|---|
| Variable (repo) | `TF_STATE_BUCKET` | repo | `dadaia-s3-bucket-terraform-rm-state` |
| Variable (repo) | `TF_STATE_REGION` | repo | `sa-east-1` |
| Secret | `AWS_ROLE_ARN_STAGE` | stage | terraform output após bootstrap stage |
| Variable | `AWS_REGION` | stage | `sa-east-1` |
| Variable | `S3_BUCKET` | stage | `stage-portifolio-marco-menezes` |
| Variable | `DOMAIN` | stage | `stage.marco-menezes.com` |
| Variable | `TF_ENV` | stage | `stage` |
| Secret | `CLOUDFRONT_DISTRIBUTION_ID_STAGE` | stage | terraform output stage |
| Secret | `AWS_ROLE_ARN` | production | terraform output após bootstrap prod |
| Variable | `AWS_REGION` | production | `sa-east-1` |
| Variable | `S3_BUCKET` | production | `marco-menezes.com` |
| Variable | `DOMAIN` | production | `marco-menezes.com` |
| Variable | `TF_ENV` | production | `prod` |
| Secret | `CLOUDFRONT_DISTRIBUTION_ID` | production | terraform output prod |

## 5. OIDC IAM Trust

Estratégia inicial: 1 role compartilhada `github-actions-portfolio-deploy` com trust
`repo:marcoaureliomenezes/portifolio:*`. A segurança de prod é dada pelo **environment
`production` requerer aprovação manual**, não por separação de role.

Trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::016098071081:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:marcoaureliomenezes/portifolio:*" }
    }
  }]
}
```

Bootstrap role (`github-actions-portfolio-bootstrap`, `AdministratorAccess`) é deletada
após primeiro apply bem-sucedido.

## 6. Workflows oficiais

- `.github/workflows/ci.yml` — PR gate (`pull_request` para `main` e `develop`). Jobs:
  `lint`, `build`, `unit-tests`, `e2e`, `lighthouse`. Detalhes em `features/quality-gate/`.
- `.github/workflows/deploy.yml` — Push em `main` ou `develop` com paths `frontend/**`.
  Jobs: `build`, `deploy-stage` (env stage), `deploy-prod` (env production, requires
  approval), `smoke-e2e` (pós-deploy).
- `.github/workflows/terraform.yml` — Push/PR em `terraform/**`. Jobs `terraform-<env>-plan`
  e `terraform-<env>-apply`.

## 7. Domínios de agente

| Domínio | Agente proprietário |
|---|---|
| `specs/**` | product-engineer |
| `frontend/**` | software-engineer (implementação), software-architect (auditoria/ADRs) |
| `backend-go/**` (P1) | software-engineer + software-architect |
| `terraform/**`, `.github/workflows/**`, `.github/CODEOWNERS` | devops-engineer |
| `tests/e2e/**`, `*.test.tsx`, `lighthouserc.json`, `playwright.config.ts`, `vitest.config.ts` | qa-engineer |

`product-engineer` é o único agente autorizado a modificar `specs/`. Implementação é
responsabilidade dos agentes técnicos correspondentes.

## 8. Processo SDD canônico

1. PE consome reports especialistas → grill-me com operador → escreve SPEC.md (Draft).
2. Operador aprova SPEC (`**Status:** Aprovado`).
3. PE escreve PLAN.md (Draft) → operador aprova.
4. PE escreve TASKS.md atômico e paralelo (Draft) → operador aprova.
5. Agentes técnicos implementam tarefas em ordem de dependência declarada em TASKS.md.
6. PE atualiza specs se novas decisões emergirem (reescrita atômica, com arquivamento
   da versão substituída em `specs/_archive/<YYYY-MM-DD>/`).

## 9. Custos e teto

| Categoria | Alvo P0 | Teto duro | Ação no teto |
|---|---|---|---|
| Custo mensal AWS total | < US$ 5/mês | US$ 10/mês | Budget alert SNS → operador re-avalia P1 |
| Build CI por job | < 6 min | 15 min | devops adiciona `timeout-minutes:` |
| Bundle JS inicial (após podagem) | < 200KB gz | 400KB gz | Architect refator extra |

## 10. Hard constraint: no local AWS credentials (FR-FOUND-01)

Esta constraint é definida por **papel (persona)**, não por usuário físico. Dois papéis
distintos operam neste projeto, com permissões mutuamente exclusivas no que tange a
credenciais AWS locais:

### 10.a Developer (papel padrão — 99% das interações com o repo)

**Hard rule:** Developer **não** tem credenciais AWS de longo prazo no ambiente DEV local.
Nenhum `~/.aws/credentials`, access key, ou profile apontando para a conta `016098071081`
existe em estações de trabalho usadas para tarefas de Developer. Toda escrita e leitura na
conta `016098071081` para o projeto `portifolio` no contexto de Developer acontece
**exclusivamente via GitHub Actions com OIDC role assumida pelo workflow**.

Tudo que é "operação de aplicação" — `terraform apply`/`plan`/`import`/`destroy`,
`aws iam *`, `aws s3 cp`/`sync`/`api put-*` contra buckets do projeto,
`aws cloudfront create-invalidation` — é proibido para Developer, **sem exceção**.

### 10.b Infra Specialist (papel raro — bootstrap inicial e break-glass)

**Infra Specialist** é um papel acionado em momentos específicos do ciclo de vida do
projeto:

1. **Bootstrap inicial** do OIDC provider e da bootstrap role (T-DEVOPS-02). Antes do OIDC
   estar em pé, não existe caminho via CI — alguém com privilégio de IAM precisa criar
   o provider e a role. Esse "alguém" é o Infra Specialist.
2. **Break-glass** durante incidentes em que o pipeline está quebrado e o caminho via CI
   está bloqueado (ex: a role OIDC final foi acidentalmente revogada e nenhum workflow
   consegue assumir nada). Usado apenas para diagnóstico read-only e restauração mínima
   do caminho via CI.

Durante esse papel, **credenciais AWS locais são autorizadas**, em escopo restrito:

- **Bootstrap (T-DEVOPS-02):** o Infra Specialist pode rodar `scripts/bootstrap-oidc.sh`
  via uma das duas opções autorizadas:
  - **Opção A (preferida):** AWS CloudShell — sessão efêmera dentro do console AWS, sem
    chaves persistidas em disco local.
  - **Opção B (autorizada):** máquina local do Infra Specialist com credenciais AWS de
    privilégio IAM (criar OIDC provider + criar role). Idempotência e resultado idênticos
    à Opção A. Ambas auditáveis via CloudTrail.
- **Diagnóstico read-only durante break-glass:** `aws sts get-caller-identity`,
  `aws iam list-*`, `aws s3 ls`, `aws cloudfront list-*`, etc. — autorizado localmente
  para Infra Specialist quando o pipeline está bloqueado.

**Continua proibido para Infra Specialist (mesmo durante break-glass):**

- `terraform apply` local contra recursos do projeto (stage ou prod).
- `aws s3 cp` / `aws s3 sync` local contra buckets de stage ou prod
  (`stage-portifolio-marco-menezes`, `portifolio-marco-menezes`,
  `dadaia-s3-bucket-terraform-rm-state/portifolio/*`).
- `aws cloudfront create-invalidation` local.
- Qualquer operação de aplicação (escrita) fora da janela de bootstrap. Após o OIDC estar
  em pé, mudanças voltam a passar por CI mesmo para Infra Specialist.

### 10.c Checklist de break-glass (obrigatória ao usar credenciais locais como Infra Specialist)

Antes e depois de qualquer execução local de comando AWS no papel Infra Specialist, o
operador preenche mentalmente (ou em incident channel) a checklist:

- [ ] Operação local foi necessária? (sim/não — se "não", abortar e seguir via CI).
- [ ] Justificativa documentada (link para incident, setup task, ou ADR).
- [ ] CloudTrail confirma a operação executada (auditável retroativamente; principal será
      a identidade humana via SSO/console, não uma role OIDC de workflow).
- [ ] Após resolver, revisão pós-mortem confirma que o caminho via CI foi restaurado e que
      nenhum atalho local foi adotado como hábito.

A persistência dessa checklist no histórico do projeto (chat, incident log, ou
`specs/_archive/`) é o que mantém a governança intacta: o privilégio de Infra Specialist é
auditável, raro, e nunca substitui o caminho via CI como rotina.

### 10.d Proibições absolutas (sem exceção, para ambos os papéis após bootstrap)

- `terraform apply`, `terraform plan`, `terraform import`, `terraform destroy` rodados
  localmente como rotina pós-bootstrap.
- `aws s3 cp`, `aws s3 sync`, `aws s3api put-*` contra buckets de stage ou prod do projeto
  rodados localmente.
- `aws cloudfront create-invalidation` local.
- Qualquer comando que assuma a role `github-actions-portfolio-*` via `aws sts assume-role`
  ou `aws sts assume-role-with-web-identity` fora de um workflow GitHub Actions.

### 10.e Autorizado (para qualquer papel)

- Jobs CI dedicados a leitura (`terraform-*-plan`, futuro `aws-readonly`) executados em
  workflow GitHub Actions assumindo role com permissões read-only.
- `gh secret set`, `gh api`, `gh pr create` executados localmente — esses comandos usam
  **GitHub token pessoal**, não credencial AWS, portanto não violam esta constraint para
  nenhum papel.
- Lighthouse manual rodado no navegador do operador contra URL pública (não consome
  credencial AWS). Resultado registrado em PR no repo, não via `aws s3 cp`.

### 10.f Racional (security control)

A separação de papéis preserva os ganhos da política original (zero superfície de chaves
de longo prazo no fluxo de aplicação 99% do tempo) e adiciona pragmatismo no 1% do tempo
em que credenciais AWS são inevitáveis (bootstrap, break-glass). O governo da política é
feito por:

- **Papel Developer:** zero chaves, zero superfície de vazamento via Developer workflow.
  Audit trail forçado por CloudTrail dos jobs CI, com identidade vinculada ao workflow
  (`token.actions.githubusercontent.com:sub = repo:marcoaureliomenezes/portifolio:*`).
- **Papel Infra Specialist:** chaves autorizadas em escopo restrito (bootstrap + read-only
  break-glass). Audit trail ainda existe via CloudTrail — apenas o principal muda
  (identidade humana via SSO/console em vez de role de workflow). Checklist de §10.c
  garante que cada uso seja justificável retroativamente.

Cross-ref: `security/SPEC.md FR-S29..S31`; `features/infra-retomada/SPEC.md §5`
(bootstrap via CloudShell ou via Infra Specialist local autorizado);
`specs/SPEC.md §4b CT-01`.

---

## 11. Estado de bootstrap atual (snapshot 2026-05-14)

Estes itens são pré-condição para qualquer implementação em F-P0-01:

- [ ] Branch `develop` criada a partir de `main`.
- [ ] Commits `15b49a8` (OIDC pipelines) e `c9aa3d4` (vite 7 + fix npm vulns) presentes
      em `develop` (via cherry-pick ou squash-merge de `ci/oidc-pipelines-compliance`).
- [x] OIDC provider AWS criado (`arn:aws:iam::016098071081:oidc-provider/token.actions.githubusercontent.com`)
      — executado em 2026-05-14 no papel Infra Specialist (Fluxo B). Registro em
      `specs/_archive/2026-05-14-bootstrap-notes.md`.
- [x] Bootstrap IAM role criada (temporária):
      `arn:aws:iam::016098071081:role/github-actions-portfolio-bootstrap` com
      `AdministratorAccess` e trust `repo:marcoaureliomenezes/portifolio:*`. Path para
      deletar: T-DEVOPS-13 após primeiro `terraform apply` prod bem-sucedido.
- [ ] Bucket `dadaia-s3-bucket-terraform-rm-state` confirmado e acessível (já existe).
- [ ] Zona Route53 `Z08547081HT88IACPHZET` confirmada (já existe).

Após F-P0-01 concluída, este checklist é substituído por outputs do terraform.
