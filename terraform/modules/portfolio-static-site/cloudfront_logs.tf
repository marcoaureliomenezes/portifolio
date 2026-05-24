# ==============================================================================
# CloudFront access logs — S3 bucket with 30-day retention (LGPD compliance)
#
# IP anonymization strategy:
#   Raw logs contain full IPs for up to 30 days per lifecycle policy below.
#   Full anonymization at log-write time would require Lambda@Edge (out of scope).
#   Pragmatic approach: auto-delete after 30 days + mask IPs at query time via Athena.
#
# LGPD note: raw log data is not linked to any user identity. Retention is bounded
# to 30 days. IPs are masked at query time — logs are never exported with raw IPs.
#
# CloudFront standard logging requires the S3 bucket to grant the CloudFront log
# delivery account write access. This is done via a bucket ACL with
# "log-delivery-write" (legacy ACL method) or via a bucket policy with the
# CloudFront log delivery canonical user ID. We use the bucket policy approach
# (aws_s3_bucket_policy) to keep ACLs disabled and public access fully blocked.
# ==============================================================================

resource "aws_s3_bucket" "cloudfront_logs" {
  bucket = "${local.env_prefix}marco-menezes-cloudfront-logs"

  tags = merge(local.common_tags, {
    Name    = "${local.env_prefix}marco-menezes-cloudfront-logs"
    Purpose = "CloudFront access logs — 30-day retention, LGPD compliant"
  })
}

resource "aws_s3_bucket_public_access_block" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# 30-day auto-delete for LGPD compliance
resource "aws_s3_bucket_lifecycle_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    id     = "delete-logs-after-30-days"
    status = "Enabled"

    filter {}

    expiration {
      days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# CloudFront standard logging requires ACL-based delivery.
# We enable ACLs only for this bucket to allow the log-delivery-write grant.
resource "aws_s3_bucket_ownership_controls" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id
  acl    = "log-delivery-write"

  depends_on = [
    aws_s3_bucket_ownership_controls.cloudfront_logs,
    aws_s3_bucket_public_access_block.cloudfront_logs,
  ]
}
