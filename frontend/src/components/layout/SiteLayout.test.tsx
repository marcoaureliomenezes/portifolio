import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./SiteLayout";

// Boundary stub: the header's own contract lives in Header.test.tsx.
vi.mock("@/components/Header", () => ({
  Header: () => <header data-testid="site-header">header</header>,
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<div data-testid="page">home</div>} />
          <Route path="/projetos" element={<div data-testid="page">index</div>} />
          <Route path="/projetos/:slug" element={<div data-testid="page">detail</div>} />
          <Route path="*" element={<div data-testid="page">missing</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("SiteLayout", () => {
  it.each([
    ["/", "home"],
    ["/projetos", "index"],
    ["/projetos/x", "detail"],
    ["/nope/never", "missing"],
  ])("%s renders one header and one main#main-content holding the outlet", (path, text) => {
    const { container } = renderAt(path);
    expect(container.querySelectorAll("header")).toHaveLength(1);
    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    expect(mains[0].id).toBe("main-content");
    expect(mains[0].querySelector("main")).toBeNull();
    expect(mains[0].contains(screen.getByTestId("page"))).toBe(true);
    expect(screen.getByTestId("page").textContent).toBe(text);
    expect(mains[0].contains(container.querySelector("header"))).toBe(false);
  });
});
