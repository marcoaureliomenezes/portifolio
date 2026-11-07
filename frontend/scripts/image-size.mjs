/**
 * image-size.mjs — the intrinsic size of a png, jpg, webp or svg file.
 *
 * imageSize(file) -> { width, height }, in px. Reads only the header bytes.
 * Throws an Error naming the file for any other extension or an unreadable header.
 */

import { closeSync, openSync, readSync } from "node:fs";
import { extname } from "node:path";

const BAD = new Error("bad header");

// read(pos, len) -> Buffer of up to len bytes starting at pos (shorter at end of file)
function png(read) {
  const h = read(0, 24);
  if (h.readUInt32BE(0) !== 0x89504e47 || h.toString("latin1", 12, 16) !== "IHDR") throw BAD;
  return { width: h.readUInt32BE(16), height: h.readUInt32BE(20) };
}

function jpg(read) {
  if (read(0, 2).toString("hex") !== "ffd8") throw BAD;
  for (let pos = 2; ; ) {
    const marker = read(pos, 2);
    if (marker[0] !== 0xff) throw BAD;
    const code = marker[1];
    if (code === 0xff) {
      pos += 1; // fill byte
    } else if (code >= 0xc0 && code <= 0xcf && code !== 0xc4 && code !== 0xc8 && code !== 0xcc) {
      const s = read(pos + 5, 4); // SOF: precision at pos+4, height then width
      return { width: s.readUInt16BE(2), height: s.readUInt16BE(0) };
    } else if (code === 0xd9 || code === 0xda) {
      throw BAD; // end of image or scan data before any frame header
    } else {
      pos += 2 + read(pos + 2, 2).readUInt16BE(0); // skip the segment
    }
  }
}

function webp(read) {
  const h = read(0, 30);
  if (h.toString("latin1", 0, 4) !== "RIFF" || h.toString("latin1", 8, 12) !== "WEBP") throw BAD;
  const fourcc = h.toString("latin1", 12, 16);
  if (fourcc === "VP8 ") {
    // 3-byte frame tag, 3-byte start code, then 14-bit width and height (little endian)
    return { width: h.readUInt16LE(26) & 0x3fff, height: h.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === "VP8L") {
    const bits = h.readUInt32LE(21); // after the 0x2f signature byte
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (fourcc === "VP8X") {
    return { width: h.readUIntLE(24, 3) + 1, height: h.readUIntLE(27, 3) + 1 };
  }
  throw BAD;
}

// ponytail: svg reads the first 4 KB only; a root tag that starts past it throws.
function svg(read) {
  const text = read(0, 4096).toString("utf8");
  const tag = /<svg\b[^>]*>/.exec(text);
  if (!tag) throw BAD;
  const px = (name) => {
    const m = new RegExp(`\\s${name}\\s*=\\s*["']([\\d.]+)(?:px)?["']`).exec(tag[0]);
    return m ? Number(m[1]) : undefined;
  };
  const width = px("width");
  const height = px("height");
  if (width && height) return { width, height };
  const vb = /\sviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(tag[0]);
  if (!vb) throw BAD;
  return { width: Number(vb[1]), height: Number(vb[2]) };
}

const PARSERS = { ".png": png, ".jpg": jpg, ".webp": webp, ".svg": svg };

export function imageSize(file) {
  const ext = extname(file).toLowerCase();
  const parse = PARSERS[ext];
  if (!parse) throw new Error(`${file}: unsupported image type "${ext}"`);
  const fd = openSync(file, "r");
  try {
    return parse((pos, len) => {
      const buf = Buffer.alloc(len);
      return buf.subarray(0, readSync(fd, buf, 0, len, pos));
    });
  } catch {
    throw new Error(`${file}: unreadable ${ext.slice(1)} header`);
  } finally {
    closeSync(fd);
  }
}
