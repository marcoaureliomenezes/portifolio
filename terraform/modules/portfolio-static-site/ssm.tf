# ==============================================================================
# SSM — nomes lidos pelo sync do painel (us-east-1, um ambiente por stack)
# ==============================================================================

resource "aws_ssm_parameter" "bucket" {
  provider = aws.us_east_1

  name  = "/static-sites/${var.site}/${var.environment}/bucket"
  type  = "String"
  value = aws_s3_bucket.website.bucket

  tags = local.common_tags
}

resource "aws_ssm_parameter" "distribution_id" {
  provider = aws.us_east_1

  name  = "/static-sites/${var.site}/${var.environment}/distribution-id"
  type  = "String"
  value = aws_cloudfront_distribution.website.id

  tags = local.common_tags
}
