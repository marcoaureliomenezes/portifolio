#!/usr/bin/env bash
# ==============================================================================
# bootstrap-oidc.sh — Bootstrap OIDC provider + IAM bootstrap role
#
# IMPORTANTE: RODAR APENAS EM AWS CLOUDSHELL
# Nunca rode este script localmente com ~/.aws/credentials.
# Fundamento: specs/foundation/SPEC.md §10 (FR-FOUND-01).
#
# Como usar (vide features/infra-retomada/SPEC.md §5, fluxo passo a):
#   1. Abra o AWS CloudShell no console AWS (conta 016098071081).
#   2. git clone https://github.com/marcoaureliomenezes/portifolio.git
#      cd portifolio && bash scripts/bootstrap-oidc.sh
#   3. Copie a linha "BOOTSTRAP_ROLE_ARN=..." exibida ao final.
#   4. Execute localmente (usa GitHub token, NÃO credencial AWS):
#        gh secret set AWS_ROLE_ARN_STAGE --env stage --body "<arn copiado>"
#        gh secret set AWS_ROLE_ARN       --env production --body "<arn copiado>"
#   5. Encerre a sessão CloudShell. Nenhuma credencial sai do ambiente AWS.
#
# O que este script cria (idempotente — pula se já existir):
#   a) OIDC Identity Provider: token.actions.githubusercontent.com
#   b) IAM Role: github-actions-portfolio-bootstrap (AdministratorAccess)
#      Trust: repo:marcoaureliomenezes/portifolio:* (qualquer ref)
#
# Esta role é TEMPORÁRIA. Após o primeiro terraform apply bem-sucedido
# (T-DEVOPS-08), a role OIDC final é criada pelo próprio terraform.
# A bootstrap role deve ser deletada via job CI dedicado (T-DEVOPS-13).
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Guarda de ambiente: somente AWS CloudShell
# ------------------------------------------------------------------------------
if [[ -z "${AWS_EXECUTION_ENV:-}" ]]; then
  echo "ERRO: Este script deve ser executado EXCLUSIVAMENTE no AWS CloudShell." >&2
  echo "      Variavel AWS_EXECUTION_ENV nao encontrada — ambiente nao e CloudShell." >&2
  echo "      Vide specs/foundation/SPEC.md §10 (FR-FOUND-01)." >&2
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_URL="https://token.actions.githubusercontent.com"
OIDC_THUMBPRINT="6938fd4d98bab03faadb97b34396831e3780aea1"
ROLE_NAME="github-actions-portfolio-bootstrap"
POLICY_ARN="arn:aws:iam::aws:policy/AdministratorAccess"
REPO_SUB="repo:marcoaureliomenezes/portifolio:*"

echo "=== Bootstrap OIDC — conta AWS: ${ACCOUNT_ID} ==="

# ------------------------------------------------------------------------------
# Passo 1: OIDC Identity Provider (idempotente)
# ------------------------------------------------------------------------------
echo ""
echo "[1/3] Verificando OIDC provider..."

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

# ------------------------------------------------------------------------------
# Passo 2: IAM Role bootstrap (idempotente)
# ------------------------------------------------------------------------------
echo ""
echo "[2/3] Verificando role IAM..."

TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${OIDC_ARN}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "${REPO_SUB}"
        }
      }
    }
  ]
}
EOF
)

if aws iam get-role --role-name "${ROLE_NAME}" > /dev/null 2>&1; then
  echo "      Role '${ROLE_NAME}' ja existe — pulando criacao."
  ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text)
else
  echo "      Criando role '${ROLE_NAME}'..."
  ROLE_ARN=$(aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document "${TRUST_POLICY}" \
    --description "Bootstrap role para primeiro terraform apply via OIDC. Deletar apos T-DEVOPS-13." \
    --tags "Key=ManagedBy,Value=bootstrap-oidc.sh" "Key=DeleteAfter,Value=T-DEVOPS-13" \
    --query 'Role.Arn' \
    --output text)
  echo "      Role criada: ${ROLE_ARN}"
fi

# ------------------------------------------------------------------------------
# Passo 3: Attach AdministratorAccess (idempotente)
# ------------------------------------------------------------------------------
echo ""
echo "[3/3] Verificando policy AdministratorAccess..."

ATTACHED=$(aws iam list-attached-role-policies \
  --role-name "${ROLE_NAME}" \
  --query "AttachedPolicies[?PolicyArn=='${POLICY_ARN}'].PolicyArn" \
  --output text)

if [[ -n "${ATTACHED}" ]]; then
  echo "      AdministratorAccess ja anexada — pulando attach."
else
  echo "      Anexando AdministratorAccess..."
  aws iam attach-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-arn "${POLICY_ARN}"
  echo "      Policy anexada."
fi

# ------------------------------------------------------------------------------
# Resultado
# ------------------------------------------------------------------------------
echo ""
echo "=== Bootstrap concluido ==="
echo ""
echo "Copie a linha abaixo e execute LOCALMENTE (usa GitHub token, nao AWS creds):"
echo ""
echo "BOOTSTRAP_ROLE_ARN=${ROLE_ARN}"
echo ""
echo "Proximos passos (sem credenciais AWS locais):"
echo "  gh secret set AWS_ROLE_ARN_STAGE --env stage      --body '${ROLE_ARN}'"
echo "  gh secret set AWS_ROLE_ARN       --env production --body '${ROLE_ARN}'"
echo ""
echo "Depois feche esta sessao CloudShell."
echo "O proximo passo (T-DEVOPS-08) e exclusivamente via GitHub Actions."
