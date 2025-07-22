# =====================================================
# VARIÁVEIS DE CONFIGURAÇÃO
# =====================================================
# 
# Este arquivo define todas as variáveis utilizadas
# na infraestrutura do portfólio.
# =====================================================

variable "aws_region" {
  description = "Região AWS principal para os recursos"
  type        = string
  default     = "us-east-1"
  
  validation {
    condition = contains([
      "us-east-1", "us-west-1", "us-west-2", 
      "eu-west-1", "eu-central-1", "sa-east-1"
    ], var.aws_region)
    error_message = "A região deve ser uma das regiões AWS válidas."
  }
}

variable "environment" {
  description = "Ambiente de deployment (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment deve ser: dev, staging ou prod."
  }
}

variable "domain_name" {
  description = "Nome do domínio principal (ex: marco-menezes.com)"
  type        = string
  default     = "marco-menezes.com"
  
  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain_name))
    error_message = "Domain name deve ser um domínio válido (ex: marco-menezes.com)."
  }
}

variable "subdomain" {
  description = "Subdomínio para o portfólio (ex: portifolio)"
  type        = string
  default     = "portifolio"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.subdomain))
    error_message = "Subdomain deve conter apenas letras minúsculas, números e hífens."
  }
}

variable "project_name" {
  description = "Nome do projeto (usado em recursos e tags)"
  type        = string
  default     = "marco-portfolio"
}

variable "enable_versioning" {
  description = "Habilitar versionamento no bucket S3"
  type        = bool
  default     = true
}

variable "enable_deletion_protection" {
  description = "Habilitar proteção contra deleção do bucket"
  type        = bool
  default     = true
}

variable "enable_cloudfront" {
  description = "Habilitar CloudFront CDN"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "Classe de preço do CloudFront"
  type        = string
  default     = "PriceClass_100"  # Mais barato (US, Canadá, Europa)
  
  validation {
    condition = contains([
      "PriceClass_All", 
      "PriceClass_200", 
      "PriceClass_100"
    ], var.cloudfront_price_class)
    error_message = "Price class deve ser: PriceClass_All, PriceClass_200 ou PriceClass_100."
  }
}

variable "ssl_certificate_validation_method" {
  description = "Método de validação do certificado SSL"
  type        = string
  default     = "DNS"
  
  validation {
    condition     = contains(["DNS", "EMAIL"], var.ssl_certificate_validation_method)
    error_message = "Validation method deve ser: DNS ou EMAIL."
  }
}

variable "default_root_object" {
  description = "Objeto raiz padrão (página inicial)"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Página de erro personalizada"
  type        = string
  default     = "error.html"
}

variable "cors_allowed_origins" {
  description = "Origens permitidas para CORS"
  type        = list(string)
  default     = ["*"]
}

variable "cors_allowed_methods" {
  description = "Métodos HTTP permitidos para CORS"
  type        = list(string)
  default     = ["GET", "HEAD"]
}

variable "backup_retention_days" {
  description = "Dias de retenção para backups"
  type        = number
  default     = 90
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 365
    error_message = "Retention days deve estar entre 1 e 365."
  }
}

# =====================================================
# VARIÁVEIS DE TAGS
# =====================================================

variable "additional_tags" {
  description = "Tags adicionais para aplicar aos recursos"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags comuns para todos os recursos AWS"
  type        = map(string)
  default = {
    Environment = "prod"
    Project     = "marco-portfolio"
    Owner       = "Marco Menezes"
    ManagedBy   = "Terraform"
  }
}
