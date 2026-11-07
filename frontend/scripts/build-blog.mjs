/**
 * build-blog.mjs — renders the posts into dist/blog (PLAN §2.2).
 *
 * CLI: node scripts/build-blog.mjs [--posts <dir>] [--dist <dir>], run from frontend/.
 * Writes <dist>/blog/index.json and <dist>/blog/<slug>/body.html; a bad link
 * throws `<slug>: link: "<href>" is not http(s), site-relative or #`.
 */

import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { HttpUrl } from "../src/lib/schemas/projects.ts";
import { readPosts } from "./blog-posts.mjs";
import { imageSize } from "./image-size.mjs";

export const SITE = "https://marco-menezes.com";
const LANGS = { pt: ["pt-BR", "pt_BR"], en: ["en", "en_US"], de: ["de", "de_DE"] };

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
function renderBody(slug, markdown, dir, files) {
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
  return marked.parser(marked.lexer(markdown));
}

/** Replaces each head tag of the template, which must hold it exactly once; values are escaped. */
function setHead(html, { title, description, lang, locale, image }) {
  const one = (name, re, to) => {
    if ((html.match(new RegExp(re.source, "g")) ?? []).length !== 1) throw new Error(`template: ${name} must match exactly once`);
    html = html.replace(re, () => to);
  };
  one("title", /<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
  one("html lang", /<html lang="[^"]*">/, `<html lang="${escape(lang)}">`);
  for (const [attr, key, value] of [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:locale", locale],
    ["property", "og:image", image],
    ["name", "twitter:image", image],
  ]) {
    one(key, new RegExp(`<meta ${attr}="${key}" content="[^"]*"`), `<meta ${attr}="${key}" content="${escape(value)}"`);
  }
  return html;
}

/** One RSS item of a published post: link and guid are the same absolute URL. */
function feedItem({ slug, title, description, date, lang, tags }) {
  const link = escape(`${SITE}/blog/${slug}`);
  return `<item>
<title>${escape(title)}</title>
<link>${link}</link>
<guid>${link}</guid>
<pubDate>${new Date(`${date}T00:00:00Z`).toUTCString()}</pubDate>
<description>${escape(description)}</description>
${tags.map((tag) => `<category>${escape(tag)}</category>`).join("\n")}
<dc:language>${escape(lang)}</dc:language>
</item>`;
}

/** Writes index.json, one body.html and one index.html per published post under <dist>/blog, one page per project under <dist>/projetos, and blog/rss.xml. */
function buildBlog(postsDir, dist) {
  const pt = JSON.parse(readFileSync("public/content/pt.json", "utf8"));
  const posts = readPosts(postsDir);
  const blog = join(dist, "blog");
  mkdirSync(blog, { recursive: true });
  const index = posts.map(({ slug, title, description, date, lang, tags }) => ({ slug, title, description, date, lang, tags }));
  writeFileSync(join(blog, "index.json"), `${JSON.stringify(index)}\n`);
  const { footer, blog: chrome } = pt.siteChrome;
  writeFileSync(
    join(blog, "rss.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${escape(`${footer.owner} — ${chrome.title}`)}</title>
<link>${escape(`${SITE}/blog`)}</link>
<description>${escape(chrome.intro)}</description>
${posts.map(feedItem).join("\n")}
</channel>
</rss>
`,
  );
  const template = readFileSync(join(dist, "index.html"), "utf8");
  for (const { slug, body, image, title, description, lang } of posts) {
    const dir = join(postsDir, slug);
    const files = new Set(image ? [image] : []);
    const html = renderBody(slug, body, dir, files);
    mkdirSync(join(blog, slug), { recursive: true });
    writeFileSync(join(blog, slug, "body.html"), html);
    const [htmlLang, locale] = LANGS[lang];
    const head = setHead(template, {
      title, description, lang: htmlLang, locale,
      image: image ? `${SITE}/blog/${slug}/${image}` : template.match(/property="og:image" content="([^"]*)"/)[1],
    });
    writeFileSync(join(blog, slug, "index.html"), head.replace('<div id="root"></div>', () => `<div id="root"><article lang="${lang}">${html}</article></div>`));
    for (const name of files) copyFileSync(join(dir, name), join(blog, slug, name));
  }
  for (const { slug, seo } of pt.projectsV2.list) {
    mkdirSync(join(dist, "projetos", slug), { recursive: true });
    const page = setHead(template, {
      title: seo.title, description: seo.description,
      lang: "pt-BR", locale: "pt_BR", image: template.match(/property="og:image" content="([^"]*)"/)[1],
    });
    writeFileSync(join(dist, "projetos", slug, "index.html"), page);
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
