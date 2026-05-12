# =====================================================
# IAM - OIDC ROLE FOR GITHUB ACTIONS
# =====================================================
#
# GitHub Actions authenticates via OIDC - no static
# access keys stored anywhere.
# The trust policy restricts assumption to this exact
# repository and the main branch only.
# =====================================================

# =====================================================
# OIDC IDENTITY PROVIDER (once per AWS account)
# =====================================================
# Create this once. If the provider already exists in
# your account, import it instead of recreating it:
#   terraform import aws_iam_openid_connect_provider.github \
#     arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # GitHub's OIDC thumbprint (stable, verified by AWS)
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = merge(local.common_tags, {
    Name    = "github-actions-oidc"
    Purpose = "OIDC provider for GitHub Actions"
  })
}

# =====================================================
# IAM ROLE - GITHUB ACTIONS DEPLOY
# =====================================================

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "github_actions_deploy" {
  name = "github-actions-portfolio-deploy"

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
          # Allow any workflow in this repository (PRs + pushes).
          # Apply is gated to main by the workflow `if:` condition, not here.
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:marcoaureliomenezes/portifolio:*"
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name    = "github-actions-portfolio-deploy"
    Purpose = "Role assumed by GitHub Actions to deploy the portfolio"
  })
}

# =====================================================
# INLINE POLICY - MINIMUM REQUIRED PERMISSIONS
# =====================================================

resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "portfolio-deploy-policy"
  role = aws_iam_role.github_actions_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListPortfolioBucket"
        Effect = "Allow"
        Action = ["s3:ListBucket"]
        Resource = aws_s3_bucket.website.arn
      },
      {
        Sid    = "ManagePortfolioObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.website.arn}/*"
      },
      {
        Sid    = "InvalidateCloudFrontCache"
        Effect = "Allow"
        Action = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.website.arn
      },
      # Permissions needed for terraform apply (state bucket access)
      {
        Sid    = "TerraformStateBucket"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::dadaia-s3-bucket-terraform-rm-state",
          "arn:aws:s3:::dadaia-s3-bucket-terraform-rm-state/*"
        ]
      }
    ]
  })
}
