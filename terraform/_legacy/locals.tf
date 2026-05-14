locals {
  bucket_name = var.domain_name
  
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Marco Menezes"
  }
}