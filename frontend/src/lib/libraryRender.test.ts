import { describe, it, expect } from "vitest";
import type { LibraryProject } from "@/types/content";
import { renderLibrary } from "./libraryRender";

const project = (tagPrefix?: string): LibraryProject => ({
  slug: "x",
  kind: "library",
  hero: { title: "x", tagline: "t" },
  card: { cover: "/c.webp", summary: "s", tech: ["Python"] },
  seo: { title: "t", description: "d" },
  pypi: { package: "x", version: "1.2.3", installCommand: "pip install x=={version}", ...(tagPrefix === undefined ? {} : { tagPrefix }) },
  sections: [
    { id: "try", title: "Try", code: "x=={version} run" },
    { id: "facts", title: "Facts", items: [{ label: "L", value: "V", href: "https://h.example/blob/{tag}/p" }] },
  ],
  links: { repo: "https://github.com/a/b", pypi: "https://pypi.org/project/x/" },
});

describe("renderLibrary", () => {
  it("renders {version} in the install command and in a section code", () => {
    const out = renderLibrary(project());
    expect(out.pypi.installCommand).toBe("pip install x==1.2.3");
    expect(out.sections[0].code).toBe("x==1.2.3 run");
  });

  it("renders {tag} as the prefix plus the version", () => {
    expect(renderLibrary(project("v")).sections[1].items?.[0].href).toBe("https://h.example/blob/v1.2.3/p");
  });

  it("renders {tag} as the version alone without a prefix", () => {
    expect(renderLibrary(project()).sections[1].items?.[0].href).toBe("https://h.example/blob/1.2.3/p");
  });
});
