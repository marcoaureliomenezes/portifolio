# Release TASKS — infra-bootstrap-v1 (archived)

**Status:** Aprovado

> Todas as tasks entregues. Conteúdo histórico extraído de
> `_archive/legacy-root/TASKS.md` Fase 0 + Fase 1.

## Tasks

- [x] T-DEVOPS-01 — Criar branch `develop` e cherry-pick `ci/oidc-pipelines-compliance`.
  Branch `develop` contém commits `fc2dea0`, `7994feb`, `774596a`, `8ea05cd`, `62daa98`,
  `586483f`. Branch fonte `ci/oidc-pipelines-compliance` removida.
- [x] T-DEVOPS-02a — `scripts/bootstrap-oidc.sh` versionado, idempotente, com guard de
  ambiente (CloudShell vs Infra Specialist local).
- [x] T-DEVOPS-02a-fix — Script atualizado para dual-mode com `INFRA_SPECIALIST_MODE=1`
  warning (não erro) fora de CloudShell.
- [x] T-DEVOPS-02 — Bootstrap OIDC executado em 2026-05-14 (Fluxo B local, Infra
  Specialist). OIDC provider + bootstrap role criados.
- [x] T-DEVOPS-03 — GitHub environments `stage` + `production` criados; secrets
  temporários setados via `gh secret set` para iniciar o ciclo CI.
- [x] T-DEVOPS-04 — `terraform/` restruturado em `modules/portfolio-static-site/` +
  `envs/stage/` + `envs/prod/`. Backend remoto S3
  (`dadaia-s3-bucket-terraform-rm-state/portifolio/{stage,prod}/`).
- [x] T-DEVOPS-05 — `.github/workflows/ci.yml`, `deploy.yml`, `terraform.yml` reescritos:
  jobs separados por env, OIDC `aws-actions/configure-aws-credentials@v4`, ubuntu-24.04
  pinado.
- [x] T-DEVOPS-06 — `.github/CODEOWNERS` criado com regras por path
  (`terraform/`, `.github/`, `frontend/`, `specs/`, `backend-go/`).
- [x] T-DEVOPS-07 — Branch protection ativa em `main` (PR + approval + CODEOWNERS +
  linear history + enforce_admins) e `develop` (PR + approval + linear history).
- [x] T-DEVOPS-08 — `terraform apply` em stage via job CI (`terraform.yml`); recursos
  criados zero-state (sem import).
- [x] T-DEVOPS-09 — Secrets stage atualizados para role OIDC final
  (`AWS_ROLE_ARN_STAGE`); bootstrap role mantida temporariamente para `prod-go-live-v1`.
