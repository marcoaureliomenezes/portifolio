import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Media } from "../Media";

const inViewState = { inView: false };

class ObserverStub {
  constructor(private cb: (entries: { isIntersecting: boolean }[]) => void) {}
  observe() {
    if (inViewState.inView) this.cb([{ isIntersecting: true }]);
  }
  unobserve() {}
  disconnect() {}
}

const cut = (name: string, width: number, height: number) => ({
  webm: `/media/${name}.webm`,
  mp4: `/media/${name}.mp4`,
  poster: `/media/${name}.jpg`,
  width,
  height,
});

const video = {
  type: "video" as const,
  alt: "Spec becomes a DataFrame",
  desktop: cut("desktop", 1280, 720),
  phone: cut("phone", 360, 450),
};

const svg = {
  type: "svg" as const,
  alt: "Demand to merge flow",
  light: "/media/flow-light.svg",
  dark: "/media/flow-dark.svg",
};

function stubMatchMedia(matching: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matching.includes(query),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

const WIDE = "(min-width: 640px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

beforeEach(() => {
  inViewState.inView = true;
  vi.stubGlobal("IntersectionObserver", ObserverStub);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Media — video", () => {
  it("renders the desktop cut with the loop attributes, webm then mp4", () => {
    stubMatchMedia([WIDE]);
    const { container } = render(<Media media={video} />);
    const el = container.querySelector("video") as HTMLVideoElement;
    expect(el.muted).toBe(true);
    expect(el.loop).toBe(true);
    expect(el.hasAttribute("playsinline")).toBe(true);
    expect(el.getAttribute("poster")).toBe("/media/desktop.jpg");
    expect(el.getAttribute("width")).toBe("1280");
    expect(el.getAttribute("height")).toBe("720");
    expect(el.getAttribute("preload")).toBe("none");
    const sources = [...container.querySelectorAll("source")];
    expect(sources.map((s) => [s.getAttribute("src"), s.getAttribute("type")])).toEqual([
      ["/media/desktop.webm", "video/webm"],
      ["/media/desktop.mp4", "video/mp4"],
    ]);
  });

  it("chooses the phone cut when (min-width: 640px) does not match", () => {
    stubMatchMedia([]);
    const { container } = render(<Media media={video} />);
    const el = container.querySelector("video") as HTMLVideoElement;
    expect(el.getAttribute("poster")).toBe("/media/phone.jpg");
    expect(el.getAttribute("width")).toBe("360");
    expect(el.getAttribute("height")).toBe("450");
    expect(container.querySelector("source")?.getAttribute("src")).toBe("/media/phone.webm");
  });

  it("mounts no video before the in-view signal", () => {
    stubMatchMedia([WIDE]);
    inViewState.inView = false;
    const { container } = render(<Media media={video} />);
    expect(container.querySelector("video")).toBeNull();
  });

  it("has the alt as its accessible name", () => {
    stubMatchMedia([WIDE]);
    render(<Media media={video} />);
    expect(screen.getByLabelText("Spec becomes a DataFrame")).toBeTruthy();
  });

  it("under reduced motion renders no video and the poster image with the same alt", () => {
    stubMatchMedia([WIDE, REDUCED]);
    const { container } = render(<Media media={video} />);
    expect(container.querySelector("video")).toBeNull();
    const img = screen.getByRole("img", { name: "Spec becomes a DataFrame" });
    expect(img.getAttribute("src")).toBe("/media/desktop.jpg");
  });
});

describe("Media — svg", () => {
  it("renders the light and dark pair with the alt", () => {
    stubMatchMedia([WIDE]);
    render(<Media media={svg} />);
    const light = screen.getByTestId("diagram-light");
    const dark = screen.getByTestId("diagram-dark");
    expect(light.getAttribute("src")).toBe("/media/flow-light.svg");
    expect(dark.getAttribute("src")).toBe("/media/flow-dark.svg");
    expect(light.getAttribute("alt")).toBe("Demand to merge flow");
    expect(dark.getAttribute("alt")).toBe("Demand to merge flow");
  });
});

function stubChangeableMatchMedia(initial: string[]) {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  let matching = initial;
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matching.includes(query);
    },
    media: query,
    addEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.add(l),
    removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.delete(l),
  }));
  return (next: string[]) => {
    matching = next;
    act(() => listeners.forEach((l) => l({ matches: false })));
  };
}

describe("Media — cut and box lifecycle", () => {
  it("replaces the video element when the breakpoint flips, so the new cut is the one loaded", () => {
    const flip = stubChangeableMatchMedia([WIDE]);
    const { container } = render(<Media media={video} />);
    const before = container.querySelector("video");
    expect(before?.getAttribute("poster")).toBe("/media/desktop.jpg");
    flip([]);
    const after = container.querySelector("video") as HTMLVideoElement;
    expect(after).not.toBe(before);
    expect(after.getAttribute("poster")).toBe("/media/phone.jpg");
    expect(after.getAttribute("width")).toBe("360");
    expect(after.getAttribute("height")).toBe("450");
    expect(after.querySelector("source")?.getAttribute("src")).toBe("/media/phone.webm");
  });

  it("reserves the chosen cut's size before the in-view signal", () => {
    stubMatchMedia([WIDE]);
    inViewState.inView = false;
    const { container } = render(<Media media={video} />);
    const sized = container.querySelector("figure")?.querySelector('[width="1280"][height="720"]');
    expect(sized).not.toBeNull();
  });
});
