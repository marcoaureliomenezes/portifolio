# Deploy Readiness Checklist — site-recovery

Data: 2026-05-10 (UTC)

## Frontend

1. `npm ci`: OK
2. `npm run build`: OK
3. `npm run lint`: OK com warnings (0 errors, 7 warnings de fast-refresh)

## Dominio publico

1. `curl -I https://marco-menezes.com`: bloqueado no ambiente atual por falha de resolucao DNS (`Could not resolve host`).

## Infra tooling local

1. `terraform -version`: indisponivel (`command not found`)
2. `aws --version`: indisponivel (`command not found`)
3. `aws sts get-caller-identity`: nao executado (sem acesso/credenciais AWS neste ambiente)
4. `terraform init` / `terraform plan`: nao executado por ausencia do Terraform CLI

## Conteudo

1. PT/EN/DE atualizados com base canonica OpenClaw: OK
2. Dados sensiveis (job hunt/salario/candidaturas) no conteudo publico: NAO encontrados

## Risco residual para deploy

1. Corrigir erros de lint atuais antes de tratar pipeline como verde.
2. Executar validacao de dominio em ambiente com DNS funcional.
3. Instalar AWS CLI + Terraform CLI para completar validacao de infraestrutura.
