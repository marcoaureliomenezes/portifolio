# =====================================================
# S3 BUCKET PARA HOSPEDAGEM ESTÁTICA
# =====================================================
# 
# Bucket S3 configurado para hospedagem de site estático
# com versionamento, proteção contra deleção e CORS.
# =====================================================

# Bucket principal para o site
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-${var.environment}-website"

  # Proteção contra deleção acidental
  lifecycle {
    prevent_destroy = true
  }

  tags = merge(local.common_tags, {
    Name        = "${var.project_name}-${var.environment}-website"
    Purpose     = "Static Website Hosting"
    PublicRead  = "true"
  })
}

# =====================================================
# CONFIGURAÇÕES DO BUCKET
# =====================================================

# Versionamento habilitado
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  
  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Disabled"
  }
}

# Criptografia server-side
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Configuração de hospedagem estática
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = var.default_root_object
  }

  error_document {
    key = var.error_document
  }

  routing_rule {
    condition {
      key_prefix_equals = "docs/"
    }
    redirect {
      replace_key_prefix_with = "documents/"
    }
  }
}

# Bloqueio de acesso público (será gerenciado via CloudFront)
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  # Permitir acesso público via CloudFront
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política do bucket para CloudFront e acesso público
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  
  # Depende do bloqueio de acesso público estar configurado
  depends_on = [aws_s3_bucket_public_access_block.website]

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "PolicyForWebsiteEndpointsPublicAccess"
    
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
        
        Condition = {
          StringEquals = {
            "AWS:SourceIp" = "0.0.0.0/0"
          }
        }
      },
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}

# =====================================================
# CONFIGURAÇÃO CORS
# =====================================================

resource "aws_s3_bucket_cors_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = var.cors_allowed_methods
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# =====================================================
# LIFECYCLE CONFIGURATION
# =====================================================

resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id
  
  # Depende do versionamento estar habilitado
  depends_on = [aws_s3_bucket_versioning.website]

  rule {
    id     = "delete_old_versions"
    status = "Enabled"

    # Manter apenas as últimas 5 versões
    noncurrent_version_expiration {
      noncurrent_days = var.backup_retention_days
    }

    # Deletar uploads incompletos após 1 dia
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }

  rule {
    id     = "intelligent_tiering"
    status = "Enabled"

    # Aplicar a todos os objetos
    filter {}

    # Transição para Intelligent Tiering
    transition {
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }
  }
}

# =====================================================
# LOGS DE ACESSO (OPCIONAL)
# =====================================================

# Bucket para logs de acesso
resource "aws_s3_bucket" "access_logs" {
  bucket = "${var.project_name}-${var.environment}-access-logs"

  tags = merge(local.common_tags, {
    Name    = "${var.project_name}-${var.environment}-access-logs"
    Purpose = "Access Logs Storage"
  })
}

# Configuração de logs de acesso
resource "aws_s3_bucket_logging" "website" {
  bucket = aws_s3_bucket.website.id

  target_bucket = aws_s3_bucket.access_logs.id
  target_prefix = "access-logs/"
}
