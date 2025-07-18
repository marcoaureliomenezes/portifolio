# =====================================================
# AWS CERTIFICATE MANAGER (ACM) - SSL/TLS
# =====================================================
# 
# Certificado SSL gratuito da AWS para HTTPS.
# IMPORTANTE: Deve ser criado em us-east-1 para CloudFront.
# =====================================================

# Certificado SSL para o domínio principal e www
resource "aws_acm_certificate" "website" {
  # OBRIGATÓRIO: CloudFront requer certificados em us-east-1
  provider = aws.us_east_1
  
  domain_name               = local.website_domain
  subject_alternative_names = ["www.${local.website_domain}"]
  validation_method         = var.ssl_certificate_validation_method

  # Renovação automática
  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name    = "${var.project_name}-${var.environment}-ssl-cert"
    Purpose = "SSL Certificate for CloudFront"
    Domain  = local.website_domain
  })
}

# =====================================================
# VALIDAÇÃO DNS DO CERTIFICADO
# =====================================================

# Registros DNS para validação do certificado
resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id

  depends_on = [aws_acm_certificate.website]
}

# Aguardar validação do certificado
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1
  
  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]

  timeouts {
    create = "10m"
  }

  lifecycle {
    create_before_destroy = true
  }
}
