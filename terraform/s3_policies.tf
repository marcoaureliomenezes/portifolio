# =====================================================
# POLÍTICAS DO S3 BUCKET
# =====================================================
# 
# Este arquivo contém todas as políticas relacionadas ao
# bucket S3 do portfólio, organizadas por função.
# =====================================================

# =====================================================
# POLÍTICA ÚNICA DO BUCKET (CONDICIONAL)
# =====================================================

# Política básica quando não há usuário IAM (apenas CloudFront)
resource "aws_s3_bucket_policy" "website_basic" {
  count  = var.create_iam_user ? 0 : 1
  bucket = aws_s3_bucket.website.id
  
  depends_on = [aws_s3_bucket_public_access_block.website]
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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

# Política completa quando há usuário IAM (CloudFront + Deploy)
resource "aws_s3_bucket_policy" "website_with_deploy" {
  count  = var.create_iam_user ? 1 : 0
  bucket = aws_s3_bucket.website.id
  
  depends_on = [aws_s3_bucket_public_access_block.website]
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Permite CloudFront acessar o bucket
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
      },
      
      # Nega upload para todos os usuários exceto o específico
      {
        Sid       = "DenyAllUploadsExceptMaintainer"
        Effect    = "Deny"
        Principal = "*"
        Action    = [
          "s3:PutObject",
          "s3:PutObjectAcl", 
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringNotEquals = {
            "aws:username" = var.iam_user_name
          }
        }
      },
      
      # Permite apenas o usuário específico fazer upload
      {
        Sid    = "AllowPortfolioMaintainerUpload"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_user.portfolio_maintainer[0].arn
        }
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*"
        ]
      }
    ]
  })
}

# =====================================================
# COMENTÁRIOS SOBRE SEGURANÇA
# =====================================================

# IMPORTANTE: Esta configuração garante que:
# 1. Apenas o CloudFront pode servir o conteúdo (não há acesso público direto)
# 2. Apenas o usuário 'portifolio-maintainer' pode fazer upload (quando habilitado)
# 3. Todos os outros acessos de escrita são negados explicitamente
# 4. O bucket não permite acesso público direto, aumentando a segurança

# Para deploy via GitHub Actions, use apenas as credenciais do usuário IAM
# As credenciais devem ser armazenadas como secrets do GitHub

# Para testar localmente:
# aws s3 sync ./frontend/dist s3://bucket-name --delete --profile portfolio-maintainer
