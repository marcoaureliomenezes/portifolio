terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend parcial: chave injetada via -backend-config no workflow
  # terraform init -backend-config="key=portifolio/stage/terraform.tfstate"
  backend "s3" {}
}
