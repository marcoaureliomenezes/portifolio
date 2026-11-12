import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const lines = readFileSync(resolve(__dirname, "../../terraform/modules/portfolio-static-site/iam.tf"), "utf8").split("\n");
const start = lines.findIndex((l) => /^resource "aws_iam_role_policy" "github_actions_deploy"/.test(l));
const policy = lines.slice(start, start + lines.slice(start).findIndex((l) => l === "}") + 1);

describe("deploy role policy", () => {
  it("is found in iam.tf", () => {
    expect(start).toBeGreaterThan(-1);
    expect(policy.length).toBeGreaterThan(3);
  });

  it("uses only the statement keys Sid, Effect, Action, Resource", () => {
    const keys = policy.flatMap((l) => l.match(/^ {8}([A-Za-z]+)\s*=/)?.slice(1) ?? []);
    expect([...new Set(keys)].sort()).toEqual(["Action", "Effect", "Resource", "Sid"]);
  });

  it("grants exactly the deploy actions, whatever their shape", () => {
    const values = [...policy.join("\n").matchAll(/\bAction\s*=\s*(\[[^\]]*\]|"[^"]*")/g)].flatMap((m) => m[1].match(/"[^"]*"/g) ?? []);
    expect(values.map((v) => v.slice(1, -1)).sort()).toEqual([
      "cloudfront:CreateInvalidation",
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject",
      "s3:PutObjectAcl",
    ]);
  });

  it("grants on exactly the bucket, its objects and the distribution", () => {
    const resources = policy.filter((l) => /^\s*Resource\s*=/.test(l)).map((l) => l.replace(/^\s*Resource\s*=\s*/, "").trim());
    expect(resources.sort()).toEqual([
      '"${aws_s3_bucket.website.arn}/*"',
      "aws_cloudfront_distribution.website.arn",
      "aws_s3_bucket.website.arn",
    ]);
  });
});
