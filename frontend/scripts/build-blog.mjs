/**
 * build-blog.mjs — renders the posts into dist/blog (PLAN §2.2).
 *
 * CLI: node scripts/build-blog.mjs [--posts <dir>] [--dist <dir>], run from frontend/.
 * Writes <dist>/blog/index.json and <dist>/blog/<slug>/body.html; a bad link
 * throws `<slug>: link: "<href>" is not http(s), site-relative or #`.
 */

import { copyFileSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { HttpUrl } from "../src/lib/schemas/projects.ts";
import { readPosts } from "./blog-posts.mjs";
import { imageSize } from "./image-size.mjs";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
const allowed = (href) => HttpUrl.safeParse(href).success || /^\/(?!\/)/.test(href) || href.startsWith("#");

const IMAGES = [".png", ".jpg", ".webp", ".svg"];
const CLIPS = { ".mp4": "video/mp4", ".webm": "video/webm" };
const POSTERS = [".webp", ".png", ".jpg"];
const isFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

/** Renders one post's Markdown in folder dir to an HTML fragment; the files it references go in `files`. */
export function renderBody(slug, markdown, dir, files = new Set()) {
  const media = (href) => {
    const ext = extname(href).toLowerCase();
    if (!/^[\w.-]+$/.test(href) || !isFile(join(dir, href)) || !(IMAGES.includes(ext) || ext in CLIPS)) {
      throw new Error(`${slug}: image: ${href}: no such file`);
    }
    files.add(href);
    return ext;
  };
  const src = (name) => `/blog/${slug}/${name}`;
  const marked = new Marked({
    renderer: {
      html: ({ text }) => escape(text),
      code: ({ text }) => `<pre><code>${escape(text)}\n</code></pre>\n`,
      image({ href, text }) {
        if (text === "") throw new Error(`${slug}: image: alt must not be empty`);
        const ext = media(href);
        const alt = escape(text);
        if (!(ext in CLIPS)) {
          const { width, height } = imageSize(join(dir, href));
          return `<img src="${src(href)}" alt="${alt}" width="${width}" height="${height}">`;
        }
        const base = href.slice(0, -ext.length);
        const poster = POSTERS.map((e) => base + e).find((name) => isFile(join(dir, name)));
        if (!poster) throw new Error(`${slug}: video: ${href}: no poster beside it`);
        files.add(poster);
        const { width, height } = imageSize(join(dir, poster));
        return `<video aria-label="${alt}" width="${width}" height="${height}" poster="${src(poster)}" muted loop playsinline controls preload="none"><source src="${src(href)}" type="${CLIPS[ext]}"></video>`;
      },
      link({ href, title, tokens }) {
        if (!allowed(href)) throw new Error(`${slug}: link: "${href}" is not http(s), site-relative or #`);
        return `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ""}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  return marked.parse(markdown);
}

/** Writes index.json and one body.html per published post under <dist>/blog. */
export function buildBlog(postsDir, dist) {
  const posts = readPosts(postsDir);
  const blog = join(dist, "blog");
  mkdirSync(blog, { recursive: true });
  const index = posts.map(({ slug, title, description, date, lang, tags }) => ({ slug, title, description, date, lang, tags }));
  writeFileSync(join(blog, "index.json"), `${JSON.stringify(index)}\n`);
  for (const { slug, body, image } of posts) {
    const dir = join(postsDir, slug);
    const files = new Set(image ? [image] : []);
    const html = renderBody(slug, body, dir, files);
    mkdirSync(join(blog, slug), { recursive: true });
    writeFileSync(join(blog, slug, "body.html"), html);
    for (const name of files) copyFileSync(join(dir, name), join(blog, slug, name));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(name);
    return i > 0 ? process.argv[i + 1] : fallback;
  };
  try {
    buildBlog(arg("--posts", "content/blog"), arg("--dist", "dist"));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
