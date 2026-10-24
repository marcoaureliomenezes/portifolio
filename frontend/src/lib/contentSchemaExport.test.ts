import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain ESM contract, no declaration file
import { CertificationSchema, EducationSchema, ProfileSchema } from "../../scripts/content-schema.mjs";

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

  it("accepts only http(s) in every profile link", () => {
    const ok = { linkedinUrl: "https://l.in/x", githubUrl: "https://github.com/x", instagramUrl: "https://i.com/x", email: ["a", "b.co"].join("@"), cvUrl: "/cv.pdf" };
    expect(ProfileSchema.safeParse(ok).success).toBe(true);
    for (const bad of ["javascript:alert(1)", "data:text/html,x"]) {
      for (const k of ["linkedinUrl", "githubUrl", "instagramUrl"]) {
        expect(ProfileSchema.safeParse({ ...ok, [k]: bad }).success).toBe(false);
      }
    }
  });

  it("exports the http(s) constraint on profile links", () => {
    expect(contract.properties.profile.properties.githubUrl.pattern).toBe("^https?:\\/\\/");
  });

  it("keeps certification, thesis and cv links off script schemes", () => {
    const cert = { id: "c", name: "n", issuer: "i", category: "c", date: "d", validity: "", level: "l", icon: "", link: "https://a.io/c", description: "", priority: 1 };
    const edu = { id: "e", degreeLevel: "l", degreeField: "f", institution: "i", location: "l", period: "p", courseworkLabel: "", coursework: "", thesisLabel: "", thesis: "" };
    const profile = { linkedinUrl: "https://l.in/x", githubUrl: "https://g.com/x", instagramUrl: "https://i.com/x", email: ["a", "b.co"].join("@"), cvUrl: "/cv.pdf" };
    expect(CertificationSchema.safeParse(cert).success).toBe(true);
    expect(CertificationSchema.safeParse({ ...cert, link: "#" }).success).toBe(true);
    expect(CertificationSchema.safeParse({ ...cert, link: "javascript:alert(1)" }).success).toBe(false);
    expect(EducationSchema.safeParse({ ...edu, thesisLink: "https://a.io/t" }).success).toBe(true);
    expect(EducationSchema.safeParse({ ...edu, thesisLink: "javascript:alert(1)" }).success).toBe(false);
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.com", "/\\evil.com"]) {
      expect(ProfileSchema.safeParse({ ...profile, cvUrl: bad }).success).toBe(false);
    }
  });

  it("forbids no unknown key, like the Zod schema that strips them", () => {
    const closed: string[] = [];
    const walk = (node: unknown, path: string) => {
      if (node === null || typeof node !== "object") return;
      if ((node as Record<string, unknown>).additionalProperties === false) closed.push(path);
      for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
    };
    walk(contract, "$");
    expect(closed).toEqual([]);
  });
});
