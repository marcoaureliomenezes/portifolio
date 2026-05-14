# F-P0-01 — Retomada da Infra Estática

**Status:** Aprovado

## 1. Contexto

A topologia de entrega do portfólio foi parcialmente destruída em 2025: CloudFront, ACM e
IAM OIDC não existem mais; permanece a zona Route53 e dois buckets S3 com o último build
(2025-07-16). Esta feature reconstrói tudo via Terraform com 2 ambientes AWS (stage + prod),
sem manualidade no console exceto pelo bootstrap inicial do OIDC provider.

Inputs principais:
- AS-IS: `.dadaia/reports/portifolio/discovery/2026-05-14T032141Z-review-portifolio-as-is.md` §2.
- Devops spec: `.dadaia/reports/portifolio/devops-engineer/2026-05-14T032921Z-pipeline-spec.md` §§2-7.

## 2. Objetivo

Provisionar (de forma idempotente) toda a topologia AWS de stage e prod, com OIDC GitHub
Actions, branch protection, environments, CODEOWNERS, e Git flow (`main` ← `develop`).
Reaproveitar onde possível (buckets existentes, zone Route53, bucket de state terraform);
recriar onde foi destruído (CloudFront, ACM, IAM).

## 3. Topologia alvo

| Recurso | Stage | Prod |
|---|---|---|
| S3 bucket | `stage-portifolio-marco-menezes` (criar) | `portifolio-marco-menezes` (importar) |
| CloudFront distribution | nova (sa-east-1 origin, us-east-1 cert) | nova (idem) |
| Aliases | `stage.marco-menezes.com` | `marco-menezes.com`, `www.marco-menezes.com` |
| ACM cert | `stage.marco-menezes.com` (us-east-1) | `marco-menezes.com` + `www.marco-menezes.com` (us-east-1) |
| Route53 records | A/ALIAS `stage` → CF stage | A/ALIAS `@` → CF prod, A/ALIAS `www` → CF prod |
| IAM role | shared `github-actions-portfolio-deploy` (trust `repo:marcoaureliomenezes/portifolio:*`) | mesma |
| TF state | `dadaia-s3-bucket-terraform-rm-state/portifolio/stage/terraform.tfstate` | `dadaia-s3-bucket-terraform-rm-state/portifolio/prod/terraform.tfstate` |

## 4. Layout terraform alvo

```
terraform/
├── modules/portfolio-static-site/
│   ├── main.tf         # provider config sem backend
│   ├── variables.tf    # 19 vars + novas (subdomain, cloudfront_price_class)
│   ├── s3.tf
│   ├── s3_policies.tf
│   ├── cloudfront.tf
│   ├── route53.tf
│   ├── acm.tf          # explicit (atual está embutido em cloudfront.tf)
│   ├── iam.tf
│   ├── outputs.tf
│   └── locals.tf
├── envs/
│   ├── stage/
│   │   ├── main.tf     # module call
│   │   ├── terraform.tf # backend "s3" {} partial config
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       ├── terraform.tf
│       └── terraform.tfvars
```

`locals.tf`:

```hcl
locals {
  env_prefix  = var.environment == "prod" ? "" : "${var.environment}-"
  bucket_name = "${local.env_prefix}portifolio-marco-menezes"
  domain      = var.environment == "prod" ? var.domain_name : "${var.subdomain}.${var.domain_name}"
}
```

`cloudfront.tf` aliases:

```hcl
aliases = var.environment == "prod" ? [var.domain_name, "www.${var.domain_name}"] : [local.domain]
```

`route53.tf` record `www` (apenas prod, `count = var.environment == "prod" ? 1 : 0`).

`iam.tf` role name: `github-actions-portfolio-${var.environment}-deploy` (split por env;
inicial: 1 role compartilhada via foundation §5; refinar para split se devops detectar
necessidade).

## 5. Bootstrap manual (uma vez, via AWS CloudShell)

> **Hard constraint** (foundation §10, security FR-S29..S31): operador **não** tem
> credenciais AWS locais. O bootstrap inicial — a única operação que precede o ciclo OIDC —
> roda em **AWS CloudShell**, sessão efêmera dentro do console AWS sem chaves persistidas
> em disco local. Daí em diante, todo `terraform apply` / `terraform import` / `aws iam *`
> roda **exclusivamente** em GitHub Actions.
>
> O bucket de state `dadaia-s3-bucket-terraform-rm-state/portifolio/` já existe (criado em
> ciclo anterior); o bootstrap deste projeto NÃO recria o state bucket — apenas o OIDC
> provider e a bootstrap role.

### 5.1. Fluxo end-to-end do bootstrap

| Passo | Onde executa | Quem | Saída esperada |
|---|---|---|---|
| (a) | AWS CloudShell | operador | OIDC provider + bootstrap role criados |
| (b) | CloudShell (output do passo a) | operador anota ARN | string ARN da bootstrap role |
| (c) | terminal local (sem AWS creds) | operador via `gh secret set` | secrets stage/prod apontam para bootstrap role |
| (d) | GitHub Actions (`terraform.yml` job `terraform-stage-apply`) | workflow | role OIDC final + recursos stage criados |
| (e) | terminal local (sem AWS creds) | operador via `gh secret set` | secrets trocados para role final (`github-actions-portfolio-deploy`) |
| (f) | GitHub Actions (workflow `cleanup-bootstrap.yml` ou job manual-trigger em `terraform.yml`) | workflow | bootstrap role e suas policies deletadas |

### 5.2. Conteúdo de `scripts/bootstrap-oidc.sh`

O script é artefato **versionado neste repo** (`scripts/bootstrap-oidc.sh`) e é criado em
T-DEVOPS-02a antes de T-DEVOPS-02 começar. Operador clona o repo no CloudShell (ou
copia/cola o script) e executa. Requisitos do script:

- **Idempotente:** detecta se OIDC provider já existe (`aws iam list-open-id-connect-providers`)
  e pula a criação; detecta se a bootstrap role existe (`aws iam get-role`) e pula a criação;
  re-attach idempotente do policy se já anexado.
- **Sem credenciais locais:** assume que está rodando em CloudShell (verifica via
  `[ -n "$AWS_EXECUTION_ENV" ]` ou similar; aborta com mensagem clara se rodado fora).
- **Operações que executa:**
  1. Cria OIDC provider `token.actions.githubusercontent.com` com thumbprint
     `6938fd4d98bab03faadb97b34396831e3780aea1` (idempotente).
  2. Cria IAM role `github-actions-portfolio-bootstrap` com trust policy restrita a
     `repo:marcoaureliomenezes/portifolio:*` (StringLike em `sub`) e
     `aud = sts.amazonaws.com`.
  3. Anexa policy gerenciada `AdministratorAccess` à bootstrap role.
  4. Imprime no stdout: `BOOTSTRAP_ROLE_ARN=<arn>` em formato de uma linha, fácil de copiar
     para `gh secret set`.
- **Pós-condições:**
  - `aws iam list-open-id-connect-providers` retorna o provider.
  - `aws iam get-role --role-name github-actions-portfolio-bootstrap` retorna a role com
    trust correta.
  - `aws iam list-attached-role-policies --role-name github-actions-portfolio-bootstrap`
    contém `AdministratorAccess`.
- **Saída esperada:** o operador copia `BOOTSTRAP_ROLE_ARN=<arn>` para clipboard e fecha
  a sessão CloudShell. Nenhum dado sensível fica em disco.

### 5.3. Configuração de secrets (passo c) — sem AWS creds

Executado localmente com `gh` CLI (token GitHub pessoal — não é credencial AWS, não viola
FR-S29):

```bash
gh secret set AWS_ROLE_ARN_STAGE --env stage --body "<bootstrap-role-arn>"
gh secret set AWS_ROLE_ARN       --env production --body "<bootstrap-role-arn>"
```

### 5.4. Primeiro apply (passo d) — exclusivamente via CI

O workflow `terraform.yml` (job `terraform-stage-apply`) é disparado por push/PR em
`terraform/**`. Esse job assume a bootstrap role via OIDC, roda `terraform apply` em
`envs/stage/`, e cria entre outros recursos a **role OIDC final**
`github-actions-portfolio-deploy` com permissões mínimas (vide security FR-S16..S18).

Nenhuma mão humana toca em `terraform apply` neste fluxo. Se o apply falhar, operador lê
logs no GitHub Actions UI e corrige via PR; **não** roda `terraform apply` localmente
"para destravar".

### 5.5. Cleanup da bootstrap role (passo f) — exclusivamente via CI

T-DEVOPS-13 (deletar bootstrap role) executa via job CI dedicado — workflow standalone
`cleanup-bootstrap.yml` ou job `manual-trigger` em `terraform.yml`. Comandos
`aws iam delete-role` e `aws iam detach-role-policy` rodam dentro do runner GitHub Actions
assumindo a role OIDC final (que tem permissão de gestão da bootstrap role para esta
operação one-shot). Não há `aws iam delete-role` rodado localmente.

## 6. Critérios de aceite

- **A1.** `terraform apply` em `envs/stage/` é idempotente e cria toda a topologia stage
  do zero (sem recursos importados — bucket stage é novo). Execução **exclusivamente via
  workflow `terraform.yml` job `terraform-stage-apply`** (foundation §10, FR-S29).
- **A2.** `terraform apply` em `envs/prod/` é idempotente e cria/importa toda a topologia
  prod. Bucket `portifolio-marco-menezes` é **importado** (não recriado). Orphan bucket
  policy é substituída no apply. Execução **exclusivamente via workflow `terraform.yml`
  job `terraform-prod-apply`** com aprovação manual no environment `production`
  (foundation §10, FR-S29).
- **A3.** Após apply prod, `curl -I https://marco-menezes.com` retorna `HTTP/2 200`,
  `server: CloudFront`, e header `strict-transport-security`.
- **A4.** Após apply stage, `curl -I https://stage.marco-menezes.com` retorna idem.
- **A5.** `aws s3api get-bucket-policy --bucket portifolio-marco-menezes` (executado em
  CloudShell ou via job CI read-only) mostra acesso via OAC para a **nova** distribuição
  (não a destruída `E25KHOW8T4PLO3`).
- **A6.** OIDC trust policy é restrita a `repo:marcoaureliomenezes/portifolio:*`.
- **A7.** Custo mensal projetado < US$ 1/mês (devops §8).
- **A8.** Bootstrap role deletada após primeiro apply bem-sucedido, via job CI dedicado
  (não `aws iam delete-role` local). Vide T-DEVOPS-13.
- **A9.** Branch `develop` criada e protegida; PR `develop → main` aberto.
- **A10.** `ci/oidc-pipelines-compliance` cherry-picked para `develop` (commits `15b49a8` e
  `c9aa3d4`); branch antiga deletada local e remote.
- **A11.** Branch protection ativa em `main` e `develop` (vide foundation §1 e
  security/FR-S11..S14).
- **A12.** Environment `production` configurado com reviewer `@marcoaureliomenezes` (vide
  foundation §3).
- **A13.** `.github/CODEOWNERS` criado (vide foundation §2).
- **A14.** Diretório `backend/` Flask permanece (dev local), porém scripts vazios
  (`setup.sh`, `start_server.sh`) e `.flask.pid` são removidos.
- **A15.** Nenhuma execução local de `terraform apply`, `terraform import`, `aws iam *` ou
  `aws s3 *` contra recursos do projeto durante todo o ciclo (vide foundation §10 e
  security FR-S29..S31). Toda operação de provisionamento ocorre via workflow GitHub
  Actions; bootstrap (T-DEVOPS-02) é a única exceção e roda em AWS CloudShell.

## 7. Fora de escopo (P2)

- WAF, AWS Shield, IDS.
- Multi-region (réplica de bucket, distribuições secundárias).
- CloudWatch dashboards, observabilidade ativa.
- Cleanup de outros recursos AWS órfãos (ECS clusters, Lambdas demo de outros projetos)
  — iniciativa separada.

## 8. Decisões fechadas

- **DEV-01.** 2 ambientes AWS (stage + prod), não 3. Dev é local (Vite). Stage serve como
  gate explícito antes de prod (devops §1).
- **DEV-02.** Layout `terraform/envs/{stage,prod}/` + `modules/portfolio-static-site/`.
  Workspaces e prefixos no mesmo state foram rejeitados (devops §5).
- **DEV-03.** 1 IAM role compartilhada com trust `repo:.../portifolio:*`. Segurança de prod
  vem do environment GitHub `production` requerer aprovação manual (devops §3.3).
- **DEV-04.** Orphan bucket policy do bucket prod é substituída pelo terraform no apply
  (Option A — devops §7 passo 17). Não deletar manualmente antes.
- **DEV-05.** Terraform versão 1.9.0 pinada (devops §4.3).
- **DEV-06.** Build artifact reusado via `actions/upload-artifact` entre CI e deploy jobs
  (devops §4.2).
- **DEV-07.** ACM em us-east-1 (requisito CloudFront), demais recursos em sa-east-1.
- **DEV-08.** Bootstrap do OIDC provider e da bootstrap role roda em **AWS CloudShell**, não
  em terminal local com credenciais admin. Operador não tem `~/.aws/credentials` para a
  conta `016098071081` no ambiente DEV. Script idempotente `scripts/bootstrap-oidc.sh`
  versionado no repo (T-DEVOPS-02a) é o único artefato copiado/clonado para CloudShell.
  Após o bootstrap, todo `terraform apply`/`terraform import`/`aws iam delete-role` roda
  exclusivamente via workflow GitHub Actions (`terraform.yml`). Vide `foundation/SPEC.md §10`
  e `security/SPEC.md FR-S29..S31`.

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| ACM cert validation timeout | `timeouts { create = "10m" }` já existe; re-run idempotente. |
| Stage cert request rate limit (5 certs/region/week) | Total = 2 certs; bem dentro do limite. |
| Branch `develop` sem conteúdo de `ci/oidc-pipelines-compliance` | Cherry-pick explícito + check pré-PR antes de merge. |
| Environment `production` sem reviewer | Configurar via UI **antes** de qualquer push em `main`. |
| Bucket import com typo no nome | Verificar `aws s3 ls` em CloudShell antes de o job `terraform-prod-apply` rodar o `terraform import`. |
| Operador esquecer e tentar `terraform apply` local | Foundation §10 + security FR-S29 documentam a proibição. Ausência de `~/.aws/credentials` torna o comando inoperante por construção. |
| Bootstrap role permanecer após go-live (privilege creep) | T-DEVOPS-13 obrigatório no critério A8; verificação automática `aws iam list-roles \| grep bootstrap` em job CI pós-cleanup. |

## 10. Referências

- Devops report §§2-7 — roteiro from-scratch passo-a-passo numerado.
- AS-IS §2 — estado AWS atual (auditado 2026-05-14).
- Security spec FR-S11..S20 — gates de IAM e branch protection.
