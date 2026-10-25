import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const pub = join(root, "public");
const projects = join(pub, "assets/projects");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const rel = (p: string) => relative(root, p).split(sep).join("/");
const urlOf = (f: string) => "/" + relative(pub, f).split(sep).join("/");
const text = (p: string) => readFileSync(p, "latin1");

const contentFiles = ["en", "pt", "de"].map((l) => join(pub, `content/${l}.json`));
const pathsIn = (s: string, re: RegExp) => [...s.matchAll(re)].map((m) => m[1].replace(/[?#].*$/, ""));

// Production modules only: fixtures in tests are data, not readers.
const srcFiles = walk(join(root, "src")).filter(
  (p) => /\.(tsx?|css|jsx?)$/.test(p) && !/\.test\.|__tests__|test-setup/.test(p),
);
const readers = [...srcFiles, join(root, "index.html"), ...contentFiles];
const QUOTED = /["'`](\/assets\/[^"'`\s$]+)/g;

const allProject = walk(projects);
// The media list is the content's own URLs, so a renamed folder cannot empty it.
const mediaItems = JSON.parse(text(contentFiles[0])).projectsV2.list.filter((i: { slug: string }) =>
  ["rand-engine", "dadaia-workspace"].includes(i.slug),
);
const media = [...new Set(pathsIn(JSON.stringify(mediaItems), /(\/assets\/projects\/[^"]+)/g))].map((u) =>
  join(pub, ...u.split("/")),
);
const byExt = (ext: string) => media.filter((p) => p.endsWith(`.${ext}`));
const posters = byExt("webp");
const svgs = byExt("svg");

describe("AC3.7 every /assets path a reader names exists under public/", () => {
  for (const f of readers) {
    it(rel(f), () => {
      const missing = pathsIn(text(f), QUOTED).filter((p) => !existsSync(join(pub, p)));
      expect(missing, `${rel(f)}: /assets path with no file under public/`).toEqual([]);
    });
  }
});

describe("AC3.2 every file under public/assets/projects is referenced by a content file", () => {
  const referenced = new Set(contentFiles.flatMap((f) => pathsIn(text(f), QUOTED)));
  for (const f of allProject) {
    it(rel(f), () => {
      const url = urlOf(f);
      expect(referenced.has(url), `${rel(f)}: no content file references ${url}`).toBe(true);
    });
  }
});

describe("AC3.2 the media list", () => {
  it("holds the 32 rand-engine and dadaia-workspace files", () => {
    expect(media.length).toBe(32);
  });
});

describe("AC3.2 media names carry the sha256 of their bytes", () => {
  for (const f of media) {
    it(rel(f), () => {
      const m = /^[a-z0-9-]+-([0-9a-f]{8})\.(webm|mp4|webp|svg)$/.exec(f.split("/").pop()!);
      expect(m, `${rel(f)}: name must match <scene>-<8 hex>.<ext>`).not.toBeNull();
      const sha = createHash("sha256").update(readFileSync(f)).digest("hex").slice(0, 8);
      expect(m![1], `${rel(f)}: name hash differs from sha256 prefix ${sha}`).toBe(sha);
    });
  }
});

describe("AC3.3 byte budgets", () => {
  const budget: [string, number, string[]][] = [
    ["webm", 307200, byExt("webm")],
    ["mp4", 409600, byExt("mp4")],
    ["poster", 61440, posters],
    ["svg", 51200, svgs],
  ];
  for (const [kind, max, files] of budget) {
    for (const f of files) {
      it(rel(f), () => {
        expect(statSync(f).size, `${rel(f)}: ${kind} over ${max} bytes`).toBeLessThanOrEqual(max);
      });
    }
  }
});

// Desktop cuts are the 640x360 CSS cut at 2x, phone cuts the 360x450 CSS cut at 2x.
const cut = (f: string) => (f.includes("-phone-") ? [720, 900] : [1280, 720]);

const mp4Info = (s: string) => {
  const m = s.indexOf("mvhd") + 4;
  const v1 = s.charCodeAt(m) === 1;
  const b = Buffer.from(s, "latin1");
  const ts = b.readUInt32BE(m + (v1 ? 20 : 12));
  const dur = v1 ? Number(b.readBigUInt64BE(m + 24)) : b.readUInt32BE(m + 16);
  const t = s.indexOf("tkhd") + 4;
  const o = t + (b[t] === 1 ? 88 : 76);
  return { seconds: dur / ts, w: b.readUInt32BE(o) >> 16, h: b.readUInt32BE(o + 4) >> 16 };
};

const webpSize = (b: Buffer) => {
  const kind = b.toString("latin1", 12, 16);
  if (kind === "VP8X") return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  if (kind === "VP8L") return [(b.readUInt16LE(21) & 0x3fff) + 1, ((b.readUInt32LE(22) >> 6) & 0x3fff) + 1];
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
};

describe("AC3.3 mp4: 8 to 12 s, no audio track, cut size", () => {
  for (const f of byExt("mp4")) {
    it(rel(f), () => {
      const s = text(f);
      const info = mp4Info(s);
      expect(info.seconds, `${rel(f)}: duration outside 8..12 s`).toBeGreaterThanOrEqual(8);
      expect(info.seconds, `${rel(f)}: duration outside 8..12 s`).toBeLessThanOrEqual(12);
      expect(/hdlr[\s\S]{8}soun/.test(s), `${rel(f)}: has a soun audio track`).toBe(false);
      expect([info.w, info.h], `${rel(f)}: cut size`).toEqual(cut(f));
    });
  }
});

describe("AC3.3 webm: no audio track, cut size", () => {
  for (const f of byExt("webm")) {
    it(rel(f), () => {
      const s = text(f);
      expect(/\x86[\s\S]A_/.test(s), `${rel(f)}: has an A_ audio codec`).toBe(false);
      const m = /\xB0\x82([\s\S]{2})\xBA\x82([\s\S]{2})/.exec(s);
      expect(m, `${rel(f)}: no PixelWidth/PixelHeight`).not.toBeNull();
      const px = (t: string) => (t.charCodeAt(0) << 8) | t.charCodeAt(1);
      expect([px(m![1]), px(m![2])], `${rel(f)}: cut size`).toEqual(cut(f));
    });
  }
});

describe("AC3.3 poster cut size", () => {
  for (const f of posters) {
    it(rel(f), () => {
      expect(webpSize(readFileSync(f)), `${rel(f)}: cut size`).toEqual(cut(f));
    });
  }
});

describe("AC3.4 and AC3.5 svg rules", () => {
  for (const f of svgs) {
    it(rel(f), () => {
      const s = text(f);
      const vb = /viewBox="\s*[\d.]+[\s,]+[\d.]+[\s,]+([\d.]+)/.exec(s);
      expect(vb, `${rel(f)}: no viewBox`).not.toBeNull();
      expect(Number(vb![1]), `${rel(f)}: viewBox wider than 360`).toBeLessThanOrEqual(360);
      const small = pathsIn(s, /font-size\s*[:=]\s*"?([\d.]+)/g).filter((n) => Number(n) < 12);
      expect(small, `${rel(f)}: font-size under 12`).toEqual([]);
      if (/@keyframes|<animate/.test(s)) {
        expect(/prefers-reduced-motion\s*:\s*reduce/.test(s), `${rel(f)}: animated without prefers-reduced-motion: reduce`).toBe(true);
      }
    });
  }
});
