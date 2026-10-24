import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const artifact = JSON.parse(
  readFileSync(resolve(root, "public/content/schema/v1.json"), "utf-8"),
);
const contract = artifact.definitions.PortfolioContentV1;

describe("content schema export (v1.json)", () => {
  it("carries the content contract's top-level properties", () => {
    expect(Object.keys(contract.properties)).toEqual(
      expect.arrayContaining(["schema_version", "profile", "experiences", "projectsV2"]),
    );
    expect(contract.required).toEqual(
      expect.arrayContaining(["schema_version", "profile", "experiences", "projectsV2"]),
    );
  });

  it("carries a nested required field", () => {
    expect(contract.properties.profile.required).toContain("linkedinUrl");
  });

  it("equals a fresh export of the schema source", () => {
    expect(() =>
      execFileSync("node", ["scripts/export-content-schema.mjs", "--check"], {
        cwd: root,
        stdio: "pipe",
      }),
    ).not.toThrow();
  });
});
