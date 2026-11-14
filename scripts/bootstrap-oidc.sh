#!/usr/bin/env bash
# ==============================================================================
# bootstrap-oidc.sh — Bootstrap do OIDC provider do GitHub na conta AWS
#
# Dois fluxos autorizados (foundation/SPEC.md §10, infra-retomada/SPEC.md §5):
#
# FLUXO A — AWS CloudShell (preferido, nenhuma credencial sai do ambiente AWS):
#   1. Abra o AWS CloudShell no console AWS (conta 016098071081).
#   2. git clone https://github.com/marcoaureliomenezes/portifolio.git
#      cd portifolio && bash scripts/bootstrap-oidc.sh
#   3. Encerre a sessao CloudShell.
#
# FLUXO B — Maquina local (papel Infra Specialist autorizado):
#   Requer credenciais AWS com privilegio IAM e a flag explícita:
#     INFRA_SPECIALIST_MODE=1 bash scripts/bootstrap-oidc.sh
#   Cumpra o checklist de foundation/SPEC.md §10.b e §10.c antes de usar.
#   Desenvolvedores (papel Developer) NAO devem usar este fluxo.
#
# O que este script cria (idempotente — pula se ja existir):
#   OIDC Identity Provider: token.actions.githubusercontent.com
#
# Nenhuma role IAM e criada aqui: a role de apply pertence ao bootstrap do painel.
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Guarda de ambiente: CloudShell (Fluxo A) ou Infra Specialist local (Fluxo B)
#
# Fluxo A — AWS CloudShell (preferido):
#   AWS_EXECUTION_ENV e setado automaticamente pelo ambiente CloudShell.
#   Nenhuma flag adicional necessaria.
#
# Fluxo B — Maquina local autorizada (Infra Specialist):
#   Requer INFRA_SPECIALIST_MODE=1 explicitamente.
#   Credenciais IAM devem estar configuradas localmente com privilegio suficiente.
#   Checklist obrigatorio antes de usar (foundation/SPEC.md §10.c):
#     1. Confirmar que e o papel Infra Specialist (nao Developer) que esta atuando.
#     2. Verificar que as credenciais sao temporarias ou de uso restrito ao bootstrap.
#     3. Encerrar a sessao local apos conclusao; nenhuma credencial AWS permanece ativa.
#     4. Registrar a execucao no incident log ou no specs/_archive/ do repo.
#
# Qualquer outro contexto (sem AWS_EXECUTION_ENV e sem INFRA_SPECIALIST_MODE=1)
# indica papel Developer — aborta com mensagem clara.
# Ref: foundation/SPEC.md §10.a (Developer) e §10.b (Infra Specialist).
# ------------------------------------------------------------------------------
if [[ -n "${AWS_EXECUTION_ENV:-}" ]]; then
  : # Fluxo A — CloudShell. Continua sem aviso.
elif [[ "${INFRA_SPECIALIST_MODE:-}" == "1" ]]; then
  echo "INFO: Running outside CloudShell as Infra Specialist (INFRA_SPECIALIST_MODE=1)." >&2
  echo "      Ensure credentials are scoped per foundation/SPEC.md §10.b and §10.c checklist." >&2
else
  echo "ERRO: Ambiente nao reconhecido como CloudShell nem como Infra Specialist local." >&2
  echo "" >&2
  echo "      Fluxo A (preferido) — AWS CloudShell:" >&2
  echo "        Abra o CloudShell no console AWS (conta 016098071081)." >&2
  echo "        git clone https://github.com/marcoaureliomenezes/portifolio.git" >&2
  echo "        cd portifolio && bash scripts/bootstrap-oidc.sh" >&2
  echo "" >&2
  echo "      Fluxo B — Maquina local (Infra Specialist autorizado):" >&2
  echo "        INFRA_SPECIALIST_MODE=1 bash scripts/bootstrap-oidc.sh" >&2
  echo "        Cumpra o checklist de foundation/SPEC.md §10.b e §10.c antes de usar." >&2
  echo "" >&2
  echo "      Desenvolvedores (papel Developer) NAO devem executar este script localmente." >&2
  echo "      Vide specs/foundation/SPEC.md §10.a (FR-FOUND-01)." >&2
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_URL="https://token.actions.githubusercontent.com"
OIDC_THUMBPRINT="6938fd4d98bab03faadb97b34396831e3780aea1"

echo "=== Bootstrap OIDC — conta AWS: ${ACCOUNT_ID} ==="

# ------------------------------------------------------------------------------
# Passo 1: OIDC Identity Provider (idempotente)
# ------------------------------------------------------------------------------
echo ""
echo "[1/1] Verificando OIDC provider..."

OIDC_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "${OIDC_ARN}" \
     > /dev/null 2>&1; then
  echo "      OIDC provider ja existe — pulando criacao."
else
  echo "      Criando OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url "${OIDC_URL}" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "${OIDC_THUMBPRINT}" \
    --tags "Key=ManagedBy,Value=bootstrap-oidc.sh" > /dev/null
  echo "      OIDC provider criado."
fi

echo ""
echo "=== Bootstrap concluido ==="
