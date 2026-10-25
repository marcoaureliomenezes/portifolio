import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(__dirname, "../media/terminal.html"), "utf8");
const script = html.slice(html.indexOf("<script>") + "<script>".length, html.indexOf("</script>"));

type Cast = { steps: { cmd: string; out: string }[] };
type TermWindow = Window & { __CAST__?: Cast; render: (t: number) => void; duration: number };

// Runs terminal.html's own script against the test jsdom with the cast set first; returns the lines drawn at t = duration.
function drawnAtEnd(cast: Cast): string[] {
  document.body.innerHTML = '<div id="t"></div>';
  const w = window as unknown as TermWindow;
  w.__CAST__ = cast;
  (0, eval)(script);
  w.render(w.duration);
  const root = document.getElementById("t");
  if (!root) throw new Error("terminal root missing");
  return [...root.children].map((d) => d.textContent ?? "");
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
