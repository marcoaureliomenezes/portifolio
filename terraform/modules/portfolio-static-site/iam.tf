# ==============================================================================
# IAM — role OIDC para GitHub Actions (deploy final)
#
# Esta role e criada pelo terraform no primeiro apply.
# A trust policy aceita so o subject do environment GitHub deste env
# (StringEquals em environment:<nome>), nunca um ref qualquer do repo:
# PRs e outros jobs nao assumem a role. Prod ainda exige aprovacao manual.
# Ref: specs/foundation/SPEC.md §5 (DEV-03).
# ==============================================================================

data "aws_caller_identity" "current" {}

# OIDC provider é account-wide (compartilhado entre todos os envs e repos).
# Criado uma vez por scripts/bootstrap-oidc.sh, que cria só o provider (a role de apply é do bootstrap do painel).
# Referenciado aqui via data source para não conflitar entre envs.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
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
            "token.actions.githubusercontent.com:sub" = "${local.oidc_prefix}:environment:${local.github_environment}"
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
        Sid    = "ManagePortfolioObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
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
      }
    ]
  })
}
