# Release PLAN — infra-bootstrap-v1 (archived)

**Status:** Aprovado

> Release encerrada. Plano original cobria Fase 0 (Pre-bootstrap) + Fase 1 (Terraform
> restructure + Stage infra) do PLAN do ciclo de Retomada 2.0.

## Sequência executada

1. **Fase 0 — Pre-bootstrap (operador via CloudShell / Infra Specialist local).**
   - T-DEVOPS-01 — Criar `develop` + cherry-pick `ci/oidc-pipelines-compliance`.
   - T-DEVOPS-02a — Versionar `scripts/bootstrap-oidc.sh`.
   - T-DEVOPS-02a-fix — Dual-mode (CloudShell + Infra Specialist local).
   - T-DEVOPS-02 — Executar bootstrap OIDC (uma vez).
   - T-DEVOPS-03 — Configurar GitHub environments + secrets temporários.

2. **Fase 1 — Terraform restructure + Stage infra.**
   - T-DEVOPS-04 — Restruturar `terraform/` em `modules/` + `envs/{stage,prod}/`.
   - T-DEVOPS-05 — Reescrever `ci.yml`, `deploy.yml`, `terraform.yml`.
   - T-DEVOPS-06 — `.github/CODEOWNERS`.
   - T-DEVOPS-07 — Branch protection em `main` e `develop`.
   - T-DEVOPS-08 — `terraform apply` em stage (via CI).
   - T-DEVOPS-09 — Atualizar secrets stage com role OIDC final.

## Critérios de fechamento (atendidos)

- OIDC provider `arn:aws:iam::016098071081:oidc-provider/token.actions.githubusercontent.com`
  presente.
- Bootstrap role `github-actions-portfolio-bootstrap` criada via Fluxo B (Infra Specialist
  local em 2026-05-14).
- Stage infra (`stage.marco-menezes.com`) provisionada via CI; bucket
  `stage-portifolio-marco-menezes` + CloudFront + ACM us-east-1 cert + Route53 alias OK.
- Branch protection ativa em `main` e `develop`.
- CI workflows reescritos para usar role OIDC final.

## Out-of-scope (parked como `prod-go-live-v1` no backlog)

- Importação do bucket prod no terraform state.
- `terraform apply` em prod.
- Deleção da bootstrap role.
- Go-live (first deploy via push para main).
