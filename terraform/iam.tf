# =====================================================
# IAM USER E POLÍTICAS PARA PORTFÓLIO
# =====================================================
# 
# Usuário IAM dedicado para manutenção do portfólio
# com permissões restritas apenas ao bucket S3 do site.
# =====================================================

# Usuário IAM para manutenção do portfólio
resource "aws_iam_user" "portfolio_maintainer" {
  count = var.create_iam_user ? 1 : 0
  
  name = var.iam_user_name
  path = "/"

  tags = merge(local.common_tags, {
    Name        = var.iam_user_name
    Purpose     = "Portfolio S3 Bucket Management"
    Description = "Usuário dedicado para upload e manutenção do site do portfólio"
  })
}

# NOTA: Access Keys devem ser criadas manualmente via AWS Console
# para maior segurança. Nunca armazene credenciais no Terraform state.

# Política IAM com privilégios mínimos para deploy via GitHub Actions
resource "aws_iam_policy" "portfolio_s3_deploy" {
  count = var.create_iam_user ? 1 : 0
  
  name        = "PortfolioS3DeployPolicy"
  path        = "/"
  description = "Política com privilégios mínimos para deploy do portfólio via GitHub Actions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListPortfolioBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.website.arn
      },
      {
        Sid    = "ManagePortfolioObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name    = "PortfolioS3DeployPolicy"
    Purpose = "Minimal S3 Deploy Access for GitHub Actions"
  })
}

# Anexar a política de deploy ao usuário
resource "aws_iam_user_policy_attachment" "portfolio_maintainer_s3_deploy" {
  count = var.create_iam_user ? 1 : 0
  
  user       = aws_iam_user.portfolio_maintainer[0].name
  policy_arn = aws_iam_policy.portfolio_s3_deploy[0].arn
}

# Política para invalidação de cache do CloudFront (opcional)
resource "aws_iam_policy" "portfolio_cloudfront_invalidation" {
  count = var.create_iam_user ? 1 : 0
  
  name        = "PortfolioCloudFrontInvalidationPolicy"
  path        = "/"
  description = "Política para invalidação de cache do CloudFront após deploy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "InvalidatePortfolioDistribution"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = aws_cloudfront_distribution.website.arn
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name    = "PortfolioCloudFrontInvalidationPolicy"
    Purpose = "CloudFront Cache Invalidation for Deploy"
  })
}

# Anexar a política do CloudFront ao usuário
resource "aws_iam_user_policy_attachment" "portfolio_maintainer_cloudfront" {
  count = var.create_iam_user ? 1 : 0
  
  user       = aws_iam_user.portfolio_maintainer[0].name
  policy_arn = aws_iam_policy.portfolio_cloudfront_invalidation[0].arn
}
