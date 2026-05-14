# =====================================================
# ROUTE 53 - DNS CONFIGURATION
# =====================================================
# 
# Configuração do Route 53 para apontar o domínio raiz
# marco-menezes.com para o CloudFront (HTTPS).
# =====================================================

# Data source para buscar a hosted zone existente
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# Registro A (alias) para apontar o domínio raiz para o CloudFront
resource "aws_route53_record" "portfolio_website_root" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
  
  # Depende da distribuição CloudFront estar pronta
  depends_on = [aws_cloudfront_distribution.website]
}
