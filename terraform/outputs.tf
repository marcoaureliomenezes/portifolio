# =====================================================
# OUTPUTS DE INFRAESTRUTURA
# =====================================================
# 
# Este arquivo define os outputs importantes da 
# infraestrutura criada (apenas bucket S3).
# =====================================================

output "website_bucket_name" {
  description = "Nome do bucket S3 do website"
  value       = aws_s3_bucket.website.bucket
}

output "website_url" {
  description = "URL do site estático S3"
  value       = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
}

output "s3_bucket_name" {
  description = "Nome do bucket S3 (compatibilidade)"
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

output "s3_website_url" {
  description = "URL do site estático S3"
  value       = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
}

# Informações de deployment
output "deployment_info" {
  description = "Informações úteis para deployment"
  value = {
    website_url       = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
    custom_domain_url = "http://${var.subdomain}.${var.domain_name}"
    s3_sync_command   = "aws s3 sync ./frontend/dist s3://${aws_s3_bucket.website.bucket} --delete"
  }
}

# DNS Information
output "dns_info" {
  description = "Informações de DNS e domínio"
  value = {
    hosted_zone_id    = data.aws_route53_zone.main.zone_id
    domain_name       = var.domain_name
    subdomain         = var.subdomain
    full_domain       = "${var.subdomain}.${var.domain_name}"
    website_endpoint  = aws_s3_bucket_website_configuration.website.website_endpoint
  }
}

# Custom domain URL
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
