# ==============================================================================
# S3 bucket policy
#
# Dois principals autorizados:
#   1. CloudFront (OAC) — s3:GetObject para servir o site
#   2. IAM role GitHub Actions — deploy (sync + delete)
# Todo o restante e negado implicitamente.
# ==============================================================================

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
        # s3:PutObjectAcl removed (F-01-01): bucket public access is blocked and
        # served exclusively via CloudFront OAC. Object ACLs are never applied.
        Sid    = "AllowGitHubActionsOIDCRoleDeploy"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.github_actions_deploy.arn
        }
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*",
        ]
      }
    ]
  })
}
