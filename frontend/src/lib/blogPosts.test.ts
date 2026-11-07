import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error plain ESM, no declaration file
import { readPosts } from "../../scripts/blog-posts.mjs";

const fixtures = resolve(__dirname, "../../tests/fixtures/blog");
const tmp = mkdtempSync(join(tmpdir(), "blog-posts-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const VALID = {
  title: "T",
  description: "D",
  date: "2026-01-01",
  lang: "en",
  tags: "a, b",
};

/** Writes one post under a fresh folder and returns the posts dir. */
function post(slug: string, fm: string | null, files: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmp, "p-"));
  mkdirSync(join(dir, slug));
  if (fm !== null) writeFileSync(join(dir, slug, "index.md"), `---\n${fm}\n---\nbody\n`);
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, slug, name), text);
  return dir;
}

function fm(over: Record<string, string | null> = {}) {
  return Object.entries({ ...VALID, ...over })
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

describe("readPosts over the fixtures", () => {
  const posts = readPosts(fixtures);

  it("returns the published posts newest first and leaves the draft out", () => {
    expect(posts.map((p: { slug: string }) => p.slug)).toEqual(["proving-post", "second-post"]);
  });

  it("carries the fields of each post", () => {
    expect(posts[0]).toMatchObject({
      slug: "proving-post",
      title: "Proving post",
      description: "A post that exercises every rule.",
      date: "2026-03-09",
      lang: "pt",
      tags: ["data", "notes"],
      image: "shot.png",
    });
    expect(posts[1]).toMatchObject({
      slug: "second-post",
      title: "Second post",
      date: "2026-02-01",
      lang: "en",
      tags: ["notes"],
    });
  });

  it("keeps the body after the front matter, links of the three allowed forms included", () => {
    expect(posts[0].body).toContain("[external link](https://example.com/page)");
    expect(posts[0].body).toContain("[site link](/projetos/demo)");
    expect(posts[0].body).toContain("[anchor](#top)");
    expect(posts[0].body).toContain("<script>alert(1)</script>");
    expect(posts[0].body).not.toContain("title:");
  });

  it("gives [] for an absent directory", () => {
    expect(readPosts(join(tmp, "absent"))).toEqual([]);
  });
});

describe("readPosts ties and non-directories", () => {
  it("orders equal dates by slug and ignores plain files", () => {
    const dir = post("bravo", fm());
    mkdirSync(join(dir, "alpha"));
    writeFileSync(join(dir, "alpha", "index.md"), `---\n${fm()}\n---\nx\n`);
    writeFileSync(join(dir, "notes.txt"), "not a post");
    expect(readPosts(dir).map((p: { slug: string }) => p.slug)).toEqual(["alpha", "bravo"]);
  });
});

describe("readPosts front-matter errors", () => {
  const cases: [string, () => string, string][] = [
    ["blank title", () => post("a-post", fm({ title: "   " })), "a-post: title: must not be blank"],
    ["blank description", () => post("a-post", fm({ description: "" })), "a-post: description: must not be blank"],
    ["bad date", () => post("a-post", fm({ date: "2026-02-30" })), "a-post: date: must be YYYY-MM-DD"],
    ["date shape", () => post("a-post", fm({ date: "9 March" })), "a-post: date: must be YYYY-MM-DD"],
    ["bad lang", () => post("a-post", fm({ lang: "fr" })), "a-post: lang: must be one of pt, en, de"],
    ["bad tags", () => post("a-post", fm({ tags: "Good, bad tag" })), "a-post: tags: must be a comma list of slugs"],
    ["bad draft", () => post("a-post", fm() + "\ndraft: maybe"), "a-post: draft: must be true or false"],
    ["image naming no file", () => post("a-post", fm() + "\nimage: nope.png"), "a-post: image: no such file in the post folder"],
    ["image naming the post's own Markdown", () => post("a-post", fm() + "\nimage: index.md"), "a-post: image: no such file in the post folder"],
    ["image leaving the folder", () => post("a-post", fm() + "\nimage: ../pic.png", { "../pic.png": "x" }), "a-post: image: no such file in the post folder"],
    ["unknown key", () => post("a-post", fm() + "\nauthor: me"), "a-post: author: unknown key"],
    ["missing field", () => post("a-post", fm({ lang: null })), "a-post: lang: is required"],
    ["upper-case slug", () => post("Bad-Post", fm()), "Bad-Post: slug: must match ^[a-z0-9]+(-[a-z0-9]+)*$"],
    ["no index.md", () => post("a-post", null), "a-post: index.md: is required"],
    ["no leading block", () => {
      const dir = post("a-post", null);
      writeFileSync(join(dir, "a-post", "index.md"), "just text\n");
      return dir;
    }, "a-post: front matter: is required"],
    ["line not key: value", () => post("a-post", "title T\n" + fm({ title: null })), "a-post: front matter: line 1 is not key: value"],
    ["draft with a bad field", () => post("a-post", fm({ lang: "fr" }) + "\ndraft: true"), "a-post: lang: must be one of pt, en, de"],
  ];

  it.each(cases)("%s", (_name, make, message) => {
    const dir = make();
    expect(() => readPosts(dir)).toThrow(new Error(message));
  });

  it("accepts an existing image file and empty tags", () => {
    const dir = post("a-post", fm({ tags: "" }) + "\nimage: pic.png", { "pic.png": "x" });
    expect(readPosts(dir)[0]).toMatchObject({ tags: [], image: "pic.png" });
  });
});
