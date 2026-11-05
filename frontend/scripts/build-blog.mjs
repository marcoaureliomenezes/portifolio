/**
 * build-blog.mjs — renders the posts into dist/blog (PLAN §2.2).
 *
 * CLI: node scripts/build-blog.mjs [--posts <dir>] [--dist <dir>], run from frontend/.
 * Writes <dist>/blog/index.json and <dist>/blog/<slug>/body.html; a bad link
 * throws `<slug>: link: "<href>" is not http(s), site-relative or #`.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { HttpUrl } from "../src/lib/schemas/projects.ts";
import { readPosts } from "./blog-posts.mjs";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
const allowed = (href) => HttpUrl.safeParse(href).success || /^\/(?!\/)/.test(href) || href.startsWith("#");

/** Renders one post's Markdown to an HTML fragment. */
export function renderBody(slug, markdown) {
  const marked = new Marked({
    renderer: {
      html: ({ text }) => escape(text),
      code: ({ text }) => `<pre><code>${escape(text)}\n</code></pre>\n`,
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
  for (const { slug, body } of posts) {
    mkdirSync(join(blog, slug), { recursive: true });
    writeFileSync(join(blog, slug, "body.html"), renderBody(slug, body));
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
