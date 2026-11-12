import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const files = ["ci.yml", "ci-weekly.yml", "deploy.yml", "terraform.yml"];

type Script = { file: string; line: number; text: string };

function scripts(file: string): Script[] {
  const lines = readFileSync(resolve(__dirname, "../../.github/workflows", file), "utf8").split("\n");
  const out: Script[] = [];
  lines.forEach((l, i) => {
    const m = /^(\s*(?:-\s+)?)run:\s*(.*)$/.exec(l);
    if (!m) return;
    const indent = m[1].length;
    if (!/^[|>][+-]?\d*\s*$/.test(m[2])) {
      out.push({ file, line: i + 1, text: m[2] });
      return;
    }
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() !== "" && lines[j].search(/\S/) <= indent) break;
      out.push({ file, line: j + 1, text: lines[j] });
    }
  });
  return out;
}

describe("workflow run: scripts", () => {
  it.each(files)("%s yields at least one script", (file) => {
    expect(scripts(file).length).toBeGreaterThan(0);
  });

  it("hold no ${{ }} expression", () => {
    const hits = files.flatMap(scripts).filter((s) => s.text.includes("${{")).map((s) => `${s.file}:${s.line}`);
    expect(hits).toEqual([]);
  });
});
