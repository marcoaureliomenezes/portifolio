import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8"));

describe("node floor", () => {
  it("package.json declares the Node floor the build needs (type stripping, 22.18+; lhci 0.16, 22.19+)", () => {
    expect(pkg.engines?.node).toBe(">=22.19.0");
  });
});
