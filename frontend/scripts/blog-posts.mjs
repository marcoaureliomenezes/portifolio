/**
 * blog-posts.mjs — the post reader.
 *
 * The one decider of "published": every post folder is validated, drafts
 * included, then drafts are dropped. Imports zod and node built-ins only, so the
 * Vite config can load it.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname } from "node:path";
import { z } from "zod";

export const IMAGES = [".png", ".jpg", ".webp", ".svg"];
export const CLIPS = { ".mp4": "video/mp4", ".webm": "video/webm" };

/** True when `name` is a plain file of `folder` with an extension in `exts`: the one rule for post media. */
export function isMedia(folder, name, exts) {
  return /^[\w.-]+$/.test(name) && exts.includes(extname(name).toLowerCase()) && statSync(`${folder}/${name}`, { throwIfNoEntry: false })?.isFile() === true;
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TAGS = /^(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\s*,\s*[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const isDay = (s) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const required = (message) => ({
  error: (issue) => (issue.input === undefined ? "is required" : message),
});

const Front = z.strictObject({
  title: z.string(required("must not be blank")).min(1, "must not be blank"),
  description: z.string(required("must not be blank")).min(1, "must not be blank"),
  date: z
    .string(required("must be YYYY-MM-DD"))
    .regex(DAY, "must be YYYY-MM-DD")
    .refine(isDay, "must be YYYY-MM-DD"),
  lang: z.enum(["pt", "en", "de"], {
    error: (issue) => (issue.input === undefined ? "is required" : "must be one of pt, en, de"),
  }),
  tags: z
    .string(required("must be a comma list of slugs"))
    .regex(TAGS, "must be a comma list of slugs")
    .transform((s) => (s === "" ? [] : s.split(/\s*,\s*/))),
  image: z.string().optional(),
  draft: z
    .enum(["true", "false"], { error: () => "must be true or false" })
    .transform((v) => v === "true")
    .optional(),
});

function readPost(slug, folder) {
  const fail = (field, message) => {
    throw new Error(`${slug}: ${field}: ${message}`);
  };
  if (!SLUG.test(slug)) fail("slug", "must match ^[a-z0-9]+(-[a-z0-9]+)*$");
  const file = `${folder}/index.md`;
  if (!existsSync(file)) fail("index.md", "is required");

  const raw = readFileSync(file, "utf8");
  const block = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!block) fail("front matter", "is required");

  const fields = {};
  block[1].split(/\r?\n/).forEach((line, i) => {
    const kv = /^(\w+):(.*)$/.exec(line);
    if (!kv) fail("front matter", `line ${i + 1} is not key: value`);
    fields[kv[1]] = kv[2].trim();
  });

  const parsed = Front.safeParse(fields);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.code === "unrecognized_keys") fail(issue.keys[0], "unknown key");
    fail(issue.path[0], issue.message);
  }
  const d = parsed.data;
  if (d.image !== undefined && !isMedia(folder, d.image, IMAGES)) {
    fail("image", "no such file in the post folder");
  }

  return {
    slug,
    title: d.title,
    description: d.description,
    date: d.date,
    lang: d.lang,
    tags: d.tags,
    image: d.image ?? null,
    draft: d.draft ?? false,
    body: raw.slice(block[0].length).trim(),
  };
}

/** Published posts of `dir`, newest first, ties by slug. An absent folder gives []. */
export function readPosts(dir) {
  if (!existsSync(dir)) return [];
  const posts = readdirSync(dir)
    .sort()
    .filter((slug) => statSync(`${dir}/${slug}`).isDirectory())
    .map((slug) => readPost(slug, `${dir}/${slug}`))
    .filter((post) => !post.draft);
  posts.sort((a, b) => (a.date === b.date ? (a.slug < b.slug ? -1 : 1) : a.date < b.date ? 1 : -1));
  return posts.map(({ draft, ...post }) => post);
}
