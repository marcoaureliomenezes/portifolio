# ==============================================================================
# ACM — certificado SSL em us-east-1 (requisito CloudFront)
# ==============================================================================

resource "aws_acm_certificate" "website" {
  provider = aws.us_east_1

  domain_name               = local.domain
  subject_alternative_names = var.environment == "prod" ? ["www.${var.domain_name}"] : []
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.domain}-ssl-certificate"
  })
}

resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}
