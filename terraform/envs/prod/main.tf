provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "marco-portfolio"
      Environment = "prod"
      ManagedBy   = "Terraform"
      Owner       = "Marco Menezes"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "marco-portfolio"
      Environment = "prod"
      ManagedBy   = "Terraform"
      Owner       = "Marco Menezes"
    }
  }
}

module "portfolio" {
  source = "../../modules/portfolio-static-site"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment            = "prod"
  aws_region             = var.aws_region
  domain_name            = var.domain_name
  subdomain              = ""
  cloudfront_price_class = var.cloudfront_price_class
  project_name           = var.project_name
  enable_versioning      = var.enable_versioning
  backup_retention_days  = var.backup_retention_days
}

variable "aws_region" {
  type    = string
  default = "sa-east-1"
}

variable "domain_name" {
  type = string
}

variable "cloudfront_price_class" {
  type    = string
  default = "PriceClass_100"
}

variable "project_name" {
  type    = string
  default = "marco-portfolio"
}

variable "enable_versioning" {
  type    = bool
  default = true
}

variable "backup_retention_days" {
  type    = number
  default = 90
}

output "cloudfront_distribution_id" {
  value = module.portfolio.cloudfront_distribution_id
}

output "github_actions_role_arn" {
  value = module.portfolio.github_actions_role_arn
}

output "custom_domain_url" {
  value = module.portfolio.custom_domain_url
}
