import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const lines = readFileSync(resolve(__dirname, "../../terraform/modules/portfolio-static-site/iam.tf"), "utf8").split("\n");

function block(header: string): string {
  const start = lines.indexOf(header);
  return lines.slice(start, start + lines.slice(start).indexOf("}") + 1).join("\n");
}

describe("deploy role", () => {
  it("is exactly this block, under the permissions boundary", () => {
    expect(block('resource "aws_iam_role" "github_actions_deploy" {')).toBe(
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
    expect(block('resource "aws_iam_role_policy" "github_actions_deploy" {')).toBe(
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
          "s3:PutObjectAcl",
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
});
