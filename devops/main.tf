terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.60.0"
    }

  }

  backend "s3" {
    bucket = "dadaia-s3-bucket-terraform-rm-state"
    key    = "aws-portifolio/terraform.tfstate"
    region = "sa-east-1"
  }
}


provider "aws" {
  region = "sa-east-1"
  default_tags {
    tags = {
      owner      = "marco-menezes"
      managed-by = "Terraform"
    }
  }
}