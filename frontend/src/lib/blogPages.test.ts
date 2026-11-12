import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
// @ts-expect-error plain ESM, no declaration file
import { buildBlog } from "../../scripts/build-blog.mjs";

const frontend = resolve(__dirname, "../..");
const fixtures = join(frontend, "tests/fixtures/blog");
const rootHtml = join(frontend, "index.html");
const tmp = mkdtempSync(join(tmpdir(), "blog-pages-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

/** buildBlog, run in process from frontend/ over a temp dist whose template is the committed index.html. */
function build(posts: string, template = readFileSync(rootHtml, "utf8")) {
  const dist = mkdtempSync(join(tmp, "dist-"));
  writeFileSync(join(dist, "index.html"), template);
  return { dist, run: () => buildBlog(posts, dist) };
}

const tag = (html: string, re: RegExp) => html.match(re)?.[1];
const title = (h: string) => tag(h, /<title>([^<]*)<\/title>/);
const meta = (h: string, attr: "name" | "property", key: string) =>
  tag(h, new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`));
const read = (dist: string, path: string) => readFileSync(join(dist, path), "utf8");

const pt = JSON.parse(readFileSync(join(frontend, "public/content/pt.json"), "utf8"));
const projects: { slug: string; seo: { title: string; description: string } }[] = pt.projectsV2.list;
const template = readFileSync(rootHtml, "utf8");
const defaultImage = meta(template, "property", "og:image");

describe("post pages over the fixtures", () => {
  let dist = "";
  beforeAll(() => {
    const b = build(fixtures);
    b.run();
    dist = b.dist;
  });

  it("proving-post head carries its own title, description, image, language and locale", () => {
    const h = read(dist, "blog/proving-post/index.html");
    expect(title(h)).toBe("Proving post");
    expect(meta(h, "property", "og:title")).toBe("Proving post");
    expect(meta(h, "name", "description")).toBe("A post that exercises every rule.");
    expect(meta(h, "property", "og:description")).toBe("A post that exercises every rule.");
    expect(meta(h, "property", "og:image")).toBe("https://marco-menezes.com/blog/proving-post/shot.png");
    expect(meta(h, "name", "twitter:image")).toBe("https://marco-menezes.com/blog/proving-post/shot.png");
    expect(h).toContain('<html lang="pt-BR">');
    expect(meta(h, "property", "og:locale")).toBe("pt_BR");
  });

  it("second-post is en with the default image of the template", () => {
    const h = read(dist, "blog/second-post/index.html");
    expect(title(h)).toBe("Second post");
    expect(h).toContain('<html lang="en">');
    expect(meta(h, "property", "og:locale")).toBe("en_US");
    expect(meta(h, "property", "og:image")).toBe(defaultImage);
    expect(meta(h, "name", "twitter:image")).toBe(defaultImage);
  });

  it("the body is the article inside #root and keeps the built scripts", () => {
    const h = read(dist, "blog/proving-post/index.html");
    const body = read(dist, "blog/proving-post/body.html");
    expect(h).toContain(`<div id="root"><article lang="pt">${body}</article></div>`);
    expect(h).toContain('<script type="module" src="/src/main.tsx"></script>');
  });

  it("a template missing a tag to replace fails the build naming it", () => {
    const b = build(fixtures, template.replace(/<meta property="og:locale"[^>]*>/, ""));
    expect(() => b.run()).toThrow(/og:locale/);
  });

  it("a template without the default og:image fails the build naming it", () => {
    const b = build(join(tmp, "no-posts"), template.replace(/<meta property="og:image"[^>]*>/, ""));
    expect(() => b.run()).toThrow(/og:image must match exactly once/);
  });
});

describe("project pages from the committed pt.json", () => {
  let dist = "";
  beforeAll(() => {
    const b = build(fixtures);
    b.run();
    dist = b.dist;
  });

  it("there are 4 projects", () => {
    expect(projects).toHaveLength(4);
  });

  it.each(projects.map((p) => p.slug))("%s page has its seo head and the root body", (slug) => {
    const { seo } = projects.find((p) => p.slug === slug)!;
    const h = read(dist, `projetos/${slug}/index.html`);
    expect(title(h)).toBe(seo.title);
    expect(meta(h, "property", "og:title")).toBe(seo.title);
    expect(meta(h, "name", "description")).toBe(seo.description);
    expect(meta(h, "property", "og:description")).toBe(seo.description);
    expect(meta(h, "property", "og:image")).toBe(defaultImage);
    expect(meta(h, "name", "twitter:image")).toBe(defaultImage);
    expect(h).toContain('<html lang="pt-BR">');
    expect(h.slice(h.indexOf("<body"))).toBe(template.slice(template.indexOf("<body")));
  });
});

describe("the root head", () => {
  it("holds one absolute og:image equal to its twitter:image, and one rss alternate", async () => {
    const { SITE } = await import(pathToFileURL(join(frontend, "scripts/build-blog.mjs")).href);
    expect(template.match(/property="og:image"/g)).toHaveLength(1);
    expect(template.match(/name="twitter:image"/g)).toHaveLength(1);
    expect(defaultImage?.startsWith(`${SITE}/`)).toBe(true);
    expect(meta(template, "name", "twitter:image")).toBe(defaultImage);
    expect(template.match(/<link rel="alternate" type="application\/rss\+xml" href="\/blog\/rss\.xml">/g)).toHaveLength(1);
  });
});
