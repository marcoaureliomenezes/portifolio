# =====================================================
# POLÍTICAS DO S3 BUCKET
# =====================================================
#
# Two principals are allowed:
#  1. CloudFront (OAC) — read objects to serve the site
#  2. GitHub Actions OIDC role — write/delete objects to deploy
# All other access is implicitly denied.
# =====================================================

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  depends_on = [aws_s3_bucket_public_access_block.website]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      },
      {
        Sid    = "AllowGitHubActionsOIDCRoleDeploy"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.github_actions_deploy.arn
        }
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*"
        ]
      }
    ]
  })
}
