# =====================================================
# PORTFÓLIO MARCO MENEZES - INFRAESTRUTURA AWS
# =====================================================
# 
# Este arquivo define a infraestrutura completa para 
# hospedagem do portfólio com HTTPS e alta disponibilidade.
#
# Componentes:
# - S3 bucket para hospedagem estática
# - CloudFront para CDN e HTTPS
# - Certificate Manager para SSL
# - Route53 para DNS
# =====================================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote State - Backend S3
  # IMPORTANTE: Criar o bucket manualmente antes do primeiro apply
  backend "s3" {
    bucket         = "terraform-state-marco-portfolio"  # Altere para seu bucket
    key            = "portfolio/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-marco-portfolio"  # Para lock
  }
}

# =====================================================
# PROVIDER AWS
# =====================================================
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Marco-Portfolio"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Marco Menezes"
    }
  }
}

# Provider adicional para us-east-1 (necessário para CloudFront certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "Marco-Portfolio"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Marco Menezes"
    }
  }
}

# =====================================================
# DATA SOURCES
# =====================================================

# Zona Route53 existente (você mencionou que já existe)
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# =====================================================
# VARIÁVEIS LOCAIS
# =====================================================
locals {
  website_domain = var.environment == "prod" ? var.domain_name : "${var.environment}.${var.domain_name}"
  
  common_tags = {
    Project     = "Marco-Portfolio"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Marco Menezes"
  }
}
