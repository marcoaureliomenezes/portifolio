// Usage: node media/record.mjs <project> <scene> [--cut desktop|phone] [--out <dir>]
//        node media/record.mjs svg <project> <scene> [--out <dir>]
// MEDIA_DIR overrides the directory holding <project>/ (default: this file's directory).
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 15, MIN_S = 8, MAX_S = 12;
const CUTS = { desktop: { width: 640, height: 360 }, phone: { width: 360, height: 450 } };
const BUDGET = { webm: 307200, mp4: 409600, webp: 61440, svg: 51200 };

const die = (m) => { console.error(`record.mjs: ${m}`); process.exit(1); };

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args.splice(i, 2)[1];
};
const cutArg = flag("--cut");
const outArg = flag("--out");
const isSvg = args[0] === "svg";
if (isSvg) args.shift();
const [project, scene] = args;
if (!project || !scene || args.length !== 2) die("usage: record.mjs [svg] <project> <scene> [--cut desktop|phone] [--out <dir>]");
if (cutArg && !CUTS[cutArg]) die(`unknown cut ${cutArg}`);

const media = process.env.MEDIA_DIR ?? here;
const out = resolve(outArg ?? join(here, "..", "public", "assets", "projects", project));
const publicPath = (f) => `/assets/projects/${project}/${f}`;

// Hash a produced file, copy it to <out>/<stem>-<h>.<ext>, enforce its budget.
function seal(file, stem, ext) {
  const size = statSync(file).size;
  if (size > BUDGET[ext]) die(`${stem}.${ext} is ${size} bytes, above the ${BUDGET[ext]} budget`);
  const h = createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8);
  const name = `${stem}-${h}.${ext}`;
  copyFileSync(file, join(out, name));
  return name;
}

// Delete the scene's previous files for the given variants (cut or light/dark).
function clean(variants) {
  const re = new RegExp(`^${scene.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(${variants.join("|")})-[0-9a-f]{8}\\.(webm|mp4|webp|svg)$`);
  for (const f of readdirSync(out)) if (re.test(f)) rmSync(join(out, f));
}

mkdirSync(out, { recursive: true });

if (isSvg) {
  clean(["light", "dark"]);
  for (const v of ["light", "dark"]) {
    console.log(JSON.stringify({ svg: publicPath(seal(join(media, project, `${scene}-${v}.svg`), `${scene}-${v}`, "svg")) }));
  }
  process.exit(0);
}

const cast = JSON.parse(readFileSync(join(media, project, `${scene}.cast.json`), "utf8"));
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: ["ignore", "inherit", "inherit"] });
const browser = await chromium.launch();
const work = mkdtempSync(join(tmpdir(), "record-"));
try {
  for (const cut of cutArg ? [cutArg] : Object.keys(CUTS)) {
    const { width, height } = CUTS[cut];
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    await page.addInitScript((c) => { window.__CAST__ = c; }, cast);
    await page.goto(`${pathToFileURL(join(here, "terminal.html"))}?cut=${cut}`);
    const duration = await page.evaluate(() => window.duration);
    if (duration > MAX_S) die(`${project}/${scene} runs ${duration.toFixed(1)} s, above ${MAX_S} s; shorten the commands`);
    const frames = Math.ceil(Math.max(duration, MIN_S) * FPS);
    const dir = join(work, cut);
    mkdirSync(dir);
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.render(t), i / FPS);
      await page.screenshot({ path: join(dir, `f${String(i).padStart(4, "0")}.png`) });
    }
    await page.close();

    const stem = `${scene}-${cut}`;
    const src = ["-framerate", String(FPS), "-i", join(dir, "f%04d.png")];
    ff(...src, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "42", "-row-mt", "1", "-pix_fmt", "yuv420p", join(dir, "o.webm"));
    ff(...src, "-an", "-c:v", "libx264", "-crf", "30", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(dir, "o.mp4"));
    ff("-i", join(dir, `f${String(frames - 1).padStart(4, "0")}.png`), "-c:v", "libwebp", "-quality", "60", join(dir, "o.webp"));
    clean([cut]);
    const names = {};
    for (const e of ["webm", "mp4", "webp"]) {
      names[e === "webp" ? "poster" : e] = publicPath(seal(join(dir, `o.${e}`), stem, e));
    }
    console.log(JSON.stringify({ ...names, width, height }));
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
