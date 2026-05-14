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

Desenvolvedores (incluindo o operador) **não** têm credenciais AWS no ambiente DEV local.
Nenhum `~/.aws/credentials` ou access key de longo prazo apontando para a conta
`016098071081` existe em estações de trabalho. Toda escrita e leitura na conta para o projeto
`portifolio` acontece via **GitHub Actions com OIDC role assumida pelo workflow**.

**Única exceção tolerada — bootstrap inicial do OIDC provider (T-DEVOPS-02):** o operador
abre uma sessão **AWS CloudShell** (terminal efêmero dentro do console AWS, autenticado
via SSO/console — sem chaves persistidas em disco local), roda o script versionado
`scripts/bootstrap-oidc.sh` uma única vez para criar OIDC provider + bootstrap role, e
encerra a sessão. A partir desse ponto, o ciclo OIDC fecha — nenhuma credencial AWS volta a
sair do ambiente AWS.

### Proibido (sem exceção após bootstrap)

- `terraform apply`, `terraform plan`, `terraform import`, `terraform destroy` rodados localmente.
- `aws iam create-*`, `aws iam delete-*`, `aws iam attach-role-policy` rodados localmente.
- `aws s3 cp`, `aws s3 sync`, `aws s3api put-*` contra buckets de stage ou prod do projeto
  (`stage-portifolio-marco-menezes`, `portifolio-marco-menezes`,
  `dadaia-s3-bucket-terraform-rm-state/portifolio/*`) rodados localmente.
- `aws cloudfront create-invalidation` local.
- Qualquer comando que assuma a role `github-actions-portfolio-*` via `aws sts assume-role`
  ou `aws sts assume-role-with-web-identity` fora de um workflow GitHub Actions.

### Autorizado

- `aws sts get-caller-identity` e demais comandos read-only (`list-*`, `describe-*`,
  `get-*`) executados **em AWS CloudShell** para diagnóstico pontual.
- Jobs CI dedicados a leitura (`terraform-*-plan`, futuro `aws-readonly`) executados em
  workflow GitHub Actions assumindo role com permissões read-only.
- `gh secret set`, `gh api`, `gh pr create` executados localmente — esses comandos usam
  **GitHub token pessoal**, não credencial AWS, portanto não violam esta constraint.
- Lighthouse manual rodado no navegador do operador contra URL pública (não consome
  credencial AWS). Resultado registrado em PR no repo, não via `aws s3 cp`.

### Racional (security control)

A ausência de chaves de longo prazo elimina a superfície de vazamento (commit acidental,
backup de disco, dotfiles em repo público, malware local). Força todo audit trail a passar
por **CloudTrail dos jobs CI**, com identidade vinculada ao workflow GitHub Actions
(`token.actions.githubusercontent.com:sub = repo:marcoaureliomenezes/portifolio:*`). Sem
chaves locais, não há como "burlar" o gate do environment `production` requerer aprovação
manual.

Cross-ref: `security/SPEC.md FR-S29`; `features/infra-retomada/SPEC.md §5` (bootstrap via
CloudShell).

---

## 11. Estado de bootstrap atual (snapshot 2026-05-14)

Estes itens são pré-condição para qualquer implementação em F-P0-01:

- [ ] Branch `develop` criada a partir de `main`.
- [ ] Commits `15b49a8` (OIDC pipelines) e `c9aa3d4` (vite 7 + fix npm vulns) presentes
      em `develop` (via cherry-pick ou squash-merge de `ci/oidc-pipelines-compliance`).
- [ ] OIDC provider AWS criado (`token.actions.githubusercontent.com`).
- [ ] Bootstrap IAM role criada (temporária).
- [ ] Bucket `dadaia-s3-bucket-terraform-rm-state` confirmado e acessível (já existe).
- [ ] Zona Route53 `Z08547081HT88IACPHZET` confirmada (já existe).

Após F-P0-01 concluída, este checklist é substituído por outputs do terraform.
