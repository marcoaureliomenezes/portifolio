import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

const dir = resolve(__dirname, "../../.github/workflows");
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

type Script = { label: string; text: string };

function walk(node: unknown, path: string[], file: string, out: Script[]): void {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, [...path, (v as { name?: unknown })?.name?.toString() ?? String(i)], file, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "defaults") continue;
      if (k === "run" && typeof v === "string") {
        out.push({ label: `${file}:${path.join("/")}`, text: v });
      } else {
        walk(v, [...path, k], file, out);
      }
    }
  }
}

function scripts(file: string): Script[] {
  const doc = parseDocument(readFileSync(resolve(dir, file), "utf8"));
  expect(doc.errors).toEqual([]);
  const out: Script[] = [];
  walk(doc.toJS(), [], file, out);
  return out;
}

describe("workflow run: scripts", () => {
  it("the listing holds at least one file", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s parses and yields at least one script", (file) => {
    expect(scripts(file).length).toBeGreaterThan(0);
  });

  it("hold no ${{ }} expression", () => {
    const hits = files.flatMap(scripts).filter((s) => s.text.includes("${{")).map((s) => s.label);
    expect(hits).toEqual([]);
  });
});
