# ==============================================================================
# IAM — role OIDC para GitHub Actions (deploy final)
#
# Security hardening (security-audit-v1 Phase B):
#
# OIDC sub claim narrowing:
#   - prod role: locked to ref:refs/heads/main — only main branch can deploy to prod.
#     This prevents feature branches, PRs, and forks from assuming the prod role.
#     Trade-off: Terraform plan/apply from non-main branches (e.g., for infra PRs)
#     requires either a separate review role or temporary sub widening. Accepted
#     trade-off for production security. Stage role retains wildcard for flexibility.
#   - stage role: retains repo:...:* to allow PR preview deploys.
#
# Ref: specs/foundation/SPEC.md §5 (DEV-03), security-audit-v1 F-05-01.
# ==============================================================================

data "aws_caller_identity" "current" {}

# OIDC provider é account-wide (compartilhado entre todos os envs e repos).
# Provisionado uma vez via scripts/bootstrap-oidc.sh (T-DEVOPS-02).
# Referenciado aqui via data source para não conflitar entre envs.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# prod: locked to main branch only (F-05-01 fix)
# stage: allows any ref in the repo (PR deploys to staging remain possible)
locals {
  oidc_sub_condition = var.environment == "prod" ? (
    "repo:marcoaureliomenezes/portifolio:ref:refs/heads/main"
  ) : (
    "repo:marcoaureliomenezes/portifolio:*"
  )
}

resource "aws_iam_role" "github_actions_deploy" {
  name = "github-actions-portfolio-${var.environment}-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            # prod: only main branch can assume this role
            # stage: any ref in the repo is allowed (PR preview deploys)
            "token.actions.githubusercontent.com:sub" = local.oidc_sub_condition
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name    = "github-actions-portfolio-${var.environment}-deploy"
    Purpose = "Role assumida pelo GitHub Actions para deploy do portfolio"
  })
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "portfolio-${var.environment}-deploy-policy"
  role = aws_iam_role.github_actions_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListPortfolioBucket"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.website.arn
      },
      {
        # s3:PutObjectAcl removed (F-01-01): bucket has public access blocked and
        # serves exclusively via CloudFront OAC. Object ACLs are never needed.
        Sid    = "ManagePortfolioObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject",
        ]
        Resource = "${aws_s3_bucket.website.arn}/*"
      },
      {
        Sid      = "InvalidateCloudFrontCache"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.website.arn
      },
      {
        Sid    = "TerraformStateBucket"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          "arn:aws:s3:::dadaia-s3-bucket-terraform-rm-state",
          "arn:aws:s3:::dadaia-s3-bucket-terraform-rm-state/portifolio/${var.environment}/*",
        ]
      }
    ]
  })
}
