# =====================================================
# OUTPUTS DE INFRAESTRUTURA
# =====================================================
# 
# Este arquivo define os outputs importantes da 
# infraestrutura criada.
# =====================================================

output "website_url" {
  description = "URL principal do website"
  value       = "https://${var.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "ID da distribuição CloudFront"
  value       = aws_cloudfront_distribution.portfolio.id
}

output "cloudfront_domain_name" {
  description = "Domain name da distribuição CloudFront"
  value       = aws_cloudfront_distribution.portfolio.domain_name
}

output "s3_bucket_name" {
  description = "Nome do bucket S3"
  value       = aws_s3_bucket.portfolio.bucket
}

output "s3_bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.portfolio.arn
}

output "s3_bucket_regional_domain_name" {
  description = "Domain name regional do bucket S3"
  value       = aws_s3_bucket.portfolio.bucket_regional_domain_name
}

output "acm_certificate_arn" {
  description = "ARN do certificado ACM"
  value       = aws_acm_certificate.portfolio.arn
}

output "route53_zone_id" {
  description = "Zone ID do Route53"
  value       = data.aws_route53_zone.portfolio.zone_id
}

output "route53_name_servers" {
  description = "Name servers do Route53"
  value       = data.aws_route53_zone.portfolio.name_servers
}

output "health_check_id" {
  description = "ID do health check do Route53"
  value       = aws_route53_health_check.portfolio.id
}

# Informações de deployment
output "deployment_info" {
  description = "Informações úteis para deployment"
  value = {
    website_url                    = "https://${var.domain_name}"
    s3_sync_command               = "aws s3 sync ./frontend s3://${aws_s3_bucket.portfolio.bucket} --delete"
    cloudfront_invalidation_command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio.id} --paths '/*'"
  }
}

# Status da infraestrutura
output "infrastructure_status" {
  description = "Status geral da infraestrutura"
  value = {
    s3_bucket_created      = aws_s3_bucket.portfolio.bucket
    cloudfront_enabled     = aws_cloudfront_distribution.portfolio.enabled
    ssl_certificate_status = aws_acm_certificate.portfolio.status
    dns_configured         = length(aws_route53_record.portfolio.name) > 0
    environment           = var.environment
    region               = var.aws_region
  }
}
