import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const LOCALES = ["pt", "en", "de"];
let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "parity-"));
  for (const l of LOCALES) copyFileSync(join(root, "public/content", `${l}.json`), join(dir, `${l}.json`));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function removeKey(locale: string, path: string[]) {
  const file = join(dir, `${locale}.json`);
  const data = JSON.parse(readFileSync(file, "utf-8"));
  let node = data;
  for (const k of path.slice(0, -1)) node = node?.[k];
  if (node) delete node[path[path.length - 1]];
  writeFileSync(file, JSON.stringify(data));
}

function runParity() {
  const r = spawnSync(process.execPath, ["scripts/check-i18n-parity.mjs"], {
    cwd: root,
    env: { ...process.env, CONTENT_DIR: dir },
    encoding: "utf-8",
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

describe("check-i18n-parity on a copy of the locale files", () => {
  it.each([
    ["earlierLabel", ["earlierLabel"]],
    ["siteChrome.footer.owner", ["siteChrome", "footer", "owner"]],
    ["siteChrome.nav.blog", ["siteChrome", "nav", "blog"]],
    ["siteChrome.blog.title", ["siteChrome", "blog", "title"]],
    ["siteChrome.blog.intro", ["siteChrome", "blog", "intro"]],
    ["siteChrome.blog.empty", ["siteChrome", "blog", "empty"]],
    ["siteChrome.blog.tagsLabel", ["siteChrome", "blog", "tagsLabel"]],
    ["siteChrome.blog.filteredBy", ["siteChrome", "blog", "filteredBy"]],
    ["siteChrome.blog.allPosts", ["siteChrome", "blog", "allPosts"]],
    ["siteChrome.blog.back", ["siteChrome", "blog", "back"]],
  ])("fails naming %s and de when the de copy lacks it", (name, path) => {
    removeKey("de", path);
    const { status, out } = runParity();
    expect(status).toBe(1);
    expect(out.split("\n").some((l) => l.includes(name) && l.includes("[de]"))).toBe(true);
  });

  it("fails naming the media item when the de copy lacks an optional key of it", () => {
    removeKey("de", ["projectsV2", "list", "0", "hero", "media", "0", "caption"]);
    const { status, out } = runParity();
    expect(status).toBe(1);
    expect(out.split("\n").some((l) => l.includes("[de]") && l.includes(".hero.media[0]") && l.includes("caption"))).toBe(true);
  });

  it("passes on an unmodified copy", () => {
    const { status, out } = runParity();
    expect({ status, out }).toEqual({
      status: 0,
      out: "[check-i18n-parity] OK — i18n parity and redaction lint passed.\n",
    });
  });
});
