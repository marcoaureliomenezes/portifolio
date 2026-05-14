# ==============================================================================
# portfolio-static-site — modulo reutilizavel para stage e prod
#
# Nao contem backend block (responsabilidade do env que chama o modulo).
# Providers aws e aws.us_east_1 sao injetados pelo env chamador via
# configuration_aliases (requer terraform >= 1.4).
# ==============================================================================

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}
