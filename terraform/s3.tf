# =====================================================
# S3 BUCKET PARA HOSPEDAGEM ESTÁTICA
# =====================================================
# 
# Bucket S3 configurado para hospedagem de site estático
# com versionamento, regras de ciclo de vida e transição de classes.
# =====================================================

# Bucket principal para o site
resource "aws_s3_bucket" "website" {
  bucket = local.bucket_name

  tags = merge(local.common_tags, {
    Name        = local.bucket_name
    Purpose     = "Static Website Hosting"
  })
}

# =====================================================
# CONFIGURAÇÕES DO BUCKET
# =====================================================

# Versionamento habilitado
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  
  versioning_configuration {
    status = "Enabled"
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

# Configuração para hospedagem de site estático
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Configuração de acesso público (deve vir antes da política)
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política de acesso público para o bucket (necessário para site estático)
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  
  # Depende da configuração de acesso público
  depends_on = [aws_s3_bucket_public_access_block.website]
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = ["${aws_s3_bucket.website.arn}/*"]
      }
    ]
  })
}

# Configuração CORS básica
resource "aws_s3_bucket_cors_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Regras de ciclo de vida para transição de classes e deleção de versões antigas
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id
  
  # Depende do versionamento estar habilitado
  depends_on = [aws_s3_bucket_versioning.website]

  rule {
    id     = "transition-to-ia-and-cleanup"
    status = "Enabled"
    
    # Filtro vazio (aplica a todos os objetos)
    filter {}

    # Transição para IA quando não for a versão atual
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    # Deleção de versões mais antigas que 3
    noncurrent_version_expiration {
      noncurrent_days = 90
      newer_noncurrent_versions = 3
    }
    
    # Limpar uploads incompletos após 7 dias
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
