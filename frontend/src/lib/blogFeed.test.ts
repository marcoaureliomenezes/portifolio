// @vitest-environment jsdom
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error plain ESM, no declaration file
import { buildBlog } from "../../scripts/build-blog.mjs";

const frontend = resolve(__dirname, "../..");
const fixtures = join(frontend, "tests/fixtures/blog");
const rootHtml = join(frontend, "index.html");
const projectSlug: string = JSON.parse(readFileSync(join(frontend, "public/content/pt.json"), "utf8")).projectsV2.list[0].slug;
const tmp = mkdtempSync(join(tmpdir(), "blog-feed-"));
process.chdir(frontend);
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

/** Runs buildBlog in process from frontend/ over a temp dist whose template is the committed index.html; returns the dist. */
function build(posts: string) {
  const dist = mkdtempSync(join(tmp, "dist-"));
  writeFileSync(join(dist, "index.html"), readFileSync(rootHtml));
  buildBlog(posts, dist);
  return dist;
}

/** The feed text and its parsed document; the parse must carry no error. */
function feed(dist: string) {
  const xml = readFileSync(join(dist, "blog/rss.xml"), "utf8");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
  return { xml, doc };
}

const text = (el: Element, name: string) => Array.from(el.getElementsByTagName(name)).map((e) => e.textContent);

describe("the feed over the fixtures", () => {
  let built: ReturnType<typeof feed> | undefined;
  const fed = () => (built ??= feed(build(fixtures)));
  const items = () => Array.from(fed().doc.getElementsByTagName("item"));

  it("is RSS 2.0 with the dc namespace and the blog as channel link", () => {
    const { doc } = fed();
    expect(doc.documentElement.tagName).toBe("rss");
    expect(doc.documentElement.getAttribute("version")).toBe("2.0");
    expect(fed().xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
    expect(doc.getElementsByTagName("channel")[0].getElementsByTagName("link")[0].textContent).toBe(
      "https://marco-menezes.com/blog",
    );
  });

  it("holds the two published posts newest first, the draft absent", () => {
    expect(items().map((i) => text(i, "title")[0])).toEqual(["Proving post", "Second post"]);
  });

  it("the first item carries every field", () => {
    const [a] = items();
    expect(text(a, "link")).toEqual(["https://marco-menezes.com/blog/proving-post"]);
    expect(text(a, "guid")).toEqual(["https://marco-menezes.com/blog/proving-post"]);
    expect(text(a, "pubDate")).toEqual(["Mon, 09 Mar 2026 00:00:00 GMT"]);
    expect(text(a, "description")).toEqual(["A post that exercises every rule."]);
    expect(text(a, "category")).toEqual(["data", "notes"]);
    expect(text(a, "dc:language")).toEqual(["pt"]);
  });

  it("the second item carries its one category and language", () => {
    const [, b] = items();
    expect(text(b, "pubDate")).toEqual(["Sun, 01 Feb 2026 00:00:00 GMT"]);
    expect(text(b, "category")).toEqual(["notes"]);
    expect(text(b, "dc:language")).toEqual(["en"]);
  });
});

describe("the feed edge cases", () => {
  it("escapes & and < in a title", () => {
    const posts = mkdtempSync(join(tmp, "p-"));
    mkdirSync(join(posts, "esc"));
    writeFileSync(
      join(posts, "esc/index.md"),
      "---\ntitle: A & B < C\ndescription: D\ndate: 2026-01-01\nlang: en\ntags: a\n---\nBody\n",
    );
    const { xml, doc } = feed(build(posts));
    expect(xml).toContain("<title>A &amp; B &lt; C</title>");
    expect(doc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].textContent).toBe("A & B < C");
  });

  it("is well-formed with zero items when no post exists", () => {
    const posts = mkdtempSync(join(tmp, "empty-"));
    const { doc } = feed(build(posts));
    expect(doc.getElementsByTagName("item")).toHaveLength(0);
    expect(doc.getElementsByTagName("channel")[0].getElementsByTagName("link")[0].textContent).toBe(
      "https://marco-menezes.com/blog",
    );
  });
});

describe("the share image", () => {
  const html = readFileSync(rootHtml, "utf8");
  const image = html.match(/property="og:image" content="([^"]*)"/)?.[1] ?? "";

  it("is a committed 1200 by 630 file under public/assets", async () => {
    const file = join(frontend, "public/assets", image.split("/").pop() ?? "");
    expect(existsSync(file)).toBe(true);
    const { imageSize } = await import(pathToFileURL(join(frontend, "scripts/image-size.mjs")).href);
    expect(imageSize(file)).toEqual({ width: 1200, height: 630 });
  });

  it("is the image every page of the fixtures build names unless the post sets its own", () => {
    const dist = build(fixtures);
    const og = (p: string) => readFileSync(join(dist, p), "utf8").match(/property="og:image" content="([^"]*)"/)?.[1];
    expect(image).toMatch(/^https:\/\/marco-menezes\.com\/assets\/share-[0-9a-f]{8}\.png$/);
    expect(og("blog/second-post/index.html")).toBe(image);
    expect(og(`projetos/${projectSlug}/index.html`)).toBe(image);
    expect(og("blog/proving-post/index.html")).toBe("https://marco-menezes.com/blog/proving-post/shot.png");
  });
});
