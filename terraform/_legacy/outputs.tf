# =====================================================
# OUTPUTS DE INFRAESTRUTURA
# =====================================================

output "website_bucket_name" {
  description = "Nome do bucket S3 do website"
  value       = aws_s3_bucket.website.bucket
}

output "s3_bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.website.arn
}

output "s3_bucket_region" {
  description = "Região do bucket S3"
  value       = var.aws_region
}

output "s3_website_endpoint" {
  description = "Endpoint do site estático S3"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "custom_domain_url" {
  description = "URL do domínio customizado (HTTPS)"
  value       = "https://${var.domain_name}"
}

# =====================================================
# CLOUDFRONT OUTPUTS
# =====================================================

output "cloudfront_distribution_id" {
  description = "ID da distribuição CloudFront"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Nome de domínio do CloudFront"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_url" {
  description = "URL do CloudFront"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "ssl_certificate_arn" {
  description = "ARN do certificado SSL"
  value       = aws_acm_certificate.website.arn
}

# =====================================================
# IAM OIDC OUTPUTS
# =====================================================

output "github_actions_role_arn" {
  description = "ARN do role IAM para GitHub Actions (OIDC). Use este valor como AWS_ROLE_ARN nos GitHub Secrets."
  value       = aws_iam_role.github_actions_deploy.arn
}

output "oidc_provider_arn" {
  description = "ARN do OIDC provider do GitHub Actions"
  value       = aws_iam_openid_connect_provider.github.arn
}

# =====================================================
# DNS OUTPUTS
# =====================================================

output "dns_info" {
  description = "Informações de DNS e domínio"
  value = {
    hosted_zone_id   = data.aws_route53_zone.main.zone_id
    domain_name      = var.domain_name
    full_domain      = var.domain_name
    website_endpoint = aws_s3_bucket_website_configuration.website.website_endpoint
  }
}

output "deployment_commands" {
  description = "Comandos úteis para verificação"
  value = {
    test_website = "curl -I https://${var.domain_name}"
    list_bucket  = "aws s3 ls s3://${aws_s3_bucket.website.bucket}"
  }
}
