import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const lines = readFileSync(resolve(__dirname, "../../.github/workflows/terraform.yml"), "utf8").split("\n");
const matching = (re: RegExp) => lines.filter((l) => re.test(l)).map((l) => l.trim());

describe("terraform workflow: one dispatched apply on the infra role", () => {
  it("is triggered by workflow_dispatch only", () => {
    expect(matching(/^ {2}(pull_request|push|workflow_dispatch):/)).toEqual(["workflow_dispatch:"]);
  });

  it("binds only the infra environment", () => {
    expect(matching(/^\s*environment:/)).toEqual(["environment: infra"]);
  });

  it("assumes only the one apply role variable", () => {
    expect(matching(/^\s*role-to-assume:/)).toEqual(["role-to-assume: ${{ vars.AWS_ROLE_ARN }}"]);
  });

  it("checks that nothing is deleted or replaced before it applies", () => {
    const guard = lines.findIndex((l) => l.includes('index("delete") | not'));
    const apply = lines.findIndex((l) => /^\s*-?\s*(run:\s*)?terraform apply\b/.test(l));
    expect(guard).toBeGreaterThan(-1);
    expect(apply).toBeGreaterThan(guard);
  });
});
