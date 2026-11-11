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

  it("grants no access to the Terraform state", () => {
    expect(policy.filter((l) => /terraform|tfstate|\bstate\b|-state/i.test(l)).map((l) => l.trim())).toEqual([]);
  });
});
