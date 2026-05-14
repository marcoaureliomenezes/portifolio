# ==============================================================================
# IAM — role OIDC para GitHub Actions (deploy final)
#
# Esta role e criada pelo terraform no primeiro apply.
# A trust policy permite qualquer ref do repo (PRs + pushes).
# A seguranca de prod e dada pelo environment GitHub exigir aprovacao manual.
# Ref: specs/foundation/SPEC.md §5 (DEV-03).
# ==============================================================================

data "aws_caller_identity" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = merge(local.common_tags, {
    Name    = "github-actions-oidc"
    Purpose = "OIDC provider for GitHub Actions"
  })
}

resource "aws_iam_role" "github_actions_deploy" {
  name = "github-actions-portfolio-${var.environment}-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:marcoaureliomenezes/portifolio:*"
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
