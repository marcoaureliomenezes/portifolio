# ==============================================================================
# CloudFront Response Headers Policy — security hardening
#
# Applied to default_cache_behavior on the CloudFront distribution.
#
# CSP rationale:
#   - SPA bundles all JS, CSS, and fonts via Vite (no external CDN dependencies)
#   - Fonts served from /assets/ (bundled by @fontsource packages)
#   - shadcn/radix components use React inline style props (CSS custom variables)
#     which render as HTML style attributes → requires 'unsafe-inline' for style-src
#   - External links (LinkedIn, GitHub, Credly) are plain <a href> — not CSP-governed
#   - No analytics SDK yet; connect-src will expand in Phase D when analytics integrates
#
# Permissions-Policy: camera, microphone, geolocation, payment all denied.
# Tailwind uses a single external CSS file (<link rel="stylesheet">) — no style injection.
# ==============================================================================

locals {
  csp_string = join("; ", [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ])
}

resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "portfolio-${var.environment}-security-headers"
  comment = "Security headers for ${local.domain} — managed by Terraform"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    content_type_options {
      override = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }

  custom_headers_config {
    # Permissions-Policy — not yet in CloudFront native security_headers_config
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=(), payment=()"
      override = true
    }

    # Content-Security-Policy — use custom_headers_config for full CSP string control
    items {
      header   = "Content-Security-Policy"
      value    = local.csp_string
      override = true
    }
  }
}
