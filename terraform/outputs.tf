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

# =====================================================
# IAM USER OUTPUTS
# =====================================================

output "iam_user_name" {
  description = "Nome do usuário IAM para manutenção do portfólio"
  value       = var.create_iam_user ? aws_iam_user.portfolio_maintainer[0].name : null
}

output "iam_user_arn" {
  description = "ARN do usuário IAM"
  value       = var.create_iam_user ? aws_iam_user.portfolio_maintainer[0].arn : null
}

# IMPORTANTE: Access Keys devem ser criadas manualmente via AWS Console
output "iam_user_instructions" {
  description = "Instruções para configurar access keys"
  value = var.create_iam_user ? {
    step_1 = "Acesse o AWS Console -> IAM -> Users -> ${aws_iam_user.portfolio_maintainer[0].name}"
    step_2 = "Clique em 'Security credentials' -> 'Create access key'"
    step_3 = "Escolha 'Application running outside AWS' -> 'Create access key'"
    step_4 = "Copie as credenciais e configure nos GitHub Secrets"
    github_secrets = {
      AWS_ACCESS_KEY_ID     = "Cole a Access Key ID aqui"
      AWS_SECRET_ACCESS_KEY = "Cole a Secret Access Key aqui"
      AWS_REGION           = var.aws_region
      S3_BUCKET_NAME       = aws_s3_bucket.website.bucket
      CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.website.id
    }
  } : null
}

output "deployment_commands" {
  description = "Comandos úteis para deployment"
  value = {
    sync_to_s3       = "aws s3 sync ./frontend/dist s3://${aws_s3_bucket.website.bucket} --delete"
    invalidate_cache = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.website.id} --paths '/*'"
    test_website     = "curl -I https://${var.domain_name}"
  }
}
