output "website_bucket_name" {
  description = "Nome do bucket S3 do website"
  value       = aws_s3_bucket.website.bucket
}

output "s3_bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.website.arn
}

output "cloudfront_distribution_id" {
  description = "ID da distribuicao CloudFront. Usar em CLOUDFRONT_DISTRIBUTION_ID secret."
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Domain name gerado pelo CloudFront"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_url" {
  description = "URL HTTPS do CloudFront"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "custom_domain_url" {
  description = "URL do dominio customizado (HTTPS)"
  value       = "https://${local.domain}"
}

output "ssl_certificate_arn" {
  description = "ARN do certificado ACM"
  value       = aws_acm_certificate.website.arn
}

output "github_actions_role_arn" {
  description = "ARN da role IAM para GitHub Actions (OIDC). Usar em AWS_ROLE_ARN secret."
  value       = aws_iam_role.github_actions_deploy.arn
}

output "oidc_provider_arn" {
  description = "ARN do OIDC provider do GitHub Actions"
  value       = aws_iam_openid_connect_provider.github.arn
}

output "hosted_zone_id" {
  description = "ID da hosted zone Route53"
  value       = data.aws_route53_zone.main.zone_id
}
