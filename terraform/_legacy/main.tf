# =====================================================
# PORTFÓLIO MARCO MENEZES - INFRAESTRUTURA AWS SIMPLIFICADA
# =====================================================
# 
# Este arquivo define a infraestrutura para hospedagem do portfólio
# usando apenas um bucket S3 para hospedagem estática.
#
# Componentes:
# - S3 bucket para hospedagem estática com versionamento e regras de ciclo de vida
# =====================================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Usando backend local para simplificar
  backend "s3" {
    bucket = "dadaia-s3-bucket-terraform-rm-state"
    key    = "portifolio/terraform.tfstate"
    region = "sa-east-1"
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

# Provider adicional para us-east-1 (necessário para certificados ACM CloudFront)
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
# LOCALS
# =====================================================


