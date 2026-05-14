variable "environment" {
  description = "Ambiente de deployment: stage ou prod"
  type        = string

  validation {
    condition     = contains(["stage", "prod"], var.environment)
    error_message = "Environment deve ser 'stage' ou 'prod'."
  }
}

variable "aws_region" {
  description = "Regiao AWS principal para os recursos (ex: sa-east-1)"
  type        = string
  default     = "sa-east-1"
}

variable "domain_name" {
  description = "Dominio raiz (ex: marco-menezes.com)"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain_name))
    error_message = "domain_name deve ser um dominio valido (ex: marco-menezes.com)."
  }
}

variable "subdomain" {
  description = "Subdominio para ambientes nao-prod (ex: stage). Ignorado em prod."
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "Classe de preco do CloudFront"
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_All", "PriceClass_200", "PriceClass_100"], var.cloudfront_price_class)
    error_message = "Price class deve ser: PriceClass_All, PriceClass_200 ou PriceClass_100."
  }
}

variable "project_name" {
  description = "Nome do projeto (usado em tags)"
  type        = string
  default     = "marco-portfolio"
}

variable "enable_versioning" {
  description = "Habilitar versionamento no bucket S3"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Dias de retencao de versoes antigas do S3"
  type        = number
  default     = 90

  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 365
    error_message = "backup_retention_days deve estar entre 1 e 365."
  }
}
