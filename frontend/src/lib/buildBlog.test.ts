import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const frontend = resolve(__dirname, "../..");
const fixtures = join(frontend, "tests/fixtures/blog");
const script = join(frontend, "scripts/build-blog.mjs");
const tmp = mkdtempSync(join(tmpdir(), "build-blog-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

type Run = { status: number; stdout: string; stderr: string; dist: string };

/** Runs the CLI from frontend/ against a fresh temp dist. */
function build(posts: string): Run {
  const dist = mkdtempSync(join(tmp, "dist-"));
  copyFileSync(join(frontend, "index.html"), join(dist, "index.html"));
  try {
    const stdout = execFileSync(process.execPath, ["scripts/build-blog.mjs", "--posts", posts, "--dist", dist], {
      cwd: frontend,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "", dist };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { status: err.status, stdout: err.stdout, stderr: err.stderr, dist };
  }
}

/** One temp post with the given body under a fresh posts folder. */
function postWith(slug: string, body: string, files: Record<string, Buffer | string> = {}) {
  const dir = mkdtempSync(join(tmp, "p-"));
  mkdirSync(join(dir, slug));
  writeFileSync(
    join(dir, slug, "index.md"),
    `---\ntitle: T\ndescription: D\ndate: 2026-01-01\nlang: en\ntags: a\n---\n${body}\n`,
  );
  for (const [name, data] of Object.entries(files)) writeFileSync(join(dir, slug, name), data);
  return dir;
}

const proving = join(fixtures, "proving-post");
const fixture = (name: string) => readFileSync(join(proving, name));
const MP4 = "clip.mp4";

/** A 30-byte webp header of a VP8X file, 8 x 6. */
function webp8x6() {
  const h = Buffer.alloc(30);
  h.write("RIFF", 0, "latin1");
  h.writeUInt32LE(22, 4);
  h.write("WEBPVP8X", 8, "latin1");
  h.writeUInt32LE(10, 16);
  h.writeUIntLE(7, 24, 3);
  h.writeUIntLE(5, 27, 3);
  return h;
}

describe("build-blog over the fixtures", () => {
  const run = build(fixtures);
  const body = (slug: string) => readFileSync(join(run.dist, "blog", slug, "body.html"), "utf8");

  it("exits 0 with nothing on stderr", () => {
    expect(run.status).toBe(0);
    expect(run.stderr).toBe("");
  });

  it("writes index.json with the published posts, newest first", () => {
    expect(JSON.parse(readFileSync(join(run.dist, "blog/index.json"), "utf8"))).toEqual([
      {
        slug: "proving-post",
        title: "Proving post",
        description: "A post that exercises every rule.",
        date: "2026-03-09",
        lang: "pt",
        tags: ["data", "notes"],
      },
      {
        slug: "second-post",
        title: "Second post",
        description: "A plain note.",
        date: "2026-02-01",
        lang: "en",
        tags: ["notes"],
      },
    ]);
  });

  it("writes one body.html per published post and none for the draft", () => {
    expect(existsSync(join(run.dist, "blog/proving-post/body.html"))).toBe(true);
    expect(existsSync(join(run.dist, "blog/second-post/body.html"))).toBe(true);
    expect(existsSync(join(run.dist, "blog/draft-post"))).toBe(false);
  });

  it("renders the heading and keeps http(s), site-relative and # links", () => {
    const html = body("proving-post");
    expect(html).toContain("<h1>A heading</h1>");
    expect(html).toContain('<a href="https://example.com/page">external link</a>');
    expect(html).toContain('<a href="/projetos/demo">site link</a>');
    expect(html).toContain('<a href="#top">anchor</a>');
  });

  it("renders raw HTML as escaped text", () => {
    const html = body("proving-post");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script");
  });

  it("renders a code block as pre/code with escaped text and no language class", () => {
    expect(body("proving-post")).toContain("<pre><code>a &lt; b\n</code></pre>");
  });
});

describe("build-blog with no post", () => {
  const empty = mkdtempSync(join(tmp, "empty-"));
  it.each([["an empty folder", empty], ["an absent one", join(empty, "absent")]])("writes [] for %s", (_name, posts) => {
    const run = build(posts);
    expect(run.status).toBe(0);
    expect(readFileSync(join(run.dist, "blog/index.json"), "utf8").trim()).toBe("[]");
  });
});

describe("build-blog link rule", () => {
  it.each([
    ["javascript:alert(1)"],
    ["mailto:a" + "@" + "b.co"],
    ["page.html"],
  ])("fails the build on the link %s", (href) => {
    const run = build(postWith("bad-link", `[x](${href})`));
    expect(run.status).toBe(1);
    expect(run.stdout).toBe("");
    expect(run.stderr).toBe(`bad-link: link: "${href}" is not http(s), site-relative or #\n`);
  });
});

describe("importing build-blog", () => {
  it("runs nothing: no output and no file written", () => {
    const cwd = mkdtempSync(join(tmp, "cwd-"));
    const out = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", `await import(${JSON.stringify(pathToFileURL(script).href)})`],
      { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    expect(out).toBe("");
    expect(readdirSync(cwd)).toEqual([]);
  });
});

describe("build-blog media", () => {
  const run = build(fixtures);
  const html = readFileSync(join(run.dist, "blog/proving-post/body.html"), "utf8");
  const copied = (slug: string, name: string) => join(run.dist, "blog", slug, name);

  it("renders an image with absolute source and the size read from the file", () => {
    expect(html).toContain('<img src="/blog/proving-post/shot.png" alt="alt text" width="3" height="2">');
  });

  it("renders a clip as a muted looping video with its poster and size", () => {
    expect(html).toContain(
      '<video aria-label="clip alt" width="4" height="3" poster="/blog/proving-post/clip.png" muted loop playsinline controls preload="none"><source src="/blog/proving-post/clip.mp4" type="video/mp4"></video>',
    );
  });

  it("never emits autoplay", () => {
    expect(html).not.toContain("autoplay");
  });

  it("copies the referenced files, the poster and the front-matter image byte for byte", () => {
    for (const name of ["shot.png", "clip.png", MP4]) {
      expect(readFileSync(copied("proving-post", name)).equals(fixture(name))).toBe(true);
    }
  });

  it("copies neither index.md nor an unreferenced file", () => {
    const dir = postWith("extra-file", "![a](shot.png)", { "shot.png": fixture("shot.png"), "extra.txt": "x" });
    const out = build(dir);
    expect(out.status).toBe(0);
    expect(readdirSync(join(out.dist, "blog/extra-file")).sort()).toEqual(["body.html", "index.html", "shot.png"]);
  });

  it("copies the front-matter image when the body never references it", () => {
    const dir = postWith("cover-only", "text", { "cover.png": fixture("shot.png") });
    const md = join(dir, "cover-only", "index.md");
    writeFileSync(md, readFileSync(md, "utf8").replace("tags: a\n", "tags: a\nimage: cover.png\n"));
    const out = build(dir);
    expect(out.status).toBe(0);
    expect(readFileSync(join(out.dist, "blog/cover-only/cover.png")).equals(fixture("shot.png"))).toBe(true);
    expect(readFileSync(join(out.dist, "blog/cover-only/index.html"), "utf8")).toContain(
      'property="og:image" content="https://marco-menezes.com/blog/cover-only/cover.png"',
    );
  });

  it("copies no file from outside the post folder", () => {
    const dir = postWith("escape", "![a](../shot.png)");
    writeFileSync(join(dir, "shot.png"), fixture("shot.png"));
    const out = build(dir);
    expect(out.status).toBe(1);
    expect(existsSync(join(out.dist, "blog/shot.png"))).toBe(false);
    expect(existsSync(join(out.dist, "blog/escape/shot.png"))).toBe(false);
  });

  it("picks the poster among webp, png, jpg in that order and reads its size", () => {
    const files = {
      [MP4]: "v", "clip.png": fixture("clip.png"), "clip.jpg": "j", "clip.webp": webp8x6(),
      "other.mp4": "v", "other.png": fixture("clip.png"), "other.jpg": "j",
    };
    const out = build(postWith("poster-order", `![c](${MP4})\n\n![o](other.mp4)`, files));
    const html = readFileSync(join(out.dist, "blog/poster-order/body.html"), "utf8");
    expect(html).toContain('width="8" height="6" poster="/blog/poster-order/clip.webp"');
    expect(html).toContain('width="4" height="3" poster="/blog/poster-order/other.png"');
  });

  it("serves a webm clip with its own type", () => {
    const out = build(postWith("webm-clip", "![c](clip.webm)", { "clip.webm": "v", "clip.png": fixture("clip.png") }));
    expect(readFileSync(join(out.dist, "blog/webm-clip/body.html"), "utf8")).toContain(
      '<source src="/blog/webm-clip/clip.webm" type="video/webm">',
    );
  });

  it.each([
    ["an empty alt", "![](shot.png)", { "shot.png": fixture("shot.png") }, "media-fail: image: alt must not be empty"],
    ["a missing file", "![a](shot.png)", {}, "media-fail: image: shot.png: no such file"],
    ["a clip without a poster", `![a](${MP4})`, { [MP4]: "v" }, `media-fail: video: ${MP4}: no poster beside it`],
    ["a bad extension", "![a](shot.gif)", { "shot.gif": "g" }, "media-fail: image: shot.gif: no such file"],
    ["a target outside the folder", "![a](../shot.png)", {}, "media-fail: image: ../shot.png: no such file"],
  ])("fails the build on %s", (_name, body, files, message) => {
    const out = build(postWith("media-fail", body, files));
    expect(out.status).toBe(1);
    expect(out.stdout).toBe("");
    expect(out.stderr).toBe(`${message}\n`);
  });
});
