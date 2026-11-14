import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const moduleDir = resolve(__dirname, "../../terraform/modules/portfolio-static-site");
const read = (file: string) => readFileSync(resolve(moduleDir, file), "utf8").split("\n");

function block(file: string, header: string): string {
  const lines = read(file);
  const start = lines.indexOf(header);
  return lines.slice(start, start + lines.slice(start).indexOf("}") + 1).join("\n");
}

describe("deploy role", () => {
  it("is exactly this block, under the permissions boundary", () => {
    expect(block("iam.tf", 'resource "aws_iam_role" "github_actions_deploy" {')).toBe(
`resource "aws_iam_role" "github_actions_deploy" {
  name                 = "github-actions-portfolio-\${var.environment}-deploy"
  permissions_boundary = "arn:\${data.aws_partition.current.partition}:iam::\${data.aws_caller_identity.current.account_id}:policy/portifolio-roles-boundary"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "\${local.oidc_prefix}:environment:\${local.github_environment}"
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name    = "github-actions-portfolio-\${var.environment}-deploy"
    Purpose = "Role assumida pelo GitHub Actions para deploy do portfolio"
  })
}`,
    );
  });

  it("carries exactly this policy", () => {
    expect(block("iam.tf", 'resource "aws_iam_role_policy" "github_actions_deploy" {')).toBe(
`resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "portfolio-\${var.environment}-deploy-policy"
  role = aws_iam_role.github_actions_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListPortfolioBucket"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.website.arn
      },
      {
        Sid    = "ManagePortfolioObjects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject",
        ]
        Resource = "\${aws_s3_bucket.website.arn}/*"
      },
      {
        Sid      = "InvalidateCloudFrontCache"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.website.arn
      }
    ]
  })
}`,
    );
  });

  it("is the only IAM resource in the module", () => {
    const headers = readdirSync(moduleDir)
      .filter((f) => f.endsWith(".tf"))
      .flatMap(read)
      .flatMap((l) => l.match(/^resource "(aws_iam_[a-z_]+)" "([^"]+)" \{$/)?.slice(1).join(".") ?? [])
      .sort();
    expect(headers).toEqual(["aws_iam_role.github_actions_deploy", "aws_iam_role_policy.github_actions_deploy"]);
  });

  it("grants the bucket policy exactly this block", () => {
    expect(block("s3_policies.tf", 'resource "aws_s3_bucket_policy" "website" {')).toBe(
`resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  depends_on = [aws_s3_bucket_public_access_block.website]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "\${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      },
      {
        Sid    = "AllowGitHubActionsOIDCRoleDeploy"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.github_actions_deploy.arn
        }
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "\${aws_s3_bucket.website.arn}/*",
        ]
      }
    ]
  })
}`,
    );
  });
});
