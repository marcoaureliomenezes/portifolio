# Route53 DNS record pointing to CloudFront distribution
resource "aws_route53_record" "portfolio" {
  zone_id = data.aws_route53_zone.portfolio.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio.hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [
    aws_cloudfront_distribution.portfolio
  ]
}

# Optional: WWW subdomain redirect to main domain
resource "aws_route53_record" "portfolio_www" {
  zone_id = data.aws_route53_zone.portfolio.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.portfolio.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio.hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [
    aws_cloudfront_distribution.portfolio
  ]
}

# Health check for monitoring (optional but recommended for production)
resource "aws_route53_health_check" "portfolio" {
  fqdn                            = var.domain_name
  port                            = 443
  type                            = "HTTPS"
  resource_path                   = "/"
  failure_threshold               = "3"
  request_interval                = "30"
  cloudwatch_alarm_region         = var.aws_region
  cloudwatch_alarm_name           = "${var.project_name}-health-check"
  insufficient_data_health_status = "Failure"

  tags = merge(var.tags, {
    Name = "${var.project_name}-health-check"
  })
}

# CloudWatch alarm for health check
resource "aws_cloudwatch_metric_alarm" "portfolio_health" {
  alarm_name          = "${var.project_name}-health-check-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "This metric monitors portfolio health check"
  alarm_actions       = [] # Add SNS topic ARN here if you want notifications

  dimensions = {
    HealthCheckId = aws_route53_health_check.portfolio.id
  }

  tags = var.tags
}
