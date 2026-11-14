import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

afterEach(() => {
  window.history.pushState({}, "", "/");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("blog routes", () => {
  it("/blog renders the index page with the empty index", async () => {
    window.history.pushState({}, "", "/blog");
    render(<App />);
    expect(await screen.findByText("No posts yet.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Blog");
  });

  it("/blog/some-post renders the post page when the post exists", async () => {
    const base = globalThis.fetch;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
      if (input === "/blog/index.json") {
        const post = {
          slug: "some-post",
          title: "Some post",
          description: "About some post",
          date: "2026-03-09",
          lang: "pt",
          tags: [],
        };
        return Promise.resolve(new Response(JSON.stringify([post])));
      }
      if (input === "/blog/some-post/body.html") {
        return Promise.resolve(new Response("<p>Some body</p>"));
      }
      return base(input, init);
    });
    window.history.pushState({}, "", "/blog/some-post");
    render(<App />);
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("Some post");
    expect(await screen.findByText("Some body")).toBeTruthy();
  });

  it("/blog/some-post renders the 404 content when no post exists", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    window.history.pushState({}, "", "/blog/some-post");
    render(<App />);
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("404");
  });
});
