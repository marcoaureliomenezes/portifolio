import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BlogIndexPage } from "./BlogIndexPage";

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

type Locale = "pt" | "en" | "de";

/** Layers an index answer over the setup fetch; every other URL falls through. */
function serveIndex(answer: () => Promise<Response>) {
  const base = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) =>
    input === "/blog/index.json" ? answer() : base(input, init),
  );
}

function servePosts() {
  serveIndex(() => Promise.resolve(new Response(JSON.stringify(POSTS))));
}

function renderAt(path: string, locale: Locale = "pt") {
  return render(
    <LanguageProvider initialLanguage={locale}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/blog" element={<BlogIndexPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

const postHrefs = () =>
  screen
    .getAllByRole("link")
    .map((a) => a.getAttribute("href"))
    .filter((h) => h?.startsWith("/blog/"));

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => vi.unstubAllGlobals());

describe("BlogIndexPage", () => {
  it.each([
    ["pt", "Blog", "Notas sobre engenharia de dados e as ferramentas que construo."],
    ["en", "Blog", "Notes on data engineering and the tools I build."],
    ["de", "Blog", "Notizen zu Data Engineering und den Werkzeugen, die ich baue."],
  ] as const)("%s lists both posts in the order the index holds them, oldest first, under the blog heading", async (locale, h1, intro) => {
    serveIndex(() => Promise.resolve(new Response(JSON.stringify([...POSTS].reverse()))));
    renderAt("/blog", locale);
    await screen.findByRole("link", { name: "Newer post" });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(h1);
    expect(screen.getByText(intro)).toBeTruthy();
    expect(postHrefs()).toEqual(["/blog/older-post", "/blog/newer-post"]);
  });

  it.each([
    ["pt", "9 de março de 2026"],
    ["en", "March 9, 2026"],
    ["de", "9. März 2026"],
  ] as const)("%s shows the date of 2026-03-09 as %s", async (locale, date) => {
    servePosts();
    renderAt("/blog", locale);
    const item = (await screen.findByRole("link", { name: "Newer post" })).closest("li, article")!;
    expect(within(item as HTMLElement).getByText(date)).toBeTruthy();
  });

  it("an entry shows title link, description, tags and a lang-tagged language tag", async () => {
    servePosts();
    renderAt("/blog");
    const link = await screen.findByRole("link", { name: "Newer post" });
    expect(link.getAttribute("href")).toBe("/blog/newer-post");
    const item = link.closest("li, article") as HTMLElement;
    expect(within(item).getByText("About the newer thing")).toBeTruthy();
    expect(within(item).getByText("Tags")).toBeTruthy();
    expect(within(item).getByRole("link", { name: "notes" }).getAttribute("href")).toBe("/blog?tag=notes");
    expect(within(item).getByRole("link", { name: "python" }).getAttribute("href")).toBe("/blog?tag=python");
    expect(within(item).getByText("PT").getAttribute("lang")).toBe("pt");
    const other = screen.getByRole("link", { name: "Older post" }).closest("li, article") as HTMLElement;
    expect(within(other).getByText("EN").getAttribute("lang")).toBe("en");
  });

  it("?tag=notes lists only the posts tagged notes and offers the way back", async () => {
    servePosts();
    const { container } = renderAt("/blog?tag=notes");
    await screen.findByRole("link", { name: "Newer post" });
    expect(postHrefs()).toEqual(["/blog/newer-post"]);
    expect(container.querySelector("main")!.textContent).toMatch(/Posts com a tag\W+notes/);
    expect(screen.getByRole("link", { name: "Todos os posts" }).getAttribute("href")).toBe("/blog");
  });

  it("?tag=nope lists none and shows the empty message", async () => {
    servePosts();
    renderAt("/blog?tag=nope");
    expect(await screen.findByText("Nenhum post ainda.")).toBeTruthy();
    expect(postHrefs()).toEqual([]);
    expect(screen.getByRole("link", { name: "Todos os posts" }).getAttribute("href")).toBe("/blog");
  });

  it("the setup default index is empty and shows the empty message", async () => {
    renderAt("/blog");
    expect(await screen.findByText("Nenhum post ainda.")).toBeTruthy();
    expect(postHrefs()).toEqual([]);
  });

  it.each([
    ["a 500 answer", () => Promise.resolve(new Response("", { status: 500 }))],
    ["a rejected fetch", () => Promise.reject(new Error("offline"))],
  ] as const)("%s shows the empty message", async (_name, answer) => {
    serveIndex(answer);
    renderAt("/blog");
    expect(await screen.findByText("Nenhum post ainda.")).toBeTruthy();
    expect(postHrefs()).toEqual([]);
  });

  it("never shows the empty message while the index is pending, then lists the posts", async () => {
    let resolve!: (r: Response) => void;
    serveIndex(() => new Promise<Response>((r) => (resolve = r)));
    renderAt("/blog");
    await vi.waitFor(() => expect(resolve).toBeTypeOf("function"));
    expect(screen.queryByText("Nenhum post ainda.")).toBeNull();
    resolve(new Response(JSON.stringify(POSTS)));
    await screen.findByRole("link", { name: "Newer post" });
    expect(screen.queryByText("Nenhum post ainda.")).toBeNull();
    expect(postHrefs()).toEqual(["/blog/newer-post", "/blog/older-post"]);
  });
});
