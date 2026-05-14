locals {
  env_prefix  = var.environment == "prod" ? "" : "${var.environment}-"
  bucket_name = "${local.env_prefix}portifolio-marco-menezes"
  domain      = var.environment == "prod" ? var.domain_name : "${var.subdomain}.${var.domain_name}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Marco Menezes"
  }
}
