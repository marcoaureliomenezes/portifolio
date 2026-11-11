import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain ESM contract, no declaration file
import { CertificationSchema, ContentDataSchema, EducationSchema, ProfileSchema } from "../../scripts/content-schema.mjs";

const root = resolve(__dirname, "../..");
const schemaFile = resolve(root, "public/schema/site-content.schema.json");
// an absent file fails the cases that read it, not the whole module
const contract = existsSync(schemaFile) ? JSON.parse(readFileSync(schemaFile, "utf-8")) : {};
const locales = ["pt", "en", "de"].map((l) =>
  JSON.parse(readFileSync(resolve(root, `public/content/${l}.json`), "utf-8")),
);

// Required by src/types/content.ts, plus three the type marks optional but the contract requires.
const requiredByType = [
  "profile", "resumeTitle", "skillsTitle", "experienceTitle", "educationTitle", "certificationsTitle",
  "responsibilities", "technologies", "gamesComingSoon", "gamesComingSoonDesc", "notFoundMessage",
  "returnHome", "heroStatsSuffix", "seeAllProjects", "earlierLabel", "detailsOpen", "detailsClose",
  "storyOpen", "storyClose", "impactLabel", "header", "resume", "skills", "experiences", "education",
  "certifications", "siteChrome",
];
const requiredByContract = [
  "schema_version", // the contract version stamp; fixtures omit it, the published contract does not
  "published_at", // the publish stamp the sync checks
  "projectsV2", // the projects cluster; the page renders from it
];

describe("content schema export (site-content.schema.json)", () => {
  it("is a 2020-12 root schema with no wrapper", () => {
    expect(contract.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(JSON.stringify(contract)).not.toContain('"$ref"');
    expect(contract).not.toHaveProperty("definitions");
  });

  it("declares the union of the locales' top-level keys", () => {
    const union = [...new Set(locales.flatMap((d) => Object.keys(d)))].sort();
    expect(union).toHaveLength(35);
    expect(Object.keys(contract.properties).sort()).toEqual(union);
  });

  it("requires exactly the type's required keys plus the contract's three", () => {
    expect([...contract.required].sort()).toEqual([...requiredByType, ...requiredByContract].sort());
  });

  it("maps to Studio: valid keys, no anyOf, no kindLabels", () => {
    const keys: string[] = [];
    const anyOf: string[] = [];
    const walk = (node: unknown, path: string) => {
      if (node === null || typeof node !== "object") return;
      const rec = node as Record<string, unknown>;
      if ("anyOf" in rec) anyOf.push(path);
      if (rec.properties && typeof rec.properties === "object") {
        for (const k of Object.keys(rec.properties)) keys.push(`${path}/${k}`);
      }
      for (const [k, v] of Object.entries(node)) walk(v, `${path}/${k}`);
    };
    walk(contract, "");
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.filter((k) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(k.split("/").pop() ?? ""))).toEqual([]);
    expect(anyOf).toEqual([]);
    expect(keys.filter((k) => k.endsWith("/kindLabels") || k.includes("/kindLabels/"))).toEqual([]);
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
    expect(contract.properties.profile.properties.githubUrl.pattern).toBe("^https?:\\/\\/[\\w.-]+(:\\d+)?([/?#]\\S*)?$");
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
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.com", "/\\evil.com", "/\t/evil.example", "/\n/evil.example", "/\r/evil.example"]) {
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

  it("carries a media definition reachable from a project section", () => {
    type Node = { properties: Record<string, Node>; items: Node; oneOf: Node[]; const: string };
    const projects: Node[] = contract.properties.projectsV2.properties.list.items.oneOf;
    const withSections = projects.find((p) => p.properties.sections);
    const media = withSections?.properties.sections.items.properties.media;
    const variants = media?.items.oneOf.map((v) => v.properties.type.const).sort();
    expect(variants).toEqual(["svg", "video"]);
  });

  it("puts every oneOf directly under an items, each branch holding a const", () => {
    const stray: string[] = [];
    const walk = (node: unknown, path: string, parent: string) => {
      if (node === null || typeof node !== "object") return;
      for (const [k, v] of Object.entries(node)) {
        if (k === "oneOf" && Array.isArray(v)) {
          if (parent !== "items") stray.push(`${path}.oneOf`);
          for (const [i, branch] of v.entries()) {
            const props = Object.values((branch as { properties?: Record<string, object> }).properties ?? {});
            if (!props.some((p) => "const" in p)) stray.push(`${path}.oneOf[${i}]`);
          }
        }
        walk(v, `${path}.${k}`, k);
      }
    };
    walk(contract, "$", "");
    expect(stray).toEqual([]);
  });
});

describe("committed locale content", () => {
  it.each(["pt", "en", "de"])("%s.json parses against the full content schema", (locale) => {
    const data = JSON.parse(readFileSync(resolve(root, `public/content/${locale}.json`), "utf-8"));
    const result = ContentDataSchema.safeParse(data);
    expect(result.error?.issues ?? []).toEqual([]);
  });
});
