import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BlogPostPage } from "./BlogPostPage";

// Boundary stub: the header's own contract lives in Header.test.tsx.
vi.mock("@/components/Header", () => ({
  Header: () => <header>header</header>,
}));

const POSTS = [
  {
    slug: "newer-post",
    title: "Newer post",
    description: "About the newer thing",
    date: "2026-03-09",
    lang: "pt",
    tags: ["notes", "python"],
  },
  {
    slug: "older-post",
    title: "Older post",
    description: "About the older thing",
    date: "2026-01-15",
    lang: "en",
    tags: ["tools"],
  },
];

const BODIES: Record<string, string> = {
  "/blog/newer-post/body.html": "<p>Hello <strong>rendered</strong> body</p>",
  "/blog/older-post/body.html": "<p>Older body</p>",
};

/** Layers the blog files over the setup fetch; every other URL falls through. */
function serveBlog() {
  const base = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    if (input === "/blog/index.json") {
      return Promise.resolve(new Response(JSON.stringify(POSTS)));
    }
    if (typeof input === "string" && input.endsWith("/body.html")) {
      return Promise.resolve(
        input in BODIES
          ? new Response(BODIES[input], { headers: { "Content-Type": "text/html" } })
          : new Response("", { status: 404 }),
      );
    }
    return base(input, init);
  });
}

function renderAt(path: string, locale: "pt" | "en" | "de" = "pt") {
  return render(
    <LanguageProvider initialLanguage={locale}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BlogPostPage", () => {
  it("shows title, date, language tag, tags, back link and the fetched body in the post's language", async () => {
    serveBlog();
    renderAt("/blog/newer-post");
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("Newer post");
    expect(screen.getByText("9 de março de 2026")).toBeTruthy();
    expect(screen.getByText("PT").getAttribute("lang")).toBe("pt");
    expect(screen.getByRole("link", { name: "notes" }).getAttribute("href")).toBe("/blog?tag=notes");
    expect(screen.getByRole("link", { name: "python" }).getAttribute("href")).toBe("/blog?tag=python");
    expect(screen.getByRole("link", { name: "Voltar ao blog" }).getAttribute("href")).toBe("/blog");
    const article = await screen.findByRole("article");
    expect(article.getAttribute("lang")).toBe("pt");
    expect(within(article).getByText("rendered").tagName).toBe("STRONG");
    expect(article.closest('[class*="max-w-[680px]"]')).not.toBeNull();
  });

  it("an en post under the de UI keeps lang en on its article", async () => {
    serveBlog();
    renderAt("/blog/older-post", "de");
    const article = await screen.findByRole("article");
    expect(article.getAttribute("lang")).toBe("en");
    expect(within(article).getByText("Older body")).toBeTruthy();
    expect(screen.getByText("15. Januar 2026")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Zurück zum Blog" }).getAttribute("href")).toBe("/blog");
  });

  it("sets the document title and description meta from the post", async () => {
    serveBlog();
    renderAt("/blog/newer-post");
    await screen.findByRole("article");
    await waitFor(() => expect(document.title).toBe("Newer post"));
    expect(document.querySelector('meta[name="description"]')!.getAttribute("content")).toBe(
      "About the newer thing",
    );
  });

  it("an unknown slug renders the 404 page", async () => {
    serveBlog();
    renderAt("/blog/no-such-post");
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("404");
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("a slug in the index whose body.html fails renders the 404 page", async () => {
    const base = globalThis.fetch;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) =>
      input === "/blog/index.json"
        ? Promise.resolve(new Response(JSON.stringify(POSTS)))
        : typeof input === "string" && input.endsWith("/body.html")
          ? Promise.resolve(new Response("", { status: 500 }))
          : base(input, init),
    );
    renderAt("/blog/newer-post");
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("404");
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("an unknown slug renders the 404 page when the host answers 200 text/html app HTML for every path", async () => {
    const base = globalThis.fetch;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) =>
      input === "/blog/index.json"
        ? Promise.resolve(new Response(JSON.stringify(POSTS)))
        : typeof input === "string" && input.endsWith("/body.html")
          ? Promise.resolve(
              new Response("<!doctype html><html><body><div id=root></div></body></html>", {
                headers: { "Content-Type": "text/html" },
              }),
            )
          : base(input, init),
    );
    renderAt("/blog/no-such-post");
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("404");
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("renders no 404 content while the index is still pending", async () => {
    const base = globalThis.fetch;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) =>
      input === "/blog/index.json"
        ? new Promise<Response>(() => undefined)
        : typeof input === "string" && input.endsWith("/body.html")
          ? Promise.resolve(new Response("", { status: 404 }))
          : base(input, init),
    );
    renderAt("/blog/newer-post");
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("404")).toBeNull();
    expect(screen.queryByRole("article")).toBeNull();
  });
});
