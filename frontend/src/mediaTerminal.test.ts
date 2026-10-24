import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(__dirname, "../media/terminal.html"), "utf8");

// Loads terminal.html with the cast set before its script runs; returns the drawn lines at t = duration.
type Cast = { steps: { cmd: string; out: string }[] };
type TermWindow = Window & { __CAST__?: Cast; render: (t: number) => void; duration: number };

function drawnAtEnd(cast: Cast): string[] {
  const dom = new JSDOM(html, { runScripts: "dangerously", beforeParse: (w) => { (w as unknown as TermWindow).__CAST__ = cast; } });
  const w = dom.window as unknown as TermWindow;
  w.render(w.duration);
  return [...w.document.getElementById("t").children].map((d: Element) => d.textContent as string);
}

describe("media terminal: the last state holds", () => {
  it("render(duration) draws every output line when the float sum falls short (194-char cmd, 6 lines)", () => {
    const cmd = "x".repeat(194);
    const out = ["row 1", "row 2", "row 3", "row 4", "row 5", "row 6"];
    expect(drawnAtEnd({ steps: [{ cmd, out: out.join("\n") + "\n" }] })).toEqual(["$ " + cmd, ...out]);
  });

  it("render(duration) draws every output line when the float sum is exact (24-char cmd, 10 lines)", () => {
    const cmd = "y".repeat(24);
    const out = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    expect(drawnAtEnd({ steps: [{ cmd, out: out.join("\n") + "\n" }] })).toEqual(["$ " + cmd, ...out]);
  });
});
