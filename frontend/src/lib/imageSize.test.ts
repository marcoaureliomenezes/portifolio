import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error plain ESM, no declaration file
import { imageSize } from "../../scripts/image-size.mjs";

const dir = mkdtempSync(join(tmpdir(), "image-size-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const be32 = (n: number) => Buffer.from([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const be16 = (n: number) => Buffer.from([n >>> 8, n & 255]);
const le16 = (n: number) => Buffer.from([n & 255, n >>> 8]);
const le24 = (n: number) => Buffer.from([n & 255, (n >>> 8) & 255, n >>> 16]);
const le32 = (n: number) => Buffer.from([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, n >>> 24]);

function write(name: string, bytes: Buffer | string): string {
  const file = join(dir, name);
  writeFileSync(file, bytes);
  return file;
}

function webp(fourcc: string, data: Buffer): Buffer {
  return Buffer.concat([
    Buffer.from("RIFF"),
    le32(4 + 8 + data.length),
    Buffer.from("WEBP"),
    Buffer.from(fourcc),
    le32(data.length),
    data,
  ]);
}

describe("imageSize", () => {
  it("reads png from the IHDR chunk", () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      be32(13),
      Buffer.from("IHDR"),
      be32(1200),
      be32(630),
      Buffer.from([8, 2, 0, 0, 0]),
    ]);
    expect(imageSize(write("a.png", png))).toEqual({ width: 1200, height: 630 });
  });

  it("reads jpg from the first SOF marker, skipping earlier segments", () => {
    const app0 = Buffer.concat([Buffer.from([0xff, 0xe0]), be16(4), Buffer.from([0, 0])]);
    const sof = Buffer.concat([
      Buffer.from([0xff, 0xc0]),
      be16(11),
      Buffer.from([8]),
      be16(480),
      be16(640),
      Buffer.from([1, 1, 0x11, 0]),
    ]);
    const jpg = Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof]);
    expect(imageSize(write("a.jpg", jpg))).toEqual({ width: 640, height: 480 });
  });

  it("reads webp VP8 (lossy)", () => {
    const data = Buffer.concat([
      Buffer.from([0x10, 0x02, 0x00, 0x9d, 0x01, 0x2a]),
      le16(320),
      le16(200),
    ]);
    expect(imageSize(write("lossy.webp", webp("VP8 ", data)))).toEqual({ width: 320, height: 200 });
  });

  it("reads webp VP8L (lossless)", () => {
    const data = Buffer.concat([Buffer.from([0x2f]), le32(100 - 1 + ((50 - 1) << 14))]);
    expect(imageSize(write("lossless.webp", webp("VP8L", data)))).toEqual({ width: 100, height: 50 });
  });

  it("reads webp VP8X (extended)", () => {
    const data = Buffer.concat([Buffer.alloc(4), le24(1920 - 1), le24(1080 - 1)]);
    expect(imageSize(write("ext.webp", webp("VP8X", data)))).toEqual({ width: 1920, height: 1080 });
  });

  it("reads svg width and height attributes in px", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300px" height="150"></svg>';
    expect(imageSize(write("px.svg", svg))).toEqual({ width: 300, height: 150 });
  });

  it("falls back to the svg viewBox", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"></svg>';
    expect(imageSize(write("vb.svg", svg))).toEqual({ width: 64, height: 32 });
  });

  it("throws naming the file for an unsupported extension", () => {
    const file = write("pic.gif", "GIF89a");
    expect(() => imageSize(file)).toThrow(/pic\.gif/);
  });

  it("throws naming the file for an unreadable header", () => {
    const file = write("broken.png", Buffer.from("not a png"));
    expect(() => imageSize(file)).toThrow(/broken\.png/);
  });
});
